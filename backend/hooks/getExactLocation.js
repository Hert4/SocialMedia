import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const getLocationFromIP = async (ip) => {
    const API_KEY = process.env.IP_INFO_TOKEN;
    try {
        const response = await axios.get(`https://ipinfo.io/${ip}?token=${API_KEY}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching location from IPInfo:", error.message);
        return null;
    }
};

export default getLocationFromIP;