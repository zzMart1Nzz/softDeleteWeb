import { api } from './api.js';
import { lortuErreserbak, lortuPistak } from './taldea/select.js';
import { eskatuErreserbaSarrera } from './taldea/insert.js';
import { ezabatuPista } from './taldea/delete.js';
import { PrestatuGabekoErrorea } from './taldea/erroreak.js';

const edukia = document.querySelector('#edukia');
const nabigazioa = document.querySelector('#nabigazioa');
const egoera = { ikuspegia: 'saioa', bazkidea: null, aurreikuspena: false, lanean: false, errenkadak: [] };
const taulak = {
  erreserbak: { izena: 'Erreserbak', etiketa: 'ERRESERBEN KUDEAKETA', azalpena: 'Kontsultatu zure erreserbak edo gehitu sarrera bat.',
    zutabeak: ['ID', 'Pista ID', 'Bazkide ID', 'Data', 'Ordua'], unitatea: 'erreserba' },
  pistak: { izena: 'Pistak', etiketa: 'PISTEN KUDEAKETA', azalpena: 'Pista bat ezabatzean, pista desgaituen zerrendara igaroko da.',
    zutabeak: ['ID', 'Izena', 'Kirola', 'Ezabatu'], unitatea: 'pista' },
  'pista-desgaituak': { izena: 'Pista desgaituak', etiketa: 'PISTEN KUDEAKETA', azalpena: 'Berreskuratu pista bat edo aukeratu behin betiko ezabatzea.',
    zutabeak: ['ID', 'Izena', 'Kirola', 'Berreskuratu', 'Ezabatu'], unitatea: 'pista' }
};

function ikonoa(izena) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(svg.namespaceURI, 'use');
  use.setAttribute('href', `#i-${izena}`);
  svg.append(use);
  return svg;
}

function testua(selector, value) { edukia.querySelector(selector).textContent = value; }
function txantiloia(id) { edukia.replaceChildren(document.querySelector(`#${id}-txantiloia`).content.cloneNode(true)); }

function mezua(message, mota = '') {
  const node = edukia.querySelector('#egoera');
  if (!node) return;
  node.textContent = message;
  node.className = `message${mota ? ` is-${mota}` : ''}`;
}

async function ekin(ekintza) {
  if (egoera.lanean) return false;
  egoera.lanean = true;
  document.querySelector('.app-shell').setAttribute('aria-busy', 'true');
  edukia.setAttribute('aria-busy', 'true');
  edukia.querySelector('.table-card')?.setAttribute('aria-busy', 'true');
  const controls = [...document.querySelectorAll('.app-shell button, .app-shell input')];
  controls.forEach(control => { control.disabled = true; });
  try { await ekintza(); return true; }
  catch (error) {
    mezua(error.message || 'Ezin izan da eragiketa egin.', error instanceof PrestatuGabekoErrorea ? '' : 'error');
    return false;
  } finally {
    egoera.lanean = false;
    controls.forEach(control => { control.disabled = false; });
    document.querySelector('.app-shell').removeAttribute('aria-busy');
    edukia.removeAttribute('aria-busy');
    edukia.querySelector('.table-card')?.removeAttribute('aria-busy');
  }
}

function nabigatu(ikuspegia, ordezkatu = false) {
  if (ordezkatu || location.hash === `#${ikuspegia}`) {
    history.replaceState(null, '', `#${ikuspegia}`);
    erakutsi(ikuspegia);
  } else location.hash = ikuspegia;
}

function saioaErakutsi() {
  const info = document.querySelector('#saio-info');
  info.replaceChildren();
  const dot = document.createElement('span');
  dot.className = 'status-dot';
  const label = document.createElement('span');
  label.textContent = egoera.bazkidea
    ? `Bazkidea #${egoera.bazkidea.id}\n${[egoera.bazkidea.izena, egoera.bazkidea.abizena].filter(Boolean).join(' ')}`
    : egoera.aurreikuspena ? 'AURREIKUSPENA\nSaioa hasi gabe' : 'Ongi etorri';
  info.append(dot, label);
  nabigazioa.hidden = egoera.ikuspegia === 'saioa';
  document.querySelector('#aurreikuspen-oharra').hidden = !egoera.aurreikuspena;
  document.querySelector('#irten-botoia').textContent = egoera.aurreikuspena ? 'Aurreikuspena itxi ↗' : 'Saioa itxi ↗';
  document.querySelector('#atzera-botoia').hidden = egoera.ikuspegia === 'hasiera';
  document.querySelector('#atal-izena').textContent = taulak[egoera.ikuspegia]?.izena || (egoera.ikuspegia === 'pisten-menua' ? 'Pistak' : '');
}

