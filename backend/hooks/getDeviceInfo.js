import { UAParser } from "ua-parser-js";

const getDeviceInfo = (req) => {
    const parser = new UAParser(req.headers['user-agent']);
    const result = parser.getResult();
    return {
        browser: result.browser.name,
        os: result.os.name,
        device: result.device.model || "Unknown Device",
    };
};

export default getDeviceInfo;