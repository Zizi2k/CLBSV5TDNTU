/**
 * Tiện ích dùng chung cho GAS Backend
 */

const SHEET_NAMES = {
  USERS: 'Users',
  MEMBERS: 'Members',
  ACTIVITIES: 'Activities',
  ACTIVITY_PARTICIPANTS: 'ActivityParticipants',
  ANNOUNCEMENTS: 'Announcements',
  EXECUTIVE_BOARD: 'ExecutiveBoard',
  ROLES: 'Roles',
  ATTENDANCE: 'Attendance',
  SCORES: 'Scores',
  SETTINGS: 'Settings',
  SESSIONS: 'Sessions',
  AUDIT_LOG: 'AuditLog'
};

function getSpreadsheet() {
  const ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!ssId) throw new Error('Chưa cấu hình SPREADSHEET_ID. Chạy initializeSheets() trước.');
  return SpreadsheetApp.openById(ssId);
}

function getSheet(name) {
  const sheet = getSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('Sheet không tồn tại: ' + name);
  return sheet;
}

function getSheetData(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] !== '' ? row[i] : ''; });
    return obj;
  });
}

function findRowById(sheetName, id, idCol = 'id') {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf(idCol);
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIndex]) === String(id)) {
      return { sheet, row: i + 1, headers, data: data[i] };
    }
  }
  return null;
}

function generateId(prefix) {
  return prefix + '_' + Utilities.getUuid().substring(0, 8).toUpperCase();
}

function hashPassword(password) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  return digest.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function generateToken() {
  return Utilities.getUuid() + '-' + Date.now();
}

function formatDate(date) {
  if (!date) return '';
  if (date instanceof Date) {
    return Utilities.formatDate(date, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
  }
  return String(date);
}

function formatDateTime(date) {
  if (!date) return '';
  if (date instanceof Date) {
    return Utilities.formatDate(date, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
  }
  return String(date);
}

function now() {
  return new Date();
}

function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((h, i) => { obj[h] = row[i] !== '' ? row[i] : ''; });
  return obj;
}

function appendRow(sheetName, obj) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => obj[h] !== undefined ? obj[h] : '');
  sheet.appendRow(row);
  return obj;
}

function updateRow(sheetName, id, updates, idCol = 'id') {
  const found = findRowById(sheetName, id, idCol);
  if (!found) throw new Error('Không tìm thấy bản ghi: ' + id);
  found.headers.forEach((h, i) => {
    if (updates[h] !== undefined) {
      found.sheet.getRange(found.row, i + 1).setValue(updates[h]);
    }
  });
}

function deleteRow(sheetName, id, idCol = 'id') {
  const found = findRowById(sheetName, id, idCol);
  if (!found) throw new Error('Không tìm thấy bản ghi: ' + id);
  found.sheet.deleteRow(found.row);
}

function maybeCleanupSessions() {
  try {
    const cache = CacheService.getScriptCache();
    if (cache.get('session_cleanup')) return;
    cleanupExpiredSessions();
    cache.put('session_cleanup', '1', 3600);
  } catch (e) {
    Logger.log('maybeCleanupSessions: ' + e.message);
  }
}

function cleanupExpiredSessions() {
  const sessions = getSheetData(SHEET_NAMES.SESSIONS);
  const nowTs = now().getTime();
  sessions.forEach(s => {
    if (!s.token) return;
    const exp = new Date(s.expiresAt).getTime();
    if (!isNaN(exp) && exp < nowTs) {
      try {
        deleteRow(SHEET_NAMES.SESSIONS, s.token, 'token');
      } catch (e) { /* ignore */ }
    }
  });
}

function safeSendEmail(to, subject, body, options) {
  if (!to && !(options && options.bcc)) return;
  try {
    const opts = options || {};
    MailApp.sendEmail({
      to: String(to || opts.bcc.split(',')[0]),
      bcc: opts.bcc || '',
      subject: subject,
      body: body,
      name: opts.name || 'CLB SV5T DNTU'
    });
  } catch (e) {
    Logger.log('Email skip (' + subject + '): ' + e.message);
  }
}

/** Email các tài khoản active — thông báo hoạt động mới */
function getActiveUserEmails() {
  const seen = {};
  const emails = [];
  getSheetData(SHEET_NAMES.USERS).forEach(u => {
    if (u.status !== 'active') return;
    const email = String(u.email || '').trim().toLowerCase();
    if (!email || seen[email]) return;
    seen[email] = true;
    emails.push(email);
  });
  return emails;
}