function erakutsi(ikuspegia) {
  const allowed = ['saioa', 'hasiera', 'pisten-menua', ...Object.keys(taulak)];
  if (!allowed.includes(ikuspegia)) return nabigatu(egoera.bazkidea || egoera.aurreikuspena ? 'hasiera' : 'saioa', true);
  if (ikuspegia !== 'saioa' && !egoera.bazkidea && !egoera.aurreikuspena) return nabigatu('saioa', true);
  if (ikuspegia === 'saioa') { egoera.bazkidea = null; egoera.aurreikuspena = false; }
  egoera.ikuspegia = ikuspegia;
  egoera.errenkadak = [];
  saioaErakutsi();

  if (ikuspegia === 'saioa') {
    txantiloia('saioa');
    edukia.querySelector('#saio-inprimakia').addEventListener('submit', hasiSaioa);
    edukia.querySelector('#bazkide-id').focus();
  } else if (ikuspegia === 'hasiera' || ikuspegia === 'pisten-menua') {
    menuaErakutsi(ikuspegia === 'hasiera');
  } else {
    txantiloia('taula');
    const definition = taulak[ikuspegia];
    testua('#orriko-izenburua', definition.izena);
    testua('#orriko-etiketa', definition.etiketa);
    testua('#orriko-azalpena', definition.azalpena);
    testua('#taula-izena', ikuspegia === 'pista-desgaituak' ? 'Desgaitutako pisten zerrenda' : `${definition.izena} · Zerrenda`);
    edukia.querySelector('#gehitu-botoia').hidden = ikuspegia !== 'erreserbak';
    const heading = edukia.querySelector('#taula-goiburua');
    definition.zutabeak.forEach(title => {
      const th = document.createElement('th'); th.scope = 'col'; th.textContent = title; heading.append(th);
    });
    hutsikErakutsi('Zerrenda kargatzen…', 'Itxaron une batez.');
    void kargatuZerrenda();
  }
  document.title = `${ikuspegia === 'saioa' ? 'Hasi saioa' : edukia.querySelector('h1')?.textContent.trim() || 'Kiroldegia'} | Kiroldegia`;
  if (ikuspegia !== 'saioa') edukia.focus({ preventScroll: true });
}

function menuaErakutsi(hasiera) {
  txantiloia('menu');
  testua('#orriko-etiketa', hasiera ? 'ZURE KUDEAKETA GUNEA' : 'PISTEN KUDEAKETA');
  testua('#orriko-izenburua', hasiera ? 'Zer kudeatu nahi duzu?' : 'Aukeratu pisten zerrenda');
  testua('#orriko-azalpena', hasiera ? 'Dena leku berean. Aukeratu atal bat hasteko.' : 'Pista erabilgarriak eta desgaitutakoak, bakoitza bere lekuan.');
  testua('#menu-laguntza', hasiera ? 'Atal bakoitzean zerrendak eta dagozkien ekintzak aurkituko dituzu.' : 'Desgaitutako pista bat berreskuratzean, berriro erabilgarri egongo da.');
  const options = hasiera ? [
    { izena: 'Erreserbak', azalpena: 'Zerrenda ikusi eta sarrerak gehitu.', ikonoa: 'calendar', ikuspegia: 'erreserbak' },
    { izena: 'Pistak', azalpena: 'Pistak eta desgaitutako pistak kudeatu.', ikonoa: 'court', ikuspegia: 'pisten-menua' }
  ] : [
    { izena: 'Pistak', azalpena: 'Kontsultatu erabilgarri dauden pistak.', ikonoa: 'court', ikuspegia: 'pistak' },
    { izena: 'Pista desgaituak', azalpena: 'Berreskuratu edo behin betiko ezabatu.', ikonoa: 'archive', ikuspegia: 'pista-desgaituak' }
  ];
  const grid = edukia.querySelector('#menu-aukerak');
  options.forEach(option => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'menu-card'; button.dataset.view = option.ikuspegia;
    const icon = document.createElement('span'); icon.className = 'card-icon'; icon.append(ikonoa(option.ikonoa));
    const h2 = document.createElement('h2'); h2.textContent = option.izena;
    const p = document.createElement('p'); p.textContent = option.azalpena;
    const open = document.createElement('span'); open.className = 'open-label'; open.append('Ireki atala', ikonoa('arrow'));
    button.append(icon, h2, p, open); grid.append(button);
  });
}

