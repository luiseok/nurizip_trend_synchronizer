const BASE_URL = "https://ev.or.kr"

const subsidyStatus = {
    FCEV: "portal/localInfo_h2",
    EV: "portal/localInfo_h2"
}

const subsidyAmount = {
    FCEV: "h2/pass/h2PopupLocalCarPirce"
}

const axiosHeader = {
    userAgent: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; FCEVSubsidyBot/1.0; +https://fcev-subsidy.luiseok.com) Safari/537.36",
    urlFormEncoded: "application/x-www-form-urlencoded"
}

export { BASE_URL, subsidyStatus, subsidyAmount, axiosHeader };