function notifyNewActivity(activity) {
  const emails = getActiveUserEmails();
  if (!emails.length) return { sent: 0 };

  const settings = getSettings();
  const clubName = settings.club_name || 'CLB SV5T DNTU';
  const contact = settings.contact_email || emails[0];
  const siteUrl = (settings.site_url || 'https://zizi2k.github.io/CLBSV5TDNTU/').replace(/\/?$/, '/');
  const detailUrl = siteUrl + '#activities/' + activity.id;

  const subject = '[' + clubName + '] Hoạt động mới: ' + activity.name;
  const body =
    'Xin chào,\n\n' +
    clubName + ' vừa đăng hoạt động mới:\n\n' +
    '• Tên: ' + (activity.name || '') + '\n' +
    (activity.criterion ? '• Tiêu chí: ' + activity.criterion + '\n' : '') +
    '• Thời gian: ' + formatDate(activity.startDate) + ' - ' + formatDate(activity.endDate) + '\n' +
    '• Địa điểm: ' + (activity.location || 'Chưa cập nhật') + '\n' +
    (activity.description ? '• Mô tả: ' + String(activity.description).substring(0, 300) + '\n' : '') +
    '\nXem chi tiết và đăng ký tham gia:\n' + detailUrl + '\n\n' +
    'Trân trọng,\n' + clubName;

  let sent = 0;
  const batchSize = 40;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    try {
      MailApp.sendEmail({
        to: contact,
        bcc: batch.join(','),
        subject: subject,
        body: body,
        name: clubName
      });
      sent += batch.length;
    } catch (e) {
      Logger.log('notifyNewActivity batch ' + i + ': ' + e.message);
    }
  }

  logAudit('NOTIFY_NEW_ACTIVITY', activity.id + ' -> ' + sent + ' emails', null);
  return { sent: sent };
}

/** Xếp hàng gửi email — không chặn API (tránh Failed to fetch / timeout) */
function queueNewActivityNotification(activity) {
  const props = PropertiesService.getScriptProperties();
  const key = 'PENDING_ACTIVITY_NOTIFY';
  let queue = [];
  try {
    queue = JSON.parse(props.getProperty(key) || '[]');
    if (!Array.isArray(queue)) queue = [];
  } catch (e) {
    queue = [];
  }
  queue.push(activity);
  props.setProperty(key, JSON.stringify(queue));

  const hasTrigger = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'processPendingActivityNotifications';
  });
  if (!hasTrigger) {
    ScriptApp.newTrigger('processPendingActivityNotifications')
      .timeBased()
      .after(15 * 1000)
      .create();
  }
}

function processPendingActivityNotifications() {
  const props = PropertiesService.getScriptProperties();
  const key = 'PENDING_ACTIVITY_NOTIFY';
  let queue = [];
  try {
    queue = JSON.parse(props.getProperty(key) || '[]');
    if (!Array.isArray(queue)) queue = [];
  } catch (e) {
    queue = [];
  }
  props.deleteProperty(key);

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'processPendingActivityNotifications') {
      try { ScriptApp.deleteTrigger(t); } catch (e) { /* ignore */ }
    }
  });

  queue.forEach(function (activity) {
    try {
      notifyNewActivity(activity);
    } catch (e) {
      Logger.log('process notify: ' + e.message);
    }
  });

  // Nếu trong lúc gửi lại có hàng đợi mới
  try {
    const more = JSON.parse(props.getProperty(key) || '[]');
    if (Array.isArray(more) && more.length) {
      ScriptApp.newTrigger('processPendingActivityNotifications')
        .timeBased()
        .after(20 * 1000)
        .create();
    }
  } catch (e) { /* ignore */ }
}

function logAudit(action, details, token) {
  try {
    let userId = 'system';
    if (token) {
      const session = getSheetData(SHEET_NAMES.SESSIONS).find(s => s.token === token);
      if (session) userId = session.userId;
    }
    appendRow(SHEET_NAMES.AUDIT_LOG, {
      id: generateId('LOG'),
      action: action,
      userId: userId,
      details: details,
      timestamp: formatDateTime(now())
    });
  } catch (e) {
    console.error('Audit log error:', e);
  }
}

function extractDriveFileId(value) {
  if (!value) return '';
  const str = String(value);
  if (!str.includes('http') && !str.includes('/')) return str;
  const match = str.match(/[-\w]{25,}/);
  return match ? match[0] : '';
}

function trashDriveFile(value) {
  const fileId = extractDriveFileId(value);
  if (!fileId) return;
  try {
    DriveApp.getFileById(fileId).setTrashed(true);
  } catch (e) { /* ignore */ }
}