async function hasiSaioa(event) {
  event.preventDefault();
  if (egoera.lanean) return;
  const input = edukia.querySelector('#bazkide-id');
  const raw = input.value.trim();
  const id = Number(raw);
  if (!/^[0-9]+$/.test(raw) || !Number.isInteger(id) || id <= 0 || id > 2147483647) {
    input.setAttribute('aria-invalid', 'true'); mezua('Sartu bazkidearen ID zenbaki oso positibo bat.', 'error'); input.focus(); return;
  }
  input.removeAttribute('aria-invalid');
  let member = null;
  const ok = await ekin(async () => {
    mezua('Bazkidea egiaztatzen…');
    member = await api.login(id);
    if (!member) mezua('Ez dago ID hori duen bazkiderik.', 'error');
  });
  if (ok && member) { egoera.bazkidea = member; egoera.aurreikuspena = false; nabigatu('hasiera'); }
  else input.focus();
}

async function kargatuZerrenda() {
  if (!taulak[egoera.ikuspegia] || egoera.lanean) return;
  const ok = await ekin(async () => {
    mezua('Zerrenda kargatzen…');
    const rows = egoera.ikuspegia === 'erreserbak'
      ? await lortuErreserbak() : await lortuPistak(egoera.ikuspegia === 'pista-desgaituak');
    if (!Array.isArray(rows)) throw new Error('Zerrendaren erantzuna ez da zuzena.');
    egoera.errenkadak = rows;
    errenkadakErakutsi();
    mezua(rows.length ? `${rows.length} ${taulak[egoera.ikuspegia].unitatea}.` : 'Ez dago daturik zerrenda honetan.');
  });
  if (!ok && !egoera.errenkadak.length) {
    hutsikErakutsi('Zerrenda oraindik ez dago erabilgarri', 'Geroago berritu dezakezu.');
  }
}

function hutsikErakutsi(title, description) {
  const tbody = edukia.querySelector('#taula-gorputza');
  if (!tbody) return;
  const row = document.createElement('tr'); row.className = 'empty-row';
  const td = document.createElement('td'); td.colSpan = taulak[egoera.ikuspegia].zutabeak.length; td.className = 'empty-cell';
  const empty = document.createElement('div'); empty.className = 'empty-state';
  const strong = document.createElement('strong'); strong.textContent = title;
  const p = document.createElement('p'); p.textContent = description;
  empty.append(ikonoa(egoera.ikuspegia === 'erreserbak' ? 'calendar' : 'court'), strong, p); td.append(empty); row.append(td); tbody.replaceChildren(row);
}

function errenkadakErakutsi() {
  const rows = egoera.errenkadak;
  const definition = taulak[egoera.ikuspegia];
  testua('#kopurua', `${rows.length} ${definition.unitatea}`);
  if (!rows.length) { hutsikErakutsi('Ez dago daturik', 'Zerrenda hau hutsik dago.'); return; }
  const tbody = edukia.querySelector('#taula-gorputza'); tbody.replaceChildren();
  rows.forEach(item => {
    const tr = document.createElement('tr');
    const values = egoera.ikuspegia === 'erreserbak'
      ? [item.id, item.pista_id, item.bazkidea_id, String(item.data ?? '').slice(0, 10), String(item.ordua ?? '').slice(0, 5)]
      : [item.id, item.izena, item.kirola];
    values.forEach(value => { const td = document.createElement('td'); td.textContent = value ?? '—'; tr.append(td); });
    if (egoera.ikuspegia !== 'erreserbak') {
      if (egoera.ikuspegia === 'pista-desgaituak') tr.append(ekintzaGelaxka(item, 'berreskuratu', 'Berreskuratu'));
      tr.append(ekintzaGelaxka(item, 'ezabatu', 'Ezabatu'));
    }
    tbody.append(tr);
  });
}

