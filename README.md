# Kiroldegia — web interfazea

HTML, CSS eta JavaScript hutsezko web interfazea, euskaraz. Ez du kanpoko mendekotasunik edo build urratsik behar.
Biltegi hau webarena da; APIa eta Windows Forms interfazea beste Git biltegi batzuetan daude.

## Abiarazi

1. Abiarazi APIa haren `ApiErreserba` karpetatik: `dotnet run --launch-profile http`.
2. Webaren karpeta honetan, Node.js 20 edo berriagoa erabiliz: `npm start`.
3. Ireki **http://127.0.0.1:5500** eta sartu datu-basean dagoen bazkidearen IDa.

Windowsen, `Abiarazi.cmd` fitxategian klik bikoitza eginda ere abiaraz dezakezu web zerbitzaria.
Lanzagailuak instalatutako Node.js erabiltzen du; ordenagailu honetan, beharrezkoa bada, Codex-en tokiko Node ere aurkitzen du.
Zerbitzaria ixteko, erabili `Ctrl+C` haren leihoan. Lehendik martxan badago, ireki helbidea beste instantzia bat abiarazi gabe.

Ez da `npm install` egin behar. Beste aukera bat VS Code-ko Live Server erabiltzea da, 5500 atakan.
Erabili HTTP zerbitzaria; `index.html` fitxategian klik bikoitza egiteak ez ditu JavaScript moduluak eta APIaren baimenak behar bezala kargatzen.

APIa `http://localhost:5289/` helbidean dago. Helbidea aldatzeko, editatu `js/konfigurazioa.js`.
MySQLren erabiltzailea eta pasahitza APIaren `appsettings.Local.json` fitxategian daude; ez dira webera bidaltzen.
APIko `Web:AllowedOrigins` konfigurazioak `http://localhost:5500` eta `http://127.0.0.1:5500` baimentzen ditu.
Beste web ataka bat erabiltzean, gehitu haren origin-a APIko konfigurazioan eta berrabiarazi APIa.

## Pantailak

- Bazkidearen IDarekin saioa hasi, pasahitzik gabe.
- Hasiera: **Erreserbak** eta **Pistak** botoi handiak.
- Erreserbak: taula, **Erreserba gehitu** eta **Berritu** botoiak.
- Pistak: **Pistak** eta **Pista desgaituak** azpimenua.
- Pista aktiboen taula: **Ezabatu** azken zutabean, soft delete egiteko.
- Pista desgaituen taula: **Berreskuratu** eta **Ezabatu** azken bi zutabeetan.

Login-a, soft delete-a eta berreskuratzea benetako APIra konektatuta daude.
Pista eta hari lotutako erreserba guztiak desgaitzen edo berreskuratzen dira, APIaren jokabideari jarraituz.
Baieztapena eskatu eta APIak arrakasta baieztatu ondoren bakarrik kentzen da errenkada uneko taulatik.

**Interfazea aurreikusi** aukerak pantailak erakusten ditu saiorik hasi gabe. Modu horretan ezin da daturik aldatu.
Ez dago adibideko erabiltzailerik edo daturik.

## Taldekideek osatzeko

SELECT, INSERT eta behin betiko DELETE ez dira inplementatu. Zerrendak hutsik eta erabilgarri ez daudela agertzea normala da,
taldekideek beren endpoint-ak konektatu arte. Ez dago erreserba-sarrerako inprimakirik eraikita.

Irakurri [TALDEKIDEENTZAT.md](TALDEKIDEENTZAT.md): arduradun bakoitzak bere fitxategia du `js/taldea/` karpetan.

## Probak

Exekutatu `npm test`. Probak Node-ren tresna propioekin egiten dira, kanpoko paketerik gabe.
HTTP deiak probetan ordezkatzen dira; ez da benetako pista edo erreserbarik aldatzen.

13 proba automatiko gainditu dira. Nabigatzailean ID baliogabea, falta den bazkidea,
benetako login-a (ID 1), menuak, prestatu gabeko taulak eta aurreikuspenaren blokeoa egiaztatu dira.
390 px-ko pantailan ere probatu da, alboko gainezkatzerik gabe.

## Git biltegiak

Web honen erroa `softDeleteWeb/softDeleteWeb` da, `index.html` eta `.git` dituen karpeta.
APIaren erroa `Api` da, `softDelete` adarrean. Windows Forms interfazearen erroa `softDeleteEntrega` da.
Ez gehitu hirurak biltzen dituen `entregaErrserba` karpeta Git biltegi bakar gisa.
