import axios from 'axios';
import {subsidyStatus} from "./constants";
import cheerio from 'cheerio';
import {FCEVInterface, FCEVReceiptInterface} from "./types/FCEV";

const parseFCEVCount = (textString:string): FCEVReceiptInterface => {
    const parsedList = textString
        .split(" ")
        .map(text => text.trim())
        .map(parsed=> parseInt(parsed.replace(/\(|\)/g, ""), 10) || 0)

    const result:FCEVReceiptInterface = {
        total: parsedList.length < 3 ? parsedList.reduce((acc, cur) => {return acc += cur }, 0) : parsedList[0],
        priority: parsedList[parsedList.length - 2],
        general: parsedList[parsedList.length - 1]
    }

    return result;
}

const requestFCEVStatus = async () => {
    const {data} = await axios.get(subsidyStatus.FCEV);
    const $ = cheerio.load(data);

    const listOfStatus: FCEVInterface[] = [];

    const tableBody = $(".table_02_2_1 tbody > tr");
    tableBody.each((index, element) => {
        const el = $(element), prevEl = $(tableBody[index - 1])

        const category = el.find("th:last-of-type").text();

        const hasMultiCategory = prevEl.children().length > 0 && el.children("th").length <= 1;
        const row: FCEVInterface= {
            province: hasMultiCategory ? listOfStatus[index - 1].province : el.find("th:first-of-type").text(),
            city: hasMultiCategory ? listOfStatus[index - 1].city : el.find("th:nth-of-type(2)").text(),
            category,
            announcements: parseFCEVCount(el.find(`td:nth-of-type(${3 - ~~hasMultiCategory})`).text()),
            applicants: parseFCEVCount(el.find(`td:nth-of-type(${4 - ~~hasMultiCategory})`).text()),
            shipments: parseFCEVCount(el.find(`td:nth-of-type(${5 - ~~hasMultiCategory})`).text()),
            remaining: parseFCEVCount(el.find(`td:nth-of-type(${6 - ~~hasMultiCategory})`).text()),
            note: hasMultiCategory ? undefined : el.find("td:last-of-type").text().replace(/\n/g, "<br />")
        }
        listOfStatus.push(row);
    })
    console.log(listOfStatus)//.filter(l=>l.city === "함평군"));

}

requestFCEVStatus();