function ekintzaGelaxka(pista, action, label) {
  const td = document.createElement('td');
  const button = document.createElement('button'); button.type = 'button';
  button.className = `row-action${action === 'berreskuratu' ? ' recover' : ''}`;
  button.textContent = label; button.dataset.action = action; button.dataset.id = pista.id;
  button.setAttribute('aria-label', `${label}: ${pista.izena || `Pista ${pista.id}`}`);
  td.append(button); return td;
}

function baimenduta() {
  if (!egoera.bazkidea || egoera.aurreikuspena) { mezua('Ekintza hau egiteko, hasi saioa.', 'error'); return false; }
  return true;
}

function baieztatu(title, description, recover) {
  const dialog = document.querySelector('#baieztapen-leihoa');
  dialog.querySelector('#baieztapen-izenburua').textContent = title;
  dialog.querySelector('#baieztapen-testua').textContent = description;
  const button = dialog.querySelector('#baieztatu-botoia');
  button.textContent = recover ? 'Berreskuratu' : 'Ezabatu';
  button.className = `button ${recover ? 'button-primary' : 'button-danger'}`;
  dialog.returnValue = '';
  return new Promise(resolve => {
    dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), { once: true });
    dialog.showModal();
  });
}

async function pistaEkintza(action, id) {
  if (!baimenduta()) return;
  const pista = egoera.errenkadak.find(item => item.id === id);
  if (!pista) return;
  const recover = action === 'berreskuratu';
  const permanent = egoera.ikuspegia === 'pista-desgaituak' && !recover;
  if (recover && egoera.ikuspegia !== 'pista-desgaituak') return;
  const name = pista.izena || `Pista #${pista.id}`;
  const title = recover ? 'Pista berreskuratu?' : permanent ? 'Behin betiko ezabatu?' : 'Pista desgaitu?';
  const description = permanent ? `«${name}» pista behin betiko ezabatu nahi duzu?`
    : `«${name}» pista eta hari lotutako erreserba guztiak ${recover ? 'berreskuratu' : 'desgaitu'} nahi dituzu?`;
  if (!await baieztatu(title, description, recover)) return;
  await ekin(async () => {
    if (permanent) await ezabatuPista(pista.id);
    else if (recover) await api.berreskuratu(pista.id);
    else await api.desgaitu(pista.id);
    egoera.errenkadak = egoera.errenkadak.filter(item => item.id !== id);
    errenkadakErakutsi();
    mezua(permanent ? 'Pista behin betiko ezabatu da.' : `Pista eta haren erreserbak ${recover ? 'berreskuratu' : 'desgaitu'} dira.`, 'success');
  });
}

document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  edukia.focus();
});

document.addEventListener('click', async event => {
  const button = event.target.closest('button[data-action], button[data-view]');
  if (!button || egoera.lanean) return;
  if (button.dataset.view) return nabigatu(button.dataset.view);
  switch (button.dataset.action) {
    case 'aurreikusi': egoera.bazkidea = null; egoera.aurreikuspena = true; nabigatu('hasiera'); break;
    case 'irten': nabigatu('saioa'); break;
    case 'atzera': nabigatu(['pistak', 'pista-desgaituak'].includes(egoera.ikuspegia) ? 'pisten-menua' : 'hasiera'); break;
    case 'berritu': await kargatuZerrenda(); break;
    case 'gehitu': {
      if (!baimenduta()) return;
      let gehituta = false;
      await ekin(async () => { gehituta = await eskatuErreserbaSarrera(egoera.bazkidea); });
      if (gehituta) await kargatuZerrenda();
      break;
    }
    case 'ezabatu': case 'berreskuratu': await pistaEkintza(button.dataset.action, Number(button.dataset.id)); break;
  }
});

window.addEventListener('hashchange', () => {
  if (egoera.lanean) { history.replaceState(null, '', `#${egoera.ikuspegia}`); return; }
  erakutsi(location.hash.slice(1) || 'saioa');
});
erakutsi(location.hash.slice(1) || 'saioa');
