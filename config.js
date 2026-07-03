/**
 * Cấu hình hệ thống CLB SV5T DNTU
 * Thay API_URL bằng URL Web App sau khi deploy Google Apps Script
 */
const CONFIG = {
  APP_VERSION: '2.5.0',
  API_URL: 'https://script.google.com/macros/s/AKfycbxYYUIMoXe3SG2wQky6-tQAEQ3T5ofeaQ8XZvb_Jkir16n3dYyLFfOZN7CjRI46F7kR4w/exec',
  CLUB_NAME: 'CLB SV5T DNTU',
  CLUB_SHORT: 'CLB SV5T DNTU',
  CLUB_TAGLINE: 'Nơi kết nối – Phát triển – Cống hiến',
  CLUB_ADDRESS: 'Phường Trảng Dài, Thành phố Đồng Nai',
  CONTACT_EMAIL: 'clbsv5t.dongnai@gmail.com',
  FACEBOOK_URL: 'https://www.facebook.com/share/1AJGDLFM6D/',
  FACEBOOK_LABEL: 'CLB SV5T DNTU',
  COLORS: {
    primary: '#0B84FF',
    primaryDark: '#0066DD',
    primaryLight: '#4DC3FF',
    accent: '#FACC15',
    white: '#FFFFFF'
  },
  ROLES: {
    admin: 'Admin',
    executive: 'Ban Chủ nhiệm',
    member: 'Thành viên',
    guest: 'Khách'
  },
  MEMBER_STATUS: {
    pending: 'Chờ duyệt',
    active: 'Đã kích hoạt',
    locked: 'Đã khóa'
  },
  ACTIVITY_STATUS: {
    ongoing: 'Đang diễn ra',
    upcoming: 'Sắp diễn ra',
    completed: 'Đã kết thúc'
  }
};
