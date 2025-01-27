// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Cấu hình ngôn ngữ mặc định và các ngôn ngữ hỗ trợ
i18n
  .use(initReactI18next) // Kết nối i18next với React
  .init({
    resources: {
      en: {
        translation: {
          welcome: "Welcome",
          logout: "Logout",
          // Thêm các key cần dịch vào đây
        },
      },
      vi: {
        translation: {
          welcome: "Chào mừng",
          logout: "Đăng xuất",
          // Thêm các key cần dịch vào đây
        },
      },
    },
    lng: "vi", // Ngôn ngữ mặc định là tiếng Việt
    fallbackLng: "en", // Ngôn ngữ dự phòng nếu không tìm thấy key
    interpolation: {
      escapeValue: false, // React đã tự xử lý escape
    },
  });

export default i18n;
