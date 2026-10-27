import { konfigurazioa } from './konfigurazioa.js';

export class ApiErrorea extends Error {
  constructor(message, status = 0, type = '') {
    super(message);
    this.name = 'ApiErrorea';
    this.status = status;
    this.type = type;
  }
}

export function sortuApi({ helbidea = konfigurazioa.apiHelbidea, fetchFn = globalThis.fetch,
  denboraMuga = konfigurazioa.denboraMuga } = {}) {
  const base = new URL(helbidea.endsWith('/') ? helbidea : `${helbidea}/`);

  async function bidali(bidea, { method = 'GET', datuak, edukirikGabe = false } = {}) {
    if (typeof bidea !== 'string' || !bidea || bidea !== bidea.trim() || bidea.startsWith('/') || bidea.includes('\\') ||
        /^[a-z][a-z0-9+.-]*:/i.test(bidea) || bidea.split(/[/?#]/).includes('..')) {
      throw new ApiErrorea('APIaren bide erlatiboa erabili behar da.');
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), denboraMuga);
    try {
      const options = { method, signal: controller.signal, credentials: 'omit', headers: { Accept: 'application/json' } };
      if (datuak !== undefined) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(datuak);
      }
      const response = await fetchFn(new URL(bidea, base), options);
      if (edukirikGabe && response.status === 204) return null;
      let result = null;
      const content = await response.text();
      try { result = JSON.parse(content); } catch { /* Erantzun baliogabeak behean baztertzen dira. */ }
      if (!response.ok) {
        throw new ApiErrorea(result?.message || `APIak ezin izan du eragiketa egin (HTTP ${response.status}).`,
          response.status, result?.type || '');
      }
      if (!result || result.status !== 'success') throw new ApiErrorea('APIaren erantzuna ez da espero zena.');
      return result;
    } catch (error) {
      if (error instanceof ApiErrorea) throw error;
      if (controller.signal.aborted) throw new ApiErrorea('APIak ez du garaiz erantzun. Berritu zerrenda berriro saiatu aurretik.');
      throw new ApiErrorea('Ezin da APIarekin konektatu. Egiaztatu APIa martxan dagoela eta web helbidea baimenduta dagoela.');
    } finally { clearTimeout(timer); }
  }

  function egiaztatuId(id) {
    if (!Number.isInteger(id) || id <= 0 || id > 2147483647) throw new ApiErrorea('ID zenbaki oso positibo bat behar da.');
  }

  async function ezarriEgoera(id, desgaituta) {
    egiaztatuId(id);
    const result = await bidali(`api/Pista/${id}/${desgaituta ? 'desgaitu' : 'berreskuratu'}`,
      { method: 'PATCH', datuak: {} });
    if (result.data?.id !== id || result.data.desgaituta !== desgaituta) {
      throw new ApiErrorea('APIak ez du pistaren egoera espero bezala baieztatu. Berritu zerrenda.');
    }
    return result.data;
  }

  return Object.freeze({
    async login(id) {
      egiaztatuId(id);
      let result;
      try { result = await bidali('api/Bazkidea/login', { method: 'POST', datuak: { id } }); }
      catch (error) {
        if (error.status === 404 && error.type === 'ez_da_aurkitu') return null;
        throw error;
      }
      if (result.data?.id !== id) throw new ApiErrorea('APIak ez du eskatutako bazkidea itzuli.');
      return result.data;
    },
    desgaitu: id => ezarriEgoera(id, true),
    berreskuratu: id => ezarriEgoera(id, false),
    async lortuZerrenda(bidea) {
      const result = await bidali(bidea);
      if (result.type !== 'list' || !Array.isArray(result.dataList)) throw new ApiErrorea('APIak ez du espero zen zerrenda itzuli.');
      return result.dataList;
    },
    async sortu(bidea, datuak) {
      const result = await bidali(bidea, { method: 'POST', datuak });
      if (result.type !== 'element' || !result.data) throw new ApiErrorea('APIak ez du sortutako elementua itzuli.');
      return result.data;
    },
    async ezabatu(bidea) { await bidali(bidea, { method: 'DELETE', edukirikGabe: true }); }
  });
}

export const api = sortuApi();
