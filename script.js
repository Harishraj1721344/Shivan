/* ============================================================
   Hifi Crackers - site script
   Edit the CONFIG block below; nothing else needs changing.
   ============================================================ */
const CONFIG = {
  // Paste your Google Apps Script Web App URL here (see README.md)
  SHEET_URL: 'https://script.google.com/macros/s/AKfycbx27dueDycU_NQRC2imY3QAMTa48O9eVEy5QeEwYCZQEMO0x7t13RJL3bTV16Gyn1MH/exec',

  // WhatsApp number with country code, digits only
  WHATSAPP: '916382108462',

  // What we supply - edit freely
  SUPPLY: [
    { icon: 'bi-fire',        name: 'Crackers',  desc: 'Sparklers, flower pots, chakkars, rockets, shots & more' },
    { icon: 'bi-cake2',       name: 'Sweets',    desc: 'Festival sweets & snacks, boxed or loose' },
    { icon: 'bi-handbag',     name: 'Dresses',   desc: 'Sarees, dhotis, shirts & kids wear' },
    { icon: 'bi-basket2',     name: 'Grocery',   desc: 'Rice, oil, dal & festival grocery kits' },
    { icon: 'bi-gift',        name: 'Gift Boxes', desc: 'Low-price combo boxes for any budget' },
    { icon: 'bi-plus-circle', name: 'Anything Else', desc: 'Need another item? Ask us, we\'ll arrange it' }
  ],

  // Gift boxes - no prices shown; customers ask for the price list
  GIFT_BOXES: [
    { name: 'Crackers Gift Box', items: 'Assorted crackers for the whole family' },
    { name: 'Sweet Box',         items: 'Mixed festival sweets & snacks' },
    { name: 'Grocery Combo',     items: 'Essential grocery kit for the festival' },
    { name: 'Festival Combo',    items: 'Crackers + sweets + dress in one box', popular: true }
  ],

  // Product categories
  PRODUCTS: [
    { icon: 'bi-stars',          name: 'Sparklers',      desc: '7cm to 50cm, electric & colour' },
    { icon: 'bi-flower2',        name: 'Flower Pots',    desc: 'Small, big, special & deluxe' },
    { icon: 'bi-arrow-repeat',   name: 'Ground Chakkars', desc: 'Big, special & deluxe chakkars' },
    { icon: 'bi-rocket-takeoff', name: 'Rockets',        desc: 'Baby, colour & whistling rockets' },
    { icon: 'bi-lightning-charge', name: 'Bombs',        desc: 'Atom, hydro & bijili crackers' },
    { icon: 'bi-brightness-high', name: 'Fancy Shots',   desc: 'Multi-colour sky shots' },
    { icon: 'bi-link-45deg',     name: 'Garlands',       desc: '100 to 10,000 wala' },
    { icon: 'bi-gift',           name: 'Gift Boxes',     desc: 'Family & corporate gift boxes' }
  ]
};

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rupee = n => '₹' + Number(n).toLocaleString('en-IN');
const waUrl = text => `https://wa.me/${CONFIG.WHATSAPP}${text ? '?text=' + encodeURIComponent(text) : ''}`;
const sheetReady = () => CONFIG.SHEET_URL && CONFIG.SHEET_URL.startsWith('https://script.google.com/');

