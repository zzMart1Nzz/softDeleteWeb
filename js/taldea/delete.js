import { api } from '../api.js';
import { PrestatuGabekoErrorea } from './erroreak.js';

export async function ezabatuPista(pistaId) {
  // TODO (DELETE): return api.ezabatu('BENETAKO_DELETE_BIDEA/' + pistaId);
  // Desgaitutako pistaren behin betiko ezabatzea bakarrik.
  throw new PrestatuGabekoErrorea('Behin betiko ezabatzea oraindik ez dago erabilgarri.');
}