function uploadAvatar(base64, filename, user, targetMemberId) {
  if (!base64) throw new Error('Không có dữ liệu ảnh');
  const folderId = PropertiesService.getScriptProperties().getProperty('AVATAR_FOLDER_ID');
  if (!folderId) throw new Error('Chưa cấu hình AVATAR_FOLDER_ID');

  let memberId = user.memberId || user.id;
  if (targetMemberId && targetMemberId !== memberId) {
    if (user.role !== 'admin' && user.role !== 'executive') {
      throw new Error('Bạn không có quyền đổi ảnh thành viên khác');
    }
    memberId = targetMemberId;
  }

  const members = getSheetData(SHEET_NAMES.MEMBERS);
  const existing = members.find(m => m.id === memberId);
  if (!existing) throw new Error('Không tìm thấy thành viên');

  const mimeType = (filename || '').toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  const blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, filename || 'avatar.jpg');
  const folder = DriveApp.getFolderById(folderId);

  if (existing.avatar) {
    trashDriveFile(existing.avatar);
  }

  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const url = 'https://drive.google.com/uc?id=' + file.getId();

  updateRow(SHEET_NAMES.MEMBERS, memberId, { avatar: url });
  logAudit('UPLOAD_AVATAR', memberId, null);
  return { url, memberId };
}

function uploadClubLogo(base64, filename, user) {
  if (!base64) throw new Error('Không có dữ liệu ảnh');
  if (!user || user.role !== 'admin') {
    throw new Error('Chỉ Admin mới được đổi logo CLB');
  }

  const folderId = PropertiesService.getScriptProperties().getProperty('AVATAR_FOLDER_ID');
  if (!folderId) throw new Error('Chưa cấu hình AVATAR_FOLDER_ID');

  const settings = getSettings();
  if (settings.club_logo) {
    trashDriveFile(settings.club_logo);
  }

  const mimeType = (filename || '').toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  const blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, filename || 'club-logo.jpg');
  const folder = DriveApp.getFolderById(folderId);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const url = 'https://drive.google.com/uc?id=' + file.getId();

  setSetting('club_logo', url);
  logAudit('UPLOAD_CLUB_LOGO', url, null);
  return { url };
}

function uploadActivityImage(base64, filename, user, activityId) {
  if (!base64) throw new Error('Không có dữ liệu ảnh');
  if (!user || (user.role !== 'admin' && user.role !== 'executive')) {
    throw new Error('Bạn không có quyền đổi ảnh hoạt động');
  }
  if (!activityId) throw new Error('Thiếu mã hoạt động');

  const activities = getSheetData(SHEET_NAMES.ACTIVITIES);
  const existing = activities.find(a => a.id === activityId);
  if (!existing) throw new Error('Không tìm thấy hoạt động');

  const folderId = PropertiesService.getScriptProperties().getProperty('AVATAR_FOLDER_ID');
  if (!folderId) throw new Error('Chưa cấu hình AVATAR_FOLDER_ID');

  if (existing.image) trashDriveFile(existing.image);

  const mimeType = (filename || '').toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  const blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, filename || 'activity.jpg');
  const folder = DriveApp.getFolderById(folderId);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const url = 'https://drive.google.com/uc?id=' + file.getId();

  updateRow(SHEET_NAMES.ACTIVITIES, activityId, { image: url });
  logAudit('UPLOAD_ACTIVITY_IMAGE', activityId, null);
  return { url, activityId };
}

function setSetting(key, value) {
  const sheet = getSheet(SHEET_NAMES.SETTINGS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyIndex = headers.indexOf('key');
  const valueIndex = headers.indexOf('value');

  for (let i = 1; i < data.length; i++) {
    if (data[i][keyIndex] === key) {
      sheet.getRange(i + 1, valueIndex + 1).setValue(value);
      return;
    }
  }

  appendRow(SHEET_NAMES.SETTINGS, { key: key, value: value, description: '' });
}

function getSettings() {
  const data = getSheetData(SHEET_NAMES.SETTINGS);
  const settings = {};
  data.forEach(row => { settings[row.key] = row.value; });
  return settings;
}

/** Gộp dữ liệu trang chủ — 1 request thay vì 3–4 */
function getHomeData() {
  return {
    activities: getActivities({}),
    announcements: getAnnouncements({}),
    members: getMembers({}),
    settings: getSettings()
  };
}

function getDashboard() {
  const members = getSheetData(SHEET_NAMES.MEMBERS);
  const users = getSheetData(SHEET_NAMES.USERS);
  const activities = getSheetData(SHEET_NAMES.ACTIVITIES);
  const announcements = getSheetData(SHEET_NAMES.ANNOUNCEMENTS);

  return {
    totalMembers: members.filter(m => m.status === 'active').length,
    pendingMembers: users.filter(u => u.status === 'pending').length,
    totalActivities: activities.length,
    totalAnnouncements: announcements.filter(a => a.hidden !== true && a.hidden !== 'TRUE').length,
    activeMembers: members.filter(m => m.status === 'active').length
  };
}

function getAuditLog() {
  const logs = getSheetData(SHEET_NAMES.AUDIT_LOG);
  const users = getSheetData(SHEET_NAMES.USERS);
  return logs.slice(-50).reverse().map(log => {
    const user = users.find(u => u.id === log.userId);
    return {
      action: log.action,
      user: user ? user.name : log.userId,
      details: log.details,
      timestamp: log.timestamp
    };
  });
}