function sendToSheet(payload) {
  if (!sheetReady()) { console.warn('SHEET_URL not set - data not saved', payload); return Promise.resolve(); }
  // text/plain avoids a CORS preflight; Apps Script reads e.postData.contents
  return fetch(CONFIG.SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
}

/* ---------- render sections ---------- */
function renderSupply() {
  $('#supplyGrid').innerHTML = CONFIG.SUPPLY.map(p => `
    <div class="col-6 col-md-4">
      <div class="supply-card"><i class="bi ${p.icon}"></i><h5>${p.name}</h5><p>${p.desc}</p></div>
    </div>`).join('');
}

function renderGiftBoxes() {
  $('#giftGrid').innerHTML = CONFIG.GIFT_BOXES.map(g => `
    <div class="col-sm-6 col-lg-3">
      <div class="plan-card ${g.popular ? 'popular' : ''}">
        ${g.popular ? '<span class="ribbon">BEST VALUE</span>' : ''}
        <div class="gift-icon"><i class="bi bi-gift-fill"></i></div>
        <h5>${g.name}</h5>
        <p class="small text-muted">${g.items}</p>
        <span class="low-price">Low price</span>
        <button class="btn btn-fire w-100 mt-3 ask-box" data-box="${g.name}">Ask Price</button>
      </div>
    </div>`).join('');

  $$('.ask-box').forEach(btn => btn.addEventListener('click', () => {
    $('#interestSelect').value = 'Gift Box';
    $('#enquiryForm [name=message]').value = `Please share the price for the ${btn.dataset.box}.`;
    $('#enquiry').scrollIntoView({ behavior: 'smooth' });
  }));
}

function renderProducts() {
  $('#productGrid').innerHTML = CONFIG.PRODUCTS.map(p => `
    <div class="col-6 col-md-3">
      <div class="product-card"><div class="p-icon"><i class="bi ${p.icon}"></i></div><h6>${p.name}</h6><p>${p.desc}</p></div>
    </div>`).join('');
}

function setupWhatsApp() {
  const href = waUrl('Hi Hifi Crackers, I have an enquiry.');
  $$('.wa-link').forEach(a => a.href = href);
  const n = CONFIG.WHATSAPP.replace(/^91/, '');
  $$('.wa-display').forEach(s => s.textContent = `+91 ${n.slice(0, 5)} ${n.slice(5)}`);
}

/* ---------- visitor tracking (IP + location) ---------- */
async function getIpInfo() {
  // Primary: ipapi.co  |  Fallback: ipwho.is  (both free, HTTPS, no key)
  try {
    const r = await fetch('https://ipapi.co/json/');
    if (r.ok) {
      const d = await r.json();
      if (!d.error) return {
        ip: d.ip, city: d.city, region: d.region, country: d.country_name, postal: d.postal,
        latitude: d.latitude, longitude: d.longitude, isp: d.org, timezone: d.timezone
      };
    }
  } catch (_) { /* try fallback */ }
  try {
    const r = await fetch('https://ipwho.is/');
    const d = await r.json();
    if (d.success) return {
      ip: d.ip, city: d.city, region: d.region, country: d.country, postal: d.postal,
      latitude: d.latitude, longitude: d.longitude, isp: d.connection && d.connection.isp,
      timezone: d.timezone && d.timezone.id
    };
  } catch (_) { /* ignore */ }
  return { ip: 'unknown' };
}

function deviceInfo() {
  const ua = navigator.userAgent;
  const device = /Mobi|Android|iPhone/i.test(ua) ? 'Mobile' : /iPad|Tablet/i.test(ua) ? 'Tablet' : 'Desktop';
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome'
    : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Other';
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad|iOS/.test(ua) ? 'iOS'
    : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Other';
  return {
    device, browser, os,
    screen: `${screen.width}x${screen.height}`,
    language: navigator.language,
    referrer: document.referrer || 'Direct',
    page: location.pathname + location.hash,
    userAgent: ua
  };
}

let visitorCache = null;
async function trackVisit() {
  const ipInfo = await getIpInfo();
  visitorCache = ipInfo;
  // log once per browser session so refreshes don't flood the sheet
  try { if (sessionStorage.getItem('hc_logged')) return; } catch (_) {}
  await sendToSheet({ type: 'visit', clientTime: new Date().toString(), ...ipInfo, ...deviceInfo() });
  try { sessionStorage.setItem('hc_logged', '1'); } catch (_) {}
}

/* ---------- enquiry form ---------- */
function setupForm() {
  const form = $('#enquiryForm');
  const msg = $('#formMsg');

  $$('[data-enquiry]').forEach(a => a.addEventListener('click', () => {
    $('#interestSelect').value = a.dataset.enquiry;
  }));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
    const data = Object.fromEntries(new FormData(form));
    const btn = $('#submitBtn');
    btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Sending...';
    try {
      const v = visitorCache || {};
      await sendToSheet({
        type: 'enquiry', ...deviceInfo(), ...data,
        ip: v.ip, ipCity: v.city, ipRegion: v.region, ipCountry: v.country
      });
      msg.className = 'small text-success fw-semibold';
      msg.textContent = 'Thank you! We received your enquiry and will contact you soon.';
      form.reset(); form.classList.remove('was-validated');
    } catch (err) {
      msg.className = 'small text-danger';
      msg.textContent = 'Could not send. Please call or WhatsApp us.';
    } finally {
      btn.disabled = false; btn.innerHTML = '<i class="bi bi-send"></i> Submit';
    }
  });

  $('#waSendBtn').addEventListener('click', () => {
    const d = Object.fromEntries(new FormData(form));
    const text = `Hi Hifi Crackers,\nName: ${d.name || '-'}\nMobile: ${d.mobile || '-'}\nInterested in: ${d.interest || '-'}\nCity: ${d.city || '-'}\nMessage: ${d.message || '-'}`;
    window.open(waUrl(text), '_blank');
  });
}

/* ---------- hero sparkles ---------- */
function sparkles() {
  const c = $('#sparkCanvas'); if (!c) return;
  const ctx = c.getContext('2d');
  let parts = [];
  const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
  resize(); addEventListener('resize', resize);
  const colors = ['#ff8a00', '#ffc61a', '#4da3ff', '#ffffff', '#ff3b3b'];
  function burst() {
    const x = Math.random() * c.width, y = Math.random() * c.height * 0.6;
    const col = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 40; i++) {
      const a = Math.PI * 2 * i / 40, s = Math.random() * 3 + 1;
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 70, col });
    }
  }
  setInterval(burst, 900);
  (function loop() {
    ctx.fillStyle = 'rgba(4,15,46,0.18)';
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.globalCompositeOperation = 'lighter';
    parts = parts.filter(p => p.life-- > 0);
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.04;
      ctx.fillStyle = p.col; ctx.globalAlpha = p.life / 70;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  })();
}

/* ---------- nav: close on click ---------- */
function setupNav() {
  const menu = $('#navMenu');
  $$('#navMenu .nav-link').forEach(l => l.addEventListener('click', () => {
    if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide();
  }));
}

/* ---------- scroll reveal ---------- */
function setupReveal() {
  const els = $$('.section-title, .sale-card, .supply-card, .plan-card, .product-card, .how-box, .hl-card, .enquiry-card, .contact-row');
  els.forEach(el => el.classList.add('reveal'));
  if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  $('#year').textContent = new Date().getFullYear();
  renderSupply();
  renderGiftBoxes();
  renderProducts();
  setupWhatsApp();
  setupForm();
  setupNav();
  setupReveal();
  sparkles();
  trackVisit();
});
