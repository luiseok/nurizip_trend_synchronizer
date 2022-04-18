import axios from 'axios';
import { BASE_URL, subsidyStatus, subsidyAmount, axiosHeader } from "./constants";
import cheerio from 'cheerio';
import {FCEVSubsidyStatus, FCEVReceipt, FCEVSubsidy} from "./types/FCEV";
import { PrismaClient, Prisma } from '@prisma/client'
import crypto from "crypto"
const prisma = new PrismaClient()

const parseFCEVCount = (textString:string): FCEVReceipt => {
    const parsedList = textString
        .split(" ")
        .map(text => text.trim())
        .map(parsed=> parseInt(parsed.replace(/\(|\)/g, ""), 10) || 0)

    const result:FCEVReceipt = {
        total: parsedList.length < 3 ? parsedList.reduce((acc, cur) => {return acc += cur }, 0) : parsedList[0],
        priority: parsedList[parsedList.length - 2],
        general: parsedList[parsedList.length - 1]
    }

    return result;
}

const requestFreshFCEVStatus = async () => {
    // TODO: Code too dirty.........Should cleanup

    const requestInstance = axios.create({
        baseURL: BASE_URL,
        headers: { 'User-Agent': axiosHeader.userAgent}
    })

    const params = new URLSearchParams()
    params.append("year1", String(new Date().getFullYear()))

    const [{data: announcement}, {data: subsidy}] = await Promise.all([
        requestInstance.get(subsidyStatus.FCEV),
        requestInstance.post(subsidyAmount.FCEV, params)
    ])

    let $ = cheerio.load(subsidy);

    const listOfStatus: FCEVSubsidyStatus[] = [];
    const listOfSubsidyAmount: FCEVSubsidy[] = [];

    const subsidyTable = $(".table_02_2_1 tbody > tr");
    subsidyTable.each((index, element) => {
        const el = $(element);

        const province =  el.find("th:first-of-type").text().trim();
        const city = el.find("th:last-of-type").text().trim();

        const FCEVCar: FCEVSubsidy = {
            province,
            city,
            category: "승용",
            amount: parseInt(el.find("td:nth-of-type(2)").text().trim().replace(/,/g, ''), 10) * 10000
        }

        const FCEVVan: FCEVSubsidy = {
            province,
            city,
            category: "승합",
            amount: parseInt(el.find("td:last-of-type").text().trim().replace(/,/g, ''), 10) * 10000
        }
        listOfSubsidyAmount.push(FCEVCar)
        listOfSubsidyAmount.push(FCEVVan)
    })

    $ = cheerio.load(announcement)

    const announcementTable = $(".table_02_2_1 tbody > tr");
    announcementTable.each((index, element) => {
        const el = $(element), prevEl = $(announcementTable[index - 1])

        const hasMultiCategory = prevEl.children().length > 0 && el.children("th").length <= 1;

        const province = hasMultiCategory ? listOfStatus[index - 1].province : el.find("th:first-of-type").text().trim();
        const city = hasMultiCategory ? listOfStatus[index - 1].city : el.find("th:nth-of-type(2)").text();
        const category = el.find("th:last-of-type").text();
        const details = hasMultiCategory ? undefined : el.find("td:last-of-type").text().replace(/\n/g, "<br />");
        const hash = crypto.createHash("md5").update(details || "").digest("hex")
        const amount = listOfSubsidyAmount.find(item => item.province === province && item.city === city && item.category === category)

        const row: FCEVSubsidyStatus= {
            province,
            city,
            category,
            announcement: parseFCEVCount(el.find(`td:nth-of-type(${3 - ~~hasMultiCategory})`).text()),
            applicant: parseFCEVCount(el.find(`td:nth-of-type(${4 - ~~hasMultiCategory})`).text()),
            shipment: parseFCEVCount(el.find(`td:nth-of-type(${5 - ~~hasMultiCategory})`).text()),
            remaining: parseFCEVCount(el.find(`td:nth-of-type(${6 - ~~hasMultiCategory})`).text()),
            details,
            hash,
            amount: amount && amount.amount || 0
        }
        listOfStatus.push(row);
    })

    await saveLogData(listOfStatus);
}
const saveLogData = async (list: FCEVSubsidyStatus[]) => {

    const freshRegions = list.map((data) => {
       return {
           province: data.province,
           city: data.city,
       }
    })
    await prisma.region.createMany({
        data: freshRegions,
        skipDuplicates: true
    })

    const [mergedRegions, announcements] = await Promise.all([
        prisma.region.findMany(),
        prisma.announcement.findMany()
    ]);

    const freshRemainings = [], freshApplicants = [], freshShipments = [];

    for (const freshItem of list) {
        const reg = mergedRegions.find(reg => reg.city === freshItem.city && reg.province === freshItem.province)

        if(reg) {
            const announcement = announcements.find(a => a.region_id === reg.region_id && a.category === freshItem.category)

            let announcement_id = announcement ? announcement.announcement_id : null;

            if(announcement) {

                if(announcement.hash !== freshItem.hash || announcement.total !== freshItem.announcement.total || announcement.amount !== freshItem.amount) {
                    await prisma.announcement.update({
                        where: { announcement_id: announcement.announcement_id },
                        data: { total: freshItem.announcement.total, general: freshItem.announcement.general, priority: freshItem.announcement.priority, hash: freshItem.hash, details: freshItem.details, amount: freshItem.amount}
                    })
                }

            } else {

              const { announcement_id: aId } = await prisma.announcement.create({
                    data: {
                        region: {
                            connect: {
                                region_id: reg.region_id
                            }
                        },
                        category: freshItem.category,
                        details: freshItem.details,
                        hash: freshItem.hash,
                        period: String(new Date().getFullYear()),
                        total: freshItem.announcement.total,
                        priority: freshItem.announcement.priority,
                        general: freshItem.announcement.general,
                        amount: freshItem.amount
                    }
                });
              announcement_id = aId;

            }
            if(announcement_id) {

                freshApplicants.push({
                    ...freshItem.applicant,
                    region_id: reg.region_id,
                    announcement_id
                })
                freshRemainings.push({
                        ...freshItem.remaining,
                        region_id: reg.region_id,
                        announcement_id
                    })
                freshShipments.push({
                    ...freshItem.shipment,
                    region_id: reg.region_id,
                    announcement_id
                })

            }
        }
    }

    await Promise.all([
        prisma.applicant.createMany({
            data: freshApplicants
        }),
        prisma.remaining.createMany({
            data: freshRemainings
        }),
        prisma.shipment.createMany({
            data: freshShipments
        })
    ])
}

requestFreshFCEVStatus().then(_ => {
    return prisma.job_log.create({
        data: {
            did_succeed: true
        }
    })
}).catch(e => {
    return prisma.job_log.create({
        data: {
            did_succeed: false
        }
    })
}).finally(async () => {
    await prisma.$disconnect();
})