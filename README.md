# Hifi Crackers Website

Static site (HTML + CSS + JS + Bootstrap 5) for GitHub Pages.
It records each visitor's IP address, approximate location and device in a Google Sheet, and saves enquiry form submissions to the same sheet.

## Files
| File | Purpose |
|---|---|
| `index.html` | Page layout |
| `style.css` | Theme (navy blue & orange from the logo), responsive styles |
| `logo.png` | Hifi Crackers logo (navbar, footer, favicon) |
| `script.js` | Settings (CONFIG), supply items, gift boxes, products, visitor tracking, enquiry form |
| `google-apps-script/Code.gs` | Paste into Google Apps Script. Writes the data to the sheet |

## 1. Set up the Google Sheet
1. Create a new Google Sheet (for example "Hifi Crackers Data").
2. Open **Extensions → Apps Script**, delete the sample code and paste in `Code.gs`. Save.
3. Click **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Authorize it, then copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`).
5. The `Visitors` and `Enquiries` tabs are created automatically when the first data arrives.

> If you later change `Code.gs`, use **Deploy → Manage deployments → Edit → New version**, so the URL stays the same.

## 2. Configure the site
Open `script.js` and edit `CONFIG`:
- `SHEET_URL`: the Web app URL from step 4
- `WHATSAPP`: WhatsApp number with 91 in front, digits only
- `SUPPLY`: items you supply (crackers, sweets, dress, grocery...)
- `GIFT_BOXES`: gift box names and contents
- `PRODUCTS`: product categories

## 3. Deploy to GitHub Pages
1. Push these files to the root of your repository.
2. Go to **Settings → Pages → Deploy from a branch → main / (root)**.
3. Optional custom domain: add `hificrackers.online` under Pages, and in Cloudflare DNS add a `CNAME` record from `www` (or `@`) to `<your-username>.github.io`.

## Notes
- Location is IP-based (ipapi.co, with ipwho.is as fallback). It's usually accurate to the city, not the street, and VPN users show the VPN's location.
- A visit is logged once per browser session, so refreshes don't flood the sheet.
- ipapi.co's free tier allows about 1,000 lookups a day. When it runs out, the fallback is used.
