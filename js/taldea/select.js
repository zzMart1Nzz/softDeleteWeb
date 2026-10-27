import { api } from '../api.js';
import { PrestatuGabekoErrorea } from './erroreak.js';

export async function lortuErreserbak() {
  // TODO (SELECT): ordezkatu throw lerroa zure benetako endpoint-arekin:
  // return api.lortuZerrenda('BENETAKO_ERRESERBEN_BIDEA');
  throw new PrestatuGabekoErrorea('Erreserben zerrenda oraindik ez dago erabilgarri.');
}

export async function lortuPistak(desgaituta) {
  // TODO (SELECT): false -> desgaituta = 0; true -> desgaituta = 1.
  // Zure APIak egin behar du iragazkia; aukeratu dagokion bidea hemen.
  // return api.lortuZerrenda('BENETAKO_PISTEN_BIDEA');
  throw new PrestatuGabekoErrorea('Pisten zerrenda oraindik ez dago erabilgarri.');
}
