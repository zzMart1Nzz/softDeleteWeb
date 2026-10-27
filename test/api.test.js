import test from 'node:test';
import assert from 'node:assert/strict';
import { sortuApi, ApiErrorea } from '../js/api.js';
import { PrestatuGabekoErrorea } from '../js/taldea/erroreak.js';
import { lortuPistak, lortuErreserbak } from '../js/taldea/select.js';
import { gehituErreserba, eskatuErreserbaSarrera } from '../js/taldea/insert.js';
import { ezabatuPista } from '../js/taldea/delete.js';

const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
const success = data => ({ status: 'success', code: 200, type: 'element', data });

test('Login-ak IDa bakarrik bidaltzen du eta bazkidea itzultzen du', async () => {
  let request;
  const api = sortuApi({ fetchFn: async (url, options) => { request = { url, options }; return json(success({ id: 1, izena: 'Ane', abizena: 'Etxeberria' })); } });
  assert.equal((await api.login(1)).id, 1);
  assert.equal(request.url.pathname, '/api/Bazkidea/login');
  assert.equal(request.options.method, 'POST');
  assert.deepEqual(JSON.parse(request.options.body), { id: 1 });
  assert.equal(request.options.credentials, 'omit');
});

test('ID baliogabeekin ez da HTTP deirik egiten', async () => {
  let calls = 0;
  const api = sortuApi({ fetchFn: async () => { calls++; } });
  for (const id of [0, -1, 1.5, '1', NaN, 2147483648]) await assert.rejects(api.login(id), ApiErrorea);
  assert.equal(calls, 0);
});

test('Falta den bazkidea eta falta den route-a bereizten dira', async () => {
  const absent = sortuApi({ fetchFn: async () => json({ status: 'error', type: 'ez_da_aurkitu' }, 404) });
  assert.equal(await absent.login(1), null);
  const missing = sortuApi({ fetchFn: async () => new Response('', { status: 404 }) });
  await assert.rejects(missing.login(1), error => error.status === 404);
});

test('Beste bazkide baten erantzuna baztertzen da', async () => {
  const api = sortuApi({ fetchFn: async () => json(success({ id: 2 })) });
  await assert.rejects(api.login(1), /eskatutako bazkidea/);
});

for (const [name, disabled] of [['desgaitu', true], ['berreskuratu', false]]) {
  test(`${name}: PATCH bidea eta egoera egiaztatzen dira`, async () => {
    let request;
    const api = sortuApi({ fetchFn: async (url, options) => { request = { url, options }; return json(success({ id: 7, desgaituta: disabled })); } });
    assert.equal((await api[name](7)).desgaituta, disabled);
    assert.equal(request.url.pathname, `/api/Pista/7/${name}`);
    assert.equal(request.options.method, 'PATCH');
    assert.deepEqual(JSON.parse(request.options.body), {});
    const wrong = sortuApi({ fetchFn: async () => json(success({ id: 7, desgaituta: !disabled })) });
    await assert.rejects(wrong[name](7), /egoera/);
  });
}

test('Zerrendak dataList erabiltzen du eta GETek ez du gorputzik', async () => {
  let options;
  const api = sortuApi({ fetchFn: async (url, request) => { options = request; return json({ status: 'success', type: 'list', dataList: [] }); } });
  assert.deepEqual(await api.lortuZerrenda('proba/pistak'), []);
  assert.equal(options.method, 'GET');
  assert.equal(options.body, undefined);
  const wrong = sortuApi({ fetchFn: async () => json(success({ id: 1 })) });
  await assert.rejects(wrong.lortuZerrenda('proba/pistak'), /zerrenda/);
});

test('Etorkizuneko INSERT laguntzaileak JSON gorputza eta elementua erabiltzen ditu', async () => {
  const body = { pista_id: 7, bazkidea_id: 1, data: '2026-10-27', ordua: '20:00:00' };
  let options;
  const api = sortuApi({ fetchFn: async (url, request) => { options = request; return json(success({ id: 91, ...body }), 201); } });
  assert.equal((await api.sortu('proba/erreserbak', body)).id, 91);
  assert.deepEqual(JSON.parse(options.body), body);
});

test('Etorkizuneko DELETE laguntzaileak 204 eta JSON onartzen ditu', async () => {
  let options;
  const empty = sortuApi({ fetchFn: async (url, request) => { options = request; return new Response(null, { status: 204 }); } });
  await empty.ezabatu('proba/pistak/7');
  assert.equal(options.method, 'DELETE');
  assert.equal(options.body, undefined);
  await sortuApi({ fetchFn: async () => json({ status: 'success' }) }).ezabatu('proba/pistak/7');
});

test('APIaren erroreak gordetzen dira; HTML ez da arrakastatzat hartzen', async () => {
  const failed = sortuApi({ fetchFn: async () => json({ status: 'error', message: 'Proba errorea' }, 500) });
  await assert.rejects(failed.login(1), error => error.message === 'Proba errorea' && error.status === 500);
  const html = sortuApi({ fetchFn: async () => new Response('<html>errorea</html>') });
  await assert.rejects(html.login(1), /erantzuna/);
});

test('Denbora-mugak ulertzeko moduko errorea ematen du', async () => {
  const api = sortuApi({ denboraMuga: 5, fetchFn: (url, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new DOMException('Abort', 'AbortError')), { once: true });
  }) });
  await assert.rejects(api.login(1), /garaiz/);
});

test('Laguntzaileak ez ditu beste zerbitzari batera bidaltzen eskaerak', async () => {
  let calls = 0;
  const api = sortuApi({ fetchFn: async () => { calls++; } });
  for (const path of ['https://example.com/a', '//example.com/a', '/api/Pista', ' https://example.com/a', '../a', 'api\\Pista']) {
    await assert.rejects(api.ezabatu(path), ApiErrorea);
  }
  assert.equal(calls, 0);
});

test('Taldekideen SELECT, INSERT eta DELETE funtzioak prestatu gabe jarraitzen dute', async () => {
  for (const call of [() => lortuPistak(false), () => lortuPistak(true), lortuErreserbak,
    () => gehituErreserba({}), () => eskatuErreserbaSarrera({ id: 1 }), () => ezabatuPista(7)]) {
    await assert.rejects(call(), PrestatuGabekoErrorea);
  }
});
