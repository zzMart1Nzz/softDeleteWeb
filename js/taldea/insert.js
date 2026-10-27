import { api } from '../api.js';
import { PrestatuGabekoErrorea } from './erroreak.js';

export async function gehituErreserba(erreserba) {
  // TODO (INSERT): return api.sortu('BENETAKO_INSERT_BIDEA', erreserba);
  // Gorputza: { pista_id, bazkidea_id, data: 'yyyy-MM-dd', ordua: 'HH:mm:ss' }.
  throw new PrestatuGabekoErrorea('Erreserbak gehitzeko aukera oraindik ez dago erabilgarri.');
}

export async function eskatuErreserbaSarrera(bazkidea) {
  // TODO (INSERT): hemen ireki etorkizuneko sarrera-inprimakia.
  // Erabili bazkidea.id eta deitu gehituErreserba(...) gorde aurretik.
  // true itzuli gorde bada (zerrenda berrituko da); false bertan behera utzi bada.
  throw new PrestatuGabekoErrorea('Erreserbak gehitzeko aukera oraindik ez dago erabilgarri.');
}
