/**
 * Hifi Crackers - Google Sheet receiver
 * Paste this into Extensions > Apps Script of your Google Sheet,
 * then Deploy > New deployment > Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the Web app URL into CONFIG.SHEET_URL in script.js.
 */

const VISIT_HEADERS = [
  'Server Time (IST)', 'IP', 'City', 'Region', 'Country', 'Postal', 'Latitude', 'Longitude',
  'Map Link', 'ISP / Org', 'Timezone', 'Device', 'OS', 'Browser', 'Screen', 'Language',
  'Referrer', 'Page', 'Client Time', 'User Agent'
];

const ENQUIRY_HEADERS = [
  'Server Time (IST)', 'Name', 'Mobile', 'Interested In', 'City (typed)', 'Message',
  'IP', 'IP City', 'IP Region', 'IP Country', 'Device', 'OS', 'Browser', 'Status'
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    const now = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd-MM-yyyy HH:mm:ss');
    const clean = v => (v === undefined || v === null) ? '' : String(v).substring(0, 500);

    if (d.type === 'enquiry') {
      getSheet_('Enquiries', ENQUIRY_HEADERS).appendRow([
        now, clean(d.name), "'" + clean(d.mobile), clean(d.interest), clean(d.city), clean(d.message),
        clean(d.ip), clean(d.ipCity), clean(d.ipRegion), clean(d.ipCountry),
        clean(d.device), clean(d.os), clean(d.browser), 'New'
      ]);
    } else {
      const map = (d.latitude && d.longitude)
        ? 'https://maps.google.com/?q=' + d.latitude + ',' + d.longitude : '';
      getSheet_('Visitors', VISIT_HEADERS).appendRow([
        now, clean(d.ip), clean(d.city), clean(d.region), clean(d.country), clean(d.postal),
        clean(d.latitude), clean(d.longitude), map, clean(d.isp), clean(d.timezone),
        clean(d.device), clean(d.os), clean(d.browser), clean(d.screen), clean(d.language),
        clean(d.referrer), clean(d.page), clean(d.clientTime), clean(d.userAgent)
      ]);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, message: 'Hifi Crackers sheet endpoint is running' });
}

function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#b3001b').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
