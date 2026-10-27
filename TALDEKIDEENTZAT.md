# Taldekideen APIak webarekin konektatu

Pantailak eta botoiak prest daude. Aldatu zure eragiketaren fitxategia; ez da `index.html` edo nabigazioa aldatu behar.

| Lana | Fitxategia | Konexio-puntua |
| --- | --- | --- |
| SELECT | `js/taldea/select.js` | `lortuErreserbak()` eta `lortuPistak(desgaituta)` |
| INSERT | `js/taldea/insert.js` | `gehituErreserba(erreserba)` eta etorkizuneko `eskatuErreserbaSarrera(bazkidea)` |
| DELETE | `js/taldea/delete.js` | `ezabatuPista(pistaId)` |

Metodo bakoitzak `PrestatuGabekoErrorea` botatzen du. Ordezkatu `throw` lerroa zure APIaren benetako bidearekin.
Gidako `BENETAKO_...` izenak markatzaileak dira, ez egindako endpoint-ak.

## SELECT

```js
return api.lortuZerrenda('BENETAKO_ERRESERBEN_BIDEA');
```

`lortuPistak(false)` deitzean APIak `desgaituta = 0` duten pistak itzuli behar ditu;
`lortuPistak(true)` deitzean `desgaituta = 1` dutenak bakarrik. Iragazkia zure SELECT endpoint-ak egingo du.
Egokitu bidea zure route-aren query parametro edo segmentura. Webak ez du iragazki hori inplementatzen.

Erantzuna APIko `ApiResponse<T>` formatuan:

```json
{"status":"success","code":200,"type":"list","message":"OK","dataList":[]}
```

Pistak: `id`, `izena`, `kirola`, `desgaituta`.
Erreserbak: `id`, `pista_id`, `bazkidea_id`, `data` (`yyyy-MM-dd`), `ordua` (`HH:mm:ss`).
Zerrenda benetan hutsik badago, `dataList: []` itzuli; akats baten aurrean HTTP errorea itzuli.

## INSERT

```js
return api.sortu('BENETAKO_INSERT_BIDEA', erreserba);
```

Gorputzaren egitura: `{ pista_id, bazkidea_id, data: 'yyyy-MM-dd', ordua: 'HH:mm:ss' }`.
Erantzunak `type: "element"` eta sortutako erreserba `data` eremuan izan behar ditu.
Ez bidali `Date` objekturik edo datu-baseko konexio-katerik.

Oraingoz ez dago sarrera-inprimakirik. Eraikitzen duzunean, ireki `eskatuErreserbaSarrera(bazkidea)` metodoan.
Erabili `bazkidea.id` sarreraren `bazkidea_id` betetzeko, eta deitu `gehituErreserba(...)` gorde aurretik.
`true` itzultzen bada webak zerrenda berritzen du; `false` itzultzen bada ez du berritzen.
Errore bat gertatuz gero, bota salbuespena; webak mezua erakutsiko du eta ez du arrakastarik simulatuko.

## DELETE

```js
return api.ezabatu('BENETAKO_DELETE_BIDEA/' + pistaId);
```

Desgaitutakoen taulako azken botoia metodo horretara lotuta dago. Aktiboen taulako **Ezabatu** botoiak soft delete egiten du.
DELETE erantzuna HTTP 204 edo `{ "status": "success", ... }` izan daiteke.
Errorea badago, errenkada ez da kentzen.

## Partekatutako bezeroa eta probak

`js/api.js` arduratzen da HTTP, JSON, errore, denbora-muga eta IDen balidazioaz.
Pasa bide erlatiboak (`api/...`), hasierako `/` gabe. Helbide nagusia `js/konfigurazioa.js` fitxategian dago.
Ez aldatu login-aren edo bi PATCH eragiketen bideak gainerako APIak konektatzeko.

`npm test` exekutatuta kontratua egiazta daiteke datu-basea aldatu gabe.
Gero probatu login-a benetako APIarekin, eta ziurtatu erabiltzen duzun web origin-a haren CORS konfigurazioan dagoela.
