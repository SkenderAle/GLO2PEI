/* === ICF: Semantic index for DFPF (documentazione + funzionamento osservato) ===
   Scopo: affiancare la ricerca testuale (codice/titolo) con una ricerca "di senso".
   Nota: non seleziona nulla automaticamente; filtra solo la lista di codici.
*/
const ICF_SEMANTIC_CONCEPTS = [
  { key:"vista", synonyms:["visivo","occhio","occhi","vedere","guardare","percezione visiva","acuita","campo visivo","illuminazione","contrasto"], codes:{ b:["b210","b2100","b2101","b2102","b1560"], s:["s220","s230"], d:["d110","d160","d166","d170","d315","d320"], e:["e150","e240","e130","e115","e125"] } },
  { key:"udito", synonyms:["uditivo","orecchio","orecchi","sentire","ascolto","ascoltare","comprensione uditiva","rumore"], codes:{ b:["b230"], s:["s260"], d:["d115","d310"], e:["e250","e125","e130"] } },
  { key:"attenzione", synonyms:["concentrazione","distrazione","focalizzare","focus","sostenere l'impegno"], codes:{ b:["b140"], d:["d160","d210","d220"], e:["e250","e130","e580"] } },
  { key:"memoria", synonyms:["memoria di lavoro","richiamo","ricordo","trattenere"], codes:{ b:["b144"], d:["d155","d160","d210"], e:["e130","e115"] } },
  { key:"funzioni esecutive", synonyms:["pianificazione","organizzazione","autocontrollo","flessibilita","routine","agenda","transizioni","gestione tempi"], codes:{ b:["b164"], d:["d230","d210","d220"], e:["e580","e130","e115"] } },
  { key:"linguaggio", synonyms:["comprensione","espressione","lessico","frase","parlato"], codes:{ b:["b167"], d:["d310","d320","d330","d350"], e:["e125","e340","e460"] } },
  { key:"comunicazione", synonyms:["messaggi","non verbale","gesti","espressioni","contesto","conversazione"], codes:{ d:["d315","d330","d350","d360"], e:["e125","e340","e460"] } },
  { key:"lettura", synonyms:["decodifica","fluenza","comprensione del testo","leggere","testo"], codes:{ d:["d166","d320"], e:["e130","e115","e125"] } },
  { key:"scrittura", synonyms:["grafia","copiare","produzione scritta","scrivere"], codes:{ d:["d170","d130"], e:["e130","e115"] } },
  { key:"calcolo", synonyms:["matematica","numeri","operazioni","problem solving matematico"], codes:{ d:["d172","d175"], e:["e130"] } },
  { key:"autonomia", synonyms:["autonomia personale","autonomia scolastica","gestione materiale","diario","agenda","organizzazione"], codes:{ d:["d230","d210"], e:["e580","e130","e115"] } },
  { key:"routine", synonyms:["transizioni","tempi","prima-poi","checklist"], codes:{ d:["d230"], b:["b164"], e:["e580","e130"] } },
  { key:"ansia", synonyms:["stress","prestazione","agitazione","paura","frustrazione","tolleranza frustrazione"], codes:{ b:["b152"], d:["d240"], e:["e450","e460","e585","e580"] } },
  { key:"regolazione emotiva", synonyms:["emozioni","rabbia","frustrazione","autocontrollo emotivo"], codes:{ b:["b152"], d:["d240"], e:["e450","e460"] } },
  { key:"comportamento", synonyms:["condotta","regole","impulsivita","oppositivita","conflitti"], codes:{ d:["d710","d240"], b:["b152","b164"], e:["e450","es2g2B4"] } },
  { key:"relazione", synonyms:["interazione","turni","cooperazione","lavoro di gruppo"], codes:{ d:["d710","d750","d820"], e:["e450","e460"] } },
  { key:"socialita", synonyms:["amicizie","inclusione","pari","gruppo"], codes:{ d:["d750","d710","d820"], e:["e450","e460"] } },
  { key:"rumore", synonyms:["affollamento","riverbero","chiasso","confusione"], codes:{ e:["e250"], d:["d115","d310"], b:["b140"] } },
  { key:"tecnologie", synonyms:["tablet","pc","app","software","sintesi vocale","correttore","digitale"], codes:{ e:["e115","e125","e130"] } },
  { key:"ambiente", synonyms:["spazi","setting","classe","organizzazione","tempi rigidi","flessibilita"], codes:{ e:["e150","e580","e250","e130"] } },
  { key:"caa", synonyms:["comunicazione aumentativa","pittogrammi","simboli","ausili comunicativi"], codes:{ e:["e125"], d:["d360","d330"] } }
];

function _icfNorm(s){
  return String(s||"")
    .toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu,"")
    .replace(/\s+/g," ")
    .trim();
}

function _semanticCandidates(query){
  const q = _icfNorm(query);
  if(!q) return null;
  const hits = new Set();
  for(const c of ICF_SEMANTIC_CONCEPTS){
    const terms = [c.key, ...(c.synonyms||[])].map(_icfNorm);
    if(terms.some(t => t && (q.includes(t) || t.includes(q)))){
      for(const group of Object.values(c.codes||{})){
        for(const code of group) hits.add(code);
      }
    }
  }
  return hits.size ? hits : null;
}

function semanticHitICF(code, query){
  const set = _semanticCandidates(query);
  if(!set) return false;
  return set.has(String(code));
}

// Chips: click to fill search + trigger filter
document.addEventListener("click", function(e){
  const chip = e.target.closest(".chip[data-q]");
  if(!chip) return;
  const input = document.getElementById("diagIcfSearch");
  if(!input) return;
  input.value = chip.dataset.q;
  input.dispatchEvent(new Event("input", { bubbles:true }));
});


/** =========================
 *  Modello dati tabella
 *  ========================= */
const COLS = [
  { key:"lieve",  label:"Lieve" },
  { key:"media",  label:"Media" },
  { key:"grave",  label:"Grave" },
  { key:"comm",   label:"Con compromissione comunicativa" },
  { key:"mot",    label:"Con compromissione motoria" },
  { key:"cog",    label:"Con compromissione cognitiva" },
  { key:"pluri",  label:"Con pluridisabilità" },
];

const DISABILITA = [
  {
    id:"intellettiva",
    label:"Disabilità intellettiva",
    severity: {
      lieve: "borderline / funzionamento limite",
      media: "disabilità intellettiva media",
      grave: "disabilità intellettiva grave",
    },
    flags: { comm:2, mot:1, cog:3, pluri:2 }
  },
  {
    id:"autismo",
    label:"Disturbo dello spettro autistico",
    severity: {
      lieve: "ASD livello 1",
      media: "ASD livello 2",
      grave: "ASD livello 3",
    },
    flags: { comm:3, mot:1, cog:2, pluri:2 }
  },
  {
    id:"fisica",
    label:"Disabilità fisica",
    severity: {
      lieve: "deficit motorio lieve",
      media: "deficit motorio medio",
      grave: "tetraplegia / gravi paralisi",
    },
    flags: { comm:1, mot:3, cog:1, pluri:2 }
  },
  {
    id:"vista",
    label:"Disabilità sensoriale – vista",
    severity: {
      lieve: "ipovisione",
      media: "ipovisione grave",
      grave: "cecità",
    },
    flags: { comm:2, mot:-1, cog:1, pluri:2 }
  },
  {
    id:"udito",
    label:"Disabilità sensoriale – udito",
    severity: {
      lieve: "ipoacusia lieve",
      media: "ipoacusia grave",
      grave: "sordità",
    },
    flags: { comm:3, mot:-1, cog:1, pluri:2 }
  },
  {
    id:"neurologica",
    label:"Disabilità neurologica",
    severity: {
      lieve: "epilessie compensate",
      media: "paralisi cerebrali medie",
      grave: "encefalopatie gravi",
    },
    flags: { comm:2, mot:2, cog:2, pluri:3 }
  },
  {
    id:"genetiche",
    label:"Patologie genetiche / sindromiche",
    severity: {
      lieve: "forme lievi",
      media: "forme classiche",
      grave: "forme severe",
    },
    flags: { comm:2, mot:2, cog:3, pluri:3 }
  },
  {
    id:"acquisite",
    label:"Traumi o patologie acquisite",
    severity: {
      lieve: "esiti lievi",
      media: "esiti moderati",
      grave: "esiti invalidanti",
    },
    flags: { comm:1, mot:2, cog:1, pluri:2 }
  },
];

const NEEDS = [
  { key:"lettura", label:"Difficoltà lettura" },
  { key:"scrittura", label:"Difficoltà scrittura/ortografia" },
  { key:"calcolo", label:"Difficoltà calcolo" },
  { key:"attenzione", label:"Attenzione / autoregolazione (ADHD)" },
  { key:"ansia", label:"Ansia / stress prestazionale" },
  { key:"comportamento", label:"Comportamenti problema / oppositività" },
  { key:"linguaggio", label:"Linguaggio (lessico/sintassi)" },
  { key:"memoria", label:"Memoria / funzioni esecutive" },
];

/** =========================
 *  Metodologie didattiche (catalogo editabile)
 *  - key: id stabile
 *  - label: titolo breve
 *  - out: testo da riportare nell'output (5.2)
 *  - group: per menu a tendina
 * ========================= */
const METHODS_CATALOG = [
  { key:"udl", group:"Generali", label:"Universal Design for Learning (UDL)", out:"UDL: obiettivi chiari, più modalità di accesso (visivo/uditivo/pratico) e più modalità di risposta (orale, scritto, digitale, grafico)." },
  { key:"taskAnalysis", group:"Generali", label:"Task Analysis (Analisi del compito)", out:"Task Analysis: scomposizione del compito in unità piccole e sequenziali; consegne brevi + esempi; acquisizione graduale delle autonomie." },
  { key:"scaffoldingGradualita", group:"Generali", label:"Scaffolding e gradualità", out:"Scaffolding e gradualità: dal guidato all’autonomo (prompting e fading), con supporti temporanei e feedback frequenti." },
  { key:"routineAgenda", group:"Generali", label:"Routine prevedibili e agenda", out:"Routine prevedibili: agenda (visiva/verbale), anticipazioni e chiusure (inizio/fine attività), tempi e regole stabili." },
  { key:"istruzioneEsplicita", group:"Generali", label:"Istruzione esplicita (Direct Instruction)", out:"Istruzione esplicita: modellamento, pratica guidata, verifica di comprensione, esercitazione distribuita e feedback immediato." },
  { key:"modelingThinkAloud", group:"Generali", label:"Modeling e Think-Aloud", out:"Modeling/Think-Aloud: l’insegnante mostra la procedura e verbalizza i passaggi per rendere visibile il ragionamento." },
  { key:"metacognizione", group:"Studio e valutazione", label:"Metacognizione e autoregolazione", out:"Metacognizione: strategie di studio, pianificazione, monitoraggio, autovalutazione (checklist, rubriche, goal setting)." },
  { key:"spacedPractice", group:"Studio e valutazione", label:"Ripasso distribuito (Spaced Practice)", out:"Ripasso distribuito: richiami frequenti e brevi nel tempo, alternando ripresa e applicazione in contesti diversi." },
  { key:"valutazioneFormativa", group:"Studio e valutazione", label:"Valutazione formativa", out:"Valutazione formativa: criteri trasparenti, rubriche, feedback sul processo, verifiche brevi e frequenti, possibilità di revisione." },
  { key:"valutazioneBassaAnsia", group:"Studio e valutazione", label:"Valutazione a bassa ansia", out:"Valutazione a bassa ansia: prove brevi, programmazione anticipata, tempo aggiuntivo, alternative di risposta, pause e feedback rassicurante." },

  { key:"peerTutoring", group:"Inclusione e cooperazione", label:"Peer Tutoring (Tutoring tra pari)", out:"Peer Tutoring: un alunno svolge il ruolo di tutor per un compagno; potenzia l’autostima e facilita la comunicazione con linguaggio semplificato." },
  { key:"cooperativeLearning", group:"Inclusione e cooperazione", label:"Apprendimento Cooperativo (Cooperative Learning)", out:"Cooperative Learning: lavoro in piccoli gruppi con obiettivo comune; interdipendenza positiva, ruoli, competenze sociali e responsabilità condivisa." },
  { key:"cooperativeRoles", group:"Inclusione e cooperazione", label:"Cooperative Learning con ruoli e accessibilità", out:"Cooperative Learning con ruoli: compiti differenziati, ruoli chiari e materiali accessibili per garantire partecipazione reale e pari dignità." },
  { key:"didatticaLaboratoriale", group:"Inclusione e cooperazione", label:"Didattica laboratoriale (learning by doing)", out:"Didattica laboratoriale: apprendimento attraverso esperienza diretta e manipolazione; riduce l’astrazione e sostiene motivazione e generalizzazione." },

  { key:"preteachingLessico", group:"Accessibilità e linguaggio", label:"Pre-teaching lessicale e supporti visivi", out:"Pre-teaching: anticipazione del lessico/concetti, esempi modello, mappe e immagini; riduce carico cognitivo e migliora comprensione/produzione." },
  { key:"accessibilitaMateriali", group:"Accessibilità e linguaggio", label:"Accessibilità dei materiali e canali multipli", out:"Accessibilità: testi semplificati/strutturati, font leggibili, audio/caption, immagini, strumenti digitali; cura del layout e del carico percettivo." },
  { key:"caa", group:"Autismo e comunicazione", label:"Comunicazione Aumentativa e Alternativa (CAA)", out:"CAA: strategie e strumenti (es. PECS, tabelle, simboli, comunicatore) per facilitare comunicazione e comprensione in difficoltà del linguaggio verbale." },

  { key:"teacch", group:"Autismo e comunicazione", label:"TEACCH (approccio strutturato)", out:"TEACCH: organizzazione di spazio/tempo e uso di agende visive per prevedibilità e autonomia, particolarmente efficace nei profili autistici." },
  { key:"videoModeling", group:"Autismo e comunicazione", label:"Storytelling e Video Modeling", out:"Storytelling/Video Modeling: narrazioni o filmati che mostrano come svolgere azioni o gestire situazioni sociali, facilitando apprendimento per imitazione." },
  { key:"socialStories", group:"Autismo e comunicazione", label:"Storie sociali e script", out:"Storie sociali/script: brevi testi o sequenze visive per preparare a contesti e regole sociali, riducendo ansia e migliorando prevedibilità." },

  { key:"flippedClassroom", group:"Studio e valutazione", label:"Flipped Classroom (Classe capovolta)", out:"Flipped Classroom: contenuti a casa (video/materiali visivi) e tempo in classe per attività pratiche e personalizzate con supporto del docente." },

  { key:"tokenEconomy", group:"Comportamento", label:"Token Economy (Economia a gettoni)", out:"Token Economy: rinforzo positivo tramite 'gettoni' e premi simbolici per comportamenti/obiettivi; utile nella gestione del comportamento." },
  { key:"pbs", group:"Comportamento", label:"Supporto positivo al comportamento (PBS)", out:"PBS: prevenzione e insegnamento di comportamenti alternativi, rinforzo positivo, adattamento dell’ambiente e coerenza educativa." },
  { key:"abc", group:"Comportamento", label:"Analisi ABC del comportamento", out:"Analisi ABC: osservazione Antecedente–Comportamento–Conseguenza per individuare funzioni, prevenire trigger e progettare interventi efficaci." },
  { key:"selfMonitoring", group:"Comportamento", label:"Auto-monitoraggio e gestione dell’attenzione", out:"Auto-monitoraggio: timer, checklist on-task, pause programmate, obiettivi brevi e rinforzi; utile per attenzione e autoregolazione." },
  { key:"pacingPause", group:"Comportamento", label:"Pacing e pause programmate", out:"Pacing: alternanza lavoro–pausa, segmentazione dei tempi, riduzione carico e recupero; utile in affaticabilità o profili neuro/medici." },

// --- Sensoriali (Udito) ---
{group:"Sensoriali – Udito", key:"uditoComunicazioneAccessibile", label:"Comunicazione accessibile per ipoacusia/sordità (clear speech, visibilità del volto, pause, controllo comprensione)", out:"Comunicazione accessibile per ipoacusia/sordità: parlare fronte classe con articolazione chiara, ritmo regolare e pause; mantenere visibile il volto, riformulare e verificare la comprensione; evitare parlare mentre si scrive o con luce alle spalle."},
{group:"Sensoriali – Udito", key:"uditoSupportiVisiviSottotitoli", label:"Sottotitoli, trascrizioni e supporti visivi (parole-chiave, mappe, immagini) per contenuti orali", out:"Predisporre sottotitoli/trascrizioni, parole‑chiave e mappe per sostenere l’accesso ai contenuti orali; consegnare schemi e sintesi prima/dopo la lezione."},
{group:"Sensoriali – Udito", key:"uditoGestioneAcusticaTurni", label:"Gestione dell’ambiente acustico e dei turni di parola (riduzione rumore, regole conversazionali)", out:"Ridurre rumore di fondo e distanza; stabilire regole di turn‑taking (un parlante alla volta), segnali visivi per richiamare l’attenzione e posizionamento favorevole (prima fila, buona illuminazione)."},
{group:"Sensoriali – Udito", key:"uditoApproccioBilingueLIS", label:"Approccio bilingue/bimodale (LIS + italiano scritto/orale) / Total Communication (se previsto)", out:"Se previsto nel profilo comunicativo: approccio bilingue/bimodale (LIS + italiano scritto/orale) o Total Communication, con coerenza tra canali, mediazione linguistica e adattamento dei materiali."},
{group:"Sensoriali – Udito", key:"uditoCuedSpeech", label:"Cued Speech / supporto fonologico visivo (se adottato)", out:"Se adottato: Cued Speech o supporti fonologici visivi per sostenere la discriminazione dei fonemi e l’accesso alla lingua parlata/scritta."},
{group:"Sensoriali – Udito", key:"uditoSupportoAppunti", label:"Supporto al note-taking (appunti condivisi, schemi consegnati, compagno di appunti)", out:"Ridurre il carico di appunti durante l’ascolto: appunti condivisi, schemi consegnati, compagno di appunti, registrazioni consentite e materiali digitali accessibili."},

// --- Sensoriali (Vista) ---
{group:"Sensoriali – Vista", key:"vistaDescrizioneVerbale", label:"Descrizione verbale sistematica di immagini, grafici, dimostrazioni e procedure", out:"Descrivere in modo esplicito ciò che è scritto/mostrato (lavagna, slide, gesti, grafici), verbalizzando passaggi e relazioni; usare un linguaggio preciso e controllare la comprensione."},
{group:"Sensoriali – Vista", key:"vistaMaterialiTattili", label:"Materiali tattili e grafici in rilievo (tactile graphics), modelli 3D e manipolazione", out:"Integrare materiali tattili (grafici in rilievo, mappe tattili, modelli 3D) e attività manipolative per sostenere concetti spaziali e STEM, con tempi adeguati di esplorazione."},
{group:"Sensoriali – Vista", key:"vistaBrailleAlfabetizzazione", label:"Alfabetizzazione Braille e competenze alternative di lettura/scrittura (se necessario)", out:"Se necessario: alfabetizzazione Braille e/o strategie di lettura/scrittura alternative (dattilobraille, barra braille, dettatura), con progressione e generalizzazione nelle discipline."},
{group:"Sensoriali – Vista", key:"vistaOrientamentoMobilita", label:"Orientamento e mobilità (O&M) e autonomia negli spazi scolastici", out:"Percorsi strutturati di orientamento e mobilità e autonomie negli spazi (aula, corridoi, laboratori), con routine, riferimenti stabili e insegnamento esplicito delle strategie di spostamento."},
{group:"Sensoriali – Vista", key:"vistaECC", label:"Expanded Core Curriculum (ECC) per disabilità visiva (autonomie, tecnologie, autodeterminazione)", out:"Integrare elementi dell’Expanded Core Curriculum: competenze compensative (Braille/ausili), tecnologie assistive, efficienza sensoriale, interazione sociale, autonomie personali, orientamento e mobilità, autodeterminazione."},
{group:"Sensoriali – Vista", key:"vistaTecnologieAssistive", label:"Tecnologie assistive e accessibilità digitale (screen reader, ingranditori, scorciatoie, formati accessibili)", out:"Uso didattico di tecnologie assistive (screen reader, ingranditori, OCR, barra braille) e produzione di materiali in formati accessibili (struttura, titoli, testo selezionabile, descrizioni alternative)."},
];

// mappa rapida
const METHODS_MAP = (() => {
  const m = new Map();
  for(const it of METHODS_CATALOG) m.set(it.key, it);
  return m;
})();

function methodOut(key){
  const it = METHODS_MAP.get(String(key));
  return it ? (it.out || it.label || "") : "";
}



/** =========================
 *  Contesti: Famiglia e Scuola (checklist rapida)
 *  ========================= */
const FAMILY_CRIT = [
  { key:"assenzaGenitore", label:"Assenza di un genitore / affidamento / tutela" },
  { key:"separazioneConflitto", label:"Separazione o conflitto genitoriale" },
  { key:"fragilitaSocioEco", label:"Fragilità socio-economiche / precarietà" },
  { key:"disagioPsicoSociale", label:"Disagio psico-sociale (stress elevato, eventi critici)" },
  { key:"barriereLinguistiche", label:"Barriere linguistiche/culturali (mediazione utile)" },
  { key:"caregiverSovraccarico", label:"Caregiver sovraccarico / difficoltà nel supporto quotidiano" },
  { key:"altraDisabilitaFam", label:"Altra disabilità/fragilità rilevante in famiglia" },
  { key:"contattoDifficile", label:"Comunicazione scuola–famiglia difficile o discontinua" },
  { key:"serviziCoinvolti", label:"Servizi/educatori coinvolti (tutela, supporto) – indicare solo l’operativo" },
];

const FAMILY_POS = [
  { key:"collaborazione", label:"Alleanza educativa forte e collaborazione" },
  { key:"routineStabili", label:"Routine stabili e prevedibilità a casa" },
  { key:"supportoRete", label:"Rete di supporto (nonni/parenti/associazioni)" },
  { key:"motivazioneFam", label:"Motivazione a sostenere obiettivi condivisi" },
  { key:"accessoTecnologie", label:"Tecnologie/strumenti disponibili e utilizzabili" },
];

const SCHOOL_CTX = [
  { key:"rumoreAffollamento", label:"Rumore/affollamento elevati (attenzione/udibilità)" },
  { key:"classeMoltoEterogenea", label:"Classe molto eterogenea (molti bisogni)" },
  { key:"continuitaDocenti", label:"Buona continuità docenti/figure di riferimento" },
  { key:"cambiFrequenti", label:"Cambi frequenti (docenti, spazi, routine)" },
  { key:"spazioQuiete", label:"Spazio quiete/angolo decompressione disponibile" },
  { key:"peerSupport", label:"Compagni disponibili (peer tutoring possibile)" },
  { key:"dotazioniDigitali", label:"Dotazioni digitali utilizzabili (tablet/PC/lab)" },
  { key:"spaziAccessibili", label:"Spazi accessibili (palestra, laboratori, bagni, corridoi)" },
];

/** =========================
 *  Obiettivi operativi verificabili (SMART) + monitoraggio
 *  ========================= */
const SMART_VERBS = [
  "indicare", "riconoscere", "descrivere", "spiegare", "riassumere",
  "seguire", "eseguire", "applicare", "utilizzare", "organizzare",
  "pianificare", "completare", "mantenere", "riprendere", "autocorreggere",
  "chiedere", "rispondere", "collaborare", "rispettare", "gestire"
];

const SMART_TIMEFRAMES = [
  "entro 4 settimane",
  "entro 8 settimane",
  "entro 12 settimane",
  "entro il trimestre/quadrimestre",
  "entro fine anno"
];

const VERIFY_TOOLS = [
  { key:"griglia", label:"Griglia di osservazione" },
  { key:"rubrica", label:"Rubrica (criteri/descrittori)" },
  { key:"checklist", label:"Checklist / check-in" },
  { key:"prodotto", label:"Prodotto dell'alunno (compito autentico)" },
  { key:"prova", label:"Prova strutturata adattata" },
  { key:"osservazione", label:"Osservazione sistematica (time-sampling)" },
  { key:"portfolio", label:"Portfolio/diario di bordo" },
  { key:"autoval", label:"Autovalutazione guidata" },
  { key:"abc", label:"Analisi ABC (se comportamenti problema)" }
];

const RESPONSIBLES = [
  "Team docenti",
  "Docenti curricolari",
  "Docente di sostegno",
  "Educatore/assistente",
  "Assistente comunicazione",
  "Famiglia (supporto)",
  "Servizi/terapisti (raccordo)"
];

function uid(prefix="g"){
  return prefix + "_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}
function hashStr(s){
  // hash semplice e stabile per identificare testi (custom objectives)
  let h = 2166136261;
  const str = String(s || "");
  for(let i=0;i<str.length;i++){
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return ("00000000" + h.toString(16)).slice(-8);
}
function defaultVerbForICF(code, label){
  const c = String(code || "");
  const l = (label || "").toLowerCase();
  if(c === "d160" || c === "b140") return "mantenere";
  if(c === "d230" || c === "b164") return "organizzare";
  if(c === "d310" || c === "d320") return "comprendere";
  if(c === "d330" || c === "d350") return "esprimere";
  if(c === "d710" || c === "d720") return "collaborare";
  if(c === "d166") return "leggere";
  if(c === "d170") return "scrivere";
  if(c === "d172") return "calcolare";
  if(l.includes("chiedere")) return "chiedere";
  if(l.includes("gestire")) return "gestire";
  return "eseguire";
}
function defaultCriterionForICF(code){
  const c = String(code || "");
  if(c === "d160" || c === "b140") return "mantiene l'attenzione per almeno 10 minuti con massimo 1 richiamo, in 4/5 occasioni";
  if(c === "d230" || c === "b164") return "gestisce la routine con checklist con massimo 1 prompt, in 4/5 occasioni";
  if(c === "d310" || c === "d320") return "comprende e riformula la consegna correttamente in 4/5 occasioni";
  if(c === "d330" || c === "d350") return "produce un messaggio pertinente e comprensibile in 4/5 occasioni";
  if(c === "d710" || c === "d720") return "rispetta turni e ruoli nel lavoro a coppie/gruppo in 4/5 occasioni";
  return "raggiunge il criterio concordato (almeno 80% o 4/5 occasioni) con supporti ridotti nel tempo";
}


/** =========================
 *  ICF – Obiettivi e fattori contestuali (schema in 4 aree)
 *  ========================= */
const ICF_SECTIONS = [
  {
    id: "S1",
    title: "1 Socializzazione e Interazione",
    subtitle: "Rapporto con i pari e con gli adulti",
    objectives: [
      { key:"d710", code:"d710", label:"Interazioni interpersonali di base (turni, regole sociali)" },
      { key:"d720", code:"d720", label:"Interazioni interpersonali complesse (negoziare, risolvere conflitti)" },
      { key:"d750", code:"d750", label:"Relazioni sociali informali (amicizie, inclusione nel gruppo)" },
      { key:"d760", code:"d760", label:"Relazioni familiari (alleanza educativa, comunicazione casa–scuola)" },
      { key:"d770", code:"d770", label:"Relazioni intime/affettive (per età: rispetto confini e consapevolezza)" },
      { key:"d820", code:"d820", label:"Partecipazione scolastica (presenza attiva, ruoli, responsabilità)" },
      { key:"d240", code:"d240", label:"Gestire stress e richieste psicologiche (tolleranza frustrazione)" },
      { key:"b152", code:"b152", label:"Regolazione emotiva (ansia, rabbia, frustrazione)" },
      { key:"b126", code:"b126", label:"Temperamento e personalità (impulsività, rigidità, autocontrollo)" },
      { key:"d730", code:"d730", label:"Relazioni con estranei/figure nuove (accoglienza, fiducia)" },
      { key:"d740", code:"d740", label:"Relazioni con autorità (docenti, regole, limiti)" },
      { key:"d220", code:"d220", label:"Completare compiti multipli in gruppo (cooperare con ruoli)" },
      { key:"d177", code:"d177", label:"Prendere decisioni (scelte, responsabilità, autoconsapevolezza)" },
    ],
    facilitators: [
      { key:"e325", code:"e325", label:"Compagni/pari supportivi (peer tutoring, compagno di riferimento)" },
      { key:"e420", code:"e420", label:"Atteggiamenti dei pari favorevoli (accoglienza, rispetto differenze)" },
      { key:"e450", code:"e450", label:"Atteggiamenti degli operatori scolastici favorevoli (coerenza, calore)" },
      { key:"e585", code:"e585", label:"Servizi scolastici di supporto (sportello ascolto, mediazione)" },
      { key:"e310", code:"e310", label:"Famiglia collaborativa e comunicazione regolare" },
      { key:"e340", code:"e340", label:"Educatore/assistente (mediazione relazionale, autonomie)" },
      { key:"e355", code:"e355", label:"Servizi sanitari/terapisti in raccordo" },
    ],
    barriers: [
      { key:"e425", code:"e425", label:"Atteggiamenti negativi dei pari (stigma, bullismo, esclusione)" },
      { key:"e455", code:"e455", label:"Atteggiamenti negativi di figure di autorità (punizioni incoerenti)" },
      { key:"e320", code:"e320", label:"Amici/compagni non disponibili (isolamento)" },
      { key:"e310b", code:"e310", label:"Comunicazione scuola–famiglia difficile" },
      { key:"e580b", code:"e580", label:"Discontinuità organizzativa (cambi frequenti, assenza routine)" },
    ]
  },
  {
    id: "S2",
    title: "2 Comunicazione e Linguaggio",
    subtitle: "Capacità di esprimersi e comprendere",
    objectives: [
      { key:"b167", code:"b167", label:"Funzioni del linguaggio (comprensione/espressione)" },
      { key:"d310", code:"d310", label:"Comprendere messaggi parlati (consegne, spiegazioni)" },
      { key:"d315", code:"d315", label:"Comprendere messaggi non verbali (gesti, espressioni, contesto)" },
      { key:"d320", code:"d320", label:"Comprendere messaggi scritti (istruzioni, testo breve)" },
      { key:"d330", code:"d330", label:"Parlare (chiarezza, organizzazione, turni)" },
      { key:"d335", code:"d335", label:"Produrre messaggi non verbali / CAA (se utile)" },
      { key:"d350", code:"d350", label:"Conversazione (avvio, mantenimento, riparazione comunicativa)" },
      { key:"d360", code:"d360", label:"Uso di dispositivi e tecniche di comunicazione (app, ausili, scrittura)" },
      { key:"d130", code:"d130", label:"Motivazione/energia (iniziativa comunicativa)" },
      { key:"d175", code:"d175", label:"Risolvere problemi (chiedere chiarimenti, strategie)" },
      { key:"d172c", code:"d172", label:"Comprendere simboli/segni (icone, mappe, segnali)" },
    ],
    facilitators: [
      { key:"e125", code:"e125", label:"Prodotti e tecnologia per comunicazione (CAA, tablet, software)" },
      { key:"e250", code:"e250", label:"Suono/rumore controllati (udibilità, attenzione all’ascolto)" },
      { key:"e460", code:"e460", label:"Atteggiamenti di persone significative favorevoli (ascolto, tempo di risposta)" },
      { key:"e340c", code:"e340", label:"Assistente comunicazione/educatore (supporto linguistico)" },
      { key:"e580", code:"e580", label:"Servizi e politiche educative (PDP/PEI, continuità)" },
    ],
    barriers: [
      { key:"e125b", code:"e125", label:"Assenza di strumenti/tecnologie comunicative" },
      { key:"e250b", code:"e250", label:"Rumore/riverbero/affollamento (barriera alla comprensione)" },
      { key:"e410", code:"e410", label:"Atteggiamenti familiari disfunzionali (poca mediazione linguistica)" },
      { key:"e460b", code:"e460", label:"Interazioni frettolose: poca attesa/tempo di risposta" },
    ]
  },
  {
    id: "S3",
    title: "3 Autonomia e Orientamento",
    subtitle: "Autonomia personale e sociale",
    objectives: [
      { key:"d230", code:"d230", label:"Gestire routine e tempi (agenda, transizioni, priorità)" },
      { key:"b164a", code:"b164", label:"Funzioni esecutive (pianificazione, autocontrollo, flessibilità)" },
      { key:"d510", code:"d510", label:"Cura di sé a scuola (igiene, bisogni)" },
      { key:"d520", code:"d520", label:"Cura parti del corpo (se pertinente)" },
      { key:"d530", code:"d530", label:"Uso servizi igienici (routine, privacy, sicurezza)" },
      { key:"d540", code:"d540", label:"Vestirsi/gestire indumenti (educazione fisica, uscita)" },
      { key:"d550", code:"d550", label:"Alimentazione (merenda/mensa, comportamenti adeguati)" },
      { key:"d570", code:"d570", label:"Gestire salute e sicurezza (regole, prevenzione rischio)" },
      { key:"d620", code:"d620", label:"Acquisire beni/servizi (gestire materiali, acquisti scolastici)" },
      { key:"d630", code:"d630", label:"Preparare pasti (laboratori, autonomia funzionale)" },
      { key:"d450", code:"d450", label:"Mobilità (spostamenti, accesso agli spazi)" },
      { key:"d460", code:"d460", label:"Spostarsi in ambienti diversi (scale, corridoi, palestra)" },
      { key:"d440", code:"d440", label:"Uso fine della mano (scrittura, strumenti, autonomia materiale)" },
      { key:"d660", code:"d660", label:"Assistere gli altri / cooperare in compiti (responsabilità)" },
      { key:"d839", code:"d839", label:"Educazione (partecipazione e autonomia nello studio – generale)" },
    ],
    facilitators: [
      { key:"e150", code:"e150", label:"Ambiente fisico adeguato/accessibile (spazi, arredi, segnaletica)" },
      { key:"e115", code:"e115", label:"Tecnologie assistive (tastiere, dettatura, ausili)" },
      { key:"e120", code:"e120", label:"Prodotti per mobilità/trasporto (ausili, carrozzina, deambulatori)" },
      { key:"e340a", code:"e340", label:"Assistente autonomia/educatore (prompt e fading, sicurezza)" },
      { key:"e580a", code:"e580", label:"Organizzazione scolastica inclusiva (tempi, spazi, procedure)" },
    ],
    barriers: [
      { key:"e150a", code:"e150", label:"Barriere architettoniche/spazi non accessibili" },
      { key:"e115a", code:"e115", label:"Assenza ausili/tecnologie adeguate" },
      { key:"e580aB", code:"e580", label:"Tempi rigidi e scarsa flessibilità organizzativa" },
      { key:"e355a", code:"e355", label:"Scarso raccordo con servizi per ausili/terapie" },
    ]
  },
  {
    id: "S4",
    title: "4 Cognitiva, Neuropsicologica e dell'Apprendimento",
    subtitle: "Memoria, attenzione e stili cognitivi",
    objectives: [
      { key:"b140", code:"b140", label:"Funzioni dell’attenzione (mantenere/focalizzare)" },
      { key:"d160", code:"d160", label:"Focalizzare l’attenzione e sostenere l’impegno" },
      { key:"b144", code:"b144", label:"Funzioni della memoria (breve termine, lavoro, richiamo)" },
      { key:"b147", code:"b147", label:"Funzioni psicomotorie (ritmo, avvio, coordinazione compiti)" },
      { key:"b156", code:"b156", label:"Percezione (discriminare stimoli, sovraccarico sensoriale)" },
      { key:"b164", code:"b164", label:"Funzioni esecutive (pianificazione, controllo, flessibilità)" },
      { key:"d155", code:"d155", label:"Acquisire competenze (apprendere procedure/strategie)" },
      { key:"d210", code:"d210", label:"Svolgere un singolo compito (avvio, completamento)" },
      { key:"d220c", code:"d220", label:"Completare compiti multipli (organizzare più richieste)" },
      { key:"d166", code:"d166", label:"Lettura (decodifica e comprensione)" },
      { key:"d170", code:"d170", label:"Scrittura (produzione testi, ortografia, grafia funzionale)" },
      { key:"d172", code:"d172", label:"Calcolo (procedure, problem solving)" },
      { key:"d175c", code:"d175", label:"Risolvere problemi (strategie, autocorrezione)" },
      { key:"d176", code:"d176", label:"Prendere decisioni (valutare opzioni, conseguenze)" },
      { key:"d177c", code:"d177", label:"Fare scelte (preferenze, priorità)" },
      { key:"d240c", code:"d240", label:"Gestire stress e richieste psicologiche (test, interrogazioni)" },
      { key:"d820c", code:"d820", label:"Svolgimento del ruolo di studente (metodo di studio)" },
      { key:"d830", code:"d830", label:"Istruzione superiore/competenze avanzate (per II grado)" },
    ],
    facilitators: [
      { key:"e130", code:"e130", label:"Prodotti per istruzione (mappe, formulari, materiali semplificati)" },
      { key:"e115c", code:"e115", label:"Tecnologie per apprendimento (sintesi vocale, correttore, app)" },
      { key:"e585c", code:"e585", label:"Servizi educativi di supporto (tutoring, recupero, laboratorio)" },
      { key:"e450c", code:"e450", label:"Atteggiamenti favorevoli del personale (feedback, chiarezza criteri)" },
      { key:"e580c", code:"e580", label:"Politiche/organizzazione: PDP/PEI, verifiche adattate, continuità" },
    ],
    barriers: [
      { key:"e130b", code:"e130", label:"Materiali non accessibili (solo testo denso, consegne complesse)" },
      { key:"e115cB", code:"e115", label:"Assenza di tecnologie o divario digitale" },
      { key:"e585b", code:"e585", label:"Scarso accesso a supporti/recupero" },
      { key:"e450b2", code:"e450", label:"Feedback punitivo o criteri non trasparenti" },
    ]
  },
];

function allIcfObjectives(){
  const out = [];
  for(const s of ICF_SECTIONS){ for(const it of s.objectives){ out.push(it); } }
  return out;
}
function allIcfFacilitators(){
  const out = [];
  for(const s of ICF_SECTIONS){ for(const it of s.facilitators){ out.push(it); } }
  return out;
}
function allIcfBarriers(){
  const out = [];
  for(const s of ICF_SECTIONS){ for(const it of s.barriers){ out.push(it); } }
  return out;
}


const ICF_OBJECTIVES = allIcfObjectives();
const ICF_FACILITATORS = allIcfFacilitators();
const ICF_BARRIERS = allIcfBarriers();

// Mappa rapida: key obiettivo ICF -> area/sezione ICF (S1..S4) e ordine di priorità
const ICF_OBJECTIVE_AREA_MAP = (() => {
  const m = Object.create(null);
  for(const sec of ICF_SECTIONS){
    for(const it of (sec.objectives || [])){
      m[it.key] = sec.id;
    }
  }
  return m;
})();

const ICF_OBJECTIVE_ORDER_MAP = (() => {
  const m = Object.create(null);
  let i = 0;
  for(const sec of ICF_SECTIONS){
    for(const it of (sec.objectives || [])){
      m[it.key] = i++;
    }
  }
  return m;
})();

const RESOURCES = [
  { key:"curricolari", label:"Docenti curricolari" },
  { key:"sostegno", label:"Docente di sostegno" },
  { key:"educatore", label:"Educatore" },
  { key:"assCom", label:"Assistente alla comunicazione" },
  { key:"assAut", label:"Assistente autonomia" },
  { key:"famiglia", label:"Famiglia" },
  { key:"servizi", label:"Servizi/terapisti" },
];

/** =========================
 *  ICD-10 (aree F, G, H) – codici diagnosi (menu a tendina, multi-selezione)
 *  ========================= */
const ICD10_CODES = [{"code": "F70", "label": "Ritardo mentale lieve"}, {"code": "F71", "label": "Ritardo mentale di media gravità"}, {"code": "F72", "label": "Ritardo mentale grave"}, {"code": "F73", "label": "Ritardo mentale profondo"}, {"code": "F80", "label": "Disturbo evolutivo specifico dell'eloquio e del linguaggio"}, {"code": "F81", "label": "Disturbo evolutivo specifico delle abilità scolastiche (comprende Dislessia/DSA)"}, {"code": "F81.1", "label": "Disturbo specifico della scrittura"}, {"code": "F81.2", "label": "Disturbo specifico delle abilità aritmetiche"}, {"code": "F81.3", "label": "Disturbi misti delle abilità scolastiche"}, {"code": "F81.8", "label": "Altri disturbi delle abilità scolastiche"}, {"code": "F81.9", "label": "Disordine evolutivo delle abilità scolastiche non meglio specificato"}, {"code": "F82", "label": "Disturbo evolutivo specifico delle abilità motorie"}, {"code": "F83", "label": "Disturbi evolutivi specifici misti"}, {"code": "F84.0", "label": "Autismo infantile"}, {"code": "F84.1", "label": "Autismo atipico"}, {"code": "F84.2", "label": "Sindrome di Rett"}, {"code": "F84.3", "label": "Sindrome disintegrativa dell'infanzia di altro tipo"}, {"code": "F84.4", "label": "Sindrome iperattiva associata a ritardo mentale e movimenti stereotipati"}, {"code": "F84.5", "label": "Sindrome di Asperger"}, {"code": "F90.0", "label": "Disturbo dell'attività e dell'attenzione"}, {"code": "F90.1", "label": "Disturbo ipercinetico della condotta"}, {"code": "F90.8", "label": "Sindrome ipercinetiche di altro tipo"}, {"code": "F93", "label": "Disturbi della sfera emozionale con esordio caratteristico dell’infanzia"}, {"code": "F94", "label": "Disturbo del funzionamento sociale con esordio specifico nell’infanzia e nell’adolescenza"}, {"code": "F95", "label": "Disturbi a tipo tic"}, {"code": "F98", "label": "Altri disturbi comportamentali e della sfera emozionale con esordio abituale nell'infanzia e nell'adolescenza"}, {"code": "G80", "label": "Paralisi cerebrale infantile"}, {"code": "G81", "label": "Emiplegia"}, {"code": "G82", "label": "Paraplegia e tetraplegia (paraparesi e tetraparesi)"}, {"code": "G83", "label": "Altre sindromi paralitiche"}, {"code": "H54", "label": "Compromissione visiva, compresa cecità e ipovisione"}, {"code": "H90", "label": "Ipoacusia trasmissiva e neurosensoriale"}, {"code": "H91", "label": "Altre perdite uditive e perdite uditive non specificate"}];

const ICD10_MAP = (() => {
  const m = new Map();
  for(const it of ICD10_CODES) {
    if(it && it.code) m.set(String(it.code), String(it.label || ""));
  }
  return m;
})();

function icdTitle(code) {
  return ICD10_MAP.get(String(code)) || "";
}

function ensureIcdState(s = state) {
  if(!s.icd || typeof s.icd !== "object") s.icd = { codes: [] };
  if(!Array.isArray(s.icd.codes)) s.icd.codes = [];
}

function cleanIcdCodes(arr) {
  if(!Array.isArray(arr)) return [];
  const out = [];
  const seen = new Set();
  for(const x of arr) {
    const c = (typeof x === "string") ? x : (x && typeof x.code === "string" ? x.code : "");
    const code = String(c || "").trim();
    if(!code) continue;
    if(seen.has(code)) continue;
    if(code.length > 16) continue;
    seen.add(code);
    out.push(code);
  }
  return out;
}

function renderICD() {
  const selEl = document.getElementById("icdSelect");
  const listEl = document.getElementById("icdList");
  if(!selEl || !listEl) return;

  ensureIcdState();
  const codes = Array.isArray(state.icd.codes) ? state.icd.codes : [];

  listEl.innerHTML = "";
  if(!codes.length) {
    listEl.innerHTML = `<span class="muted">Nessun codice ICD inserito.</span>`;
    return;
  }

  const sorted = [...codes].sort((a,b) => String(a).localeCompare(String(b), "it"));
  for(const code of sorted) {
    const title = icdTitle(code);
    const chip = document.createElement("span");
    chip.className = "icdChip";
    chip.innerHTML = `<b>${textEscape(code)}</b><span>${textEscape(title)}</span><button type="button" title="Rimuovi">×</button>`;
    chip.querySelector("button").addEventListener("click", () => {
      ensureIcdState();
      state.icd.codes = state.icd.codes.filter(x => x !== code);
      renderICD();
      renderAllSide();
    });
    listEl.appendChild(chip);
  }
}


function renderDocs(){
  const g = (id) => document.getElementById(id);
  const d = state.docs || {};
  const setVal = (el, v) => { if(el) el.value = v || ""; };

  setVal(g("accertamentoDate"), d.accertamentoDate);
  setVal(g("scadenzaDate"), d.scadenzaDate);
  setVal(g("pfRedattoDate"), d.pfRedattoDate);
  setVal(g("dfDate"), d.dfDate);
  setVal(g("pdfDate"), d.pdfDate);
  setVal(g("progettoIndDate"), d.progettoIndDate);
}
function bindICD() {
  const selEl = document.getElementById("icdSelect");
  const btnAdd = document.getElementById("btnIcdAdd");
  const btnReset = document.getElementById("btnIcdReset");

  if(btnAdd && selEl) {
    btnAdd.addEventListener("click", () => {
      const code = String(selEl.value || "").trim();
      if(!code) return toast("Seleziona un codice ICD-10.");
      ensureIcdState();
      if(!state.icd.codes.includes(code)) state.icd.codes.push(code);
      selEl.value = "";
      renderICD();
      renderAllSide();
      toast("Codice ICD aggiunto.");
    });
  }

  if(btnReset) {
    btnReset.addEventListener("click", () => {
      ensureIcdState();
      state.icd.codes = [];
      renderICD();
      renderAllSide();
      toast("ICD azzerati.");
    });
  }
}

/** =========================
 *  ICF DF/PF (qualificatori 0–4) – elenco codici completo (da file CODICI.xlsx)
 *  ========================= */
const ICF_DFPF_CODES = [{"code": "b110", "title": "Funzioni della coscienza", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b114", "title": "Funzioni dell’orientamento", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b117", "title": "Funzioni intellettive", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b122", "title": "Funzioni psicosociali globali", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b126", "title": "Funzioni del temperamento e della personalità", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b130", "title": "Funzioni dell’energia e delle pulsioni", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b134", "title": "Funzioni del sonno", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b139", "title": "Funzioni mentali globali, altro specificato e non specificato", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b140", "title": "Funzioni dell’attenzione", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b144", "title": "Funzioni della memoria", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b147", "title": "Funzioni psicomotorie", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b152", "title": "Funzioni emozionali", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b156", "title": "Funzioni percettive", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b160", "title": "Funzioni del pensiero", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b164", "title": "Funzioni cognitive di livello superiore", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b167", "title": "Funzioni mentali del linguaggio", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b172", "title": "Funzioni di calcolo", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b176", "title": "Funzione mentale di sequenza dei movimenti complessi", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b180", "title": "Funzioni dell’esperienza del sé e del tempo", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b189", "title": "Funzioni mentali specifiche, altro specificato e non specificato", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b198", "title": "Funzioni mentali, altro specificato", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b199", "title": "Funzioni mentali, non specificato", "component": "b", "level": 3, "chapter": "Capitolo 1 – Funzioni mentali"}, {"code": "b210", "title": "Funzioni della vista", "component": "b", "level": 3, "chapter": "Capitolo 2 – Funzioni sensoriali e dolore"}, {"code": "b215", "title": "Funzioni delle strutture adiacenti all’occhio", "component": "b", "level": 3, "chapter": "Capitolo 2 – Funzioni sensoriali e dolore"}, {"code": "b220", "title": "Sensazioni associate all’occhio e alle strutture adiacenti", "component": "b", "level": 3, "chapter": "Capitolo 2 – Funzioni sensoriali e dolore"}, {"code": "b229", "title": "Funzioni della vista e correlate, altro specificato e non specificato", "component": "b", "level": 3, "chapter": "Capitolo 2 – Funzioni sensoriali e dolore"}, {"code": "b230", "title": "Funzioni uditive", "component": "b", "level": 3, "chapter": "Capitolo 2 – Funzioni sensoriali e dolore"}, {"code": "b235", "title": "Funzioni vestibolari", "component": "b", "level": 3, "chapter": "Capitolo 2 – Funzioni sensoriali e dolore"}, {"code": "b240", "title": "Sensazioni associate alla funzione uditiva e vestibolare", "component": "b", "level": 3, "chapter": "Capitolo 2 – Funzioni sensoriali e dolore"}, {"code": "b249", "title": "Funzioni uditive e vestibolari, altro specificato e non specificato", "component": "b", "level": 3, "chapter": "Capitolo 2 – Funzioni sensoriali e dolore"}, {"code": "b250", "title": "Funzione del gusto", "component": "b", "level": 3, "chapter": "Capitolo 2 – Funzioni sensoriali e dolore"}, {"code": "b255", "title": "Funzione dell’olfatto", "component": "b", "level": 3, "chapter": "Capitolo 2 – Funzioni sensoriali e dolore"}, {"code": "b260", "title": "Funzione propriocettiva", "component": "b", "level": 3, "chapter": "Capitolo 2 – Funzioni sensoriali e dolore"}, {"code": "b265", "title": "Funzione del tatto", "component": "b", "level": 3, "chapter": "Capitolo 2 – Funzioni sensoriali e dolore"}, {"code": "b270", "title": "Funzioni sensoriali correlate alla temperatura e ad altri stimoli", "component": "b", "level": 3, "chapter": "Capitolo 2 – Funzioni sensoriali e dolore"}, {"code": "b279", "title": "Ulteriori funzioni sensoriali, altro specificato e non specificato", "component": "b", "level": 3, "chapter": "Capitolo 2 – Funzioni sensoriali e dolore"}, {"code": "b280", "title": "Sensazione di dolore", "component": "b", "level": 3, "chapter": "Capitolo 2 – Funzioni sensoriali e dolore"}, {"code": "b289", "title": "Sensazione di dolore, altro specificato e non specificato", "component": "b", "level": 3, "chapter": "Capitolo 2 – Funzioni sensoriali e dolore"}, {"code": "b298", "title": "Funzioni sensoriali e dolore, altro specificato", "component": "b", "level": 3, "chapter": "Capitolo 2 – Funzioni sensoriali e dolore"}, {"code": "b299", "title": "Funzioni sensoriali e dolore, non specificato", "component": "b", "level": 3, "chapter": "Capitolo 2 – Funzioni sensoriali e dolore"}, {"code": "b310", "title": "Funzioni della voce", "component": "b", "level": 3, "chapter": "Capitolo 3 – Funzioni della voce e dell’eloquio"}, {"code": "b320", "title": "Funzioni dell’articolazione della voce", "component": "b", "level": 3, "chapter": "Capitolo 3 – Funzioni della voce e dell’eloquio"}, {"code": "b330", "title": "Funzioni della fluidità e del ritmo dell’eloquio", "component": "b", "level": 3, "chapter": "Capitolo 3 – Funzioni della voce e dell’eloquio"}, {"code": "b340", "title": "Funzioni di vocalizzazione alternativa", "component": "b", "level": 3, "chapter": "Capitolo 3 – Funzioni della voce e dell’eloquio"}, {"code": "b398", "title": "Funzioni della voce e dell’eloquio, altro specificato", "component": "b", "level": 3, "chapter": "Capitolo 3 – Funzioni della voce e dell’eloquio"}, {"code": "b399", "title": "Funzioni della voce e dell’eloquio, non specificato", "component": "b", "level": 3, "chapter": "Capitolo 3 – Funzioni della voce e dell’eloquio"}, {"code": "b410", "title": "Funzioni del cuore", "component": "b", "level": 3, "chapter": "Capitolo 4 – Funzioni dei sistemi cardiovascolare, ematologico,"}, {"code": "b415", "title": "Funzioni dei vasi sanguigni", "component": "b", "level": 3, "chapter": "Capitolo 4 – Funzioni dei sistemi cardiovascolare, ematologico,"}, {"code": "b420", "title": "Funzioni della pressione sanguigna", "component": "b", "level": 3, "chapter": "Capitolo 4 – Funzioni dei sistemi cardiovascolare, ematologico,"}, {"code": "b429", "title": "Funzioni del sistema cardiovascolare, altro specificato e non specificato", "component": "b", "level": 3, "chapter": "Capitolo 4 – Funzioni dei sistemi cardiovascolare, ematologico,"}, {"code": "b430", "title": "Funzioni del sistema ematologico", "component": "b", "level": 3, "chapter": "Capitolo 4 – Funzioni dei sistemi cardiovascolare, ematologico,"}, {"code": "b435", "title": "Funzioni del sistema immunologico", "component": "b", "level": 3, "chapter": "Capitolo 4 – Funzioni dei sistemi cardiovascolare, ematologico,"}, {"code": "b439", "title": "Funzioni dei sistemi ematologico e immunologico, altro specificato e non specificato", "component": "b", "level": 3, "chapter": "Capitolo 4 – Funzioni dei sistemi cardiovascolare, ematologico,"}, {"code": "b440", "title": "Funzioni respiratorie", "component": "b", "level": 3, "chapter": "Capitolo 4 – Funzioni dei sistemi cardiovascolare, ematologico,"}, {"code": "b445", "title": "Funzioni del muscolo respiratorio", "component": "b", "level": 3, "chapter": "Capitolo 4 – Funzioni dei sistemi cardiovascolare, ematologico,"}, {"code": "b449", "title": "Funzioni dell’apparato respiratorio, altro specificato e non specificato", "component": "b", "level": 3, "chapter": "Capitolo 4 – Funzioni dei sistemi cardiovascolare, ematologico,"}, {"code": "b450", "title": "Ulteriori funzioni respiratorie", "component": "b", "level": 3, "chapter": "Capitolo 4 – Funzioni dei sistemi cardiovascolare, ematologico,"}, {"code": "b455", "title": "Funzioni di tolleranza dell’esercizio fisico", "component": "b", "level": 3, "chapter": "Capitolo 4 – Funzioni dei sistemi cardiovascolare, ematologico,"}, {"code": "b460", "title": "Sensazioni associate alle funzioni cardiovascolare e respiratoria", "component": "b", "level": 3, "chapter": "Capitolo 4 – Funzioni dei sistemi cardiovascolare, ematologico,"}, {"code": "b469", "title": "Ulteriori funzioni e sensazioni del sistema cardiovascolare e", "component": "b", "level": 3, "chapter": "Capitolo 4 – Funzioni dei sistemi cardiovascolare, ematologico,"}, {"code": "b498", "title": "Funzioni dei sistemi cardiovascolare, ematologico, immunologico", "component": "b", "level": 3, "chapter": "Capitolo 4 – Funzioni dei sistemi cardiovascolare, ematologico,"}, {"code": "b499", "title": "Funzioni dei sistemi cardiovascolare, ematologico, immunologico", "component": "b", "level": 3, "chapter": "Capitolo 4 – Funzioni dei sistemi cardiovascolare, ematologico,"}, {"code": "b510", "title": "Funzioni di ingestione", "component": "b", "level": 3, "chapter": "Capitolo 5 – Funzioni dell’apparato digerente e dei sistemi metabolico ed endocrino"}, {"code": "b515", "title": "Funzioni di digestione", "component": "b", "level": 3, "chapter": "Capitolo 5 – Funzioni dell’apparato digerente e dei sistemi metabolico ed endocrino"}, {"code": "b520", "title": "Funzioni di assimilazione", "component": "b", "level": 3, "chapter": "Capitolo 5 – Funzioni dell’apparato digerente e dei sistemi metabolico ed endocrino"}, {"code": "b525", "title": "Funzioni di defecazione", "component": "b", "level": 3, "chapter": "Capitolo 5 – Funzioni dell’apparato digerente e dei sistemi metabolico ed endocrino"}, {"code": "b530", "title": "Funzioni di mantenimento del peso", "component": "b", "level": 3, "chapter": "Capitolo 5 – Funzioni dell’apparato digerente e dei sistemi metabolico ed endocrino"}, {"code": "b535", "title": "Sensazioni associate all’apparato digerente", "component": "b", "level": 3, "chapter": "Capitolo 5 – Funzioni dell’apparato digerente e dei sistemi metabolico ed endocrino"}, {"code": "b539", "title": "Funzioni correlate all’apparato digerente, altro specificato e non specificato", "component": "b", "level": 3, "chapter": "Capitolo 5 – Funzioni dell’apparato digerente e dei sistemi metabolico ed endocrino"}, {"code": "b540", "title": "Funzioni metaboliche generali", "component": "b", "level": 3, "chapter": "Capitolo 5 – Funzioni dell’apparato digerente e dei sistemi metabolico ed endocrino"}, {"code": "b545", "title": "Funzioni del bilancio idrico, minerale ed elettrolitico", "component": "b", "level": 3, "chapter": "Capitolo 5 – Funzioni dell’apparato digerente e dei sistemi metabolico ed endocrino"}, {"code": "b550", "title": "Funzioni di termoregolazione", "component": "b", "level": 3, "chapter": "Capitolo 5 – Funzioni dell’apparato digerente e dei sistemi metabolico ed endocrino"}, {"code": "b555", "title": "Funzioni delle ghiandole endocrine", "component": "b", "level": 3, "chapter": "Capitolo 5 – Funzioni dell’apparato digerente e dei sistemi metabolico ed endocrino"}, {"code": "b559", "title": "Funzioni correlate al metabolismo e al sistema endocrino,", "component": "b", "level": 3, "chapter": "Capitolo 5 – Funzioni dell’apparato digerente e dei sistemi metabolico ed endocrino"}, {"code": "b598", "title": "Funzioni dell’apparato digerente e dei sistemi metabolico ed", "component": "b", "level": 3, "chapter": "Capitolo 5 – Funzioni dell’apparato digerente e dei sistemi metabolico ed endocrino"}, {"code": "b599", "title": "Funzioni dell’apparato digerente e dei sistemi metabolico ed", "component": "b", "level": 3, "chapter": "Capitolo 5 – Funzioni dell’apparato digerente e dei sistemi metabolico ed endocrino"}, {"code": "b610", "title": "Funzioni urinarie escretorie", "component": "b", "level": 3, "chapter": "Capitolo 6 – Funzioni genitourinarie e riproduttive"}, {"code": "b620", "title": "Funzioni urinarie", "component": "b", "level": 3, "chapter": "Capitolo 6 – Funzioni genitourinarie e riproduttive"}, {"code": "b630", "title": "Sensazioni associate alle funzioni urinarie", "component": "b", "level": 3, "chapter": "Capitolo 6 – Funzioni genitourinarie e riproduttive"}, {"code": "b639", "title": "Funzioni urinarie, altro specificato e non specificato", "component": "b", "level": 3, "chapter": "Capitolo 6 – Funzioni genitourinarie e riproduttive"}, {"code": "b640", "title": "Funzioni sessuali", "component": "b", "level": 3, "chapter": "Capitolo 6 – Funzioni genitourinarie e riproduttive"}, {"code": "b650", "title": "Funzioni mestruali", "component": "b", "level": 3, "chapter": "Capitolo 6 – Funzioni genitourinarie e riproduttive"}, {"code": "b660", "title": "Funzioni della procreazione", "component": "b", "level": 3, "chapter": "Capitolo 6 – Funzioni genitourinarie e riproduttive"}, {"code": "b670", "title": "Sensazioni associate alle funzioni genitali e riproduttive", "component": "b", "level": 3, "chapter": "Capitolo 6 – Funzioni genitourinarie e riproduttive"}, {"code": "b679", "title": "Funzioni genitali e riproduttive, altro specificato e non specificato", "component": "b", "level": 3, "chapter": "Capitolo 6 – Funzioni genitourinarie e riproduttive"}, {"code": "b698", "title": "Funzioni genitourinarie e riproduttive, altro specificato", "component": "b", "level": 3, "chapter": "Capitolo 6 – Funzioni genitourinarie e riproduttive"}, {"code": "b699", "title": "Funzioni genitourinarie e riproduttive, non specificato", "component": "b", "level": 3, "chapter": "Capitolo 6 – Funzioni genitourinarie e riproduttive"}, {"code": "b710", "title": "Funzioni della mobilità dell’articolazione", "component": "b", "level": 3, "chapter": "Capitolo 7 – Funzioni neuro-muscoloscheletriche e correlate al movimento"}, {"code": "b715", "title": "Funzioni della stabilità dell’articolazione", "component": "b", "level": 3, "chapter": "Capitolo 7 – Funzioni neuro-muscoloscheletriche e correlate al movimento"}, {"code": "b720", "title": "Funzioni della mobilità dell’osso", "component": "b", "level": 3, "chapter": "Capitolo 7 – Funzioni neuro-muscoloscheletriche e correlate al movimento"}, {"code": "b729", "title": "Funzioni delle arti", "component": "b", "level": 3, "chapter": "Capitolo 7 – Funzioni neuro-muscoloscheletriche e correlate al movimento"}, {"code": "b730", "title": "Funzioni della forza muscolare", "component": "b", "level": 3, "chapter": "Capitolo 7 – Funzioni neuro-muscoloscheletriche e correlate al movimento"}, {"code": "b735", "title": "Funzioni del tono muscolare", "component": "b", "level": 3, "chapter": "Capitolo 7 – Funzioni neuro-muscoloscheletriche e correlate al movimento"}, {"code": "b740", "title": "Funzioni della resistenza muscolare", "component": "b", "level": 3, "chapter": "Capitolo 7 – Funzioni neuro-muscoloscheletriche e correlate al movimento"}, {"code": "b749", "title": "Funzioni muscolari, altro specificato e non specificato", "component": "b", "level": 3, "chapter": "Capitolo 7 – Funzioni neuro-muscoloscheletriche e correlate al movimento"}, {"code": "b750", "title": "Funzioni del riflesso motorio", "component": "b", "level": 3, "chapter": "Capitolo 7 – Funzioni neuro-muscoloscheletriche e correlate al movimento"}, {"code": "b755", "title": "Funzioni della reazione di movimento involontario", "component": "b", "level": 3, "chapter": "Capitolo 7 – Funzioni neuro-muscoloscheletriche e correlate al movimento"}, {"code": "b760", "title": "Funzioni di controllo del movimento volontario", "component": "b", "level": 3, "chapter": "Capitolo 7 – Funzioni neuro-muscoloscheletriche e correlate al movimento"}, {"code": "b765", "title": "Funzioni del movimento involontario", "component": "b", "level": 3, "chapter": "Capitolo 7 – Funzioni neuro-muscoloscheletriche e correlate al movimento"}, {"code": "b770", "title": "Funzioni del pattern dell’andatura", "component": "b", "level": 3, "chapter": "Capitolo 7 – Funzioni neuro-muscoloscheletriche e correlate al movimento"}, {"code": "b780", "title": "Sensazioni correlate alle funzioni muscolari e del movimento", "component": "b", "level": 3, "chapter": "Capitolo 7 – Funzioni neuro-muscoloscheletriche e correlate al movimento"}, {"code": "b789", "title": "Funzioni del movimento, altro specificato e non specificato", "component": "b", "level": 3, "chapter": "Capitolo 7 – Funzioni neuro-muscoloscheletriche e correlate al movimento"}, {"code": "b798", "title": "Funzioni neuro-muscoloscheletriche e correlate al movimento,", "component": "b", "level": 3, "chapter": "Capitolo 7 – Funzioni neuro-muscoloscheletriche e correlate al movimento"}, {"code": "b799", "title": "Funzioni neuro-muscoloscheletriche e correlate al movimento, non specificato", "component": "b", "level": 3, "chapter": "Capitolo 7 – Funzioni neuro-muscoloscheletriche e correlate al movimento"}, {"code": "b810", "title": "Funzioni protettive della cute", "component": "b", "level": 3, "chapter": "Capitolo 8 – Funzioni della cute e delle strutture correlate"}, {"code": "b820", "title": "Funzioni di riparazione della cute", "component": "b", "level": 3, "chapter": "Capitolo 8 – Funzioni della cute e delle strutture correlate"}, {"code": "b830", "title": "Altre funzioni della cute", "component": "b", "level": 3, "chapter": "Capitolo 8 – Funzioni della cute e delle strutture correlate"}, {"code": "b840", "title": "Sensazione correlata alla cute", "component": "b", "level": 3, "chapter": "Capitolo 8 – Funzioni della cute e delle strutture correlate"}, {"code": "b849", "title": "Funzioni della cute, altro specificato e non specificato", "component": "b", "level": 3, "chapter": "Capitolo 8 – Funzioni della cute e delle strutture correlate"}, {"code": "b850", "title": "Funzioni dei peli e dei capelli", "component": "b", "level": 3, "chapter": "Capitolo 8 – Funzioni della cute e delle strutture correlate"}, {"code": "b860", "title": "Funzioni delle unghie", "component": "b", "level": 3, "chapter": "Capitolo 8 – Funzioni della cute e delle strutture correlate"}, {"code": "b869", "title": "Funzioni dei peli, dei capelli e delle unghie, altro specificato e non specificato", "component": "b", "level": 3, "chapter": "Capitolo 8 – Funzioni della cute e delle strutture correlate"}, {"code": "b898", "title": "Funzioni della cute e delle strutture correlate, altro specificato", "component": "b", "level": 3, "chapter": "Capitolo 8 – Funzioni della cute e delle strutture correlate"}, {"code": "b899", "title": "Funzioni della cute e delle strutture correlate, non specificato", "component": "b", "level": 3, "chapter": "Capitolo 8 – Funzioni della cute e delle strutture correlate"}, {"code": "b1100", "title": "Stato di coscienza", "component": "b", "level": 4, "chapter": ""}, {"code": "b1101", "title": "Continuità della coscienza", "component": "b", "level": 4, "chapter": ""}, {"code": "b1102", "title": "Qualità della coscienza", "component": "b", "level": 4, "chapter": ""}, {"code": "b1103", "title": "Regolazione degli stati veglia", "component": "b", "level": 4, "chapter": ""}, {"code": "b1108", "title": "Funzioni della coscienza, altro specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1109", "title": "Funzioni della coscienza, non specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1140", "title": "Orientamento rispetto al tempo", "component": "b", "level": 4, "chapter": ""}, {"code": "b1141", "title": "Orientamento rispetto al luogo", "component": "b", "level": 4, "chapter": ""}, {"code": "b1142", "title": "Orientamento rispetto alla persona", "component": "b", "level": 4, "chapter": ""}, {"code": "b1143", "title": "Orientamento rispetto agli oggetti", "component": "b", "level": 4, "chapter": ""}, {"code": "b1144", "title": "Orientamento rispetto allo spazio", "component": "b", "level": 4, "chapter": ""}, {"code": "b1148", "title": "Funzioni dell’orientamento, altro non specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1149", "title": "Funzioni dell’orientamento, non specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1250", "title": "Adattabilità", "component": "b", "level": 4, "chapter": ""}, {"code": "b1251", "title": "Responsabilità", "component": "b", "level": 4, "chapter": ""}, {"code": "b1252", "title": "Livello di attività", "component": "b", "level": 4, "chapter": ""}, {"code": "b1253", "title": "Prevedibilità", "component": "b", "level": 4, "chapter": ""}, {"code": "b1254", "title": "Perseveranza", "component": "b", "level": 4, "chapter": ""}, {"code": "b1255", "title": "Propositività", "component": "b", "level": 4, "chapter": ""}, {"code": "b1258", "title": "Funzioni e attitudini intrapersonali, altro non specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1259", "title": "Funzioni e attitudini intrapersonali, non specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1260", "title": "Estroversione", "component": "b", "level": 4, "chapter": ""}, {"code": "b1261", "title": "Giovialità", "component": "b", "level": 4, "chapter": ""}, {"code": "b1262", "title": "Coscienziosità", "component": "b", "level": 4, "chapter": ""}, {"code": "b1263", "title": "Stabilità psichica", "component": "b", "level": 4, "chapter": ""}, {"code": "b1264", "title": "Apertura all’esperienza", "component": "b", "level": 4, "chapter": ""}, {"code": "b1265", "title": "Ottimismo", "component": "b", "level": 4, "chapter": ""}, {"code": "b1266", "title": "Fiducia", "component": "b", "level": 4, "chapter": ""}, {"code": "b1267", "title": "Affidabilità", "component": "b", "level": 4, "chapter": ""}, {"code": "b1268", "title": "Funzioni del temperamento e della personalità, altro specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1269", "title": "Funzioni del temperamento e della personalità, non specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1300", "title": "Livello di energia", "component": "b", "level": 4, "chapter": ""}, {"code": "b1301", "title": "Motivazione", "component": "b", "level": 4, "chapter": ""}, {"code": "b1302", "title": "Appetito", "component": "b", "level": 4, "chapter": ""}, {"code": "b1303", "title": "Craving (impulso incontrollabile ad assumere sostanze)", "component": "b", "level": 4, "chapter": ""}, {"code": "b1304", "title": "Controllo degli impulsi", "component": "b", "level": 4, "chapter": ""}, {"code": "b1308", "title": "Funzioni dell’energia e delle pulsioni, altro specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1309", "title": "Funzioni dell’energia e delle pulsioni, non specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1340", "title": "Ammontare del sonno", "component": "b", "level": 4, "chapter": ""}, {"code": "b1341", "title": "Inizio del sonno", "component": "b", "level": 4, "chapter": ""}, {"code": "b1342", "title": "Mantenimento del sonno", "component": "b", "level": 4, "chapter": ""}, {"code": "b1343", "title": "Qualità del sonno", "component": "b", "level": 4, "chapter": ""}, {"code": "b1344", "title": "Funzioni che coinvolgono il ciclo del sonno", "component": "b", "level": 4, "chapter": ""}, {"code": "b1348", "title": "Funzioni del sonno, altro specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1349", "title": "Funzioni del sonno, non specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1400", "title": "Mantenimento dell’attenzione", "component": "b", "level": 4, "chapter": ""}, {"code": "b1401", "title": "Spostamento dell’attenzione", "component": "b", "level": 4, "chapter": ""}, {"code": "b1402", "title": "Distribuzione dell’attenzione", "component": "b", "level": 4, "chapter": ""}, {"code": "b1403", "title": "Condivisione dell’attenzione", "component": "b", "level": 4, "chapter": ""}, {"code": "b1408", "title": "Funzioni dell’attenzione, altro specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1409", "title": "Funzioni dell’attenzione, non specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1440", "title": "Memoria a breve termine", "component": "b", "level": 4, "chapter": ""}, {"code": "b1441", "title": "Memoria a lungo termine", "component": "b", "level": 4, "chapter": ""}, {"code": "b1442", "title": "Recupero ed elaborazione della memoria", "component": "b", "level": 4, "chapter": ""}, {"code": "b1448", "title": "Funzioni della memoria, altro specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1449", "title": "Funzione della memoria, non specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1470", "title": "Controllo psicomotorio", "component": "b", "level": 4, "chapter": ""}, {"code": "b1471", "title": "Qualità delle funzioni psicomotorie", "component": "b", "level": 4, "chapter": ""}, {"code": "b1472", "title": "Organizzazione delle funzioni psicomotorie", "component": "b", "level": 4, "chapter": ""}, {"code": "b1473", "title": "Dominanza manuale", "component": "b", "level": 4, "chapter": ""}, {"code": "b1474", "title": "Dominanza laterale", "component": "b", "level": 4, "chapter": ""}, {"code": "b1478", "title": "Funzioni psicomotorie, altro specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1479", "title": "Funzioni psicomotorie, non specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1520", "title": "Appropriatezza dell’emozione", "component": "b", "level": 4, "chapter": ""}, {"code": "b1521", "title": "Regolazione dell’emozione", "component": "b", "level": 4, "chapter": ""}, {"code": "b1522", "title": "Gamma di emozioni", "component": "b", "level": 4, "chapter": ""}, {"code": "b1528", "title": "Funzioni emozionali, altro specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1529", "title": "Funzioni emozionali, non specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1560", "title": "Percezione uditiva", "component": "b", "level": 4, "chapter": ""}, {"code": "b1561", "title": "Percezione visiva", "component": "b", "level": 4, "chapter": ""}, {"code": "b1562", "title": "Percezione olfattiva", "component": "b", "level": 4, "chapter": ""}, {"code": "b1563", "title": "Percezione gustativa", "component": "b", "level": 4, "chapter": ""}, {"code": "b1564", "title": "Percezione tattile", "component": "b", "level": 4, "chapter": ""}, {"code": "b1565", "title": "Percezione visuospaziale", "component": "b", "level": 4, "chapter": ""}, {"code": "b1568", "title": "Funzioni percettive, altro specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1569", "title": "Funzioni percettive, non specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1600", "title": "Ritmo del pensiero", "component": "b", "level": 4, "chapter": ""}, {"code": "b1601", "title": "Forma del pensiero", "component": "b", "level": 4, "chapter": ""}, {"code": "b1602", "title": "Contenuto del pensiero", "component": "b", "level": 4, "chapter": ""}, {"code": "b1603", "title": "Controllo del pensiero", "component": "b", "level": 4, "chapter": ""}, {"code": "b1608", "title": "Funzioni del pensiero, altro specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1609", "title": "Funzioni del pensiero, non specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1640", "title": "Astrazione", "component": "b", "level": 4, "chapter": ""}, {"code": "b1641", "title": "Organizzazione e pianificazione", "component": "b", "level": 4, "chapter": ""}, {"code": "b1642", "title": "Gestione del tempo", "component": "b", "level": 4, "chapter": ""}, {"code": "b1643", "title": "Flessibilità cognitiva", "component": "b", "level": 4, "chapter": ""}, {"code": "b1644", "title": "Insight", "component": "b", "level": 4, "chapter": ""}, {"code": "b1645", "title": "Giudizio", "component": "b", "level": 4, "chapter": ""}, {"code": "b1646", "title": "Soluzione dei problemi", "component": "b", "level": 4, "chapter": ""}, {"code": "b1648", "title": "Funzioni cognitive di livello superiore, altro specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1649", "title": "Funzioni cognitive di livello superiore, non specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1670", "title": "Recepire il linguaggio", "component": "b", "level": 4, "chapter": ""}, {"code": "b1671", "title": "Espressione del linguaggio", "component": "b", "level": 4, "chapter": ""}, {"code": "b1672", "title": "Funzioni linguistiche integrative", "component": "b", "level": 4, "chapter": ""}, {"code": "b1678", "title": "Funzioni mentali del linguaggio, altro specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1679", "title": "Funzioni mentali del linguaggio, non specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1720", "title": "Calcolo semplice", "component": "b", "level": 4, "chapter": ""}, {"code": "b1721", "title": "Calcolo complesso", "component": "b", "level": 4, "chapter": ""}, {"code": "b1728", "title": "Funzioni di calcolo, altro specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1729", "title": "Funzioni di calcolo, non specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1800", "title": "Esperienza del sé", "component": "b", "level": 4, "chapter": ""}, {"code": "b1801", "title": "Immagine corporea", "component": "b", "level": 4, "chapter": ""}, {"code": "b1802", "title": "Esperienza del tempo", "component": "b", "level": 4, "chapter": ""}, {"code": "b1808", "title": "Funzione dell’esperienza del sé e del tempo, altro specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b1809", "title": "Funzione dell’esperienza del sé e del tempo, non specificato", "component": "b", "level": 4, "chapter": ""}, {"code": "b2100", "title": "Funzioni dell’acuità visiva", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2101", "title": "Funzioni del campo visivo", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2102", "title": "Qualità della visione", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2108", "title": "Funzione della vista, altro specificato", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2109", "title": "Funzione della vista, non specificato", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2150", "title": "Funzioni dei muscoli interni dell’occhio", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2151", "title": "Funzioni della palpebra", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2152", "title": "Funzioni dei muscoli esterni dell’occhio", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2153", "title": "Funzioni delle ghiandole lacrimali", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2158", "title": "Funzioni delle strutture adiacenti all’occhio, altro specificato", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2159", "title": "Funzioni delle strutture adiacenti all’occhio, non specificato", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2300", "title": "Percezione del suono", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2301", "title": "Discriminazione del suono", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2302", "title": "Localizzazione della fonte del suono", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2303", "title": "Lateralizzazione del suono", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2304", "title": "Discriminazione delle parole", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2308", "title": "Funzioni uditive, altro specificato", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2309", "title": "Funzioni uditive, non specificato", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2350", "title": "Funzione vestibolare di posizione", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2351", "title": "Funzione vestibolare dell’equilibrio", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2352", "title": "Funzione vestibolare della determinazione del movimento", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2358", "title": "Funzioni vestibolari, altro specificato", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2359", "title": "Funzioni vestibolari, non specificato", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2400", "title": "Ronzio auricolare o tinnito", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2401", "title": "Capogiro", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2402", "title": "Sensazione di cadere", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2403", "title": "Nausea associata a capogiro o vertigene", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2404", "title": "Irritazione nell’orecchio", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2405", "title": "Pressione auricolare", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2408", "title": "Sensazioni associate alla funzione uditiva e vestibolare, altro specificato", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2409", "title": "Sensazioni associate alla funzione uditiva e vestibolare, non specificato", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2700", "title": "Sensibilità alla temperatura", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2701", "title": "Sensibilità alla vibrazione", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2702", "title": "Sensibilità alla pressione", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2703", "title": "Sensibilità ad uno stimolo nocivo", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2708", "title": "Funzioni sensoriali correlate alla temperatura e ad altri stimoli, altro", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2709", "title": "Funzioni sensoriali correlate alla temperatura e ad altri stimoli, non", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2800", "title": "Dolore generalizzato", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2801", "title": "Dolore in una parte del corpo", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2802", "title": "Dolore in più parti del corpo", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2803", "title": "Dolore diffuso in un dermatomo", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b2804", "title": "Dolore diffuso in una zona o regione", "component": "b", "level": 4, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b3100", "title": "Produzione della voce", "component": "b", "level": 4, "chapter": "cap.3 FUNZIONI DELLA VOCE E DELL’ELOQUIO"}, {"code": "b3101", "title": "Qualità della voce", "component": "b", "level": 4, "chapter": "cap.3 FUNZIONI DELLA VOCE E DELL’ELOQUIO"}, {"code": "b3108", "title": "Funzioni della voce, altro specificato", "component": "b", "level": 4, "chapter": "cap.3 FUNZIONI DELLA VOCE E DELL’ELOQUIO"}, {"code": "b3109", "title": "Funzioni della voce, non specificato", "component": "b", "level": 4, "chapter": "cap.3 FUNZIONI DELLA VOCE E DELL’ELOQUIO"}, {"code": "b3300", "title": "Fluidità dell’eloquio", "component": "b", "level": 4, "chapter": "cap.3 FUNZIONI DELLA VOCE E DELL’ELOQUIO"}, {"code": "b3301", "title": "Ritmo dell’eloquio", "component": "b", "level": 4, "chapter": "cap.3 FUNZIONI DELLA VOCE E DELL’ELOQUIO"}, {"code": "b3302", "title": "Velocità dell’eloquio", "component": "b", "level": 4, "chapter": "cap.3 FUNZIONI DELLA VOCE E DELL’ELOQUIO"}, {"code": "b3303", "title": "Melodia dell’eloquio", "component": "b", "level": 4, "chapter": "cap.3 FUNZIONI DELLA VOCE E DELL’ELOQUIO"}, {"code": "b3308", "title": "Funzioni della fluidità e del ritmo dell’eloquio, altro specificato", "component": "b", "level": 4, "chapter": "cap.3 FUNZIONI DELLA VOCE E DELL’ELOQUIO"}, {"code": "b3309", "title": "Funzioni della fluidità e del ritmo dell’eloquio, non specificato", "component": "b", "level": 4, "chapter": "cap.3 FUNZIONI DELLA VOCE E DELL’ELOQUIO"}, {"code": "b3400", "title": "Produzione di note", "component": "b", "level": 4, "chapter": "cap.3 FUNZIONI DELLA VOCE E DELL’ELOQUIO"}, {"code": "b3401", "title": "Emettere una gamma di suoni", "component": "b", "level": 4, "chapter": "cap.3 FUNZIONI DELLA VOCE E DELL’ELOQUIO"}, {"code": "b3408", "title": "Funzioni di vocalizzazione alternativa, altro specificato", "component": "b", "level": 4, "chapter": "cap.3 FUNZIONI DELLA VOCE E DELL’ELOQUIO"}, {"code": "b3409", "title": "Funzioni di vocalizzazione alternativa, non specificato", "component": "b", "level": 4, "chapter": "cap.3 FUNZIONI DELLA VOCE E DELL’ELOQUIO"}, {"code": "b4100", "title": "Frequenza cardiaca", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4101", "title": "Ritmo cardiaco", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4102", "title": "Forza di contrazione dei muscoli ventricolari", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4103", "title": "Rifornimento di sangue al cuore", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4150", "title": "Funzioni delle arterie", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4151", "title": "Funzioni dei capillari", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4152", "title": "Funzioni delle vene", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4200", "title": "Aumento della pressione sanguigna", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4201", "title": "Calo della pressione sanguigna", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4202", "title": "Mantenimento della pressione sanguigna", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4300", "title": "Produzione di sangue", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4301", "title": "Funzioni del sangue relative al trasporto di ossigeno", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4302", "title": "Funzioni del sangue relative al trasporto di metaboliti", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4303", "title": "Funzioni di coagulazione", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4308", "title": "Funzioni del sistema ematologico, altro specificato", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4309", "title": "Funzioni del sistema ematologico, non specificato", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4350", "title": "Reazione immunitaria", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4351", "title": "Reazioni di ipersensibilità", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4352", "title": "Funzioni dei vasi linfatici", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4353", "title": "Funzioni dei linfonodi", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4358", "title": "Funzioni del sistema immunologico, altro specificato", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4359", "title": "Funzioni del sistema immunologico, non specificato", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4400", "title": "Frequenza respiratoria", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4401", "title": "Ritmo respiratorio", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4402", "title": "Profondità del respiro", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4408", "title": "Funzioni respiratorie, altro specificato", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4409", "title": "Funzioni respiratorie, non specificato", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4450", "title": "Funzioni dei muscoli respiratori toracici", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4451", "title": "Funzioni del diaframma", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4452", "title": "Funzioni dei muscoli respiratori accessori", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4458", "title": "Funzioni del muscolo respiratorio, altro specificato", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4459", "title": "Funzioni del muscolo respiratorio, non specificato", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4500", "title": "Produzione di muco delle vie respiratorie", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4501", "title": "Trasporto di muco delle vie respiratorie", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4508", "title": "Ulteriori funzioni respiratorie, altro specificato", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4509", "title": "Ulteriori funzioni respiratorie, non specificato", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4550", "title": "Resistenza fisica generale", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4551", "title": "Capacità aerobica", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4552", "title": "Affaticabilità", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4558", "title": "Funzioni di tolleranza dell’esercizio fisico, altro specificato", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b4559", "title": "Funzioni di tolleranza dell’esercizio fisico, non specificato", "component": "b", "level": 4, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b5100", "title": "Succhiare", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5101", "title": "Mordere", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5102", "title": "Masticare", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5103", "title": "Movimentazione del cibo nella bocca", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5104", "title": "Salivazione", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5105", "title": "Deglutizione", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5106", "title": "Vomitare", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5107", "title": "Ruminare", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5108", "title": "Funzioni dell’ingestione, altro specificato", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5109", "title": "Funzioni dell’ingestione, non specificato", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5150", "title": "Trasporto di cibo attraverso lo stomaco e gli intestini", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5151", "title": "Decomposizione del cibo", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5152", "title": "Assorbimento di sostanze nutrienti", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5153", "title": "Tolleranza al cibo", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5158", "title": "Funzioni di digestione, altro specificato", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5159", "title": "Funzioni di digestione, non specificato", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5250", "title": "Eliminazione delle feci", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5251", "title": "Consistenza fecale", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5252", "title": "Frequenza della defecazione", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5253", "title": "Continenza fecale", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5254", "title": "Flatulenza", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5258", "title": "Funzioni di defecazione, altro specificato", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5259", "title": "Funzioni di defecazione, non specificato", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5350", "title": "Sensazione di nausea", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5351", "title": "Senso di gonfiore", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5352", "title": "Sensazione di crampo addominale", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5358", "title": "Sensazioni associate all’apparato digerente, altro specificato", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5359", "title": "Sensazioni associate all’apparato digerente, non specificato", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5400", "title": "Tasso metabolico basale", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5401", "title": "Metabolismo dei carboidrati", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5402", "title": "Metabolismo delle proteine", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5403", "title": "Metabolismo dei grassi", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5408", "title": "Funzioni metaboliche generali, altro specificato", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5409", "title": "Funzioni metaboliche generali, non specificato", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5450", "title": "Bilancio idrico", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5451", "title": "Bilancio dei minerali", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5452", "title": "Bilancio degli elettroliti", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5458", "title": "Funzioni del bilancio idrico, minerale ed elettrolitico, altro specificato", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5459", "title": "Funzioni del bilancio idrico, minerale ed elettrolitico, non specificato", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5500", "title": "Temperatura corporea", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5501", "title": "Mantenimento della temperatura corporea", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5508", "title": "Funzioni di termoregolazione, altro specificato", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b5550", "title": "Funzioni puberali", "component": "b", "level": 4, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b6100", "title": "Filtrazione dell’urina", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6101", "title": "Raccolta dell’urina", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6108", "title": "Funzioni urinarie escretorie, altro specificato", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6109", "title": "Funzioni urinarie escretorie, non specificato", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6200", "title": "Minzione", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6201", "title": "Frequenza della minzione", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6202", "title": "Continenza urinaria", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6208", "title": "Funzioni della minzione, altro specificato", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6209", "title": "Funzione della minzione, non specificato", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6400", "title": "Funzioni della fase di eccitamento sessuale", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6401", "title": "Funzioni della fase dei preliminari sessuali", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6402", "title": "Funzioni della fase orgasmica", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6403", "title": "Funzioni della fase di risoluzione sessuale", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6408", "title": "Funzioni sessuali, altro specificato", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6409", "title": "Funzioni sessuali, non specificato", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6500", "title": "Regolarità del ciclo mestruale", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6501", "title": "Intervallo tra le mestruazioni", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6502", "title": "Entità del sanguinamento mestruale", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6503", "title": "Inizio delle mestruazioni", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6508", "title": "Funzioni mestruali, altro specificato", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6509", "title": "Funzioni mestruali, non specificato", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6600", "title": "Funzioni correlate alla fertilità", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6601", "title": "Funzioni correlate alla gravidanza", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6602", "title": "Funzioni correlate al parto", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6603", "title": "Lattazioni", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6608", "title": "Funzioni della procreazione, altro specificato", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6609", "title": "Funzioni della procreazione, non specificato", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6700", "title": "Disagio associato al rapporto sessuale", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6701", "title": "Disagio associato asl ciclo mestruale", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6702", "title": "Disagio associato alla menopausa", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6703", "title": "Funzioni genitali", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6708", "title": "Sensazioni associate alle funzioni genitali e riproduttive,altro specificato", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b6709", "title": "Sensazioni associate alle funzioni genitali e riproduttive, non specificato", "component": "b", "level": 4, "chapter": "cap.6 FUNZIONI GENITOURINARIE E RIPRODUTTIVE"}, {"code": "b7100", "title": "Mobilità di una singola articolazione", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7101", "title": "Mobilità di diverse articolazioni", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7102", "title": "Mobilità delle articolazioni generalizzata", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7108", "title": "Funzioni della mobilità dell’articolazione, altro specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7109", "title": "Funzioni della mobilità dell’articolazione, non specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7150", "title": "Stabilità di una singola articolazione", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7151", "title": "Stabilità di diverse articolazioni", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7152", "title": "Stabilità delle articolazioni generalizzata", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7158", "title": "Funzioni della stabilità dell’articolazione, altro specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7159", "title": "Funzioni della stabilità dell’articolazione, non specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7200", "title": "Mobilità della scapola", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7201", "title": "Mobilità della pelvi", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7202", "title": "Mobilità delle ossa carpali", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7203", "title": "Mobilità delle ossa tarsali", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7208", "title": "Funzioni della mobilità dell’osso, altro specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7209", "title": "Funzioni della mobilità dell’osso, non specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7300", "title": "Forza di muscoli isolati e di gruppi di muscoli", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7301", "title": "Forza dei muscoli di un arto", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7302", "title": "Forza dei muscoli di un lato del corpo", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7303", "title": "Forza dei muscoli della metà inferiore del corpo", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7304", "title": "Forza dei muscoli di tutti gli arti", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7305", "title": "Forza dei muscoli del tronco", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7306", "title": "Forza di tutti i muscoli del corpo", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7308", "title": "Funzioni della forza muscolare, altro specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7309", "title": "Funzioni della forza muscolare, non specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7350", "title": "Tono di muscoli isolati e di gruppi di muscoli", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7351", "title": "Tono dei muscoli di un arto", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7352", "title": "Tono dei muscoli di un lato del corpo", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7353", "title": "Tono dei muscoli della metà inferiore del corpo", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7354", "title": "Tono dei muscoli di tutti gli arti", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7355", "title": "Tono dei muscoli del tronco", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7356", "title": "Tono di tutti i muscoli del corpo", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7358", "title": "Funzioni del tono muscolare, altro specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7359", "title": "Funzioni del tono muscolare, non specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7400", "title": "Resistenza di muscoli isolati", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7401", "title": "Resistenza di gruppi di muscoli", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7402", "title": "Resistenza di tutti i muscoli del corpo", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7408", "title": "Funzioni della resistenza muscolare, altro specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7409", "title": "Funzioni della resistenza muscolare, non specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7500", "title": "Riflesso motorio miostatico", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7501", "title": "Riflessi generati da stimoli dolorosi", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7502", "title": "Riflessi generati da altri stimoli eterocettivi", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7508", "title": "Funzioni del riflesso motorio, altro specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7509", "title": "Funzioni del riflesso motorio, non specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7600", "title": "Controllo di movimenti volontari semplici", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7601", "title": "Controllo di movimenti volontari complessi", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7602", "title": "Coordinazione di movimenti volontari", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7603", "title": "Funzioni di sostegno del braccio o della gamba", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7608", "title": "Funzioni di controllo del movimento volontario, altro specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7609", "title": "Funzioni di controllo del movimento volontario, non specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7610", "title": "Movimenti generali", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7611", "title": "Movimenti spontanei specifici", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7618", "title": "Movimenti spontanei, altro specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7619", "title": "Movimenti spontanei, non specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7650", "title": "Contrazioni involontarie dei muscoli", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7651", "title": "Tremore", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7652", "title": "Tic e manierismi", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7653", "title": "Stereotipie e perseverazione motoria", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7658", "title": "Funzioni del movimento involontario, altro specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7659", "title": "Funzioni del movimento involontario, non specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7800", "title": "Sensazione di rigidità muscolare", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7801", "title": "Sensazione di spasmo muscolare", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7808", "title": "Sensazioni correlate alle funzioni muscolari e di movimento, altro specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b7809", "title": "Sensazioni correlate alle funzioni muscolari e di movimento, non specificato", "component": "b", "level": 4, "chapter": "cap.7 FUNZIONI NEURO-MUSCOLOSCHELETRICHE E CORRELATE AL"}, {"code": "b11420", "title": "Orientamento rispetto a sé", "component": "b", "level": 5, "chapter": ""}, {"code": "b11421", "title": "Orientamento rispetto agli altri", "component": "b", "level": 5, "chapter": ""}, {"code": "b11428", "title": "Orientamento rispetto alla persona, altro specificato", "component": "b", "level": 5, "chapter": ""}, {"code": "b11429", "title": "Orientamento rispetto alla persona, non specificato", "component": "b", "level": 5, "chapter": ""}, {"code": "b16700", "title": "Recepire il linguaggio verbale", "component": "b", "level": 5, "chapter": ""}, {"code": "b16701", "title": "Recepire il linguaggio scritto", "component": "b", "level": 5, "chapter": ""}, {"code": "b16702", "title": "Recepire il linguaggio dei segni", "component": "b", "level": 5, "chapter": ""}, {"code": "b16703", "title": "Recepire il linguaggio gestuale", "component": "b", "level": 5, "chapter": ""}, {"code": "b16708", "title": "Recepire il linguaggio, altro specificato", "component": "b", "level": 5, "chapter": ""}, {"code": "b16709", "title": "Recepire il linguaggio, non specificato", "component": "b", "level": 5, "chapter": ""}, {"code": "b16710", "title": "Espressione del linguaggio verbale", "component": "b", "level": 5, "chapter": ""}, {"code": "b16711", "title": "Espressione del linguaggio scritto", "component": "b", "level": 5, "chapter": ""}, {"code": "b16712", "title": "Espressione del linguaggio dei segni", "component": "b", "level": 5, "chapter": ""}, {"code": "b16713", "title": "Espressione del linguaggio gestuale", "component": "b", "level": 5, "chapter": ""}, {"code": "b16718", "title": "Espressione del linguaggio, altro specificato", "component": "b", "level": 5, "chapter": ""}, {"code": "b16719", "title": "Espressione del linguaggio, non specificato", "component": "b", "level": 5, "chapter": ""}, {"code": "b21000", "title": "Acuità binoculare nella visione a distanza", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b21001", "title": "Acuità monoculare nella visione a distanza", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b21002", "title": "Acuità binoculare nella visione da vicino", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b21003", "title": "Acuità monoculare nella visione da vicino", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b21008", "title": "Funzioni dell’acuità visiva, altro specificato", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b21009", "title": "Funzioni dell’acuità visiva, non specificato", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b21020", "title": "Sensibilità alla luce", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b21021", "title": "Visione dei colori", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b21022", "title": "Sensibilità al contrasto", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b21023", "title": "Qualità dell’immagine visiva", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b21028", "title": "Qualità della visione, altro specificato", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b21029", "title": "Qualità della visione, non specificato", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b28010", "title": "Dolore al capo o al collo", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b28011", "title": "Dolore al torace", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b28012", "title": "Dolore allo stomaco o all’addome", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b28013", "title": "Dolore alla schiena", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b28014", "title": "Dolore all’arto superiore", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b28015", "title": "Dolore all’arto inferiore", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b28016", "title": "Dolore alle articolazioni", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b28018", "title": "Dolore in una parte del corpo, altro specificato", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b28019", "title": "Dolore in una parte del corpo, non specificato", "component": "b", "level": 5, "chapter": "cap.2 FUNZIONI SENSORIALI E DOLORE"}, {"code": "b43500", "title": "Reazione immunitaria specifica", "component": "b", "level": 5, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b43501", "title": "Reazione immunitaria non specifica", "component": "b", "level": 5, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b43508", "title": "Reazione immunitaria, altro specificato", "component": "b", "level": 5, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b43509", "title": "Reazione immunitaria, non specificato", "component": "b", "level": 5, "chapter": "cap.4 FUNZIONI DEI SISTEMI CARDIOVASCOLARE, EMATOLOGICO,"}, {"code": "b51050", "title": "Deglutizione attraverso il cavo orale", "component": "b", "level": 5, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b51051", "title": "Deglutizione attraverso la faringe", "component": "b", "level": 5, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b51052", "title": "Deglutizione attraverso l’esofago", "component": "b", "level": 5, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b51058", "title": "Deglutizione, altro specificato", "component": "b", "level": 5, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b51059", "title": "Deglutizione, non specificato", "component": "b", "level": 5, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b51060", "title": "Rigurgitare", "component": "b", "level": 5, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b54500", "title": "Ritenzione idrica", "component": "b", "level": 5, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b54501", "title": "Mantenimento del bilancio idrico", "component": "b", "level": 5, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b54508", "title": "Funzioni del bilancio idrico, altro specificato", "component": "b", "level": 5, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b54509", "title": "Funzioni del bilancio idrico, non specificato", "component": "b", "level": 5, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b55500", "title": "Sviluppo di peli sul corpo e sul pube", "component": "b", "level": 5, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b55501", "title": "Sviluppo del seno e del capezzolo", "component": "b", "level": 5, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b55502", "title": "Sviluppo del pene, dei testicoli e dello scroto", "component": "b", "level": 5, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b55508", "title": "Funzioni puberali, altro specificato", "component": "b", "level": 5, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "b55509", "title": "Funzioni puberali, non specificato", "component": "b", "level": 5, "chapter": "cap.5 FUNZIONI DELL’APPARATO DIGERENTE E DEI SISTEMI METABOLICO ED"}, {"code": "d110", "title": "Guardare", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d115", "title": "Ascoltare", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d120", "title": "Altre percezioni sensoriali intenzionali", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d129", "title": "Esperienze sensoriali intenzionali, altro specificato e non", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d130", "title": "Copiare", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d135", "title": "Ripetere", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d140", "title": "Imparare a leggere", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d145", "title": "Imparare a scrivere", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d150", "title": "Imparare a calcolare", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d155", "title": "Acquisizione di abilità", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d159", "title": "Apprendimento di base, altro specificato e non specificato", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d160", "title": "Focalizzare l’attenzione", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d163", "title": "Pensiero", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d166", "title": "Lettura", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d170", "title": "Scrittura", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d172", "title": "Calcolo", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d175", "title": "Risoluzione di problemi", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d177", "title": "Prendere decisioni", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d179", "title": "Applicazione delle conoscenze, altro specificato e non specificato", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d198", "title": "Apprendimento e applicazione delle conoscenze, altro specificato", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d199", "title": "Apprendimento e applicazione delle conoscenze, non specificato", "component": "d", "level": 3, "chapter": "Capitolo 1 – Apprendimento e applicazione delle conoscenze"}, {"code": "d210", "title": "Intraprendere un compito singolo", "component": "d", "level": 3, "chapter": "Capitolo 2 – Compiti e richieste generali"}, {"code": "d220", "title": "Intraprendere compiti articolati", "component": "d", "level": 3, "chapter": "Capitolo 2 – Compiti e richieste generali"}, {"code": "d230", "title": "Eseguire la routine quotidiana", "component": "d", "level": 3, "chapter": "Capitolo 2 – Compiti e richieste generali"}, {"code": "d240", "title": "Gestire la tensione e altre richieste di tipo psicologico", "component": "d", "level": 3, "chapter": "Capitolo 2 – Compiti e richieste generali"}, {"code": "d298", "title": "Compiti e richieste generali, altro specificato", "component": "d", "level": 3, "chapter": "Capitolo 2 – Compiti e richieste generali"}, {"code": "d299", "title": "Compiti e richieste generali, non specificato", "component": "d", "level": 3, "chapter": "Capitolo 2 – Compiti e richieste generali"}, {"code": "d310", "title": "Comunicare con - ricevere - messaggi verbali", "component": "d", "level": 3, "chapter": "Capitolo 3 – Comunicazione"}, {"code": "d315", "title": "Comunicare con - ricevere - messaggi non verbali", "component": "d", "level": 3, "chapter": "Capitolo 3 – Comunicazione"}, {"code": "d320", "title": "Comunicare con - ricevere - messaggi nel linguaggio dei segni", "component": "d", "level": 3, "chapter": "Capitolo 3 – Comunicazione"}, {"code": "d325", "title": "Comunicare con - ricevere - messaggi scritti", "component": "d", "level": 3, "chapter": "Capitolo 3 – Comunicazione"}, {"code": "d329", "title": "Comunicare - ricevere, altro specificato e non specificato", "component": "d", "level": 3, "chapter": "Capitolo 3 – Comunicazione"}, {"code": "d330", "title": "Parlare", "component": "d", "level": 3, "chapter": "Capitolo 3 – Comunicazione"}, {"code": "d335", "title": "Produrre messaggi non verbali", "component": "d", "level": 3, "chapter": "Capitolo 3 – Comunicazione"}, {"code": "d340", "title": "Produrre messaggi nel linguaggio dei segni", "component": "d", "level": 3, "chapter": "Capitolo 3 – Comunicazione"}, {"code": "d345", "title": "Scrivere messaggi", "component": "d", "level": 3, "chapter": "Capitolo 3 – Comunicazione"}, {"code": "d349", "title": "Comunicare - produrre, altro specificato e non specificato", "component": "d", "level": 3, "chapter": "Capitolo 3 – Comunicazione"}, {"code": "d350", "title": "Conversazione", "component": "d", "level": 3, "chapter": "Capitolo 3 – Comunicazione"}, {"code": "d355", "title": "Discussione", "component": "d", "level": 3, "chapter": "Capitolo 3 – Comunicazione"}, {"code": "d360", "title": "Utilizzo di strumenti e tecniche di comunicazione", "component": "d", "level": 3, "chapter": "Capitolo 3 – Comunicazione"}, {"code": "d369", "title": "Conversazione e uso di strumenti e tecniche di comunicazione,", "component": "d", "level": 3, "chapter": "Capitolo 3 – Comunicazione"}, {"code": "d398", "title": "Comunicazione, altro specificato", "component": "d", "level": 3, "chapter": "Capitolo 3 – Comunicazione"}, {"code": "d399", "title": "Comunicazione, non specificato", "component": "d", "level": 3, "chapter": "Capitolo 3 – Comunicazione"}, {"code": "d410", "title": "Cambiare la posizione corporea di base", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d415", "title": "Mantenere una posizione corporea", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d420", "title": "Trasferirsi", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d429", "title": "Cambiare e mantenere una posizione corporea, altro specificato e non specificato", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d430", "title": "Sollevare e trasportare oggetti", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d435", "title": "Spostare oggetti con gli arti inferiori", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d440", "title": "Uso fine della mano", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d445", "title": "Uso della mano e del braccio", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d449", "title": "Trasportare, spostare e maneggiare oggetti, altro specificato e non specificato", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d450", "title": "Camminare", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d455", "title": "Spostarsi", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d460", "title": "Spostarsi in diverse collocazioni", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d465", "title": "Spostarsi usando apparecchiature/ausili", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d469", "title": "Camminare e spostarsi, altro specificato e non specificato", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d470", "title": "Usare un mezzo di trasporto", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d475", "title": "Guidare", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d480", "title": "Cavalcare animali per farsi trasportare", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d489", "title": "Muoversi usando un mezzo di trasporto, altro specificato e", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d498", "title": "Mobilità, altro specificato", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d499", "title": "Mobilità, non specificato", "component": "d", "level": 3, "chapter": "Capitolo 4 – Mobilità"}, {"code": "d510", "title": "Lavarsi", "component": "d", "level": 3, "chapter": "Capitolo 5 – Cura della propria persona"}, {"code": "d520", "title": "Prendersi cura di singole parti del corpo", "component": "d", "level": 3, "chapter": "Capitolo 5 – Cura della propria persona"}, {"code": "d530", "title": "Bisogni corporali", "component": "d", "level": 3, "chapter": "Capitolo 5 – Cura della propria persona"}, {"code": "d540", "title": "Vestirsi", "component": "d", "level": 3, "chapter": "Capitolo 5 – Cura della propria persona"}, {"code": "d550", "title": "Mangiare", "component": "d", "level": 3, "chapter": "Capitolo 5 – Cura della propria persona"}, {"code": "d560", "title": "Bere", "component": "d", "level": 3, "chapter": "Capitolo 5 – Cura della propria persona"}, {"code": "d570", "title": "Prendersi cura della propria salute", "component": "d", "level": 3, "chapter": "Capitolo 5 – Cura della propria persona"}, {"code": "d598", "title": "Cura della propria persona, altro specificato", "component": "d", "level": 3, "chapter": "Capitolo 5 – Cura della propria persona"}, {"code": "d599", "title": "Cura della propria persona, non specificato", "component": "d", "level": 3, "chapter": "Capitolo 5 – Cura della propria persona"}, {"code": "d610", "title": "Procurarsi un posto in cui vivere", "component": "d", "level": 3, "chapter": "Capitolo 6 – Vita domestica"}, {"code": "d620", "title": "Procurarsi beni e servizi", "component": "d", "level": 3, "chapter": "Capitolo 6 – Vita domestica"}, {"code": "d629", "title": "Procurarsi i beni necessari, altro specificato e non specificato", "component": "d", "level": 3, "chapter": "Capitolo 6 – Vita domestica"}, {"code": "d630", "title": "Preparare pasti", "component": "d", "level": 3, "chapter": "Capitolo 6 – Vita domestica"}, {"code": "d640", "title": "Fare i lavori di casa", "component": "d", "level": 3, "chapter": "Capitolo 6 – Vita domestica"}, {"code": "d649", "title": "Compiti casalinghi, altro specificato e non specificato", "component": "d", "level": 3, "chapter": "Capitolo 6 – Vita domestica"}, {"code": "d650", "title": "Prendersi cura degli oggetti della casa", "component": "d", "level": 3, "chapter": "Capitolo 6 – Vita domestica"}, {"code": "d660", "title": "Assistere gli altri", "component": "d", "level": 3, "chapter": "Capitolo 6 – Vita domestica"}, {"code": "d669", "title": "Prendersi cura degli oggetti della casa e assistere gli altri, altro", "component": "d", "level": 3, "chapter": "Capitolo 6 – Vita domestica"}, {"code": "d698", "title": "Vita domestica, altro specificato", "component": "d", "level": 3, "chapter": "Capitolo 6 – Vita domestica"}, {"code": "d699", "title": "Vita domestica, non specificato", "component": "d", "level": 3, "chapter": "Capitolo 6 – Vita domestica"}, {"code": "d710", "title": "Interazioni interpersonali semplici", "component": "d", "level": 3, "chapter": "Capitolo 7 – Interazioni e relazioni interpersonali"}, {"code": "d720", "title": "Interazioni interpersonali complesse", "component": "d", "level": 3, "chapter": "Capitolo 7 – Interazioni e relazioni interpersonali"}, {"code": "d729", "title": "Interazioni interpersonali generali, altro specificato e non specificato", "component": "d", "level": 3, "chapter": "Capitolo 7 – Interazioni e relazioni interpersonali"}, {"code": "d730", "title": "Entrare in relazione con estranei", "component": "d", "level": 3, "chapter": "Capitolo 7 – Interazioni e relazioni interpersonali"}, {"code": "d740", "title": "Relazioni formali", "component": "d", "level": 3, "chapter": "Capitolo 7 – Interazioni e relazioni interpersonali"}, {"code": "d750", "title": "Relazioni sociali informali", "component": "d", "level": 3, "chapter": "Capitolo 7 – Interazioni e relazioni interpersonali"}, {"code": "d760", "title": "Relazioni familiari", "component": "d", "level": 3, "chapter": "Capitolo 7 – Interazioni e relazioni interpersonali"}, {"code": "d770", "title": "Relazioni intime", "component": "d", "level": 3, "chapter": "Capitolo 7 – Interazioni e relazioni interpersonali"}, {"code": "d779", "title": "Relazioni interpersonali particolari, altro specificato e non specificato", "component": "d", "level": 3, "chapter": "Capitolo 7 – Interazioni e relazioni interpersonali"}, {"code": "d798", "title": "Interazioni e relazioni interpersonali, altro specificato", "component": "d", "level": 3, "chapter": "Capitolo 7 – Interazioni e relazioni interpersonali"}, {"code": "d799", "title": "Interazioni e relazioni interpersonali, non specificato", "component": "d", "level": 3, "chapter": "Capitolo 7 – Interazioni e relazioni interpersonali"}, {"code": "d810", "title": "Istruzione informale", "component": "d", "level": 3, "chapter": "Capitolo 8 – Aree di vita principali"}, {"code": "d815", "title": "Istruzione prescolastica", "component": "d", "level": 3, "chapter": "Capitolo 8 – Aree di vita principali"}, {"code": "d820", "title": "Istruzione scolastica", "component": "d", "level": 3, "chapter": "Capitolo 8 – Aree di vita principali"}, {"code": "d825", "title": "Formazione professionale", "component": "d", "level": 3, "chapter": "Capitolo 8 – Aree di vita principali"}, {"code": "d830", "title": "Istruzione superiore", "component": "d", "level": 3, "chapter": "Capitolo 8 – Aree di vita principali"}, {"code": "d839", "title": "Istruzione, altro specificato e non specificato", "component": "d", "level": 3, "chapter": "Capitolo 8 – Aree di vita principali"}, {"code": "d840", "title": "Apprendistato (addestramento al lavoro)", "component": "d", "level": 3, "chapter": "Capitolo 8 – Aree di vita principali"}, {"code": "d845", "title": "Acquisire, conservare e lasciare un lavoro", "component": "d", "level": 3, "chapter": "Capitolo 8 – Aree di vita principali"}, {"code": "d850", "title": "Lavoro retribuito", "component": "d", "level": 3, "chapter": "Capitolo 8 – Aree di vita principali"}, {"code": "d855", "title": "Lavoro non retribuito", "component": "d", "level": 3, "chapter": "Capitolo 8 – Aree di vita principali"}, {"code": "d859", "title": "Lavoro e impiego, altro specificato e non specificato", "component": "d", "level": 3, "chapter": "Capitolo 8 – Aree di vita principali"}, {"code": "d860", "title": "Transazioni economiche semplici", "component": "d", "level": 3, "chapter": "Capitolo 8 – Aree di vita principali"}, {"code": "d865", "title": "Transazioni economiche complesse", "component": "d", "level": 3, "chapter": "Capitolo 8 – Aree di vita principali"}, {"code": "d870", "title": "Autosufficienza economica", "component": "d", "level": 3, "chapter": "Capitolo 8 – Aree di vita principali"}, {"code": "d879", "title": "Vita economica, altro specificato e non specificato", "component": "d", "level": 3, "chapter": "Capitolo 8 – Aree di vita principali"}, {"code": "d898", "title": "Aree di vita fondamentali, altro specificato", "component": "d", "level": 3, "chapter": "Capitolo 8 – Aree di vita principali"}, {"code": "d899", "title": "Aree di vita fondamentali, non specificato", "component": "d", "level": 3, "chapter": "Capitolo 8 – Aree di vita principali"}, {"code": "d910", "title": "Vita nella comunità", "component": "d", "level": 3, "chapter": "Capitolo 9 – Vita sociale, civile e di comunità"}, {"code": "d920", "title": "Ricreazione e tempo libero", "component": "d", "level": 3, "chapter": "Capitolo 9 – Vita sociale, civile e di comunità"}, {"code": "d930", "title": "Religione e spiritualità", "component": "d", "level": 3, "chapter": "Capitolo 9 – Vita sociale, civile e di comunità"}, {"code": "d940", "title": "Diritti umani", "component": "d", "level": 3, "chapter": "Capitolo 9 – Vita sociale, civile e di comunità"}, {"code": "d950", "title": "Vita politica e cittadinanza", "component": "d", "level": 3, "chapter": "Capitolo 9 – Vita sociale, civile e di comunità"}, {"code": "d998", "title": "Vita sociale, civile e di comunità, altro specificato", "component": "d", "level": 3, "chapter": "Capitolo 9 – Vita sociale, civile e di comunità"}, {"code": "d999", "title": "Vita sociale, civile e di comunità, non specificato", "component": "d", "level": 3, "chapter": "Capitolo 9 – Vita sociale, civile e di comunità"}, {"code": "d1200", "title": "Toccare e sentire con la bocca o le labbra", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1201", "title": "Toccare con le mani,le dita, gli arti o altre parti del corpo", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1202", "title": "Odorare", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1203", "title": "Gustare mordendo, masticando, succhiando", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1310", "title": "Imparare attraverso semplici azioni con un solo oggetto", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1311", "title": "Imparare attraverso azioni che mettono in relazione due o più oggetti", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1312", "title": "Imparare attraverso azioni che mettono in relazione due o più oggetti tenendo conto", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1313", "title": "Apprendere attraverso il gioco simbolico", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1314", "title": "Apprendere attraverso il gioco di finzione", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1318", "title": "Imparare attraverso le azioni con gli oggetti, altro specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1319", "title": "Imparare attraverso le azioni con gli oggetti, non specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1330", "title": "Acquisire singole parole o simboli significativi", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1331", "title": "Combinare le parole in frasi", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1332", "title": "Acquisire la sintassi", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1338", "title": "Acquisire il linguaggio, altro specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1339", "title": "Acquisire il linguaggio, non specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1370", "title": "Acquisire concetti di base", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1371", "title": "Acquisire concetti complessi", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1378", "title": "Acquisire concetti, altro specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1379", "title": "Acquisire concetti, non specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1400", "title": "Acquisire le abilità di riconoscimento di simboli, quali figure, icone, caratteri,", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1401", "title": "Acquisire le abilità di pronuncia di parole scritte", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1402", "title": "Acquisire le abilità di comprensione di parole e frasi scritte", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1405", "title": "Piegarsi", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d1408", "title": "Imparare a leggere, altro specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1409", "title": "Imparare a leggere, non specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1450", "title": "Apprendere le abilità di uso di strumenti di scrittura", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1451", "title": "Apprendere le abilità di scrittura di simboli, di caratteri e dell’alfabeto", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1452", "title": "Apprendere le abilità di scrittura di parole e frasi", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1458", "title": "Imparare a scrivere, altro specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1459", "title": "Imparare a scrivere, non specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1500", "title": "Acquisire le abilità di riconoscimento di numeri, simboli e segni aritmetici", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1501", "title": "Acquisire abilità di alfabetismo numerico come contare e ordinare", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1502", "title": "Acquisire abilità nell’uso delle operazioni elementari", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1508", "title": "Imparare a calcolare, altro specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1509", "title": "Imparare a calcolare, non specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1550", "title": "Acquisizione di abilità basilari", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1551", "title": "Acquisizione di abilità complesse", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1558", "title": "Acquisizione di abilità, altro specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1559", "title": "Acquisizione di abilità, non specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1600", "title": "Focalizzare l’attenzione sul tocco, il volto e la voce di una persona", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1601", "title": "Focalizzare l’attenzione sui cambiamenti nell’ambiente", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1608", "title": "Focalizzare l’attenzione, altro specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1609", "title": "Focalizzare l’attenzione, non specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1630", "title": "Fingere", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1631", "title": "Speculare", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1632", "title": "Ipotizzare", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1638", "title": "Pensare, altro specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1639", "title": "Pensare, non specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1660", "title": "Utilizzare le abilità e le strategie generali del processo di lettura", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1661", "title": "Comprendere il linguaggio scritto", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1668", "title": "Leggere, altro specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1669", "title": "Leggere, non specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1700", "title": "Utilizzare le abilità e le strategie generali del processo di scrittura", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1701", "title": "Utilizzare convenzioni grammaticali nei componimenti scritti", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1702", "title": "Utilizzare le abilità e le strategie generali per creare componimenti", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1708", "title": "Scrivere, altro specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1709", "title": "Scrivere, non specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1720", "title": "Utilizzare le abilità e le strategie semplici del processo di calcolo", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1721", "title": "Utilizzare le abilità e le strategie complesse del processo di calcolo", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1728", "title": "Calcolare, altro specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1729", "title": "Calcolare, non specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1750", "title": "Risoluzione di problemi semplici", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1751", "title": "Risoluzione di problemi complessi", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1758", "title": "Risoluzione di problemi, altro specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d1759", "title": "Risoluzione di problemi, non specificato", "component": "d", "level": 4, "chapter": "cap. 1 APPRENDIMENTO E APPLICAZIONE DELLE CONOSCENZE acquisite,"}, {"code": "d2100", "title": "Intraprendere un compito semplice", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2101", "title": "Intraprendere un compito complesso", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2102", "title": "Intraprendere un compito singolo autonomamente", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2103", "title": "Intraprendere un compito singolo in gruppo", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2104", "title": "Completare un compito semplice", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2105", "title": "Completare un compito complesso", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2108", "title": "Intraprendere compiti singoli, altro specificato", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2109", "title": "Intraprendere compiti singoli, non specificato", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2200", "title": "Eseguire compiti articolati", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2201", "title": "Completare compiti articolati", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2202", "title": "Intraprendere compiti articolati autonomamente", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2203", "title": "Intraprendere compiti articolati in gruppo", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2204", "title": "Completare compiti articolati autonomamente", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2205", "title": "Completare compiti articolati in gruppo", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2208", "title": "Intraprendere compiti articolati, altro specificato", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2209", "title": "Intraprendere compiti articolati, non specificato", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2300", "title": "Seguire delle routine (procedimenti ed incombenze quotidiane)", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2301", "title": "Gestire la routine quotidiana", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2302", "title": "Completare la routine quotidiana", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2303", "title": "Gestire il proprio tempo e la propria attività", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2304", "title": "Gestire i cambiamenti nella routine quotidiana", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2305", "title": "Gestire il proprio tempo", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2306", "title": "Adattarsi alle necessità temporali", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2308", "title": "Eseguire la routine quotidiana, altri specificato", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2309", "title": "Eseguire la routine quotidiana, non specificato", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2400", "title": "Gestire le responsabilità", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2401", "title": "Gestire lo stress", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2402", "title": "Gestire le crisi", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2408", "title": "Gestire la tensione e altre richieste di tipo psicologico, altro specificato", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2409", "title": "Gestire la tensione e altre richieste di tipo psicologico, non specificato", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2500", "title": "Accettare le novità", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2501", "title": "Rispondere alle richieste", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2502", "title": "Relazionarsi alle persone e alle situazioni", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2503", "title": "Agire in modo prevedibile", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2504", "title": "Adattare il livello di attività", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2508", "title": "Controllare il proprio comportamento, altro specificato", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d2509", "title": "Controllare il proprio comportamento, no specificato", "component": "d", "level": 4, "chapter": "cap.2 COMPITI E RICHIESTE GENERALI"}, {"code": "d3100", "title": "Reagire alla voce umana", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3101", "title": "Comprendere messaggi verbali semplici", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3102", "title": "Comprendere messaggi verbali complessi", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3108", "title": "Comunicare con – ricevere – messaggi verbali, altro specificato", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3150", "title": "Comunicare con – ricevere – gesti del corpo", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3151", "title": "Comunicare con – ricevere – segni e simboli comuni", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3152", "title": "Comunicare con – ricevere – disegni e fotografie", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3158", "title": "Comunicare con – ricevere –messaggi non verbali, altro specificato", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3159", "title": "Comunicare con – ricevere –messaggi non verbali, non specificato", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3350", "title": "Produrre gesti con il corpo", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3351", "title": "Produrre segni e simboli", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3352", "title": "Produrre disegni e fotografie", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3358", "title": "Produrre messaggi non verbali, altro specificato", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3359", "title": "Produrre messaggi non verbali, non specificato", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3500", "title": "Avviare una conversazione", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3501", "title": "Mantenere una conversazione", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3502", "title": "Terminare una conversazione", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3503", "title": "Conversare con una persona", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3504", "title": "Conversare con molte persone", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3508", "title": "Conversazione, altro specificato", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3509", "title": "Conversazione, non specificato", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3550", "title": "Discussione con una persona", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3551", "title": "Discussione con molte persone", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3558", "title": "Discussione, altro specificato", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3559", "title": "Discussione. Non specificato", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3600", "title": "Usare strumenti di telecomunicazione", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3601", "title": "Usare macchine per scrivere", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3602", "title": "Usare tecniche di comunicazione", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3608", "title": "Utilizzo di strumenti e tecniche di comunicazione, altro specificato", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d3609", "title": "Utilizzo di strumenti e tecniche di comunicazione, non specificato", "component": "d", "level": 4, "chapter": "cap.3 COMUNICAZIONE"}, {"code": "d4100", "title": "Sdraiarsi", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4101", "title": "Accovacciarsi", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4102", "title": "Inginocchiarsi", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4103", "title": "Sedersi", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4104", "title": "Stare in posizione eretta", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4106", "title": "Spostare il baricentro del corpo", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4107", "title": "Girarsi", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4108", "title": "Cambiare la posizione corporea di base, altro specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4109", "title": "Cambiare la posizione corporea di base, non specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4150", "title": "Mantenere una posizione sdraiata", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4151", "title": "Mantenere una posizione accovacciata", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4152", "title": "Mantenere una posizione inginocchiata", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4153", "title": "Mantenere una posizione seduta", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4154", "title": "Mantenere una posizione eretta", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4155", "title": "Mantenere la posizione del capo", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4158", "title": "Mantenere una posizione corporea, altro specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4159", "title": "Mantenere una posizione corporea, non specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4200", "title": "Trasferirsi da seduti", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4201", "title": "Trasferirsi da sdraiati", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4208", "title": "Trasferirsi, altro specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4209", "title": "Trasferirsi, non specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4300", "title": "Sollevare", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4301", "title": "Portare con le mani", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4302", "title": "Portare sulle braccia", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4303", "title": "Portare sulle spalle, sul fianco, sulla schiena", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4304", "title": "Portare sulla testa", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4305", "title": "Posare degli oggetti", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4308", "title": "Sollevare e trasportare, altro specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4309", "title": "Sollevare e trasportare, non specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4350", "title": "Spingere con gli arti inferiori", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4351", "title": "Calciare", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4358", "title": "Spostare oggetti con gli arti inferiori, altro specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4359", "title": "Spostare oggetti con gli arti inferiori, non specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4400", "title": "Raccogliere", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4401", "title": "Afferrare", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4402", "title": "Manipolare", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4403", "title": "Lasciare", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4408", "title": "Uso fine della mano, altro specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4409", "title": "Uso fine della mano, non specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4450", "title": "Tirare", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4451", "title": "Spingere", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4452", "title": "Raggiungere allungando il braccio", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4453", "title": "Girare o esercitare torsione delle mani e delle braccia", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4454", "title": "Lanciare", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4455", "title": "Afferrare", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4458", "title": "Uso della mano e del braccio, altro specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4459", "title": "Uso della mano e del braccio, non specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4500", "title": "Camminare per brevi distanze", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4501", "title": "Camminare per lunghe distanze", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4502", "title": "Camminare su superfici diverse", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4503", "title": "Camminare attorno a degli ostacoli", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4508", "title": "Camminare, altro specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4509", "title": "Camminare, non specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4550", "title": "Strisciare", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4551", "title": "Salire", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4552", "title": "Correre", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4553", "title": "Saltare", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4554", "title": "Nuotare", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4555", "title": "Spostarsi da seduti e rotolarsi", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4556", "title": "Trascinarsi", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4558", "title": "Spostarsi, altro specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4559", "title": "Spostarsi, non specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4600", "title": "Spostarsi all’interno della casa", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4601", "title": "Spostarsi all’interno di edifici diversi da casa propria", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4602", "title": "Spostarsi all’esterno della casa e di altro edificio", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4608", "title": "Spostarsi in diverse collocazioni, altro specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4609", "title": "Spostarsi in diverse collocazioni, non specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4700", "title": "Usare un mezzo di trasporto a trazione umana", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4701", "title": "Usare mezzi di trasporto privati motorizzati", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4702", "title": "Usare mezzi di trasporto pubblici motorizzati", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4703", "title": "Usare delle persone per il trasporto", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4708", "title": "Usare un mezzo di trasporto, altro specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4709", "title": "Usare un mezzo di trasporto, non specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4750", "title": "Condurre un mezzo di trasporto a trazione umana", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4751", "title": "Guidare veicoli motorizzati", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4752", "title": "Guidare veicoli a trazione animale", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4758", "title": "Guidare, altro specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d4759", "title": "Guidare, non specificato", "component": "d", "level": 4, "chapter": "cap.4 MOBILITA’"}, {"code": "d5100", "title": "Lavare parti del corpo", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5101", "title": "Lavarsi tutto il corpo", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5102", "title": "Asciugarsi", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5108", "title": "Lavarsi, altro specificato", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5109", "title": "Lavarsi, non specificato", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5200", "title": "Curare la pelle", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5201", "title": "Curare i denti", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5202", "title": "Curare i capelli ed i piedi", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5203", "title": "Curare le unghie dei pieti", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5204", "title": "Curare il naso", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5300", "title": "Regolazione della minzione", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5301", "title": "Regolazione della defecazione", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5302", "title": "Cura relativa alle mestruazioni", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5308", "title": "Bisogni corporali, altro specificato", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5308", "title": "Prendersi cura di singole parti del corpo, altro specificato", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5309", "title": "Bisogni corporali, non specificato", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5309", "title": "Prendersi cura di singole parti del corpo, non specificato", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5400", "title": "Mettersi indumenti", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5401", "title": "Togliersi indumenti", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5402", "title": "Mettersi calzature", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5403", "title": "Togliersi calzature", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5404", "title": "Scegliere l’abbigliamento appropriato", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5408", "title": "Vestirsi, altro specificato", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5409", "title": "Vestirsi, non specificato", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5500", "title": "Manifestare il bisogno di mangiare", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5501", "title": "Magiare appropriatamente", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5508", "title": "Mangiare, altro specificato", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5509", "title": "Mangiare, non specificato", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5600", "title": "Manifestare il bisogno di bere", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5601", "title": "Allattarsi al seno", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5602", "title": "Alimentazione da biberon", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5608", "title": "Bere, altro specificato", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5609", "title": "Bere, non specificato", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5700", "title": "Assicurarsi il proprio comfort fisico", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5701", "title": "Gestire la dieta e la forma fisica", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5702", "title": "Mantenersi in salute", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5708", "title": "Prendersi cura della propria salute, altro specificato", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d5709", "title": "Prendersi cura della propria salute, non specificato", "component": "d", "level": 4, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d6100", "title": "Comprare un posto in cui vivere", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6101", "title": "Prendere in affitto un posto in cui vivere", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6102", "title": "Arredare un posto in cui vivere", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6108", "title": "Procurarsi un posto in cui vivere, altro specificato", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6109", "title": "Procurarsi un posto in cui vivere, non specificato", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6200", "title": "Fare compere, acquistare", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6201", "title": "Procurarsi ciò che serve quotidianamente", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6208", "title": "Procurarsi beni e servizi, altro specificato", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6209", "title": "Procurarsi beni e servizi, non specificato", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6300", "title": "Preparare pasti semplici", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6301", "title": "Preparare pasti complessi", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6302", "title": "Aiutare a preparare i pasti", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6308", "title": "Preparare i pasti, altro specificato", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6309", "title": "Preparare i pasti, non specificato", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6400", "title": "Lavare e asciugare indumenti e abiti", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6401", "title": "Pulire l’area dove si cucina e gli utensili", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6402", "title": "Pulire l’abitazione", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6403", "title": "Utilizzare elettrodomestici", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6404", "title": "Riporre ciò che serve quotidianamente", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6405", "title": "Eliminare l’immondizia", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6406", "title": "Aiutare a fare i lavori domestici", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6408", "title": "Fare i lavori di casa, altro specificato", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6409", "title": "Fare i lavori di casa, non specificato", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6500", "title": "Confezionare e riparare gli indumenti", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6501", "title": "Provvedere alla manutenzione della casa e dei mobili", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6502", "title": "Provvedere alla manutenzione degli apparecchi domestici", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6503", "title": "Provvedere alla manutenzione dei veicoli", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6504", "title": "Provvedere alla manutenzione degli ausili", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6505", "title": "Prendersi cura delle piante, all’interno e all’esterno", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6506", "title": "Prendersi cura degli animali", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6507", "title": "Aiutare a prendersi cura degli oggetti della casa", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6508", "title": "Prendersi cura degli oggetti della casa, altro specificato", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6509", "title": "Prendersi cura degli oggetti della casa, non specificato", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6600", "title": "Assistere gli altri nella cura della propria persona", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6601", "title": "Assistere gli altri nel movimento", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6602", "title": "Assistere gli altri nella comunicazione", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6603", "title": "Assistere gli altri nelle relazioni interpersonali", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6604", "title": "Assistere gli altri nella nutrizione", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6605", "title": "Assistere gli altri nel mantenersi in salute", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6606", "title": "Aiutare ad assistere gli altri", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6608", "title": "Assistere gli altri, altro specificato", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d6609", "title": "Assistere gli altri, non specificato", "component": "d", "level": 4, "chapter": "cap.6 VITA DOMESTICA"}, {"code": "d7100", "title": "Rispetto e cordialità nelle relazioni", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7101", "title": "Apprezzamento nelle relazioni", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7102", "title": "Tolleranza nelle relazioni", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7103", "title": "Critiche nelle relazioni", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7104", "title": "Segnali sociali nelle relazioni", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7105", "title": "Contatto fisico nelle relazioni", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7106", "title": "Differenziazione delle persone familiari e non", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7108", "title": "Interazioni interpersonali semplici, altro specificato", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7109", "title": "Interazioni interpersonali semplici, non specificato", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7200", "title": "Formare delle relazioni", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7201", "title": "Porre termine alle relazioni", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7202", "title": "Regolare i comportamenti nelle interazioni", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7203", "title": "Interagire secondo le regole sociali", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7204", "title": "Mantenere la distanza sociale", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7208", "title": "Interazioni interpersonali complesse, altro specificato", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7209", "title": "Interazioni interpersonali complesse, non specificato", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7400", "title": "Entrare in relazione con persone autorevoli", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7401", "title": "Entrare in relazione con subordinati", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7402", "title": "Entrare in relazione con persone di pari livello", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7408", "title": "Relazioni formali, altro specificato", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7409", "title": "Relazioni formali, non specificato", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7500", "title": "Relazioni informali con amici", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7501", "title": "Relazioni informali con vicini di casa", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7502", "title": "Relazioni informali con conoscenti", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7503", "title": "Relazioni informali con coinquilini", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7504", "title": "Relazioni informali con i pari", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7508", "title": "Relazioni sociali informali, altro specificato", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7509", "title": "Relazioni sociali informali, non specificato", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7600", "title": "Relazioni genitore-figlio", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7601", "title": "Relazioni figlio-genitore", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7602", "title": "Relazioni tra fratelli", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7603", "title": "Relazioni nella famiglia allargata", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7608", "title": "Relazioni familiari,altro specificato", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7609", "title": "Relazioni familiari, non specificato", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7700", "title": "Relazioni romantiche", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7701", "title": "Relazioni coniugali", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7702", "title": "Relazioni sessuali", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7708", "title": "Relazioni intime, altro specificato", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d7709", "title": "Relazioni intime, non specificato", "component": "d", "level": 4, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d8150", "title": "Accedere a un programma di istruzione prescolastica o passare da un livello ad un", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8151", "title": "Mantenere un programma di istruzione prescolastica", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8152", "title": "Progredire in un programma di istruzione prescolastica", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8153", "title": "Terminare un programma di istruzione prescolastica", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8158", "title": "Istruzione prescolastica, altro specificato", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8159", "title": "Istruzione prescolastica, non specificato", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8200", "title": "Accedere a un programma di istruzione scolastica o passare da un livello ad un", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8201", "title": "Mantenere un programma di istruzione scolastica", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8202", "title": "Progredire in un programma di istruzione scolastica", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8203", "title": "Terminare un programma di istruzione scolastica o delle tappe scolastiche", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8208", "title": "Istruzione scolastica, altro specificato", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8209", "title": "Istruzione scolastica, non specificato", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8250", "title": "Accedere ad un programma di formazione professionale o passare da un livello ad", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8251", "title": "Mantenere un programma di formazione professionale", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8252", "title": "Progredire in un programma di formazione professionale", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8253", "title": "Terminare un programma di formazione professionale", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8258", "title": "Formazione professionale, altro specificato", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8259", "title": "Formazione professionale, non specificato", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8300", "title": "Accedere all’istruzione superiore o passare da un livello ad un altro", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8301", "title": "Mantenere un programma di istruzione superiore", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8302", "title": "Progredire in un programma di istruzione superiore", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8303", "title": "Terminare un programma di istruzione superiore", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8308", "title": "Istruzione superiore, altro specificato", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8309", "title": "Istruzione superiore, non specificato", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8450", "title": "Cercare un lavoro", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8451", "title": "Mantenere un lavoro", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8452", "title": "Lasciare un lavoro", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8458", "title": "Acquisire, conservare, lasciare un lavoro, altro specificato", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8459", "title": "Acquisire, conservare, lasciare un lavoro, non specificato", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8500", "title": "Lavoro autonomo", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8501", "title": "Lavoro part-time", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8502", "title": "Lavoro a tempo pieno", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8508", "title": "Lavoro retribuito, altro specificato", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8509", "title": "Lavoro retribuito, non specificato", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8800", "title": "Gioco solitario", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8801", "title": "Gioco da spettatori", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8802", "title": "Gioco parallelo", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8803", "title": "Gioco cooperativo condiviso", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8808", "title": "Coinvolgimento nel gioco, altro specificato", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d8809", "title": "Coinvolgimento nel gioco, non specificato", "component": "d", "level": 4, "chapter": "cap.8 AREE DI VITA PRINCIPALI"}, {"code": "d9100", "title": "Associazioni informali", "component": "d", "level": 4, "chapter": "cap.9 VITA SOCIALE, CIVILE E DI COMUNITA’"}, {"code": "d9101", "title": "Associazioni formali", "component": "d", "level": 4, "chapter": "cap.9 VITA SOCIALE, CIVILE E DI COMUNITA’"}, {"code": "d9102", "title": "Cerimonie", "component": "d", "level": 4, "chapter": "cap.9 VITA SOCIALE, CIVILE E DI COMUNITA’"}, {"code": "d9103", "title": "Vita di comunità informale", "component": "d", "level": 4, "chapter": "cap.9 VITA SOCIALE, CIVILE E DI COMUNITA’"}, {"code": "d9108", "title": "Vita di comunità, altro specificato", "component": "d", "level": 4, "chapter": "cap.9 VITA SOCIALE, CIVILE E DI COMUNITA’"}, {"code": "d9109", "title": "Vita di comunità, non specificato", "component": "d", "level": 4, "chapter": "cap.9 VITA SOCIALE, CIVILE E DI COMUNITA’"}, {"code": "d9200", "title": "Gioco", "component": "d", "level": 4, "chapter": "cap.9 VITA SOCIALE, CIVILE E DI COMUNITA’"}, {"code": "d9201", "title": "Sport", "component": "d", "level": 4, "chapter": "cap.9 VITA SOCIALE, CIVILE E DI COMUNITA’"}, {"code": "d9202", "title": "Arte e cultura", "component": "d", "level": 4, "chapter": "cap.9 VITA SOCIALE, CIVILE E DI COMUNITA’"}, {"code": "d9203", "title": "Artigianato", "component": "d", "level": 4, "chapter": "cap.9 VITA SOCIALE, CIVILE E DI COMUNITA’"}, {"code": "d9204", "title": "Hobby", "component": "d", "level": 4, "chapter": "cap.9 VITA SOCIALE, CIVILE E DI COMUNITA’"}, {"code": "d9205", "title": "Socializzazione", "component": "d", "level": 4, "chapter": "cap.9 VITA SOCIALE, CIVILE E DI COMUNITA’"}, {"code": "d9208", "title": "Ricreazione e tempo libero, altro specificato", "component": "d", "level": 4, "chapter": "cap.9 VITA SOCIALE, CIVILE E DI COMUNITA’"}, {"code": "d9209", "title": "Ricreazione e tempo libero, non specificato", "component": "d", "level": 4, "chapter": "cap.9 VITA SOCIALE, CIVILE E DI COMUNITA’"}, {"code": "d9300", "title": "Religione organizzata", "component": "d", "level": 4, "chapter": "cap.9 VITA SOCIALE, CIVILE E DI COMUNITA’"}, {"code": "d9301", "title": "Spiritualità", "component": "d", "level": 4, "chapter": "cap.9 VITA SOCIALE, CIVILE E DI COMUNITA’"}, {"code": "d9308", "title": "Religione e spiritualità, altro specificato", "component": "d", "level": 4, "chapter": "cap.9 VITA SOCIALE, CIVILE E DI COMUNITA’"}, {"code": "d9309", "title": "Religione e spiritualità, non specificato", "component": "d", "level": 4, "chapter": "cap.9 VITA SOCIALE, CIVILE E DI COMUNITA’"}, {"code": "d53000", "title": "Manifestare il bisogno di urinare", "component": "d", "level": 5, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d53001", "title": "Espletare la minzione appropriatamente", "component": "d", "level": 5, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d53008", "title": "Regolazione della minzione, altro specificato", "component": "d", "level": 5, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d53009", "title": "Regolazione della minzione, non specificato", "component": "d", "level": 5, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d53010", "title": "Manifestare il bisogno di defecare", "component": "d", "level": 5, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d53011", "title": "Espletare la defecazione appropriatamente", "component": "d", "level": 5, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d53018", "title": "Regolazione della defecazione, altro specificato", "component": "d", "level": 5, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d53019", "title": "Regolazione della defecazione, non specificato", "component": "d", "level": 5, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d57020", "title": "Gestire i farmaci e seguire i consigli sanitari", "component": "d", "level": 5, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d57021", "title": "Chiedere consiglio o aiuto alla persona che accudisce a ai professionisti", "component": "d", "level": 5, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d57022", "title": "Evitare i rischi di abuso di droghe o alcol", "component": "d", "level": 5, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d57028", "title": "Mantenersi in salute, altro specificato", "component": "d", "level": 5, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d57029", "title": "Mantenersi in salute, non specificato", "component": "d", "level": 5, "chapter": "cap.5 CURA DELLA PROPRIA PERSONA"}, {"code": "d71040", "title": "Iniziare delle interazioni sociali", "component": "d", "level": 5, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d71041", "title": "Mantenere delle relazioni sociali", "component": "d", "level": 5, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d71048", "title": "Segnali sociali nelle relazioni, altro specificato", "component": "d", "level": 5, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "d71049", "title": "Segnali sociali nelle relazioni, non specificato", "component": "d", "level": 5, "chapter": "cap.7 INTERAZIONI E RELAZIONI INTERPERSONALI"}, {"code": "e110", "title": "Prodotti o sostanze per il consumo personale", "component": "e", "level": 3, "chapter": "Capitolo 1 – Prodotti e tecnologia"}, {"code": "e115", "title": "Prodotti e tecnologia per l’uso personale nella vita quotidiana", "component": "e", "level": 3, "chapter": "Capitolo 1 – Prodotti e tecnologia"}, {"code": "e120", "title": "Prodotti e tecnologia per la mobilità e il trasporto in ambienti interni e esterni", "component": "e", "level": 3, "chapter": "Capitolo 1 – Prodotti e tecnologia"}, {"code": "e125", "title": "Prodotti e tecnologia per la comunicazione", "component": "e", "level": 3, "chapter": "Capitolo 1 – Prodotti e tecnologia"}, {"code": "e130", "title": "Prodotti e tecnologia per l’istruzione", "component": "e", "level": 3, "chapter": "Capitolo 1 – Prodotti e tecnologia"}, {"code": "e135", "title": "Prodotti e tecnologia per il lavoro", "component": "e", "level": 3, "chapter": "Capitolo 1 – Prodotti e tecnologia"}, {"code": "e140", "title": "Prodotti e tecnologia per la cultura, la ricreazione e lo sport", "component": "e", "level": 3, "chapter": "Capitolo 1 – Prodotti e tecnologia"}, {"code": "e145", "title": "Prodotti e tecnologia per la pratica della religione o della spiritualità", "component": "e", "level": 3, "chapter": "Capitolo 1 – Prodotti e tecnologia"}, {"code": "e150", "title": "Prodotti e tecnologia per la progettazione e la costruzione di", "component": "e", "level": 3, "chapter": "Capitolo 1 – Prodotti e tecnologia"}, {"code": "e155", "title": "Prodotti e tecnologia per la progettazione e la costruzione di", "component": "e", "level": 3, "chapter": "Capitolo 1 – Prodotti e tecnologia"}, {"code": "e160", "title": "Prodotti e tecnologia per lo sviluppo del territorio", "component": "e", "level": 3, "chapter": "Capitolo 1 – Prodotti e tecnologia"}, {"code": "e165", "title": "Risorse e beni", "component": "e", "level": 3, "chapter": "Capitolo 1 – Prodotti e tecnologia"}, {"code": "e198", "title": "Prodotti e tecnologia, altro specificato", "component": "e", "level": 3, "chapter": "Capitolo 1 – Prodotti e tecnologia"}, {"code": "e199", "title": "Prodotti e tecnologia, non specificato", "component": "e", "level": 3, "chapter": "Capitolo 1 – Prodotti e tecnologia"}, {"code": "e210", "title": "Geografia fisica", "component": "e", "level": 3, "chapter": "Capitolo 2 – Ambiente naturale e cambiamenti ambientali effettuati dall’uomo"}, {"code": "e215", "title": "Popolazione", "component": "e", "level": 3, "chapter": "Capitolo 2 – Ambiente naturale e cambiamenti ambientali effettuati dall’uomo"}, {"code": "e220", "title": "Flora e fauna", "component": "e", "level": 3, "chapter": "Capitolo 2 – Ambiente naturale e cambiamenti ambientali effettuati dall’uomo"}, {"code": "e225", "title": "Clima", "component": "e", "level": 3, "chapter": "Capitolo 2 – Ambiente naturale e cambiamenti ambientali effettuati dall’uomo"}, {"code": "e230", "title": "Eventi naturali", "component": "e", "level": 3, "chapter": "Capitolo 2 – Ambiente naturale e cambiamenti ambientali effettuati dall’uomo"}, {"code": "e235", "title": "Eventi causati dall’uomo", "component": "e", "level": 3, "chapter": "Capitolo 2 – Ambiente naturale e cambiamenti ambientali effettuati dall’uomo"}, {"code": "e240", "title": "Luce", "component": "e", "level": 3, "chapter": "Capitolo 2 – Ambiente naturale e cambiamenti ambientali effettuati dall’uomo"}, {"code": "e245", "title": "Cambiamenti correlati al tempo", "component": "e", "level": 3, "chapter": "Capitolo 2 – Ambiente naturale e cambiamenti ambientali effettuati dall’uomo"}, {"code": "e250", "title": "Suono", "component": "e", "level": 3, "chapter": "Capitolo 2 – Ambiente naturale e cambiamenti ambientali effettuati dall’uomo"}, {"code": "e255", "title": "Vibrazione", "component": "e", "level": 3, "chapter": "Capitolo 2 – Ambiente naturale e cambiamenti ambientali effettuati dall’uomo"}, {"code": "e260", "title": "Qualità dell’aria", "component": "e", "level": 3, "chapter": "Capitolo 2 – Ambiente naturale e cambiamenti ambientali effettuati dall’uomo"}, {"code": "e298", "title": "Ambiente naturale e cambiamenti effettuati dall’uomo, altro specificato", "component": "e", "level": 3, "chapter": "Capitolo 2 – Ambiente naturale e cambiamenti ambientali effettuati dall’uomo"}, {"code": "e299", "title": "Ambiente naturale e cambiamenti effettuati dall’uomo, non", "component": "e", "level": 3, "chapter": "Capitolo 2 – Ambiente naturale e cambiamenti ambientali effettuati dall’uomo"}, {"code": "e310", "title": "Famiglia ristretta", "component": "e", "level": 3, "chapter": "Capitolo 3 – Relazioni e sostegno sociale"}, {"code": "e315", "title": "Famiglia allargata", "component": "e", "level": 3, "chapter": "Capitolo 3 – Relazioni e sostegno sociale"}, {"code": "e320", "title": "Amici", "component": "e", "level": 3, "chapter": "Capitolo 3 – Relazioni e sostegno sociale"}, {"code": "e325", "title": "Conoscenti, colleghi, vicini di casa e membri della comunità", "component": "e", "level": 3, "chapter": "Capitolo 3 – Relazioni e sostegno sociale"}, {"code": "e330", "title": "Persone in posizioni di autorità", "component": "e", "level": 3, "chapter": "Capitolo 3 – Relazioni e sostegno sociale"}, {"code": "e335", "title": "Persone in posizioni subordinate", "component": "e", "level": 3, "chapter": "Capitolo 3 – Relazioni e sostegno sociale"}, {"code": "e340", "title": "Persone che forniscono aiuto o assistenza", "component": "e", "level": 3, "chapter": "Capitolo 3 – Relazioni e sostegno sociale"}, {"code": "e345", "title": "Estranei", "component": "e", "level": 3, "chapter": "Capitolo 3 – Relazioni e sostegno sociale"}, {"code": "e350", "title": "Animali domestici", "component": "e", "level": 3, "chapter": "Capitolo 3 – Relazioni e sostegno sociale"}, {"code": "e355", "title": "Operatori sanitari", "component": "e", "level": 3, "chapter": "Capitolo 3 – Relazioni e sostegno sociale"}, {"code": "e360", "title": "Altri operatori", "component": "e", "level": 3, "chapter": "Capitolo 3 – Relazioni e sostegno sociale"}, {"code": "e398", "title": "Relazioni e sostegno sociale, altro specificato", "component": "e", "level": 3, "chapter": "Capitolo 3 – Relazioni e sostegno sociale"}, {"code": "e399", "title": "Relazioni e sostegno sociale, non specificato", "component": "e", "level": 3, "chapter": "Capitolo 3 – Relazioni e sostegno sociale"}, {"code": "e410", "title": "Atteggiamenti individuali dei componenti della famiglia ristretta", "component": "e", "level": 3, "chapter": "Capitolo 4 – Atteggiamenti"}, {"code": "e415", "title": "Atteggiamenti individuali dei componenti della famiglia allargata", "component": "e", "level": 3, "chapter": "Capitolo 4 – Atteggiamenti"}, {"code": "e420", "title": "Atteggiamenti individuali degli amici", "component": "e", "level": 3, "chapter": "Capitolo 4 – Atteggiamenti"}, {"code": "e425", "title": "Atteggiamenti individuali di conoscenti, colleghi, vicini di", "component": "e", "level": 3, "chapter": "Capitolo 4 – Atteggiamenti"}, {"code": "e430", "title": "Atteggiamenti individuali di persone in posizioni di autorità", "component": "e", "level": 3, "chapter": "Capitolo 4 – Atteggiamenti"}, {"code": "e435", "title": "Atteggiamenti individuali di persone in posizioni subordinate", "component": "e", "level": 3, "chapter": "Capitolo 4 – Atteggiamenti"}, {"code": "e440", "title": "Atteggiamenti individuali di persone che forniscono aiuto o assistenza", "component": "e", "level": 3, "chapter": "Capitolo 4 – Atteggiamenti"}, {"code": "e445", "title": "Atteggiamenti individuali di estranei", "component": "e", "level": 3, "chapter": "Capitolo 4 – Atteggiamenti"}, {"code": "e450", "title": "Atteggiamenti individuali di operatori sanitari", "component": "e", "level": 3, "chapter": "Capitolo 4 – Atteggiamenti"}, {"code": "e455", "title": "Atteggiamenti individuali di altri operatori", "component": "e", "level": 3, "chapter": "Capitolo 4 – Atteggiamenti"}, {"code": "e460", "title": "Atteggiamenti della società", "component": "e", "level": 3, "chapter": "Capitolo 4 – Atteggiamenti"}, {"code": "e465", "title": "Norme sociali, costumi e ideologie", "component": "e", "level": 3, "chapter": "Capitolo 4 – Atteggiamenti"}, {"code": "e498", "title": "Atteggiamenti, altro specificato", "component": "e", "level": 3, "chapter": "Capitolo 4 – Atteggiamenti"}, {"code": "e499", "title": "Atteggiamenti, non specificato", "component": "e", "level": 3, "chapter": "Capitolo 4 – Atteggiamenti"}, {"code": "e510", "title": "Servizi, sistemi e politiche per la produzione di beni di consumo", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e515", "title": "Servizi, sistemi e politiche per l’architettura e la costruzione", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e520", "title": "Servizi, sistemi e politiche per la pianificazione dello spazio aperto", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e525", "title": "Servizi, sistemi e politiche abitative", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e530", "title": "Servizi, sistemi e politiche di pubblica utilità", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e535", "title": "Servizi, sistemi e politiche di comunicazione", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e540", "title": "Servizi, sistemi e politiche di trasporto", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e545", "title": "Servizi, sistemi e politiche di protezione civile", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e550", "title": "Servizi, sistemi e politiche legali", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e555", "title": "Servizi, sistemi e politiche delle associazioni e delle organizzazioni", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e560", "title": "Servizi, sistemi e politiche dei mass media", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e565", "title": "Servizi, sistemi e politiche dell’economia", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e570", "title": "Servizi, sistemi e politiche previdenziali/assistenziali", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e575", "title": "Servizi, sistemi e politiche di sostegno sociale generale", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e580", "title": "Servizi, sistemi e politiche sanitarie", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e585", "title": "Servizi, sistemi e politiche dell’istruzione e della formazione", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e590", "title": "Servizi, sistemi e politiche del lavoro", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e595", "title": "Servizi e sistemi politici, e politiche", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e598", "title": "Servizi, sistemi e politiche, altro specificato", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e599", "title": "Servizi, sistemi e politiche, non specificato", "component": "e", "level": 3, "chapter": "Capitolo 5 – Servizi, sistemi e politiche"}, {"code": "e1100", "title": "Cibo", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1101", "title": "Farmaci", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1108", "title": "Prodotti o sostanze per il consumo personale, altro specificato", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1109", "title": "Prodotti o sostanze per il consumo personale, non specificato", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1150", "title": "Prodotti e tecnologia generali per l’uso personale nella vita quotidiana", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1151", "title": "Prodotti e tecnologia di assistenza per l’uso personale nella vita quotidiana", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1152", "title": "Prodotti e tecnologia utilizzati per il gioco", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1158", "title": "Prodotti e tecnologia per l’uso personale nella vita quotidiana, altro specificato", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1159", "title": "Prodotti e tecnologia per l’uso personale nella vita quotidiana, non specificato", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1200", "title": "Prodotti e tecnologia generali per la mobilità e il trasporto personali in ambienti", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1201", "title": "Prodotti e tecnologia di assistenza per la mobilità e il trasporto personali in", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1208", "title": "Prodotti e tecnologia per la mobilità e il trasporto personali in ambienti interni ed", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1209", "title": "Prodotti e tecnologia per la mobilità e il trasporto personali in ambienti interni ed", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1250", "title": "Prodotti e tecnologia generali per la comunicazione", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1251", "title": "Prodotti e tecnologia di assistenza per la comunicazione", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1258", "title": "Prodotti e tecnologia per la comunicazione, altro specificato", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1259", "title": "Prodotti e tecnologia per la comunicazione, non specificato", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1300", "title": "Prodotti e tecnologia generali per l’istruzione", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1301", "title": "Prodotti e tecnologia di assistenza per l’istruzione", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1308", "title": "Prodotti e tecnologia per l’istruzione, altro specificato", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1309", "title": "Prodotti e tecnologia per l’istruzione, non specificato", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1350", "title": "Prodotti e tecnologia generali per il lavoro", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1358", "title": "Prodotti e tecnologia per il lavoro, altro specificato", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1359", "title": "Prodotti e tecnologia per il lavoro, non specificato", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1400", "title": "Prodotti e tecnologia generali per la cultura, la ricreazione e lo sport", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1401", "title": "Prodotti e tecnologia di assistenza per la cultura, la ricreazione e lo sport", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1408", "title": "Prodotti e tecnologia per la cultura, la ricreazione e lo sport", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1409", "title": "Prodotti e tecnologia per la cultura, la ricreazione e lo sport", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1450", "title": "Prodotti e tecnologia generali per la pratica della religione o della spiritualità", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1450", "title": "Prodotti e tecnologia per la pratica della religione o della spiritualità, non specificato", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1451", "title": "Prodotti e tecnologia di assistenza per la pratica della religione o della spiritualità", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1458", "title": "Prodotti e tecnologia per la pratica della religione o della spiritualità, altro", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1500", "title": "Prodotti e tecnologia per la progettazione e la costruzione di entrate ed uscite degli", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1501", "title": "Prodotti e tecnologia per la progettazione e la costruzione dell’accesso alle strutture", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1502", "title": "Prodotti e tecnologia per la progettazione e la costruzione per trovare e seguire un", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1503", "title": "Prodotti e tecnologie per la progettazione e la costruzione per la sicurezza fisica", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1508", "title": "Prodotti e tecnologia per la programmazione e la costruzione di edifici per il", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1509", "title": "Prodotti e tecnologia per la programmazione e la costruzione di edifici per il", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1550", "title": "Prodotti e tecnologia per la progettazione e la costruzione di entrate ed uscite degli", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1551", "title": "Prodotti e tecnologia per la progettazione e la costruzione dell’accesso alle strutture", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1552", "title": "Prodotti e tecnologia per la progettazione e la costruzione per trovare e seguire un", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1553", "title": "Prodotti e tecnologie per la progettazione e la costruzione per la sicurezza fisica", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1558", "title": "Prodotti e tecnologia per la programmazione e la costruzione di edifici per uso", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1559", "title": "Prodotti e tecnologia per la programmazione e la costruzione di edifici per uso", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1600", "title": "Prodotti e tecnologia per lo sviluppo del territorio rurale", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1601", "title": "Prodotti e tecnologia per lo sviluppo del territorio periferico", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1602", "title": "Prodotti e tecnologia per lo sviluppo del territorio urbano", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1603", "title": "Prodotti e tecnologia di parchi, aree di conservazione dell’ambiente e riserve", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1608", "title": "Prodotti e tecnologia per lo sviluppo del territorio, altro specificato", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1609", "title": "Prodotti e tecnologia per lo sviluppo del territorio, non specificato", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1650", "title": "Risorse finanziarie", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1651", "title": "Risorse tangibili", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1652", "title": "Risorse intangibili", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1658", "title": "Risorse e beni, altro specificato", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e1659", "title": "Risorse e beni, non specificato", "component": "e", "level": 4, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e2100", "title": "Morfologia terrestre (es. montagne,colline, valli, pianure)", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2101", "title": "Masse d’acqua (es. laghi, dighe, fiumi, ruscelli)", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2108", "title": "Geografia fisica, altro specificato", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2109", "title": "Geografia fisica, non specificato", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2150", "title": "Cambiamento demografico", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2151", "title": "Densità di popolazione", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2158", "title": "Popolazione, altro specificato", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2159", "title": "Popolazione, non specificato", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2200", "title": "Piante", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2201", "title": "Animali", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2208", "title": "Flora e fauna, altro specificato", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2209", "title": "Flora e fauna, non specificato", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2250", "title": "Temperatura", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2251", "title": "Umidità", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2252", "title": "Pressione atmosferica", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2253", "title": "Precipitazioni atmosferiche", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2254", "title": "Vento", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2255", "title": "Variazioni stagionali", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2258", "title": "Clima, altro specificato", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2259", "title": "Clima, non specificato", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2400", "title": "Intensità della luce", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2401", "title": "Qualità della luce", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2408", "title": "Luce, altro specificato", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2409", "title": "Luce, non specificato", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2450", "title": "Cicli giorno/notte", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2451", "title": "Cicli lunari", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2458", "title": "Cambiamenti correlati al tempo, altro specificato", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2459", "title": "Cambiamenti correlati al tempo, non specificato", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2500", "title": "Intensità del suono", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2501", "title": "Qualità del suono", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2508", "title": "Suono, altro specificato", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2509", "title": "Suono, non specificato", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2600", "title": "Qualità dell’aria in luoghi chiusi", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2601", "title": "Qualità dell’aria all’aperto", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2608", "title": "Qualità dell’aria, altro specificato", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e2609", "title": "Qualità della’ria, non specificato", "component": "e", "level": 4, "chapter": "cap.2 AMBIENTE NATURALE E CAMBIAMENTI AMBIENTALI EFFETTUATI"}, {"code": "e5100", "title": "Servizi per la produzione di beni di consumo", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5102", "title": "Politiche per la produzione di beni di consumo", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5108", "title": "Servizi, sistemi e politiche per la produzione di beni di consumo", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5109", "title": "Servizi, sistemi e politiche per la produzione di beni di consumo", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5150", "title": "Servizi per l’architettura e la costruzione", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5152", "title": "Politiche per l’architettura e la costruzione", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5158", "title": "Servizi, sistemi e politiche per l’architettura e la costruzione, altro specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5159", "title": "Servizi, sistemi e politiche per l’architettura e la costruzione, non specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5200", "title": "Servizi per la pianificazione dello spazio aperto", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5201", "title": "Sistemi per la pianificazione dello spazio aperto", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5202", "title": "Politiche per la pianificazione dello spazio aperto", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5208", "title": "Servizi, sistemi e politiche per la pianificazione dello spazio aperto, altro specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5209", "title": "Servizi, sistemi e politiche per la pianificazione dello spazio aperto, non specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5250", "title": "Servizi abitativi", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5251", "title": "Sistemi abitativi", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5252", "title": "Politiche abitative", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5258", "title": "Servizi, sistemi e politiche abitative, altro specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5259", "title": "Servizi, sistemi e politiche abitative, non specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5300", "title": "Servizi di pubblica utilità", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5301", "title": "Sistemi di pubblica utilità", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5302", "title": "Politiche di pubblica utilità", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5308", "title": "Servizi, sistemi e politiche di pubblica utilità, altro specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5309", "title": "Servizi, sistemi e politiche di pubblica utilità, non specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5350", "title": "Servizi di comunicazione", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5351", "title": "Sistemi di comunicazione", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5352", "title": "Politiche di comunicazione", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5358", "title": "Servizi, sistemi e politiche di comunicazione, altro specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5359", "title": "Servizi, sistemi e politiche di comunicazione, non specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5400", "title": "Servizi di trasporto", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5401", "title": "Sistemi di trasporto", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5402", "title": "Politiche di trasporto", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5408", "title": "Servizi, sistemi e politiche di trasporto, altro specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5409", "title": "Servizi, sistemi e politiche di trasporto, non specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5450", "title": "Servizi di protezione civile", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5451", "title": "Sistemi di protezione civile", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5452", "title": "Politiche di protezione civile", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5458", "title": "Servizi, sistemi e politiche di protezione civile, altro specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5459", "title": "Servizi, sistemi e politiche di protezione civile, non specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5500", "title": "Servizi legali", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5501", "title": "Sistemi legali", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5502", "title": "Politiche legali", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5508", "title": "Servizi, sistemi e politiche legali, altro specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5509", "title": "Servizi, sistemi e politiche legali, non specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5550", "title": "Servizi delle associazioni e delle organizzazioni", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5551", "title": "Sistemi delle associazioni e delle organizzazioni", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5552", "title": "Politiche delle associazioni e delle organizzazioni", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5558", "title": "Servizi, sistemi e politiche delle associazioni e delle organizzazioni, altro specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5559", "title": "Servizi, sistemi e politiche delle associazioni e delle organizzazioni, non specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5600", "title": "Servizi dei mass media", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5601", "title": "Sistemi dei mass media", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5602", "title": "Politiche dei mass media", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5608", "title": "Servizi, sistemi e politiche dei mass media, altro specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5609", "title": "Servizi, sistemi e politiche dei mass media, non specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5650", "title": "Servizi dell’economia", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5651", "title": "Sistemi e politiche dell’economia", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5652", "title": "Politiche dell’economia", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5658", "title": "Servizi, sistemi e politiche dell’economia,altro specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5659", "title": "Servizi, sistemi e politiche dell’economia, non specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5700", "title": "Servizi previdenziali/assistenziali", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5701", "title": "Sistemi previdenziali/assistenziali", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5702", "title": "Politiche previdenziali/assistenziali", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5708", "title": "Servizi, sistemi e politiche previdenziali/assistenziali, altro specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5709", "title": "Servizi, sistemi e politiche previdenziali/assistenziali, non specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5750", "title": "Servizi di sostegno sociale generale", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5751", "title": "Sistemi di sostegno sociale generale", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5752", "title": "Politiche di sostegno sociale generale", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5758", "title": "Servizi, sistemi e politiche di sostegno sociale generale, altro specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5759", "title": "Servizi, sistemi e politiche di sostegno sociale generale, non specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5800", "title": "Servizi sanitari", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5801", "title": "Sistemi sanitari", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5802", "title": "Politiche sanitarie", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5808", "title": "Servizi, sistemi e politiche sanitarie, altro specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5809", "title": "Servizi, sistemi e politiche sanitarie, non specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5850", "title": "Servizi dell’istruzione e della formazione", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5851", "title": "Sistemi dell’istruzione e della formazione", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5852", "title": "Politiche dell’istruzione e della formazione", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5853", "title": "Servizi dell’istruzione e della formazione speciali", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5854", "title": "Sistemi dell’istruzione e della formazione speciali", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5855", "title": "Politiche dell’istruzione e della formazione speciali", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5858", "title": "Servizi, sistemi e politiche dell’istruzione e della formazione, altro classificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5859", "title": "Servizi, sistemi e politiche dell’istruzione e della formazione, non specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5900", "title": "Servizi del lavoro", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5901", "title": "Sistemi del lavoro", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5902", "title": "Politiche del lavoro", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5909", "title": "Servizi, sistemi e politiche del lavoro, non specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5950", "title": "Servizi politici", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5951", "title": "Sistemi politici", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5952", "title": "Politiche", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5958", "title": "Servizi, sistemi politici e politiche, altro specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e5959", "title": "Servizi, sistemi politici e politiche , non specificato", "component": "e", "level": 4, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e11520", "title": "Prodotti e tecnologia generali per il gioco", "component": "e", "level": 5, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e11521", "title": "Prodotti e tecnologia adattati per il gioco", "component": "e", "level": 5, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e11528", "title": "Prodotti e tecnologia utilizzati per il gioco, altro specificato", "component": "e", "level": 5, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e11529", "title": "Prodotti e tecnologia utilizzati per il gioco, non specificato", "component": "e", "level": 5, "chapter": "cap.1 PRODOTTI E TECNOLOGIA"}, {"code": "e57500", "title": "Cura informale di bambini o adulti da parte di famigliari e amici", "component": "e", "level": 5, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e57502", "title": "Centro di servizi di assistenza al bambino o all’adulto –con o senza scopo di lucro", "component": "e", "level": 5, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e57508", "title": "Servizi di sostegno sociale generale, altro specificato", "component": "e", "level": 5, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "e57509", "title": "Servizi di sostegno sociale generale, non specificato", "component": "e", "level": 5, "chapter": "cap.5 SERVIZI, SISTEMI E POLITICHE"}, {"code": "s110", "title": "Struttura del cervello", "component": "s", "level": 3, "chapter": "Capitolo 1 – Strutture del sistema nervoso"}, {"code": "s120", "title": "Midollo spinale e strutture correlate", "component": "s", "level": 3, "chapter": "Capitolo 1 – Strutture del sistema nervoso"}, {"code": "s130", "title": "Struttura delle meningi", "component": "s", "level": 3, "chapter": "Capitolo 1 – Strutture del sistema nervoso"}, {"code": "s140", "title": "Struttura del sistema nervoso simpatico", "component": "s", "level": 3, "chapter": "Capitolo 1 – Strutture del sistema nervoso"}, {"code": "s150", "title": "Struttura del sistema nervoso parasimpatico", "component": "s", "level": 3, "chapter": "Capitolo 1 – Strutture del sistema nervoso"}, {"code": "s198", "title": "Struttura del sistema nervoso, altro specificato", "component": "s", "level": 3, "chapter": "Capitolo 1 – Strutture del sistema nervoso"}, {"code": "s199", "title": "Struttura del sistema nervoso, non specificato", "component": "s", "level": 3, "chapter": "Capitolo 1 – Strutture del sistema nervoso"}, {"code": "s210", "title": "Struttura della cavità orbitaria", "component": "s", "level": 3, "chapter": "Capitolo 2 – Occhio, orecchio e strutture correlate"}, {"code": "s220", "title": "Struttura del bulbo oculare", "component": "s", "level": 3, "chapter": "Capitolo 2 – Occhio, orecchio e strutture correlate"}, {"code": "s230", "title": "Strutture adiacenti all’occhio", "component": "s", "level": 3, "chapter": "Capitolo 2 – Occhio, orecchio e strutture correlate"}, {"code": "s240", "title": "Struttura dell’orecchio esterno", "component": "s", "level": 3, "chapter": "Capitolo 2 – Occhio, orecchio e strutture correlate"}, {"code": "s250", "title": "Struttura dell’orecchio medio", "component": "s", "level": 3, "chapter": "Capitolo 2 – Occhio, orecchio e strutture correlate"}, {"code": "s260", "title": "Struttura dell’orecchio interno", "component": "s", "level": 3, "chapter": "Capitolo 2 – Occhio, orecchio e strutture correlate"}, {"code": "s298", "title": "Occhio, orecchio e strutture correlate, altro specificato", "component": "s", "level": 3, "chapter": "Capitolo 2 – Occhio, orecchio e strutture correlate"}, {"code": "s299", "title": "Occhio, orecchio e strutture correlate, non specificato", "component": "s", "level": 3, "chapter": "Capitolo 2 – Occhio, orecchio e strutture correlate"}, {"code": "s310", "title": "Struttura del naso", "component": "s", "level": 3, "chapter": "Capitolo 3 – Strutture coinvolte nella voce e nell’eloquio"}, {"code": "s320", "title": "Struttura della bocca", "component": "s", "level": 3, "chapter": "Capitolo 3 – Strutture coinvolte nella voce e nell’eloquio"}, {"code": "s330", "title": "Struttura della faringe", "component": "s", "level": 3, "chapter": "Capitolo 3 – Strutture coinvolte nella voce e nell’eloquio"}, {"code": "s340", "title": "Struttura della laringe", "component": "s", "level": 3, "chapter": "Capitolo 3 – Strutture coinvolte nella voce e nell’eloquio"}, {"code": "s398", "title": "Strutture coinvolte nella voce e nell’eloquio, altro specificato", "component": "s", "level": 3, "chapter": "Capitolo 3 – Strutture coinvolte nella voce e nell’eloquio"}, {"code": "s399", "title": "Strutture coinvolte nella voce e nell’eloquio, non specificato", "component": "s", "level": 3, "chapter": "Capitolo 3 – Strutture coinvolte nella voce e nell’eloquio"}, {"code": "s410", "title": "Struttura del sistema cardiovascolare", "component": "s", "level": 3, "chapter": "Capitolo 4 – Strutture dei sistemi cardiovascolare, immunologico"}, {"code": "s420", "title": "Struttura del sistema immunitario", "component": "s", "level": 3, "chapter": "Capitolo 4 – Strutture dei sistemi cardiovascolare, immunologico"}, {"code": "s430", "title": "Struttura dell’apparato respiratorio", "component": "s", "level": 3, "chapter": "Capitolo 4 – Strutture dei sistemi cardiovascolare, immunologico"}, {"code": "s498", "title": "Strutture dei sistemi cardiovascolare, immunologico e dell’apparato", "component": "s", "level": 3, "chapter": "Capitolo 4 – Strutture dei sistemi cardiovascolare, immunologico"}, {"code": "s499", "title": "Strutture dei sistemi cardiovascolare, immunologico e dell’apparato", "component": "s", "level": 3, "chapter": "Capitolo 4 – Strutture dei sistemi cardiovascolare, immunologico"}, {"code": "s510", "title": "Struttura delle ghiandole salivari", "component": "s", "level": 3, "chapter": "Capitolo 5 – Strutture correlate all’apparato digerente e ai"}, {"code": "s520", "title": "Struttura dell’esofago", "component": "s", "level": 3, "chapter": "Capitolo 5 – Strutture correlate all’apparato digerente e ai"}, {"code": "s530", "title": "Struttura dello stomaco", "component": "s", "level": 3, "chapter": "Capitolo 5 – Strutture correlate all’apparato digerente e ai"}, {"code": "s540", "title": "Struttura dell’intestino", "component": "s", "level": 3, "chapter": "Capitolo 5 – Strutture correlate all’apparato digerente e ai"}, {"code": "s550", "title": "Struttura del pancreas", "component": "s", "level": 3, "chapter": "Capitolo 5 – Strutture correlate all’apparato digerente e ai"}, {"code": "s560", "title": "Struttura del fegato", "component": "s", "level": 3, "chapter": "Capitolo 5 – Strutture correlate all’apparato digerente e ai"}, {"code": "s570", "title": "Struttura della cistifellea e dei dotti biliari", "component": "s", "level": 3, "chapter": "Capitolo 5 – Strutture correlate all’apparato digerente e ai"}, {"code": "s580", "title": "Struttura delle ghiandole endocrine", "component": "s", "level": 3, "chapter": "Capitolo 5 – Strutture correlate all’apparato digerente e ai"}, {"code": "s598", "title": "Strutture correlate all’apparato digerente e ai sistemi metabolico", "component": "s", "level": 3, "chapter": "Capitolo 5 – Strutture correlate all’apparato digerente e ai"}, {"code": "s599", "title": "Strutture correlate all’apparato digerente e ai sistemi metabolico ed endocrino, non specificato", "component": "s", "level": 3, "chapter": "Capitolo 5 – Strutture correlate all’apparato digerente e ai"}, {"code": "s610", "title": "Struttura del sistema urinario", "component": "s", "level": 3, "chapter": "Capitolo 6 – Strutture correlate ai sistemi genitourinario e riproduttivo"}, {"code": "s620", "title": "Struttura del pavimento pelvico", "component": "s", "level": 3, "chapter": "Capitolo 6 – Strutture correlate ai sistemi genitourinario e riproduttivo"}, {"code": "s630", "title": "Struttura del sistema riproduttivo", "component": "s", "level": 3, "chapter": "Capitolo 6 – Strutture correlate ai sistemi genitourinario e riproduttivo"}, {"code": "s698", "title": "Strutture correlate ai sistemi genitourinario e riproduttivo,", "component": "s", "level": 3, "chapter": "Capitolo 6 – Strutture correlate ai sistemi genitourinario e riproduttivo"}, {"code": "s699", "title": "Strutture correlate ai sistemi genitourinario e riproduttivo, non specificato", "component": "s", "level": 3, "chapter": "Capitolo 6 – Strutture correlate ai sistemi genitourinario e riproduttivo"}, {"code": "s710", "title": "Struttura della regione del capo e del collo", "component": "s", "level": 3, "chapter": "Capitolo 7 – Strutture correlate al movimento"}, {"code": "s720", "title": "Struttura della regione della spalla", "component": "s", "level": 3, "chapter": "Capitolo 7 – Strutture correlate al movimento"}, {"code": "s730", "title": "Struttura dell’arto superiore", "component": "s", "level": 3, "chapter": "Capitolo 7 – Strutture correlate al movimento"}, {"code": "s740", "title": "Struttura della regione pelvica", "component": "s", "level": 3, "chapter": "Capitolo 7 – Strutture correlate al movimento"}, {"code": "s750", "title": "Struttura dell’arto inferiore", "component": "s", "level": 3, "chapter": "Capitolo 7 – Strutture correlate al movimento"}, {"code": "s760", "title": "Struttura del tronco", "component": "s", "level": 3, "chapter": "Capitolo 7 – Strutture correlate al movimento"}, {"code": "s770", "title": "Ulteriori strutture muscoloscheletriche correlate al movimento", "component": "s", "level": 3, "chapter": "Capitolo 7 – Strutture correlate al movimento"}, {"code": "s798", "title": "Strutture correlate al movimento, altro specificato", "component": "s", "level": 3, "chapter": "Capitolo 7 – Strutture correlate al movimento"}, {"code": "s799", "title": "Strutture correlate al movimento, non specificato", "component": "s", "level": 3, "chapter": "Capitolo 7 – Strutture correlate al movimento"}, {"code": "s810", "title": "Struttura delle aree della cute", "component": "s", "level": 3, "chapter": "Capitolo 8 – Cute e strutture correlate"}, {"code": "s820", "title": "Struttura delle ghiandole della cute", "component": "s", "level": 3, "chapter": "Capitolo 8 – Cute e strutture correlate"}, {"code": "s830", "title": "Struttura delle unghie", "component": "s", "level": 3, "chapter": "Capitolo 8 – Cute e strutture correlate"}, {"code": "s840", "title": "Struttura dei peli e dei capelli", "component": "s", "level": 3, "chapter": "Capitolo 8 – Cute e strutture correlate"}, {"code": "s898", "title": "Cute e strutture correlate, altro specificato", "component": "s", "level": 3, "chapter": "Capitolo 8 – Cute e strutture correlate"}, {"code": "s899", "title": "Cute e strutture correlate, non specificato", "component": "s", "level": 3, "chapter": "Capitolo 8 – Cute e strutture correlate"}];

const ICF_DFPF_MAP = (() => {
  const m = new Map();
  for(const it of ICF_DFPF_CODES) {
    if(it && it.code) m.set(String(it.code), String(it.title || ""));
  }
  return m;
})();

const DFPF_QUALIFIERS = [
  { v:0, label:"0 – nessun problema" },
  { v:1, label:"1 – problema lieve" },
  { v:2, label:"2 – problema moderato" },
  { v:3, label:"3 – problema grave" },
  { v:4, label:"4 – problema completo" },
];

function dfpfTitle(code){
  return ICF_DFPF_MAP.get(String(code)) || "";
}

function ensureDfpfState(s = state){
  if(!s.icf) s.icf = {};
  if(!s.icf.dfpf || typeof s.icf.dfpf !== "object") s.icf.dfpf = { selected: {} };
  if(!s.icf.dfpf.selected || typeof s.icf.dfpf.selected !== "object") s.icf.dfpf.selected = {};
}

function cleanDfpfSelected(sel){
  if(!sel || typeof sel !== "object") return {};
  const out = {};
  for(const [code, v] of Object.entries(sel)){
    const n = Number(v);
    if(!Number.isFinite(n)) continue;
    const q = Math.max(0, Math.min(4, Math.round(n)));
    out[String(code)] = q;
  }
  return out;
}

function renderDiagICF(){
  const searchEl = document.getElementById("diagIcfSearch");
  const catEl = document.getElementById("diagIcfCat");
  const onlyEl = document.getElementById("diagIcfOnlySel");
  const listEl = document.getElementById("diagIcfList");
  const countEl = document.getElementById("diagIcfCount");
  if(!searchEl || !catEl || !onlyEl || !listEl || !countEl) return;

  ensureDfpfState();

  const q = String(searchEl.value || "").trim().toLowerCase();
  const cat = String(catEl.value || "all");
  const onlySel = !!onlyEl.checked;

  let arr = ICF_DFPF_CODES;

  if(cat !== "all") arr = arr.filter(it => it.component === cat);
  if(q) arr = arr.filter(it => (String(it.code).toLowerCase().includes(q) || String(it.title||"").toLowerCase().includes(q) || semanticHitICF(it.code, q)));
  if(onlySel) arr = arr.filter(it => state.icf.dfpf.selected[it.code] !== undefined);

  const total = arr.length;
  const limit = 200;
  const show = arr.slice(0, limit);

  listEl.innerHTML = "";

  for(const it of show){
    const code = String(it.code);
    const title = String(it.title || "");
    const chap = String(it.chapter || "");
    const selected = state.icf.dfpf.selected[code];
    const row = document.createElement("div");
    row.className = "dfpfRow";

    const options = DFPF_QUALIFIERS.map(o => {
      const sel = (selected !== undefined && Number(selected) === o.v) ? "selected" : "";
      return `<option value="${o.v}" ${sel}>${o.short || o.label}</option>`;
    }).join("");

    row.innerHTML = `
      <div class="dfpfCodeCell">${textEscape(code)}</div>
      <div class="dfpfCheckCell">
        <input type="checkbox" aria-label="Seleziona ${textEscape(code)}" ${selected !== undefined ? "checked" : ""} />
      </div>
      <div class="dfpfQualCell">
        <select class="input dfpfQ" title="Qualificatore 0–4: 0 nessun problema; 1 lieve; 2 moderato; 3 grave; 4 completo" ${selected === undefined ? "disabled" : ""}>${options}</select>
      </div>
      <div class="dfpfDescCell" tabindex="0" role="button" aria-label="Attiva/disattiva ${textEscape(code)}">
        <div class="dfpfDescTitle">${textEscape(title)}</div>
        <div class="dfpfMeta">${chap ? textEscape(chap) : ""}</div>
      </div>
    `;

    const cb = row.querySelector("input");
    const sel = row.querySelector("select");

    // Toggle selezione cliccando sulla riga (esclusi checkbox e menu)
    row.addEventListener("click", (ev) => {
      const t = ev.target;
      if(t && (t.closest("select") || t.closest("option") || t.closest("input[type=checkbox]"))) return;
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // Accessibilità: INVIO o SPAZIO sulla descrizione
    const descBtn = row.querySelector(".dfpfDescCell");
    if(descBtn){
      descBtn.addEventListener("keydown", (ev) => {
        if(ev.key === "Enter" || ev.key === " "){
          ev.preventDefault();
          cb.checked = !cb.checked;
          cb.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    }
cb.addEventListener("change", (e) => {
      ensureDfpfState();
      if(e.target.checked){
        if(state.icf.dfpf.selected[code] === undefined) state.icf.dfpf.selected[code] = 2;
      } else {
        delete state.icf.dfpf.selected[code];
      }
      renderDiagICF();
      renderAllSide();
    });

    sel.addEventListener("change", (e) => {
      ensureDfpfState();
      const v = Number(e.target.value);
      if(Number.isFinite(v)) state.icf.dfpf.selected[code] = Math.max(0, Math.min(4, Math.round(v)));
      renderAllSide();
    });

    listEl.appendChild(row);
  }

  const selCount = Object.keys(state.icf.dfpf.selected || {}).length;
  const extra = total > limit ? ` (usa la ricerca per raffinare)` : "";
  countEl.textContent = `Selezionati: ${selCount} • Mostrati: ${show.length} / ${total}${extra}`;
}


function createDefaultState(){
  return {
    rows: Object.fromEntries(
      DISABILITA.map(d => [d.id, { severity:null, comm:false, mot:false, cog:false, pluri:false }])
    ),
    needs: Object.fromEntries(NEEDS.map(n => [n.key, false])),
    icd: { codes: [] },
    docs: {
      accertamentoDate: "",
      scadenzaDate: "",
      pfRedattoDate: "",
      dfDate: "",
      pdfDate: "",
      progettoIndDate: ""
    },
    icf: {
      objectives: Object.fromEntries(ICF_OBJECTIVES.map(it => [it.key, false])),
      customObjectives: "",
      facilitators: Object.fromEntries(ICF_FACILITATORS.map(it => [it.key, false])),
      barriers: Object.fromEntries(ICF_BARRIERS.map(it => [it.key, false])),
      overrides: {
        facilitators: Object.fromEntries(ICF_FACILITATORS.map(it => [it.key, false])),
        barriers: Object.fromEntries(ICF_BARRIERS.map(it => [it.key, false]))
      },
      resources: Object.fromEntries(RESOURCES.map(r => [r.key, r.key === "curricolari" ? true : false])),
      preset: Object.fromEntries(ICF_SECTIONS.map(sec => [sec.id, { on:false, snapshot:null }])),
      smartGoals: [],
      monitor: {
        frequency: "settimanale",
        reviewEvery: "6-8 settimane",
        midDate: "",
        annualDate: "",
        tools: Object.fromEntries(VERIFY_TOOLS.map(t => [t.key, false]))
      },
      dfpf: { selected: {} }
    },

    plan: {
      methods: Object.fromEntries(METHODS_CATALOG.map(m => [m.key, false])),
      overrides: { methods: Object.fromEntries(METHODS_CATALOG.map(m => [m.key, false])) },
      customMethods: ""
    },

    familyCtx: {
      crit: Object.fromEntries(FAMILY_CRIT.map(it => [it.key, false])),
      pos: Object.fromEntries(FAMILY_POS.map(it => [it.key, false])),
      siblings: "",
      note: ""
    },
    schoolCtx: {
      classLabel: "",
      total: "",
      male: "",
      female: "",
      ada: "",
      dsa: "",
      bes: "",
      ctx: Object.fromEntries(SCHOOL_CTX.map(it => [it.key, false])),
      note: ""
    },
    meta: { profileName:"", eta:"", ordine:"", famiglia:"", classe:"", storico:"", puntiForza:"" }
  };
}

let state = createDefaultState();

function computeProfileFlags(s){
  const flags = { comm:false, mot:false, cog:false, pluri:false };
  for(const d of DISABILITA){
    const r = s.rows[d.id];
    for(const k of Object.keys(flags)){
      if(r && r[k]) flags[k] = true;
    }
  }
  return flags;
}

/** =========================
 *  Trigger contesto → Fattori ambientali (e)
 *  - Non "diagnostica": usa ciò che l'utente spunta nelle checklist Famiglia/Scuola.
 *  - Applica in modo additivo e rispetta eventuali override manuali (checkbox toccate).
 *  ========================= */
function deriveEnvFromContext(s = state){
  const fac = [];
  const bar = [];

  const sch = (s.schoolCtx && s.schoolCtx.ctx) ? s.schoolCtx.ctx : {};
  const fam = (s.familyCtx && s.familyCtx.crit) ? s.familyCtx.crit : {};

  // Scuola
  if(sch.rumoreAffollamento){ bar.push("e250b"); fac.push("e250"); }
  if(sch.cambiFrequenti){ bar.push("e580b"); fac.push("e580"); }
  if(sch.classeMoltoEterogenea){ bar.push("e585b"); fac.push("e585"); }
  if(sch.spazioQuiete){ fac.push("e150"); fac.push("e250"); }
  if(sch.peerSupport){ fac.push("e325"); }
  if(sch.dotazioniDigitali){ fac.push("e115"); fac.push("e130"); }
  if(sch.spaziAccessibili){ fac.push("e150"); }

  // Famiglia
  if(fam.contattoDifficile){ bar.push("e310b"); fac.push("e310"); }
  if(fam.barriereLinguistiche){ bar.push("e410"); fac.push("e340c"); fac.push("e585"); }
  if(fam.caregiverSovraccarico){ bar.push("e310b"); }
  if(fam.assenzaGenitore){ bar.push("e310b"); }
  if(fam.separazioneConflitto){ bar.push("e410"); }
  if(fam.disagioPsicoSociale){ bar.push("e410"); }
  if(fam.fragilitaSocioEco){ bar.push("e115cB"); }
  if(fam.altraDisabilitaFam){ bar.push("e310b"); }
  if(fam.serviziCoinvolti){ fac.push("e580"); fac.push("e585"); }

  return { facilitators: uniq(fac), barriers: uniq(bar) };
}

function autoApplyEnvFromContext(s = state){
  if(!s || !s.icf) return;
  const env = deriveEnvFromContext(s);

  const oFac = (s.icf.overrides && s.icf.overrides.facilitators) ? s.icf.overrides.facilitators : {};
  const oBar = (s.icf.overrides && s.icf.overrides.barriers) ? s.icf.overrides.barriers : {};

  for(const k of env.facilitators){
    if(s.icf.facilitators && (k in s.icf.facilitators) && !oFac[k]) s.icf.facilitators[k] = true;
  }
  for(const k of env.barriers){
    if(s.icf.barriers && (k in s.icf.barriers) && !oBar[k]) s.icf.barriers[k] = true;
  }
}


function autoApplyHighImpactPresets(s = state){
  if(!s || !s.icf) return;
  ensureIcdState(s);
  ensureDfpfState(s);

  const oFac = (s.icf.overrides && s.icf.overrides.facilitators) ? s.icf.overrides.facilitators : {};
  const oBar = (s.icf.overrides && s.icf.overrides.barriers) ? s.icf.overrides.barriers : {};

  const icd = Array.isArray(s.icd.codes) ? s.icd.codes.map(c => String(c || "").trim().toUpperCase()) : [];
  const icdHasAny = (prefixes) => icd.some(code => prefixes.some(p => code.startsWith(p)));

  const dfpfSel = (s.icf.dfpf && s.icf.dfpf.selected && typeof s.icf.dfpf.selected === "object") ? s.icf.dfpf.selected : {};
  const q = (code) => {
    const v = Number(dfpfSel[code]);
    return Number.isFinite(v) ? v : null;
  };

  const rows = s.rows || {};
  const needs = s.needs || {};
  const pf = computeProfileFlags(s);

  const vistaSev = rows.vista ? rows.vista.severity : null;
  const uditoSev = rows.udito ? rows.udito.severity : null;
  const fisicaSev = rows.fisica ? rows.fisica.severity : null;

  const intSev = rows.intellettiva ? rows.intellettiva.severity : null;
  const autSev = rows.autismo ? rows.autismo.severity : null;
  const neuSev = rows.neurologica ? rows.neurologica.severity : null;
  const genSev = rows.genetiche ? rows.genetiche.severity : null;
  const acqSev = rows.acquisite ? rows.acquisite.severity : null;

  const applyFac = (keys) => {
    for(const k of keys){
      if(s.icf.facilitators && (k in s.icf.facilitators) && !oFac[k]) s.icf.facilitators[k] = true;
    }
  };
  const applyBar = (keys) => {
    for(const k of keys){
      if(s.icf.barriers && (k in s.icf.barriers) && !oBar[k]) s.icf.barriers[k] = true;
    }
  };

  // =========================
  //  Preset “alto impatto”
  // =========================

  // VISTA: ipovisione grave / cecità → materiali accessibili + ausili + ambiente
  const trigVistaHigh = (vistaSev === "grave" || vistaSev === "media" || icdHasAny(["H54"]) || (q("b210") !== null && q("b210") >= 3));
  if(trigVistaHigh){
    applyBar(["e130b","e115a","e150a"]);
    applyFac(["e115","e130","e150","e355","e585"]);
  }

  // UDITO: ipoacusia grave / sordità → controllo rumore + comunicazione accessibile + supporti
  const trigUditoHigh = (uditoSev === "grave" || uditoSev === "media" || icdHasAny(["H90","H91"]) || (q("b230") !== null && q("b230") >= 3));
  if(trigUditoHigh){
    applyBar(["e250b","e125b","e460b"]);
    applyFac(["e125","e250","e460","e340c","e580"]);
  }

  // MOTORIA: (da media a grave) → accessibilità fisica, ausili, tempi
  const trigMotSevere = (fisicaSev === "grave" || icdHasAny(["G82","G83"]) ||
    ((q("d450") !== null && q("d450") >= 3) || (q("d440") !== null && q("d440") >= 3)));
  const trigMotAny = (fisicaSev === "media" || trigMotSevere || pf.mot);
  if(trigMotAny){
    applyBar(["e150a","e115a","e580aB"]);
    applyFac(["e150","e115","e120","e340a","e580a"]);
  }

  // =========================
  //  Preset “profilo/area”
  //  (automatismi non-distruttivi: rispettano overrides)
  // =========================

  // INTELLETTIVA / COGNITIVA (frequente necessità di semplificazione, tempi, tecnologie)
  const trigInt = (
    !!intSev ||
    icdHasAny(["F70","F71","F72","F73","F78","F79"]) ||
    ((q("b117") !== null && q("b117") >= 3))
  );
  if(trigInt || pf.cog){
    applyBar(["e130b","e115cB","e585b","e450b2","e580aB"]);
    applyFac(["e130","e115c","e585c","e450c","e580c","e340a"]);
  }

  // AUTISMO (spesso: prevedibilità, gestione stimoli, supporto comunicativo/sociale)
  const trigAut = (!!autSev || icdHasAny(["F84"]));
  if(trigAut){
    applyBar(["e250b","e580b","e425","e455","e460b","e320"]);
    applyFac(["e150","e250","e460","e580","e325","e340","e355"]);
  }

  // NEUROLOGICA (variabile: sicurezza/tempi, raccordo sanitario, organizzazione)
  const trigNeu = (
    !!neuSev ||
    icdHasAny(["G40","G41","G80","G81"]) ||
    ((q("b730") !== null && q("b730") >= 3)) // debolezza muscolare (se presente)
  );
  if(trigNeu){
    applyBar(["e355a","e580b","e580aB","e115a"]);
    applyFac(["e150","e115","e120","e355","e580","e340a","e580a","e450c"]);
  }

  // GENETICHE / SINDROMICHE (spesso pluri-bisogno: rete, ausili, accessibilità)
  const trigGen = (
    !!genSev ||
    icdHasAny(["Q","P"])
  );
  if(trigGen || pf.pluri){
    applyBar(["e150a","e115a","e355a","e580aB","e585b"]);
    applyFac(["e150","e115","e120","e340a","e355","e580a","e585"]);
  }

  // ACQUISITE (esiti variabili: flessibilità, supporti, raccordo)
  const trigAcq = !!acqSev;
  if(trigAcq){
    applyBar(["e580b","e450b2","e355a"]);
    applyFac(["e150","e115","e120","e340a","e355","e580a"]);
    if(acqSev === "grave"){
      applyBar(["e150a","e115a","e580aB"]);
      applyFac(["e585"]);
    }
  }

  // =========================
  //  Preset “bisogni tipo DSA/ADHD”
  //  (non è una diagnosi: solo aggancio pragmatico a barriere/facilitatori tipici)
  // =========================

  const trigLearn = !!(needs.lettura || needs.scrittura || needs.calcolo || needs.memoria);
  if(trigLearn){
    applyBar(["e130b","e115cB","e585b","e450b2"]);
    applyFac(["e130","e115c","e585c","e450c","e580c"]);
  }

  if(needs.linguaggio || pf.comm){
    applyBar(["e125b","e460b"]);
    applyFac(["e125","e460","e340c","e580"]);
  }

  const trigRegolazione = !!(needs.attenzione || needs.ansia);
  if(trigRegolazione){
    applyBar(["e250b","e460b"]);
    applyFac(["e250","e450","e580","e585"]);
  }
  if(needs.comportamento){
    applyBar(["e425","e455","e460b"]);
    applyFac(["e450","e585","e580","e325"]);
  }
}

/** =========================
 *  Metodologie: suggerimenti automatici + selezione editabile
 *  - autoApplyMethods(): seleziona (non distruttivo) metodologie consigliate
 *  - overrides: se l'utente tocca una metodologia, non viene più ri-selezionata automaticamente
 * ========================= */
function ensurePlanState(s=state){
  if(!s.plan) s.plan = {};
  if(!s.plan.methods || typeof s.plan.methods !== "object") s.plan.methods = {};
  if(!s.plan.overrides || typeof s.plan.overrides !== "object") s.plan.overrides = {};
  if(!s.plan.overrides.methods || typeof s.plan.overrides.methods !== "object") s.plan.overrides.methods = {};
  for(const it of METHODS_CATALOG){
    if(!(it.key in s.plan.methods)) s.plan.methods[it.key] = false;
    if(!(it.key in s.plan.overrides.methods)) s.plan.overrides.methods[it.key] = false;
  }
  if(typeof s.plan.customMethods !== "string") s.plan.customMethods = "";
}

function deriveMethodsFromProfile(s=state){
  ensurePlanState(s);
  const rec = [];
  const add = (k) => { if(METHODS_MAP.has(k)) rec.push(k); };

  // base (sempre utili, ma comunque disattivabili)
  add("udl");
  add("taskAnalysis");
  add("scaffoldingGradualita");
  add("routineAgenda");

  const rows = s.rows || {};
  const has = (id) => !!(rows[id] && rows[id].severity);
  const sev = (id) => rows[id] ? rows[id].severity : null;
  const icdCodes = (s.icd?.codes || []).map(c => (typeof c === "string") ? c : (c.code || "")).filter(Boolean);
  const icdHas = (prefix) => icdCodes.some(c => c.startsWith(prefix));
  const hasVista = has("vista") || icdHas("H54"); // cecità/ipovisione
  const hasUdito = has("udito") || icdHas("H90") || icdHas("H91"); // ipoacusia/sordità


  // bisogni
  const needs = s.needs || {};
  if(needs.attenzione) add("selfMonitoring");
  if(needs.memoria) { add("metacognizione"); add("spacedPractice"); }
  if(needs.ansia) add("valutazioneBassaAnsia");
  if(needs.linguaggio) { add("preteachingLessico"); add("caa"); }
  if(needs.comportamento) { add("pbs"); add("abc"); add("tokenEconomy"); }

  // profilo / categorie
  if(has("intellettiva") || has("genetiche")){
    add("istruzioneEsplicita");
    add("modelingThinkAloud");
    add("didatticaLaboratoriale");
    add("peerTutoring");
    add("cooperativeLearning");
    add("valutazioneFormativa");
  }

  if(has("dsa")){
    add("accessibilitaMateriali");
    add("metacognizione");
    add("valutazioneFormativa");
    add("spacedPractice");
    add("preteachingLessico");
  }

  if(has("autismo")){
    add("teacch");
    add("videoModeling");
    add("socialStories");
    add("pbs");
    add("tokenEconomy");
    add("cooperativeLearning");
    add("accessibilitaMateriali");
    // CAA spesso utile se difficoltà comunicative marcate o severità non lieve
    const sAut = sev("autismo");
    if(needs.linguaggio || sAut === "media" || sAut === "grave") add("caa");
  }

  
if(hasVista){
  add("vistaDescrizioneVerbale");
  add("vistaMaterialiTattili");
  add("vistaECC");
  add("vistaTecnologieAssistive");
  const sv = sev("vista");
  if(sv==="grave"){
    add("vistaOrientamentoMobilita");
    add("vistaBrailleAlfabetizzazione");
  } else if(sv==="media"){
    add("vistaOrientamentoMobilita");
  }
}

  
if(hasUdito){
  add("uditoComunicazioneAccessibile");
  add("uditoSupportiVisiviSottotitoli");
  add("uditoGestioneAcusticaTurni");
  add("uditoSupportoAppunti");
  const su = sev("udito");
  if(su==="media" || su==="grave") add("uditoApproccioBilingueLIS");
  if(su==="grave") add("uditoCuedSpeech");
}

  if(has("fisica")){
    add("cooperativeRoles");
    add("didatticaLaboratoriale");
    add("flippedClassroom");
  }

  if(has("neurologica") || has("acquisite")){
    add("pacingPause");
    add("metacognizione");
    add("valutazioneBassaAnsia");
  }

  // ICF DFPF (se presenti)
  const dfpf = (s.icf && s.icf.dfpf && s.icf.dfpf.selected) ? s.icf.dfpf.selected : {};
  const q = (code) => {
    const v = dfpf[code];
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  if((q("b210") ?? 0) >= 3) add("accessibilitaMateriali"); // funzioni visive
  if((q("b230") ?? 0) >= 3) add("accessibilitaMateriali"); // funzioni uditive
  if(Math.max(q("d450")||0, q("d455")||0, q("d460")||0) >= 3) add("cooperativeRoles");

  // Obiettivi ICF selezionati: se compaiono aree linguaggio/comunicazione, rafforza pre-teaching/supporti
  const objSel = (s.icf && s.icf.objectives) ? s.icf.objectives : {};
  const objCodes = ICF_OBJECTIVES.filter(it => objSel[it.key]).map(it => it.code);
  if(objCodes.some(c => ["b167","d310","d330","d350","d360"].includes(c))) add("preteachingLessico");

  return uniq(rec);
}

function autoApplyMethods(s=state){
  ensurePlanState(s);
  const recKeys = deriveMethodsFromProfile(s);
  for(const k of recKeys){
    if(k in s.plan.methods){
      if(!s.plan.overrides.methods[k]) s.plan.methods[k] = true;
    }
  }
}

function renderMethods(){
  const mount = document.getElementById("methodsList");
  const countEl = document.getElementById("methodsCount");
  const searchEl = document.getElementById("methodsSearch");
  const addSel = document.getElementById("methodsAddSelect");
  const customTa = document.getElementById("methodsCustom");
  if(!mount || !countEl || !searchEl || !addSel || !customTa) return;

  ensurePlanState(state);

  // sync textarea solo se non è in focus (evita fastidi durante digitazione)
  if(document.activeElement !== customTa) customTa.value = state.plan.customMethods || "";

  const q = (searchEl.value || "").trim().toLowerCase();
  const recommended = new Set(deriveMethodsFromProfile(state));

  // lista filtrata
  const items = METHODS_CATALOG
    .filter(it => !q || (it.label.toLowerCase().includes(q) || (it.out||"").toLowerCase().includes(q)))
    .slice()
    .sort((a,b) => {
      const selA = state.plan.methods[a.key] ? 1 : 0;
      const selB = state.plan.methods[b.key] ? 1 : 0;
      if(selA !== selB) return selB - selA;
      const recA = recommended.has(a.key) ? 1 : 0;
      const recB = recommended.has(b.key) ? 1 : 0;
      if(recA !== recB) return recB - recA;
      return a.label.localeCompare(b.label, "it", { sensitivity:"base" });
    });

  mount.innerHTML = "";
  for(const it of items){
    const lab = document.createElement("label");
    lab.className = "toggle";
    lab.style.alignItems = "flex-start";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!state.plan.methods[it.key];
    cb.addEventListener("change", () => {
      ensurePlanState(state);
      state.plan.methods[it.key] = cb.checked;
      state.plan.overrides.methods[it.key] = true; // l'utente l'ha toccata
      renderAllSideNoSmart();
    });

    const box = document.createElement("div");
    box.style.display = "flex";
    box.style.flexDirection = "column";
    box.style.gap = "3px";
    box.style.flex = "1";

    const top = document.createElement("div");
    top.style.display = "flex";
    top.style.alignItems = "center";
    top.style.gap = "8px";
    top.style.flexWrap = "wrap";

    const title = document.createElement("span");
    title.textContent = it.label;
    title.style.fontWeight = "800";
    top.appendChild(title);

    if(recommended.has(it.key)){
      const pill = document.createElement("span");
      pill.className = "pill ok";
      pill.textContent = "auto";
      top.appendChild(pill);
    }
    if(state.plan.overrides.methods[it.key]){
      const pill2 = document.createElement("span");
      pill2.className = "pill warn";
      pill2.textContent = "override";
      top.appendChild(pill2);
    }

    const desc = document.createElement("div");
    desc.className = "muted";
    desc.style.fontSize = "11.5px";
    desc.style.lineHeight = "1.25";
    desc.textContent = it.out || "";

    box.appendChild(top);
    if(it.out) box.appendChild(desc);

    lab.appendChild(cb);
    lab.appendChild(box);
    mount.appendChild(lab);
  }

  const selectedCount = Object.values(state.plan.methods).filter(Boolean).length;
  countEl.textContent = `${selectedCount} selezionate • ${items.length} visibili`;

  // dropdown "aggiungi"
  const groups = {};
  for(const it of METHODS_CATALOG){
    if(state.plan.methods[it.key]) continue; // già selezionata
    groups[it.group || "Altro"] = groups[it.group || "Altro"] || [];
    groups[it.group || "Altro"].push(it);
  }
  addSel.innerHTML = "";
  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = "+ Aggiungi metodologia...";
  addSel.appendChild(opt0);

  Object.keys(groups).sort((a,b)=>a.localeCompare(b,"it",{sensitivity:"base"})).forEach(g=>{
    const og = document.createElement("optgroup");
    og.label = g;
    groups[g].sort((a,b)=>a.label.localeCompare(b.label,"it",{sensitivity:"base"})).forEach(it=>{
      const opt = document.createElement("option");
      opt.value = it.key;
      opt.textContent = it.label;
      og.appendChild(opt);
    });
    addSel.appendChild(og);
  });
}

function bindMethods(){
  const searchEl = document.getElementById("methodsSearch");
  const addSel = document.getElementById("methodsAddSelect");
  const btnAdd = document.getElementById("btnMethodAdd");
  const btnClear = document.getElementById("btnMethodsClear");
  const btnAuto = document.getElementById("btnMethodsAuto");
  const customTa = document.getElementById("methodsCustom");
  if(!searchEl || !addSel || !btnAdd || !btnClear || !btnAuto || !customTa) return;

  searchEl.addEventListener("input", () => renderMethods());

  btnAdd.addEventListener("click", () => {
    ensurePlanState(state);
    const k = addSel.value;
    if(k && (k in state.plan.methods)){
      state.plan.methods[k] = true;
      state.plan.overrides.methods[k] = true;
      addSel.value = "";
      renderAllSideNoSmart();
    }
  });

  btnClear.addEventListener("click", () => {
    ensurePlanState(state);
    for(const k in state.plan.methods){
      state.plan.methods[k] = false;
      state.plan.overrides.methods[k] = true; // evita riattivazioni automatiche
    }
    state.plan.customMethods = "";
    customTa.value = "";
    renderAllSideNoSmart();
  });

  btnAuto.addEventListener("click", () => {
    ensurePlanState(state);
    for(const k in state.plan.overrides.methods){
      state.plan.overrides.methods[k] = false;
    }
    renderAllSideNoSmart();
  });

  customTa.addEventListener("input", (e) => {
    ensurePlanState(state);
    state.plan.customMethods = e.target.value || "";
    renderOutput();
  });
}




function uniq(arr){
  return Array.from(new Set(arr)).filter(Boolean);
}

function getRecommendedForSection(sectionId, s = state){
  const flags = computeProfileFlags(s);
  const needs = s.needs || {};
  const eta = Number((s.meta && s.meta.eta) || 0);
  const rows = s.rows || {};

  // DF/PF ICF (qualificatori) – usa i codici con qualificatore >=2 per suggerire obiettivi pertinenti
  const dfpfSel = (s.icf && s.icf.dfpf && s.icf.dfpf.selected && typeof s.icf.dfpf.selected === "object")
    ? s.icf.dfpf.selected
    : {};
  const qDfpf = (code) => {
    const v = Number(dfpfSel[code]);
    return Number.isFinite(v) ? v : null;
  };

  const rec = { objectives: [], facilitators: [], barriers: [] };
  const addObj = (key) => { if(s.icf && s.icf.objectives && (key in s.icf.objectives)) rec.objectives.push(key); };
  const addFac = (key) => { if(s.icf && s.icf.facilitators && (key in s.icf.facilitators)) rec.facilitators.push(key); };
  const addBar = (key) => { if(s.icf && s.icf.barriers && (key in s.icf.barriers)) rec.barriers.push(key); };

  const lvl = (id) => {
    const sev = rows[id] && rows[id].severity;
    if(sev === "lieve") return 1;
    if(sev === "media") return 2;
    if(sev === "grave") return 3;
    return 0;
  };

  const maxLvl = (...ids) => Math.max(0, ...ids.map(id => lvl(id)));

  switch(sectionId){
    case "S1":{
      addObj("d710");
      addObj("d820");
      addObj("d750");
      addFac("e450");
      break;
    }
    case "S2":{
      addObj("d310");
      addObj("d350");
      addObj("d360");
      addFac("e460");
      addFac("e580");
      break;
    }
    case "S3":{
      addObj("d230");
      addObj("b164a");
      addFac("e580a");
      break;
    }
    case "S4":{
      addObj("b140");
      addObj("d160");
      addObj("b144");
      addObj("b164");
      addFac("e450c");
      addFac("e580c");
      break;
    }
}

  // aggiunta automatica da DF/PF: se un codice della sezione ha qualificatore >= 2 (moderato+), proporlo tra gli obiettivi
  const sec = ICF_SECTIONS.find(x => x.id === sectionId);
  if(sec){
    for(const o of sec.objectives){
      const q = qDfpf(o.code);
      if(q !== null && q >= 2) addObj(o.key);
    }
  }


if(sectionId === "S4"){
    if(needs.attenzione) addObj("d820c");
    if(needs.memoria) addObj("d155");
    if(needs.lettura) addObj("d166");
    if(needs.scrittura) addObj("d170");
    if(needs.calcolo) addObj("d172");
    if(needs.attenzione || needs.memoria || needs.lettura || needs.scrittura || needs.calcolo){
      addFac("e130");
      addFac("e115c");
      addFac("e585c");
    }
  }
  if(sectionId === "S2" && (needs.linguaggio || flags.comm)){
    addObj("b167");
    addObj("d330");
    addObj("d315");
    addFac("e125");
    addFac("e250");
  }
  if(sectionId === "S1" && (needs.comportamento || needs.ansia)){
    addObj("d240");
    addObj("b152");
    addFac("e585");
  }

  if(sectionId === "S2" && flags.comm){
    addObj("d315");
    addObj("d320");
    addObj("d175");
    addFac("e125");
  }
  if(sectionId === "S3" && flags.mot){
    addObj("d450");
    addObj("d460");
    addObj("d440");
    addObj("d570");
    addFac("e150");
    addFac("e115");
    addFac("e120");
    addFac("e340a");
  }
  if(sectionId === "S4" && flags.cog){
    addObj("d155");
    addObj("d210");
    addObj("d220c");
    addObj("d175c");
    addObj("d240c");
    addFac("e130");
    addFac("e115c");
    addFac("e585c");
  }
  if(flags.pluri){
    if(sectionId === "S1") addObj("d740");
    if(sectionId === "S2") addObj("d335");
    if(sectionId === "S3") addObj("d510");
    if(sectionId === "S4") addObj("d240c");
    addFac("e355");
    addFac("e340");
  }

  const L_int = lvl("intellettiva");
  const L_asd = lvl("autismo");
  const L_fis = lvl("fisica");
  const L_vis = lvl("vista");
  const L_udi = lvl("udito");
  const L_neu = lvl("neurologica");
  const L_gen = lvl("genetiche");
  const L_acq = lvl("acquisite");

  if(L_vis){
    if(sectionId === "S4"){
      addObj("d166");
      if(L_vis >= 2){ addObj("b156"); addObj("d160"); }
      addFac("e130"); addFac("e115c");
    }
    if(sectionId === "S2"){
      addObj("d320"); addObj("d172c");
      if(L_vis >= 2) addObj("d360");
      addFac("e125");
    }
    if(sectionId === "S3"){
      if(L_vis >= 2){ addObj("d450"); addObj("d460"); }
      addFac("e150");
    }
  }
  if(L_fis && sectionId === "S3"){
    if(L_fis >= 1){ addObj("d440"); addObj("d450"); }
    if(L_fis >= 2){ addObj("d460"); addObj("d570"); }
    if(L_fis >= 3){ addObj("d510"); addObj("d230"); }
    addFac("e150"); addFac("e115"); addFac("e120"); addFac("e340a"); addFac("e580a");
  }
  if(L_udi && sectionId === "S2"){
    addObj("d310"); addObj("d330"); addObj("d350");
    if(L_udi >= 2) addObj("d315");
    addObj("d360");
    addFac("e250"); addFac("e580"); addFac("e125");
  }
  if(sectionId === "S2"){
    if(L_udi || (s.meta && s.meta.classe === "critico")) addFac("e250");
    if(maxLvl("autismo","intellettiva","genetiche","neurologica") >= 3 || flags.pluri) addObj("d335");
  }

  if(sectionId === "S1"){
    if(eta && eta >= 12) addObj("d177");
    if((s.meta && (s.meta.classe === "critico" || s.meta.classe === "complesso")) || needs.comportamento){
      addObj("d720");
      addFac("e585");
    }
    const multi = [L_int,L_asd,L_fis,L_vis,L_udi,L_neu,L_gen,L_acq].filter(x=>x>0).length >= 2;
    if(multi){ addObj("d760"); addFac("e310"); addFac("e355"); }
  }

  const env = deriveEnvFromContext(s);
  env.facilitators.forEach(k => addFac(k));
  env.barriers.forEach(k => addBar(k));

  rec.objectives = uniq(rec.objectives);
  rec.facilitators = uniq(rec.facilitators);
  rec.barriers = uniq(rec.barriers);
  return rec;
}

function applyRecommendedSection(sectionId, s = state){
  const rec = getRecommendedForSection(sectionId, s);
  rec.objectives.forEach(k => { s.icf.objectives[k] = true; });
  rec.facilitators.forEach(k => { s.icf.facilitators[k] = true; });
  rec.barriers.forEach(k => { s.icf.barriers[k] = true; });
}

function toggleRecommendedSection(sectionId){
  if(!state.icf.preset) state.icf.preset = Object.fromEntries(ICF_SECTIONS.map(sec => [sec.id, { on:false, snapshot:null }]));
  const p = state.icf.preset[sectionId] || (state.icf.preset[sectionId] = { on:false, snapshot:null });

  if(p.on){
    const snap = p.snapshot || { obj:{}, fac:{}, bar:{} };
    for(const k of Object.keys(snap.obj || {})) state.icf.objectives[k] = !!snap.obj[k];
    for(const k of Object.keys(snap.fac || {})) state.icf.facilitators[k] = !!snap.fac[k];
    for(const k of Object.keys(snap.bar || {})) state.icf.barriers[k] = !!snap.bar[k];
    p.on = false;
    p.snapshot = null;
    return { on:false };
  }

  const rec = getRecommendedForSection(sectionId, state);
  const snapshot = { obj:{}, fac:{}, bar:{} };

  rec.objectives.forEach(k => {
    snapshot.obj[k] = !!state.icf.objectives[k];
    state.icf.objectives[k] = true;
  });

  rec.facilitators.forEach(k => {
    snapshot.fac[k] = !!state.icf.facilitators[k];
    state.icf.facilitators[k] = true;
  });
  rec.barriers.forEach(k => {
    snapshot.bar[k] = !!state.icf.barriers[k];
    state.icf.barriers[k] = true;
  });

  p.on = true;
  p.snapshot = snapshot;
  return { on:true };
}

function flagBadge(val){
  if(val === -1) return `<span class="badge bad" title="Non applicabile">✖</span>`;
  if(val === 0) return `<span class="badge" title="Non tipico">—</span>`;
  if(val === 1) return `<span class="badge warn" title="Possibile">poss.</span>`;
  if(val === 2) return `<span class="badge ok" title="Frequente/centrale">✔</span>`;
  if(val === 3) return `<span class="badge ok" title="Molto frequente/centrale">✔✔</span>`;
  return `<span class="badge">—</span>`;
}

function severityBadgeKey(key){
  if(key === "lieve") return "L";
  if(key === "media") return "M";
  if(key === "grave") return "G";
  return "?";
}

function textEscape(s){
  return (s || "").replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
}


function fmtDate(iso){
  if(!iso) return "";
  // Expect YYYY-MM-DD
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(String(iso).trim());
  if(!m) return String(iso);
  const y=m[1], mo=m[2], d=m[3];
  return `${d}/${mo}/${y}`;
}


function kLabel(k){
  return ({comm:"compromissione comunicativa", mot:"compromissione motoria", cog:"compromissione cognitiva", pluri:"pluridisabilità"})[k] || k;
}

function famigliaLabel(v){
  const map = {
    "":"—",
    "stabile":"Stabile e collaborativa",
    "fragile":"Fragilità / stress",
    "conflittuale":"Conflittuale / comunicazione difficile",
    "assente":"Poco presente / contatto difficile",
    "tutela":"Servizi / tutela / affidamento"
  };
  return map[v] || "—";
}

function classeLabel(v){
  const map = {
    "":"—",
    "favorevole":"Clima favorevole",
    "neutro":"Neutro / ordinario",
    "critico":"Criticità relazionali / ambientali",
    "complesso":"Classe complessa"
  };
  return map[v] || "—";
}

function listHtml(items){
  if(!items || items.length === 0) return "";
  return `<ul>${items.map(it => `<li>${textEscape(it)}</li>`).join("")}</ul>`;
}

function listHtmlUnsafe(items){
  if(!items || items.length === 0) return "";
  return `<ul>${items.map(it => `<li>${it}</li>`).join("")}</ul>`;
}

function splitToBullets(text){
  const t = (text || "").trim();
  if(!t) return [];
  const parts = t.split(/\n+/).map(x => x.trim()).filter(Boolean);
  if(parts.length <= 1) return [t];
  return parts;
}

function htmlToPlainText(html){
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.innerText || "").replace(/\n{3,}/g, "\n\n").trim();
}

function htmlJoin(arr){
  return (arr || []).join("\n");
}

function renderTable(){
  const mount = document.getElementById("tableMount");
  let html = `<table><thead><tr>`;
  html += `<th>DISABILITÀ</th>`;
  for(const c of COLS){ html += `<th>${textEscape(c.label)}</th>`; }
  html += `</tr></thead><tbody>`;

  for(const d of DISABILITA){
    const row = state.rows[d.id];
    html += `<tr>`;
    html += `<td>${textEscape(d.label)}</td>`;

    for(const sevKey of ["lieve","media","grave"]){
      const pressed = row.severity === sevKey;
      const label = d.severity[sevKey];
      html += `<td>
        <div class="cell">
          <button class="btn" type="button"
            data-kind="severity" data-id="${d.id}" data-key="${sevKey}"
            aria-pressed="${pressed}">
            <span class="badge">${severityBadgeKey(sevKey)}</span>
            <span>${textEscape(label)}</span>
          </button>
        </div>
      </td>`;
    }

    for(const fKey of ["comm","mot","cog","pluri"]){
      const val = (d.flags[fKey] !== undefined && d.flags[fKey] !== null) ? d.flags[fKey] : 0;
      const disabled = (val === -1);
      const pressed = row[fKey] === true;
      const labelMap = { comm:"Comunicativa", mot:"Motoria", cog:"Cognitiva", pluri:"Pluridisabilità" };
      html += `<td>
        <div class="cell">
          <button class="btn ${disabled ? "disabled" : ""}" type="button"
            data-kind="flag" data-id="${d.id}" data-key="${fKey}" ${disabled ? "disabled" : ""}
            aria-pressed="${pressed}">
            ${flagBadge(val)}
            <span>${labelMap[fKey]}</span>
          </button>
        </div>
      </td>`;
    }

    html += `</tr>`;
  }

  html += `</tbody></table>`;
  mount.innerHTML = html;

  mount.querySelectorAll("button[data-kind]").forEach(btn => {
    btn.addEventListener("click", () => {
      const kind = btn.dataset.kind;
      const id = btn.dataset.id;
      const key = btn.dataset.key;
      if(kind === "severity"){
        state.rows[id].severity = (state.rows[id].severity === key) ? null : key;
      } else if(kind === "flag"){
        state.rows[id][key] = !state.rows[id][key];
      }
      renderAllSide();
      renderICF();
      renderTable();
    });
  });
}

function renderNeeds(){
  const mount = document.getElementById("needsMount");
  mount.innerHTML = "";
  NEEDS.forEach(n => {
    const wrap = document.createElement("label");
    wrap.className = "toggle";
    wrap.innerHTML = `<input type="checkbox" ${state.needs[n.key] ? "checked" : ""} />
                      <span>${textEscape(n.label)}</span>`;
    wrap.querySelector("input").addEventListener("change", (e) => {
      state.needs[n.key] = e.target.checked;
      renderAllSide();
    });
    mount.appendChild(wrap);
  });
}

function renderFamilyCtx(){
  const critMount = document.getElementById("famCritMount");
  const posMount = document.getElementById("famPosMount");
  if(!critMount || !posMount) return;

  critMount.innerHTML = "";
  posMount.innerHTML = "";

  const add = (mount, item, bucket) => {
    const wrap = document.createElement("label");
    wrap.className = "toggle";
    wrap.innerHTML = `<input type="checkbox" ${bucket[item.key] ? "checked" : ""} /> <span>${textEscape(item.label)}</span>`;
    wrap.querySelector("input").addEventListener("change", (e)=>{ bucket[item.key] = e.target.checked; renderAllSide(); renderICF(); });
    mount.appendChild(wrap);
  };

  FAMILY_CRIT.forEach(it => add(critMount, it, state.familyCtx.crit));
  FAMILY_POS.forEach(it => add(posMount, it, state.familyCtx.pos));
}

function renderSchoolCtx(){
  const mount = document.getElementById("schCtxMount");
  if(!mount) return;
  mount.innerHTML = "";

  SCHOOL_CTX.forEach(it => {
    const wrap = document.createElement("label");
    wrap.className = "toggle";
    wrap.innerHTML = `<input type="checkbox" ${state.schoolCtx.ctx[it.key] ? "checked" : ""} /> <span>${textEscape(it.label)}</span>`;
    wrap.querySelector("input").addEventListener("change", (e)=>{ state.schoolCtx.ctx[it.key] = e.target.checked; renderAllSide(); renderICF(); });
    mount.appendChild(wrap);
  });
}


function renderICF(){
  const search = (document.getElementById("icfSearch").value || "").trim().toLowerCase();

  const mount = document.getElementById("icfObjectivesMount");
  mount.innerHTML = "";

  ICF_SECTIONS.forEach(section => {
    const gWrap = document.createElement("div");
    gWrap.style.marginBottom = "12px";

    const head = document.createElement("div");
    head.style.display = "flex";
    head.style.justifyContent = "space-between";
    head.style.alignItems = "center";
    head.style.gap = "10px";
    head.style.margin = "6px 0 8px";

    const left = document.createElement("div");
    left.className = "note";
    left.innerHTML = `<b>${textEscape(section.title)}</b> <span class="muted">– ${textEscape(section.subtitle)}</span>`;

    const btn = document.createElement("button");
    btn.className = "btn";
    btn.type = "button";

    const isOn = !!(state.icf.preset && state.icf.preset[section.id] && state.icf.preset[section.id].on);
    btn.setAttribute("aria-pressed", isOn ? "true" : "false");
    btn.textContent = isOn ? "↩︎ Rimuovi preset" : "✨ Preset consigliati";

    btn.addEventListener("click", () => {
      const r = toggleRecommendedSection(section.id);
      renderICF();
      renderAllSide();
      toast((r.on ? "Preset attivati: " : "Preset rimossi: ") + section.title);
    });

    head.appendChild(left);
    head.appendChild(btn);
    gWrap.appendChild(head);

    const box = document.createElement("div");
    box.className = "smallRow";

    section.objectives.forEach(it => {
      const hay = `${it.code} ${it.label} ${section.title} ${section.subtitle}`.toLowerCase();
      if(search && !hay.includes(search)) return;

      const wrap = document.createElement("label");
      wrap.className = "toggle";
      wrap.style.flex = "1 1 300px";
      wrap.innerHTML = `<input type="checkbox" ${state.icf.objectives[it.key] ? "checked" : ""} />
                        <span><b>${textEscape(it.code)}</b> ${textEscape(it.label)}</span>`;
      wrap.querySelector("input").addEventListener("change", (e) => {
        state.icf.objectives[it.key] = e.target.checked;
        renderAllSide();
      });
      box.appendChild(wrap);
    });

    gWrap.appendChild(box);
    mount.appendChild(gWrap);
  });

  const facMount = document.getElementById("icfFacMount");
  facMount.innerHTML = "";

  ICF_SECTIONS.forEach(section => {
    const head = document.createElement("div");
    head.className = "note";
    head.style.margin = "10px 0 6px";
    head.innerHTML = `<b>${textEscape(section.title)}</b>`;
    facMount.appendChild(head);

    section.facilitators.forEach(it => {
      const wrap = document.createElement("label");
      wrap.className = "toggle";
      wrap.innerHTML = `<input type="checkbox" ${state.icf.facilitators[it.key] ? "checked" : ""} />
                        <span><b>${textEscape(it.code)}</b> ${textEscape(it.label)}</span>`;
      wrap.querySelector("input").addEventListener("change", (e) => {
        state.icf.facilitators[it.key] = e.target.checked;
        if(state.icf.overrides && state.icf.overrides.facilitators) state.icf.overrides.facilitators[it.key] = true;
        renderAllSide();
      });
      facMount.appendChild(wrap);
    });
  });

  const barMount = document.getElementById("icfBarMount");
  barMount.innerHTML = "";

  ICF_SECTIONS.forEach(section => {
    const head = document.createElement("div");
    head.className = "note";
    head.style.margin = "10px 0 6px";
    head.innerHTML = `<b>${textEscape(section.title)}</b>`;
    barMount.appendChild(head);

    section.barriers.forEach(it => {
      const wrap = document.createElement("label");
      wrap.className = "toggle";
      wrap.innerHTML = `<input type="checkbox" ${state.icf.barriers[it.key] ? "checked" : ""} />
                        <span><b>${textEscape(it.code)}</b> ${textEscape(it.label)}</span>`;
      wrap.querySelector("input").addEventListener("change", (e) => {
        state.icf.barriers[it.key] = e.target.checked;
        if(state.icf.overrides && state.icf.overrides.barriers) state.icf.overrides.barriers[it.key] = true;
        renderAllSide();
      });
      barMount.appendChild(wrap);
    });
  });

  const rMount = document.getElementById("resourcesMount");
  rMount.innerHTML = "";
  RESOURCES.forEach(r => {
    const wrap = document.createElement("label");
    wrap.className = "toggle";
    wrap.innerHTML = `<input type="checkbox" ${state.icf.resources[r.key] ? "checked" : ""} />
                      <span>${textEscape(r.label)}</span>`;
    wrap.querySelector("input").addEventListener("change", (e) => {
      state.icf.resources[r.key] = e.target.checked;
      renderAllSide();
    });
    rMount.appendChild(wrap);
  });
}


/** =========================
 *  SMART – gestione UI e sincronizzazione
 *  ========================= */
function getSmartSources(){
  const sources = [];
  // ICF selezionati (limitati: max 1 obiettivo SMART generato automaticamente per ciascuna area di funzionamento)
  // Se l'utente desidera più SMART nella stessa area, può aggiungerli manualmente ("Aggiungi").
  for(const sec of ICF_SECTIONS){
    const firstSelected = (sec.objectives || []).find(it => state.icf.objectives[it.key]);
    if(firstSelected){
      sources.push({ sourceType:"icf", sourceKey: firstSelected.key, code: firstSelected.code, label: firstSelected.label, icfArea: sec.id });
    }
  }
  // Obiettivi custom (campo libero): una riga = un obiettivo
  const custom = getCustomObjectivesList();
  for(const txt of custom){
    sources.push({ sourceType:"custom", sourceKey: "custom_" + hashStr(txt), code:"", label: txt });
  }
  return sources;
}

function findSmartGoal(sourceType, sourceKey){
  return (state.icf.smartGoals || []).find(g => g.sourceType === sourceType && g.sourceKey === sourceKey);
}

function makeSmartGoalFromSource(src){
  const code = src.code || "";
  const label = src.label || "";
  const verb = defaultVerbForICF(code, label);
  return {
    id: uid("g"),
    sourceType: src.sourceType,
    sourceKey: src.sourceKey,
    code,
    label,
    verb,
    behavior: label,
    conditions: "Durante attività strutturate in classe (con consegne chiare e supporti necessari).",
    criterion: defaultCriterionForICF(code),
    timeframe: "entro 8 settimane",
    verifyTool: "griglia",
    responsible: "Team docenti",
    notes: ""
  };
}

function syncSmartGoalsFromSelections(){
  if(!state.icf.smartGoals) state.icf.smartGoals = [];
  const sources = getSmartSources();
  let added = 0;
  for(const src of sources){
    const existing = findSmartGoal(src.sourceType, src.sourceKey);
    if(!existing){
      state.icf.smartGoals.push(makeSmartGoalFromSource(src));
      added++;
    } else {
      // aggiorna code/label se cambiati (senza toccare i campi SMART)
      existing.code = src.code || existing.code || "";
      existing.label = src.label || existing.label || "";
      if(!existing.behavior) existing.behavior = existing.label;
    }
  }
  return added;
}

function addFreeSmartGoal(){
  if(!state.icf.smartGoals) state.icf.smartGoals = [];
  state.icf.smartGoals.push({
    id: uid("g"),
    sourceType: "free",
    sourceKey: "",
    code: "",
    label: "Obiettivo libero",
    verb: "eseguire",
    behavior: "",
    conditions: "",
    criterion: "",
    timeframe: "entro 8 settimane",
    verifyTool: "griglia",
    responsible: "Team docenti",
    notes: ""
  });
}

function isGoalActive(g){
  if(!g) return false;
  if(g.sourceType === "free") return true;
  if(g.sourceType === "icf"){
    if(!state.icf.objectives[g.sourceKey]) return false;
    // Attivo solo se è il "primario" della sua area ICF (max 1 per area)
    const secId = ICF_OBJECTIVE_AREA_MAP[g.sourceKey] || "";
    if(!secId) return true; // fallback: se non sappiamo l'area, non penalizziamo
    const primary = (ICF_SECTIONS.find(s => s.id === secId)?.objectives || []).find(it => state.icf.objectives[it.key]);
    return primary ? (primary.key === g.sourceKey) : true;
  }
  if(g.sourceType === "custom"){
    const custom = getCustomObjectivesList();
    return custom.includes(g.label);
  }
  return true;
}

function renderMonitorTools(){
  const mount = document.getElementById("monToolsMount");
  if(!mount) return;
  mount.innerHTML = "";
  if(!state.icf.monitor) state.icf.monitor = { tools: {} };
  if(!state.icf.monitor.tools) state.icf.monitor.tools = {};

  VERIFY_TOOLS.forEach(t => {
    const wrap = document.createElement("label");
    wrap.className = "toggle";
    wrap.innerHTML = `<input type="checkbox" ${state.icf.monitor.tools[t.key] ? "checked" : ""} />
                      <span>${textEscape(t.label)}</span>`;
    wrap.querySelector("input").addEventListener("change", (e) => {
      state.icf.monitor.tools[t.key] = e.target.checked;
      renderAllSide();
    });
    mount.appendChild(wrap);
  });
}

function hydrateMonitorUI(){
  const mon = state.icf.monitor || {};
  const f = document.getElementById("monFreq");
  const r = document.getElementById("monReview");
  const mid = document.getElementById("monMidDate");
  const ann = document.getElementById("monAnnualDate");
  if(f) f.value = mon.frequency || "settimanale";
  if(r) r.value = mon.reviewEvery || "6-8 settimane";
  if(mid) mid.value = mon.midDate || "";
  if(ann) ann.value = mon.annualDate || "";
}

function bindMonitor(){
  const f = document.getElementById("monFreq");
  const r = document.getElementById("monReview");
  const mid = document.getElementById("monMidDate");
  const ann = document.getElementById("monAnnualDate");
  const ensure = () => { if(!state.icf.monitor) state.icf.monitor = { tools: {} }; };

  if(f){
    f.addEventListener("change", () => {
      ensure();
      state.icf.monitor.frequency = f.value;
      renderAllSide();
    });
  }
  if(r){
    r.addEventListener("change", () => {
      ensure();
      state.icf.monitor.reviewEvery = r.value;
      renderAllSide();
    });
  }
  if(mid){
    mid.addEventListener("change", () => {
      ensure();
      state.icf.monitor.midDate = mid.value;
      renderAllSide();
    });
  }
  if(ann){
    ann.addEventListener("change", () => {
      ensure();
      state.icf.monitor.annualDate = ann.value;
      renderAllSide();
    });
  }
}

function renderSmart(){
  const mount = document.getElementById("smartMount");
  if(!mount) return;
  if(!state.icf.smartGoals) state.icf.smartGoals = [];

  // Ordina: attivi prima
  const goals = [...state.icf.smartGoals].sort((a,b) => (isGoalActive(b) - isGoalActive(a)));

  mount.innerHTML = "";
  if(goals.length === 0){
    mount.innerHTML = `<div class="note">Nessun obiettivo SMART ancora. Premi <b>Crea/Aggiorna</b> per generarli dagli obiettivi ICF selezionati.</div>`;
    return;
  }

  const toolOptions = VERIFY_TOOLS.map(t => `<option value="${t.key}">${textEscape(t.label)}</option>`).join("");
  const verbOptions = SMART_VERBS.map(v => `<option value="${textEscape(v)}">${textEscape(v)}</option>`).join("");
  const timeOptions = SMART_TIMEFRAMES.map(t => `<option value="${textEscape(t)}">${textEscape(t)}</option>`).join("");
  const respOptions = RESPONSIBLES.map(x => `<option value="${textEscape(x)}">${textEscape(x)}</option>`).join("");

  goals.forEach(g => {
    const active = isGoalActive(g);
    const card = document.createElement("div");
    card.className = "smartCard";

    const codeLabel = g.code ? `<b>${textEscape(g.code)}</b> ` : "";
    const inactivePill = active ? `<span class="pill ok">attivo</span>` : `<span class="pill warn">non selezionato</span>`;
    const srcPill = g.sourceType === "icf" ? `<span class="pill">ICF</span>` : (g.sourceType === "custom" ? `<span class="pill">custom</span>` : `<span class="pill">libero</span>`);

    card.innerHTML = `
      <div class="smartHeader">
        <div class="ttl">${codeLabel}${textEscape(g.label || "Obiettivo")}</div>
        <div class="meta">
          ${srcPill}
          ${inactivePill}
          <button class="miniBtn danger" type="button" data-act="del">🗑︎</button>
        </div>
      </div>

      <div class="smartGrid">
        <div>
          <label>Verbo operativo</label>
          <select data-k="verb">${verbOptions}</select>
        </div>
        <div>
          <label>Tempo</label>
          <select data-k="timeframe">${timeOptions}</select>
        </div>
        <div class="span2">
          <label>Azione osservabile (cosa fa – in modo descrittivo)</label>
          <input data-k="behavior" type="text" placeholder="es. completa 10 minuti di lavoro on-task..." />
        </div>
        <div class="span2">
          <label>Condizioni (dove/come – supporti ammessi)</label>
          <textarea data-k="conditions" placeholder="es. durante lavoro individuale con checklist e consegne spezzate..."></textarea>
        </div>
        <div class="span2">
          <label>Criterio di successo (misurabile)</label>
          <input data-k="criterion" type="text" placeholder="es. 4/5 occasioni; 80%; max 1 prompt..." />
        </div>
        <div>
          <label>Verifica (strumento principale)</label>
          <select data-k="verifyTool">${toolOptions}</select>
        </div>
        <div>
          <label>Responsabile prevalente</label>
          <select data-k="responsible">${respOptions}</select>
        </div>
        <div class="span2">
          <label>Note / strategie collegate</label>
          <textarea data-k="notes" placeholder="es. timer visivo, rinforzo, peer tutoring, CAA..."></textarea>
        </div>
      </div>
    `;

    // set initial values
    card.querySelector('[data-k="verb"]').value = g.verb || "eseguire";
    card.querySelector('[data-k="timeframe"]').value = g.timeframe || "entro 8 settimane";
    card.querySelector('[data-k="behavior"]').value = g.behavior || "";
    card.querySelector('[data-k="conditions"]').value = g.conditions || "";
    card.querySelector('[data-k="criterion"]').value = g.criterion || "";
    card.querySelector('[data-k="verifyTool"]').value = g.verifyTool || "griglia";
    card.querySelector('[data-k="responsible"]').value = g.responsible || "Team docenti";
    card.querySelector('[data-k="notes"]').value = g.notes || "";

    // bindings
    card.querySelectorAll("[data-k]").forEach(el => {
      el.addEventListener("input", () => {
        const k = el.getAttribute("data-k");
        g[k] = el.value;
        renderAllSideNoSmart();
      });
      el.addEventListener("change", () => {
        const k = el.getAttribute("data-k");
        g[k] = el.value;
        renderAllSideNoSmart();
      });
    });

    card.querySelector('[data-act="del"]').addEventListener("click", () => {
      state.icf.smartGoals = (state.icf.smartGoals || []).filter(x => x.id !== g.id);
      renderSmart();
      renderAllSide();
      toast("Obiettivo SMART rimosso");
    });

    mount.appendChild(card);
  });
}

function getActiveSmartGoals(){
  const active = (state.icf.smartGoals || []).filter(g => isGoalActive(g));

  // Limite: massimo 1 SMART automatico per area di funzionamento (solo per sourceType === "icf").
  // L'utente può comunque aggiungere ulteriori SMART manualmente (sourceType "free") o personalizzati.
  const icf = active.filter(g => g && g.sourceType === "icf");
  const other = active.filter(g => !g || g.sourceType !== "icf");

  // Ordina gli ICF secondo l'ordine degli obiettivi (così la scelta è stabile e prevedibile)
  icf.sort((a,b) => {
    const oa = (ICF_OBJECTIVE_ORDER_MAP[a.sourceKey] ?? 999999);
    const ob = (ICF_OBJECTIVE_ORDER_MAP[b.sourceKey] ?? 999999);
    return oa - ob;
  });

  const picked = [];
  const seenAreas = new Set();
  for(const g of icf){
    const area = ICF_OBJECTIVE_AREA_MAP[g.sourceKey] || "";
    // Se non riusciamo a determinare l'area, non applichiamo il limite (meglio includere che perdere).
    if(!area){
      picked.push(g);
      continue;
    }
    if(seenAreas.has(area)) continue;
    seenAreas.add(area);
    picked.push(g);
  }

  return [...other, ...picked];
}

function getSelectedICFObjectives(){
  return ICF_OBJECTIVES.filter(it => state.icf.objectives[it.key]);
}

function getCustomObjectivesList(){
  return (state.icf.customObjectives || "")
    .split(/\n+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function summarizeSelections(){
  const chips = [];
  let sevCount = 0;
  let flagCount = 0;

  for(const d of DISABILITA){
    const r = state.rows[d.id];
    if(r.severity){
      sevCount++;
      chips.push({ text: `${d.label}: ${d.severity[r.severity]}`, remove: () => { r.severity = null; } });
    }
    for(const k of ["comm","mot","cog","pluri"]){
      if(r[k]){ flagCount++; chips.push({ text: `${d.label} – ${kLabel(k)}`, remove: () => { r[k] = false; } }); }
    }
  }

  for(const n of NEEDS){
    if(state.needs[n.key]){
      chips.push({ text: `Bisogno: ${n.label}`, remove: () => { state.needs[n.key] = false; } });
    }
  }

  const icfSelected = getSelectedICFObjectives();
  icfSelected.forEach(o => {
    chips.push({ text: `Obiettivo ICF: ${o.code} ${o.short || o.label}`, remove: () => { state.icf.objectives[o.key] = false; } });
  });

  const custom = (state.icf.customObjectives || "").trim();
  const customCount = custom ? custom.split(/\n+/).filter(Boolean).length : 0;
  if(custom){
    chips.push({ text: `Obiettivi personalizzati: ${customCount}`, remove: () => { state.icf.customObjectives = ""; } });
  }

  const facSel = ICF_FACILITATORS.filter(it => state.icf.facilitators[it.key]);
  facSel.forEach(it => chips.push({ text: `Facilitatore: ${it.code} ${it.label}`, remove: () => { state.icf.facilitators[it.key] = false; } }));
  const barSel = ICF_BARRIERS.filter(it => state.icf.barriers[it.key]);
  barSel.forEach(it => chips.push({ text: `Barriera: ${it.code} ${it.label}`, remove: () => { state.icf.barriers[it.key] = false; } }));

  return { chips, sevCount, flagCount, icfCount: icfSelected.length + customCount };
}

function renderChipsAndKpis(){
  const { chips, sevCount, flagCount, icfCount } = summarizeSelections();

  const mount = document.getElementById("chips");
  mount.innerHTML = "";
  if(chips.length === 0){
    mount.innerHTML = `<span class="note">Nessuna selezione ancora.</span>`;
  } else {
    chips.forEach(c => {
      const el = document.createElement("span");
      el.className = "chip";
      el.innerHTML = `<span>${textEscape(c.text)}</span><span class="x" title="Rimuovi">×</span>`;
      el.querySelector(".x").addEventListener("click", () => {
        c.remove();
        hydrateMetaUI();
        hydrateICFUI();
        renderTable();
        renderNeeds();
        renderICF();
        renderAllSide();
      });
      mount.appendChild(el);
    });
  }

  const k = document.getElementById("kpis");
  const eta = Number(state.meta.eta || 0);
  const needsCount = Object.values(state.needs).filter(Boolean).length;
  k.innerHTML = `
    <div class="kpi">
      <div class="t">Gravità selezionate</div>
      <div class="v">${sevCount}</div>
    </div>
    <div class="kpi">
      <div class="t">Compromissioni attive</div>
      <div class="v">${flagCount}</div>
    </div>
    <div class="kpi">
      <div class="t">Età / Bisogni / Obiettivi ICF</div>
      <div class="v">${eta ? eta + " anni" : "—"} / ${needsCount} / ${icfCount}</div>
    </div>
  `;
}

/** =========================
 *  Generatore PEI (HTML, non markdown)
 *  ========================= */
function buildPEIHTML(){
  const meta = state.meta;
  const eta = Number(meta.eta || 0);
  const ordine = meta.ordine || "";
  const famiglia = meta.famiglia || "";
  const classe = meta.classe || "";

  const flags = { comm:false, mot:false, cog:false, pluri:false };
  for(const d of DISABILITA){
    for(const k of Object.keys(flags)){
      if(state.rows[d.id][k]) flags[k] = true;
    }
  }

  const profileLines = [];
  for(const d of DISABILITA){
    const r = state.rows[d.id];
    const parts = [];
    if(r.severity) parts.push(d.severity[r.severity]);
    const fl = [];
    for(const k of ["comm","mot","cog","pluri"]){ if(r[k]) fl.push(kLabel(k)); }
    if(fl.length) parts.push(fl.join(", "));
    if(parts.length) profileLines.push(`${d.label}: ${parts.join(" • ")}`);
  }

  const needsLines = NEEDS.filter(n => state.needs[n.key]).map(n => n.label);
  const storico = (meta.storico || "").trim();
  const forza = (meta.puntiForza || "").trim();

  const icfObj = getSelectedICFObjectives();
  const icfCustom = getCustomObjectivesList();

  const facSel = ICF_FACILITATORS.filter(it => state.icf.facilitators[it.key]);
  const barSel = ICF_BARRIERS.filter(it => state.icf.barriers[it.key]);

  const resourcesSel = RESOURCES.filter(r => state.icf.resources[r.key]).map(r => r.label);

  let prioritiesShort = [];
  let goalsAnnual = [];
  let actions = [];
  let methods = [];
  let setting = [];
  let tools = [];
  let dispensations = [];
  let assessment = [];
  let collaboration = [];

  // Metodologie didattiche: selezione editabile (con suggerimenti automatici applicati a monte)
  ensurePlanState(state);
  methods = Object.keys(state.plan.methods).filter(k => state.plan.methods[k]).map(k => methodOut(k)).filter(Boolean);
  const customMethods = (state.plan.customMethods || "").split("\n").map(x => x.trim()).filter(Boolean);
  methods.push(...customMethods);

if(eta && eta <= 7){
    prioritiesShort.push("Prerequisiti: attenzione condivisa, comunicazione funzionale, autonomie di base, turn-taking.");
    actions.push("Attività brevi e strutturate (gioco guidato, routine), rinforzi naturali e generalizzazione.");
  } else if(eta && eta <= 11){
    prioritiesShort.push("Autonomia nello studio (micro-routine), competenze strumentali essenziali, socialità e regolazione emotiva.");
  } else if(eta && eta >= 12){
    prioritiesShort.push("Autonomia e responsabilizzazione, metodo di studio, competenze sociali, orientamento e competenze di vita.");
    actions.push("Progetti autentici con ruoli chiari (Project-Based Learning) e rubriche semplici.");
  }

  const objCodes = new Set(icfObj.map(o => o.code));

  if(objCodes.has("b140") || objCodes.has("d160")){
    goalsAnnual.push("Migliorare la capacità di mantenere l’attenzione sul compito e di riprendere l’attività dopo interruzioni.");
    prioritiesShort.push("Aumentare il tempo di lavoro efficace (con pause) e ridurre dispersioni.");
    actions.push("Chunking (5–10 minuti) + micro-pause; timer visivo; consegne una alla volta; checklist di avvio.");
    setting.push("Posto a ridotta distrazione; materiali pronti; routine di avvio (2 minuti).");
  }

  if(objCodes.has("b152")){
    goalsAnnual.push("Sviluppare strategie di autoregolazione emotiva in situazioni di frustrazione/ansia.");
    actions.push("Scala emozioni/termometro; scelta di strategie (respirazione, pausa, richiesta aiuto); social story per eventi critici.");
    setting.push("Spazio di decompressione concordato; segnali condivisi per chiedere pausa.");
  }

  if(objCodes.has("b164") || objCodes.has("d230")){
    goalsAnnual.push("Potenziare pianificazione e gestione di tempi/materiali (routine e transizioni).");
    prioritiesShort.push("Stabilizzare routine: diario/agenda, controllo materiale, consegne.");
    actions.push("Planner settimanale; checklist materiale; ‘prima-poi’; revisione finale guidata (2 domande).");
    tools.push("Organizer digitale o cartaceo; checklist; promemoria visivi.");
  }

  if(objCodes.has("b167") || objCodes.has("d310") || objCodes.has("d330")){
    goalsAnnual.push("Migliorare comprensione delle consegne e capacità di esprimere bisogni/risposte in modo funzionale.");
    actions.push("Semplificazione linguistica + parole chiave; controlli di comprensione; alternative di risposta (orale/immagini/digitale).");
}
  if(objCodes.has("d335")){
    tools.push("CAA: tabelle di scelta, simboli/app, risposte yes/no, supporti visivi (se coerenti col profilo).");
    collaboration.push("Allineamento con logopedista/terapista su lessico funzionale e modalità di prompt/fading.");
  }

  if(objCodes.has("d166") || state.needs.lettura){
    goalsAnnual.push("Consolidare abilità di lettura funzionale e comprensione adeguata agli obiettivi.");
    tools.push("Sintesi vocale/audiotesti; testi ad alta leggibilità; anticipazione di parole-chiave.");
    dispensations.push("Dispensa dalla lettura ad alta voce non preparata (se fonte d’ansia/errore).");
  }
  if(objCodes.has("d170") || state.needs.scrittura){
    goalsAnnual.push("Migliorare produzione scritta funzionale (scalette, coerenza) con strumenti compensativi.");
    tools.push("Videoscrittura, correttore, predizione parola; mappe e scalette per scrivere.");
    dispensations.push("Riduzione della copia; valutare contenuto più che grafia quando previsto dal PEI.");
  }
  if(objCodes.has("d172") || state.needs.calcolo){
    goalsAnnual.push("Sviluppare competenze di calcolo e problem solving funzionali agli obiettivi essenziali.");
    tools.push("Calcolatrice, formulari, procedure passo-passo.");
    dispensations.push("Riduzione esercizi ripetitivi; focalizzazione sul procedimento.");
  }

  if(objCodes.has("d710") || objCodes.has("d720")){
    goalsAnnual.push("Migliorare interazioni con pari (turn-taking, cooperazione) e gestione conflitti con supporti.");
    actions.push("Cooperative strutturato (ruoli); peer tutoring; regole esplicite e visuali; prove di role-play.");
    setting.push("Regole di classe visuali; gestione turni; routine di lavoro a coppie.");
  }

  if(objCodes.has("d820")){
    goalsAnnual.push("Aumentare partecipazione attiva alle attività di classe (presenza, coinvolgimento, autonomia).");
    actions.push("Obiettivi ‘minimi essenziali’ chiari; compiti autentici; scelta controllata (2 opzioni) per aumentare agency.");
  }

  // Preset alto impatto: MOTORIA (da lieve a tetraplegia)
  const _icdUp = (state.icd && Array.isArray(state.icd.codes))
    ? state.icd.codes.map(c => String(c || "").trim().toUpperCase())
    : [];
  const _icdHas = (prefixes) => _icdUp.some(code => prefixes.some(p => code.startsWith(p)));

  const motSev = (state.rows.fisica && state.rows.fisica.severity) ? state.rows.fisica.severity : null;
  const motSevere = (motSev === "grave" || _icdHas(["G82","G83"]));
  const motAny = (flags.mot || objCodes.has("d450") || objCodes.has("d440") || !!motSev || motSevere);

  if(motAny){
    setting.push("Accessibilità: postazione ergonomica, spazi di passaggio, tempi di spostamento adeguati; procedure stabili per spostamenti (laboratori/palestra).");
    tools.push("PC/tablet: videoscrittura e correttore; ridurre copiatura. Se utile: dettatura vocale; mouse/trackball/joystick; tastiera facilitata.");
    dispensations.push("Riduzione attività di copia manuale; materiali già predisposti; tempi aggiuntivi per esecuzione/spostamenti.");
  }
  if(motSevere){
    tools.push("Accessibilità input avanzata: puntatore testa o eye-tracking; switch + scansione; postazione regolabile (tavolo/ausili postura).");
    setting.push("Concordare assistenza per trasferimenti/autonomie e gestione sicurezza (piano condiviso).");
    assessment.push("Alternative a prove manuali/laboratorio/palestra con obiettivi equivalenti; valutare la competenza, non la performance motoria.");
  }

  if(state.needs.attenzione){
    actions.push("Segnali non verbali concordati; micro-obiettivi; rinforzo del comportamento on-task.");
  }
  if(state.needs.ansia){
    assessment.push("Valutazioni a bassa ansia: prove brevi, interrogazioni programmate, feedback sul processo.");
    setting.push("Preavviso dei cambi; rituali di inizio prova; possibilità di pausa.");
  }
  if(state.needs.comportamento){
collaboration.push("Patto educativo condiviso e coerenza tra adulti; rinforzi chiari e prevedibili.");
  }
  if(state.needs.memoria){
    tools.push("Mappe, flashcard, ripasso distribuito; interrogazioni brevi e frequenti.");
}

  // Preset alto impatto: VISTA (ipovisione grave/cecità)
  const vistaSev = (state.rows.vista && state.rows.vista.severity) ? state.rows.vista.severity : null;
  const vistaHigh = (vistaSev === "media" || vistaSev === "grave" || _icdHas(["H54"]));
  const vistaBlind = (vistaSev === "grave" || _icdHas(["H54"]));

  if(vistaHigh){
    tools.push("Accessibilità visiva: testi digitali strutturati + sintesi vocale; OCR per materiali cartacei; per ipovisione: ingrandimento/alto contrasto (videoingranditore).");
    setting.push("Ordine e percorsi stabili; descrizioni verbali di schemi/immagini; posizionamento ottimizzato (luce/abbagliamento).");
    dispensations.push("Sostituire prove grafiche/mappe non accessibili con equivalenti descrittivi; tempi aggiuntivi per uso OCR/screen reader.");
    assessment.push("Verifiche: consegne anche in forma orale + digitale accessibile; criteri centrati sui contenuti.");
  }
  if(vistaBlind){
    tools.push("Screen reader (NVDA/JAWS/VoiceOver) + scorciatoie; eventuale display/dattilobraille; mappe/tavole tattili; calcolatrice parlante/app accessibile.");
    collaboration.push("Raccordo con CTS/tiflologo e consulenza ausili (se attivabili).");
  }
  // Preset alto impatto: UDITO (ipoacusia grave/sordità)
  const uditoSev = (state.rows.udito && state.rows.udito.severity) ? state.rows.udito.severity : null;
  const uditoHigh = (uditoSev === "media" || uditoSev === "grave" || _icdHas(["H90","H91"]));
  const uditoDeaf = (uditoSev === "grave" || _icdHas(["H90","H91"]));

  if(uditoHigh){
    tools.push("Comunicazione accessibile: sottotitoli/caption e trascrizioni; parole-chiave su slide; app speech-to-text (quando utile).");
    setting.push("Docente frontale con buona illuminazione sul viso; turni di parola (uno alla volta); controllo rumore/riverbero.");
    dispensations.push("Consegne sempre scritte + visive; tempi per riformulazione; evitare interrogazioni a distanza senza supporto.");
    assessment.push("Verifiche: formato chiaro e visivo; domande/istruzioni per iscritto; verificare comprensione senza modalità punitive.");
  }
  if(uditoDeaf){
    tools.push("Sistema FM/DM (microfono docente + ricevitore) se previsto; materiali/risorse in LIS se utilizzata.");
    collaboration.push("Se previsto: assistente alla comunicazione/interprete e raccordo servizi/logopedia.");
  }

  if(famiglia === "fragile") collaboration.push("Comunicazioni brevi e regolari (micro-obiettivi); attenzione a sostenibilità dei compiti a casa.");
  if(famiglia === "conflittuale") collaboration.push("Canale unico e tracciabile; incontri strutturati con agenda e verbale.");
  if(famiglia === "assente") collaboration.push("Strategie di contatto essenziali; figure di riferimento; documentare passaggi chiave.");
  if(famiglia === "tutela") collaboration.push("Coordinamento con servizi/educatori secondo procedure della scuola, con attenzione alla privacy.");
  if(classe === "critico" || classe === "complesso") setting.push("Regole di classe esplicite + visuali; gestione rumore; cooperativo strutturato.");

  if(facSel.length){
    collaboration.push("Valorizzare facilitatori selezionati (es. peer tutoring, tecnologie, raccordo con servizi) con responsabilità chiare.");
  }
  if(barSel.length){
    setting.push("Ridurre barriere selezionate (es. rumore/affollamento, discontinuità) con azioni specifiche e monitoraggio.");
  }

  methods = uniq(methods);
  setting = uniq(setting);
  tools = uniq(tools);
  dispensations = uniq(dispensations);
  actions = uniq(actions);
  assessment = uniq(assessment);
  collaboration = uniq(collaboration);

  // Snapshot (per export PEI JSON ponte)
  window.__peiLast = { prioritiesShort, goalsAnnual, actions, methods, setting, tools, dispensations, assessment, collaboration };


  const monitoring = [
    "Definire 3–5 indicatori osservabili (es. avvio compito, richieste di aiuto, partecipazione, accuratezza, autonomia).",
    "Rilevazione settimanale (griglia semplice) + revisione ogni 6–8 settimane nel team.",
    "Adattare strategie/strumenti in base ai dati (ciò che non funziona si modifica)."
  ];

  const selectedBySection = ICF_SECTIONS.map(s => ({
    section: s,
    items: s.objectives.filter(o => state.icf.objectives[o.key])
  }));

  if(goalsAnnual.length === 0 && (icfObj.length || icfCustom.length)){
    goalsAnnual = icfObj.map(o => `Migliorare: ${o.label.toLowerCase()}.`);
    goalsAnnual.push(...icfCustom);
  }
  if(goalsAnnual.length === 0){
    goalsAnnual.push("Definire 2–3 obiettivi annuali misurabili coerenti con il profilo di funzionamento e la partecipazione scolastica.");
  }
  if(prioritiesShort.length === 0){
    prioritiesShort.push("Definire 2–4 priorità operative per 8–12 settimane (abilità osservabili e misurabili)."
    );
  }

  const html = [];
  html.push(`<h1>Scheda di sintesi per la redazione del PEI</h1>`);
  html.push(`<p class="muted">Documento di progettazione educativa a supporto della redazione del PEI. Non costituisce PEI formale.</p>`);

  // Documentazione e atti (sintesi)
  const docs = state.docs || {};
  const docLines = [];
  if(docs.accertamentoDate) docLines.push(`Accertamento (rilasciato): ${fmtDate(docs.accertamentoDate)}`);
  if(docs.scadenzaDate) docLines.push(`Scadenza/Rivedibilità: ${fmtDate(docs.scadenzaDate)}`);
  if(docs.pfRedattoDate) docLines.push(`Profilo di Funzionamento (redatto): ${fmtDate(docs.pfRedattoDate)}`);
  if(docs.dfDate) docLines.push(`Diagnosi Funzionale (redatta): ${fmtDate(docs.dfDate)}`);
  if(docs.pdfDate) docLines.push(`Profilo Dinamico Funzionale (approvato): ${fmtDate(docs.pdfDate)}`);
  if(docs.progettoIndDate) docLines.push(`Progetto Individuale (redatto): ${fmtDate(docs.progettoIndDate)}`);

  if(docLines.length){
    html.push(`<div class="box"><h2>Documentazione e atti</h2>${listHtml(docLines)}</div>`);
  }

if(meta.profileName && meta.profileName.trim()){
    html.push(`<p><b>Profilo:</b> ${textEscape(meta.profileName.trim())}</p>`);
  }
  html.push(`<p><b>Età/Ordine:</b> ${eta ? textEscape(String(eta)) + " anni" : "—"} / ${ordine ? textEscape(ordine) : "—"}</p>`);

  const famCrit = FAMILY_CRIT.filter(it => state.familyCtx.crit[it.key]).map(it => it.label);
  const famPos  = FAMILY_POS.filter(it => state.familyCtx.pos[it.key]).map(it => it.label);
  const schCtx  = SCHOOL_CTX.filter(it => state.schoolCtx.ctx[it.key]).map(it => it.label);

  const famNoteBul = splitToBullets(state.familyCtx.note || "");
  const schNoteBul = splitToBullets(state.schoolCtx.note || "");

  /* =========================
   *  PROFILO DI FUNZIONAMENTO
   * ========================= */
  html.push(`<h2>Profilo di funzionamento – quadro di sintesi</h2>`);
  html.push(profileLines.length ? listHtml(profileLines) : `<p class="muted">Nessuna selezione.</p>`);

  // ICD-10 (diagnosi)
  ensureIcdState();
  const icdCodes = (state.icd && Array.isArray(state.icd.codes)) ? state.icd.codes : [];
  if(icdCodes.length){
    const rows = icdCodes
      .map(c => ({ code:String(c), title: icdTitle(c) }))
      .sort((a,b) => a.code.localeCompare(b.code, "it"))
      .map(x => `<b>${textEscape(x.code)}</b> ${textEscape(x.title)}`);
    html.push(`<h3>ICD-10 (codici diagnosi dalla documentazione)</h3>`);
    html.push(listHtmlUnsafe(rows));
  }

  // ICF da DF/PF con qualificatori (0–4)
  ensureDfpfState();
  const dfpfEntries = Object.entries(state.icf.dfpf.selected || {}).map(([code, q]) => ({ code:String(code), q:Number(q) }))
    .filter(x => Number.isFinite(x.q))
    .sort((a,b) => a.code.localeCompare(b.code, "it"));
  if(dfpfEntries.length){
    const rows = dfpfEntries.map(x => `<b>${textEscape(x.code)}</b> ${textEscape(dfpfTitle(x.code))} — <i>qualificatore</i> ${textEscape(String(x.q))}`);
    html.push(`<h3>ICF da documentazione + eventuale funzionamento osservato (qualificatori 0–4)</h3>`);
    html.push(listHtmlUnsafe(rows));
  }

  if(needsLines.length){
    html.push(`<h3>Bisogni aggiuntivi (tipo DSA/ADHD ecc.)</h3>`);
    html.push(listHtml(needsLines));
  }

  if(forza){
    html.push(`<h3>Punti di forza / interessi / motivatori</h3>`);
    html.push(listHtml(splitToBullets(forza)));
  }

  if(storico){
    html.push(`<h3>Storico essenziale</h3>`);
    html.push(listHtml(splitToBullets(storico)));
  }

  /* =========================
   *  CONTESTO E RISORSE
   * ========================= */
  html.push(`<h2>Contesto educativo</h2>`);

  html.push(`<h3>Contesto familiare</h3>`);
  html.push(`<p><b>Quadro sintetico:</b> ${textEscape(famigliaLabel(famiglia))}</p>`);
  if(famCrit.length) html.push(`<p><b>Fattori critici:</b></p>${listHtml(famCrit)}`);
  if(famPos.length)  html.push(`<p><b>Fattori positivi:</b></p>${listHtml(famPos)}`);
  if((state.familyCtx.siblings || "") !== "") html.push(`<p><b>Fratelli/sorelle:</b> ${textEscape(state.familyCtx.siblings)}</p>`);
  if(famNoteBul.length) html.push(`<p><b>Note operative:</b></p>${listHtml(famNoteBul)}`);

  html.push(`<h3>Contesto scolastico</h3>`);
  html.push(`<p><b>Clima classe:</b> ${textEscape(classeLabel(classe))}</p>`);
  const st = state.schoolCtx;
  const statsLine = [];
  if((st.classLabel || "").trim()) statsLine.push(`<b>Classe:</b> ${textEscape(st.classLabel.trim())}`);
  if(st.total !== "")  statsLine.push(`<b>Tot:</b> ${textEscape(st.total)}`);
  if(st.male !== "")   statsLine.push(`<b>Maschi:</b> ${textEscape(st.male)}`);
  if(st.female !== "") statsLine.push(`<b>Femmine:</b> ${textEscape(st.female)}`);
  if(st.ada !== "")    statsLine.push(`<b>Altri ADA/104:</b> ${textEscape(st.ada)}`);
  if(st.dsa !== "")    statsLine.push(`<b>DSA:</b> ${textEscape(st.dsa)}`);
  if(st.bes !== "")    statsLine.push(`<b>BES:</b> ${textEscape(st.bes)}`);
  if(statsLine.length) html.push(`<p>${statsLine.join(" &nbsp;•&nbsp; ")}</p>`);
  if(schCtx.length)    html.push(`<p><b>Fattori scolastici rilevanti:</b></p>${listHtml(schCtx)}`);
  if(schNoteBul.length) html.push(`<p><b>Note operative:</b></p>${listHtml(schNoteBul)}`);

  html.push(`<h2>Risorse e figure coinvolte</h2>`);
  html.push(`<p><b>Risorse coinvolte:</b> ${resourcesSel.length ? textEscape(resourcesSel.join(", ")) : "—"}</p>`);

  /* =========================
   *  ICF: OBIETTIVI + AMBIENTE
   * ========================= */
  html.push(`<h2>Funzionamento secondo il modello ICF</h2>`);
  html.push(`<h3>Obiettivi ICF selezionati</h3>`);

  const hasAnyICF = selectedBySection.some(g => g.items.length) || icfCustom.length;
  if(hasAnyICF){
    for(const g of selectedBySection){
      if(!g.items.length) continue;
      html.push(`<p><b>${textEscape(g.section.title)}</b> <i>(${textEscape(g.section.subtitle)})</i></p>`);
      html.push(listHtmlUnsafe(g.items.map(o => `<b>${textEscape(o.code)}</b> ${textEscape(o.label)}`)));
    }
    if(icfCustom.length){
      html.push(`<p><b>Obiettivi personalizzati</b></p>`);
      html.push(listHtml(icfCustom));
    }
  } else {
    html.push(`<p class="muted">Seleziona obiettivi ICF oppure inserisci obiettivi personalizzati.</p>`);
  }

  html.push(`<h3>Fattori ambientali</h3>`);
  html.push(`<p><b>Facilitatori</b></p>`);
  html.push(facSel.length ? listHtmlUnsafe(facSel.map(it => `<b>${textEscape(it.code)}</b> ${textEscape(it.label)}`)) : `<p class="muted">—</p>`);
  html.push(`<p><b>Barriere</b></p>`);
  html.push(barSel.length ? listHtmlUnsafe(barSel.map(it => `<b>${textEscape(it.code)}</b> ${textEscape(it.label)}`)) : `<p class="muted">—</p>`);

  /* =========================
   *  PRIORITÀ E OBIETTIVI
   * ========================= */
  html.push(`<h2>Priorità educative a breve termine</h2>`);
  html.push(listHtml(uniq(prioritiesShort).slice(0, 6)));

  // Medio periodo: tappo di coerenza tra breve e annuale (se non definito esplicitamente)
  let goalsMedium = [];
  if(prioritiesShort.length){
    goalsMedium = uniq(prioritiesShort).slice(0, 4).map(x => {
      const s = String(x).trim().replace(/\.+$/,"").replace(/\.$/,"");
      return `Consolidare: ${s}.`;
    });
  } else if(goalsAnnual.length){
    goalsMedium = goalsAnnual.slice(0, 3).map(x => {
      const s = String(x).trim().replace(/\.+$/,"").replace(/\.$/,"");
      return `Avviare progressi verso: ${s}.`;
    });
  }
  if(!goalsMedium.length){
    goalsMedium.push("Definire 2–4 obiettivi di medio periodo come tappe verso gli obiettivi annuali.");
  }

  html.push(`<h2>Obiettivi educativi di medio periodo</h2>`);
  html.push(listHtml(goalsMedium));

  html.push(`<h2>Obiettivi educativi annuali</h2>`);
  html.push(listHtml(goalsAnnual));

  html.push(`<h2>Obiettivi operativi verificabili</h2>`);
  const smartGoals = getActiveSmartGoals();
  if(smartGoals.length){
    const rows = [];
    let i = 1;
    for(const g of smartGoals){
      const title = (g.code ? (g.code + " – ") : "") + (g.label || "Obiettivo");
      const lines = [];
      const action = (g.verb || "eseguire") + (g.behavior ? (" " + g.behavior) : "");
      lines.push(`<b>Obiettivo ${i}</b>: <i>${textEscape(title)}</i>`);
      if(action.trim()) lines.push(`<b>Azione osservabile</b>: ${textEscape(action.trim())}`);
      if((g.conditions || "").trim()) lines.push(`<b>Condizioni</b>: ${textEscape(g.conditions.trim())}`);
      if((g.criterion || "").trim()) lines.push(`<b>Criterio</b>: ${textEscape(g.criterion.trim())}`);
      if((g.timeframe || "").trim()) lines.push(`<b>Tempo</b>: ${textEscape(g.timeframe.trim())}`);
      const toolLabel = (VERIFY_TOOLS.find(t => t.key === g.verifyTool) || {}).label || "";
      if(toolLabel) lines.push(`<b>Verifica</b>: ${textEscape(toolLabel)}`);
      if((g.responsible || "").trim()) lines.push(`<b>Responsabile</b>: ${textEscape(g.responsible.trim())}`);
      if((g.notes || "").trim()) lines.push(`<b>Note/strategie</b>: ${textEscape(g.notes.trim())}`);
      rows.push(lines.join("<br>"));
      i++;
    }
    html.push(listHtmlUnsafe(rows));
  } else {
    html.push(`<p class="muted">Nessun obiettivo operativo compilato. Usa “Crea/Aggiorna” per generarli dagli obiettivi ICF selezionati oppure aggiungine uno manualmente.</p>`);
  }

  /* =========================
   *  STRATEGIE E PIANO OPERATIVO
   * ========================= */
  html.push(`<h2>Strategie educative e metodologiche</h2>`);
  html.push(listHtml(methods));

  html.push(`<h2>Azioni e attività previste</h2>`);
  html.push(actions.length ? listHtml(actions) : `<p class="muted">Definire attività coerenti con obiettivi e contesto.</p>`);

  html.push(`<h2>Setting educativo e organizzazione</h2>`);
  html.push(setting.length ? listHtml(setting) : `<p class="muted">Definire facilitazioni ambientali coerenti con i bisogni osservati.</p>`);

  html.push(`<h2>Strumenti e supporti</h2>`);
  html.push(tools.length ? listHtml(tools) : `<p class="muted">Selezionare 2–4 strumenti davvero usabili e sostenibili.</p>`);

  html.push(`<h2>Misure di personalizzazione e adattamento</h2>`);
  html.push(dispensations.length ? listHtml(dispensations) : `<p class="muted">Adattare quantità/tempi senza abbassare l’obiettivo essenziale.</p>`);

  html.push(`<h2>Verifica, valutazione e monitoraggio</h2>`);
  html.push(assessment.length ? listHtml(assessment) : `<p class="muted">Verifiche adattate a formato/tempo; criteri trasparenti (rubrica semplice).</p>`);
  html.push(listHtml(monitoring));

  html.push(`<h2>Collaborazione e corresponsabilità educativa</h2>`);
  html.push(collaboration.length ? listHtml(collaboration) : `<p class="muted">Incontri periodici con agenda; strategie condivise e lessico comune.</p>`);

  html.push(`<div class="boxNote"><b>Nota:</b> la presente scheda è uno strumento di supporto alla progettazione educativa e non sostituisce la redazione formale del PEI. Evitare dati sensibili non necessari (privacy).</div>`);
  return htmlJoin(html);
}

function getPEIHTMLDocument(){
  const body = buildPEIHTML();
  const style = `
    body{ font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.35; }
    h1{ font-size: 16pt; margin: 0 0 8pt; }
    h2{ font-size: 13pt; margin: 12pt 0 6pt; }
    h3{ font-size: 11.5pt; margin: 10pt 0 4pt; }
    p{ margin: 4pt 0; }
    ul{ margin: 4pt 0 4pt 18pt; }
    li{ margin: 2pt 0; }
  `;
  return `<!doctype html><html><head><meta charset="utf-8"><title>PEI</title><style>${style}</style></head><body>${body}</body></html>`;
}

function renderOutput(){
  const out = document.getElementById("output");
  out.innerHTML = buildPEIHTML();
}

function renderAllSide(){
  // Applica trigger di contesto → fattori ambientali (non distruttivo)
  autoApplyEnvFromContext(state);
  autoApplyHighImpactPresets(state);
  ensurePlanState(state);
  autoApplyMethods(state);

  renderICF();
  renderMethods();

  renderChipsAndKpis();
  renderSmart();
  renderMonitorTools();
  renderOutput();
}

// Variante: aggiorna tutto TRANNE la UI degli Obiettivi SMART (per evitare perdita di focus durante la digitazione)
function renderAllSideNoSmart(){
  // Non richiamare renderSmart() qui.
  // I trigger ambientali possono rimanere stabili durante l'editing SMART.
  autoApplyEnvFromContext(state);
  autoApplyHighImpactPresets(state);
  ensurePlanState(state);
  autoApplyMethods(state);

  renderICF();
  renderMethods();

  renderChipsAndKpis();
  renderMonitorTools();
  renderOutput();
}


function bindMeta(){
  const profileName = document.getElementById("profileName");
  const eta = document.getElementById("eta");
  const ordine = document.getElementById("ordine");
  const famiglia = document.getElementById("famiglia");
  const classe = document.getElementById("classe");
  const storico = document.getElementById("storico");
  const puntiForza = document.getElementById("puntiForza");
  const icfCustom = document.getElementById("icfCustom");

  const famSiblings = document.getElementById("famSiblings");
  const famNote = document.getElementById("famNote");

  const schClass = document.getElementById("schClass");
  const schTotal = document.getElementById("schTotal");
  const schMale = document.getElementById("schMale");
  const schFemale = document.getElementById("schFemale");
  const schADA = document.getElementById("schADA");
  const schDSA = document.getElementById("schDSA");
  const schBES = document.getElementById("schBES");
  const schNote = document.getElementById("schNote");


  function sync(){
  // META
  state.meta.profileName = profileName.value;
  state.meta.eta = eta.value;
  state.meta.ordine = ordine.value;
  state.meta.famiglia = famiglia.value;
  state.meta.classe = classe.value;
  state.meta.storico = storico.value;
  state.meta.puntiForza = puntiForza.value;
  state.icf.customObjectives = icfCustom.value;

  // ✅ FIX: CONTESTO FAMIGLIA → STATE
  state.familyCtx.siblings = famSiblings.value;
  state.familyCtx.note = famNote.value;

  // ✅ FIX: CONTESTO SCUOLA → STATE
  state.schoolCtx.classLabel = schClass.value;
  state.schoolCtx.total = schTotal.value;
  state.schoolCtx.male = schMale.value;
  state.schoolCtx.female = schFemale.value;
  state.schoolCtx.ada = schADA.value;
  state.schoolCtx.dsa = schDSA.value;
  state.schoolCtx.bes = schBES.value;
  state.schoolCtx.note = schNote.value;

  renderAllSide();

  const ae = document.activeElement;
  if(ae && (ae === famiglia || ae === classe)) { renderICF(); }
}


  [profileName, eta, ordine, famiglia, classe, storico, puntiForza, icfCustom, famSiblings, famNote, schClass, schTotal, schMale, schFemale, schADA, schDSA, schBES, schNote].forEach(el => {
    el.addEventListener("input", sync);
    el.addEventListener("change", sync);
  });

  document.getElementById("icfSearch").addEventListener("input", () => renderICF());
  document.getElementById("btnIcfClear").addEventListener("click", () => {
    document.getElementById("icfSearch").value = "";
    renderICF();
  });
}

function hydrateMetaUI(){
  document.getElementById("profileName").value = state.meta.profileName || "";
  document.getElementById("eta").value = state.meta.eta || "";
  document.getElementById("ordine").value = state.meta.ordine || "";
  document.getElementById("famiglia").value = state.meta.famiglia || "";
  document.getElementById("classe").value = state.meta.classe || "";
  document.getElementById("storico").value = state.meta.storico || "";
  document.getElementById("puntiForza").value = state.meta.puntiForza || "";
  document.getElementById("famSiblings").value = (state.familyCtx && state.familyCtx.siblings) ? state.familyCtx.siblings : "";
  document.getElementById("famNote").value = (state.familyCtx && state.familyCtx.note) ? state.familyCtx.note : "";

  document.getElementById("schClass").value = (state.schoolCtx && state.schoolCtx.classLabel) ? state.schoolCtx.classLabel : "";
  document.getElementById("schTotal").value = (state.schoolCtx && state.schoolCtx.total) ? state.schoolCtx.total : "";
  document.getElementById("schMale").value = (state.schoolCtx && state.schoolCtx.male) ? state.schoolCtx.male : "";
  document.getElementById("schFemale").value = (state.schoolCtx && state.schoolCtx.female) ? state.schoolCtx.female : "";
  document.getElementById("schADA").value = (state.schoolCtx && state.schoolCtx.ada) ? state.schoolCtx.ada : "";
  document.getElementById("schDSA").value = (state.schoolCtx && state.schoolCtx.dsa) ? state.schoolCtx.dsa : "";
  document.getElementById("schBES").value = (state.schoolCtx && state.schoolCtx.bes) ? state.schoolCtx.bes : "";
  document.getElementById("schNote").value = (state.schoolCtx && state.schoolCtx.note) ? state.schoolCtx.note : "";

}

function hydrateICFUI(){
  document.getElementById("icfCustom").value = state.icf.customObjectives || "";
  hydrateMonitorUI();
  ensureDfpfState();
  renderDiagICF();
  ensureIcdState();
  renderICD();
}

const LS_KEY = "pei_planner_ada104_v4";

function normalizeState(s){
  const d = createDefaultState();
  if(!s || typeof s !== "object") return d;

  s.rows = s.rows && typeof s.rows === "object" ? s.rows : {};
  for(const k of Object.keys(d.rows)){
    const r = s.rows[k] && typeof s.rows[k] === "object" ? s.rows[k] : {};
    s.rows[k] = {
      severity: (r.severity === "lieve" || r.severity === "media" || r.severity === "grave") ? r.severity : null,
      comm: !!r.comm,
      mot: !!r.mot,
      cog: !!r.cog,
      pluri: !!r.pluri,
    };
  }

  s.needs = s.needs && typeof s.needs === "object" ? s.needs : {};
  for(const k of Object.keys(d.needs)){
    if(typeof s.needs[k] !== "boolean") s.needs[k] = false;
  }

  s.meta = s.meta && typeof s.meta === "object" ? s.meta : {};
  for(const k of Object.keys(d.meta)){
    if(typeof s.meta[k] !== "string") s.meta[k] = d.meta[k];
  }


  
// ICD-10 (codici diagnosi)
s.icd = s.icd && typeof s.icd === "object" ? s.icd : {};
s.icd.codes = cleanIcdCodes(s.icd.codes);

// contesto famiglia e scuola
  s.familyCtx = s.familyCtx && typeof s.familyCtx === "object" ? s.familyCtx : {};
  s.familyCtx.crit = s.familyCtx.crit && typeof s.familyCtx.crit === "object" ? s.familyCtx.crit : {};
  for(const k of Object.keys(d.familyCtx.crit)){
    if(typeof s.familyCtx.crit[k] !== "boolean") s.familyCtx.crit[k] = false;
  }
  s.familyCtx.pos = s.familyCtx.pos && typeof s.familyCtx.pos === "object" ? s.familyCtx.pos : {};
  for(const k of Object.keys(d.familyCtx.pos)){
    if(typeof s.familyCtx.pos[k] !== "boolean") s.familyCtx.pos[k] = false;
  }
  if(typeof s.familyCtx.siblings !== "string") s.familyCtx.siblings = "";
  if(typeof s.familyCtx.note !== "string") s.familyCtx.note = "";

  s.schoolCtx = s.schoolCtx && typeof s.schoolCtx === "object" ? s.schoolCtx : {};
  if(typeof s.schoolCtx.classLabel !== "string") s.schoolCtx.classLabel = "";
  if(typeof s.schoolCtx.total !== "string") s.schoolCtx.total = "";
  if(typeof s.schoolCtx.male !== "string") s.schoolCtx.male = "";
  if(typeof s.schoolCtx.female !== "string") s.schoolCtx.female = "";
  if(typeof s.schoolCtx.ada !== "string") s.schoolCtx.ada = "";
  if(typeof s.schoolCtx.dsa !== "string") s.schoolCtx.dsa = "";
  if(typeof s.schoolCtx.bes !== "string") s.schoolCtx.bes = "";
  s.schoolCtx.ctx = s.schoolCtx.ctx && typeof s.schoolCtx.ctx === "object" ? s.schoolCtx.ctx : {};
  for(const k of Object.keys(d.schoolCtx.ctx)){
    if(typeof s.schoolCtx.ctx[k] !== "boolean") s.schoolCtx.ctx[k] = false;
  }
  if(typeof s.schoolCtx.note !== "string") s.schoolCtx.note = "";

  s.icf = s.icf && typeof s.icf === "object" ? s.icf : {};

  s.icf.objectives = s.icf.objectives && typeof s.icf.objectives === "object" ? s.icf.objectives : {};
  for(const k of Object.keys(d.icf.objectives)){
    if(typeof s.icf.objectives[k] !== "boolean") s.icf.objectives[k] = false;
  }

  if(typeof s.icf.customObjectives !== "string") s.icf.customObjectives = "";

  // DF/PF ICF (qualificatori)
  s.icf.dfpf = s.icf.dfpf && typeof s.icf.dfpf === "object" ? s.icf.dfpf : {};
  s.icf.dfpf.selected = s.icf.dfpf.selected && typeof s.icf.dfpf.selected === "object" ? s.icf.dfpf.selected : {};
  s.icf.dfpf.selected = cleanDfpfSelected(s.icf.dfpf.selected);

  s.icf.facilitators = s.icf.facilitators && typeof s.icf.facilitators === "object" ? s.icf.facilitators : {};
  for(const k of Object.keys(d.icf.facilitators)){
    if(typeof s.icf.facilitators[k] !== "boolean") s.icf.facilitators[k] = false;
  }

  s.icf.barriers = s.icf.barriers && typeof s.icf.barriers === "object" ? s.icf.barriers : {};
  for(const k of Object.keys(d.icf.barriers)){
    if(typeof s.icf.barriers[k] !== "boolean") s.icf.barriers[k] = false;
  }

  s.icf.overrides = s.icf.overrides && typeof s.icf.overrides === "object" ? s.icf.overrides : {};
  s.icf.overrides.facilitators = s.icf.overrides.facilitators && typeof s.icf.overrides.facilitators === "object" ? s.icf.overrides.facilitators : {};
  for(const k of Object.keys(d.icf.facilitators)){
    if(typeof s.icf.overrides.facilitators[k] !== "boolean") s.icf.overrides.facilitators[k] = false;
  }
  s.icf.overrides.barriers = s.icf.overrides.barriers && typeof s.icf.overrides.barriers === "object" ? s.icf.overrides.barriers : {};
  for(const k of Object.keys(d.icf.barriers)){
    if(typeof s.icf.overrides.barriers[k] !== "boolean") s.icf.overrides.barriers[k] = false;
  }

  s.icf.resources = s.icf.resources && typeof s.icf.resources === "object" ? s.icf.resources : {};
  for(const k of Object.keys(d.icf.resources)){
    if(typeof s.icf.resources[k] !== "boolean") s.icf.resources[k] = d.icf.resources[k];
  }

  s.icf.preset = s.icf.preset && typeof s.icf.preset === "object" ? s.icf.preset : {};
  for(const sec of ICF_SECTIONS){
    const cur = s.icf.preset[sec.id] && typeof s.icf.preset[sec.id] === "object" ? s.icf.preset[sec.id] : {};
    s.icf.preset[sec.id] = {
      on: !!cur.on,
      snapshot: (cur.snapshot && typeof cur.snapshot === "object") ? cur.snapshot : null
    };
  }
// SMART goals
s.icf.smartGoals = Array.isArray(s.icf.smartGoals) ? s.icf.smartGoals : [];
const cleaned = [];
for(const g of s.icf.smartGoals){
  if(!g || typeof g !== "object") continue;
  const goal = {
    id: (typeof g.id === "string" && g.id) ? g.id : uid("g"),
    sourceType: (g.sourceType === "icf" || g.sourceType === "custom" || g.sourceType === "free") ? g.sourceType : "free",
    sourceKey: (typeof g.sourceKey === "string") ? g.sourceKey : "",
    code: (typeof g.code === "string") ? g.code : "",
    label: (typeof g.label === "string") ? g.label : "",
    verb: (typeof g.verb === "string" && g.verb) ? g.verb : "eseguire",
    behavior: (typeof g.behavior === "string") ? g.behavior : "",
    conditions: (typeof g.conditions === "string") ? g.conditions : "",
    criterion: (typeof g.criterion === "string") ? g.criterion : "",
    timeframe: (typeof g.timeframe === "string" && g.timeframe) ? g.timeframe : "entro 8 settimane",
    verifyTool: (typeof g.verifyTool === "string") ? g.verifyTool : "griglia",
    responsible: (typeof g.responsible === "string") ? g.responsible : "Team docenti",
    notes: (typeof g.notes === "string") ? g.notes : ""
  };
  cleaned.push(goal);
}
s.icf.smartGoals = cleaned;

s.icf.monitor = s.icf.monitor && typeof s.icf.monitor === "object" ? s.icf.monitor : {};
if(typeof s.icf.monitor.frequency !== "string") s.icf.monitor.frequency = "settimanale";
if(typeof s.icf.monitor.reviewEvery !== "string") s.icf.monitor.reviewEvery = "6-8 settimane";
if(typeof s.icf.monitor.midDate !== "string") s.icf.monitor.midDate = "";
if(typeof s.icf.monitor.annualDate !== "string") s.icf.monitor.annualDate = "";
s.icf.monitor.tools = s.icf.monitor.tools && typeof s.icf.monitor.tools === "object" ? s.icf.monitor.tools : {};
const toolDefaults = Object.fromEntries(VERIFY_TOOLS.map(t => [t.key, false]));
for(const k of Object.keys(toolDefaults)){
  if(typeof s.icf.monitor.tools[k] !== "boolean") s.icf.monitor.tools[k] = toolDefaults[k];
}


  return s;
}

function toast(msg){
  let el = document.getElementById("toast");
  if(!el){
    el = document.createElement("div");
    el.id = "toast";
    el.style.position = "fixed";
    el.style.bottom = "18px";
    el.style.left = "50%";
    el.style.transform = "translateX(-50%)";
    el.style.padding = "10px 12px";
    el.style.borderRadius = "999px";
    el.style.background = "rgba(16,24,39,.95)";
    el.style.border = "1px solid rgba(255,255,255,.12)";
    el.style.color = "rgba(231,237,245,.95)";
    el.style.boxShadow = "0 16px 32px rgba(0,0,0,.35)";
    el.style.fontSize = "13px";
    el.style.zIndex = "999";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = "1";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>{ el.style.opacity = "0"; }, 1800);
}

function storageAvailable(){
  try{
    const x="__pei_planner_test__";
    window.localStorage.setItem(x,x);
    window.localStorage.removeItem(x);
    return true;
  } catch(e){
    return false;
  }
}

function updateSaveStatus(msg){
  const el = document.getElementById("saveStatus");
  if(!el) return;
  el.textContent = msg || "";
}

function saveLocal(){
  // Salvataggio in localStorage (fallback a Export JSON se non disponibile)
  if(!storageAvailable()){
    toast("Storage locale non disponibile: salvo come file JSON.");
    exportJSON();
    updateSaveStatus("Storage locale non disponibile → usa Export JSON.");
    return;
  }
  try{
    state.__lastSavedAt = new Date().toISOString();
    localStorage.setItem(LS_KEY, JSON.stringify(state));
    toast("Salvato in locale ✅");
    const when = new Date(state.__lastSavedAt);
    updateSaveStatus("Ultimo salvataggio locale: " + when.toLocaleString());
  } catch(e){
    console.error(e);
    toast("Impossibile salvare in locale (privacy/quota). Usa Export JSON.");
    updateSaveStatus("Impossibile salvare in locale → usa Export JSON.");
  }
}


function loadLocal(){
  // Caricamento da localStorage (fallback a Import JSON se non disponibile)
  if(!storageAvailable()){
    toast("Storage locale non disponibile: usa Importa JSON.");
    updateSaveStatus("Storage locale non disponibile → usa Importa JSON.");
    const inp = document.getElementById("fileImport");
    if(inp) inp.click();
    return;
  }
  let raw = null;
  try{
    raw = localStorage.getItem(LS_KEY);
  } catch(e){
    console.error(e);
    raw = null;
  }
  if(!raw){
    toast("Nessun salvataggio trovato.");
    updateSaveStatus("Nessun salvataggio locale trovato.");
    return;
  }
  try{
    const data = JSON.parse(raw);
    if(!data || typeof data !== "object"){
      toast("File locale non valido.");
      updateSaveStatus("File locale non valido.");
      return;
    }
    state = normalizeState(data);

    // Ripopola campi UI
    hydrateMetaUI();
    hydrateICFUI();

    // Ridisegna UI dipendenti dallo stato
    renderTable();
    renderNeeds();
    renderFamilyCtx();
    renderSchoolCtx();
    renderICF();
    renderDiagICF();
    renderAllSide();

    const when = state.__lastSavedAt ? new Date(state.__lastSavedAt) : null;
    updateSaveStatus(when ? ("Caricato salvataggio del: " + when.toLocaleString()) : "Caricato salvataggio locale.");
    toast("Caricato ✅");
  } catch(e){
    console.error(e);
    toast("Errore nel caricamento: " + (e && e.message ? e.message : e));
    updateSaveStatus("Errore nel caricamento locale.");
  }
}


function resetAll(){
  state = createDefaultState();
  hydrateMetaUI();
  hydrateICFUI();
  renderTable();
  renderNeeds();
  renderFamilyCtx();
  renderSchoolCtx();
  renderICF();
  renderAllSide();
  toast("Azzerato.");
}

function exportJSON(){
  const out = (typeof structuredClone === "function") ? structuredClone(state) : JSON.parse(JSON.stringify(state));
  out.meta = out.meta || {};
  out.meta.document_preamble = "Documento di progettazione educativa a supporto della redazione del PEI. Non costituisce PEI formale.";
  const blob = new Blob([JSON.stringify(out, null, 2)], {type:"application/json"});
const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);

  const rawName = (state.meta && state.meta.profileName ? state.meta.profileName : "").trim();
  const safe = rawName
    ? rawName.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60)
    : "pei_planner_export";

  a.download = safe + ".json";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("JSON esportato ⬇️");
}




/** =========================
 *  Premessa AI (da inserire nei JSON ponte PEI)
 *  - Versione unificata: Secondaria I grado (A1) / Secondaria II grado (A4)
 *  - Non è "codice eseguibile": sono linee guida strutturate che accompagnano il JSON ponte
 * ========================= */
function buildPremessaAI(ordineRaw){
  const ordine = String(ordineRaw || "").toLowerCase();
  let ordine_scuola = "auto";
  let allegato = "auto";

  // Riconoscimento robusto dell'ordine scolastico.
  // Molti utenti scrivono varianti tipo: "Scuola secondaria di I grado", "I grado", "scuola media".
  const isSecondariaI =
    /\b(i\s*grado|1\s*grado|primo\s*grado)\b/.test(ordine) ||
    /scuola\s+media/.test(ordine) ||
    /secondaria\s*(di\s*)?(i|1)\b/.test(ordine) ||
    /secondaria\s+primo/.test(ordine);

  const isSecondariaII =
    /\b(ii\s*grado|2\s*grado|secondo\s*grado)\b/.test(ordine) ||
    /secondaria\s*(di\s*)?(ii|2)\b/.test(ordine) ||
    /secondaria\s+secondo/.test(ordine);

  if(isSecondariaI){
    ordine_scuola = "secondaria_I_grado";
    allegato = "ALLEGATO_A1";
  } else if(isSecondariaII){
    ordine_scuola = "secondaria_II_grado";
    allegato = "ALLEGATO_A4";
  }

  return {
    scopo: "Istruzioni per elaborare un PEI a partire da questo JSON ponte",
    lingua_output: "it",
    stile_output: "discorsivo didattico-pedagogico (evitare elenchi meccanici quando possibile; usare formulazioni professionali, non cliniche)",
    ordine_scuola,
    allegato_preferito: allegato,
    logica_selezione_modello: {
      se_ordine_scuola: {
        secondaria_I_grado: "ALLEGATO_A1",
        secondaria_II_grado: "ALLEGATO_A4"
      },
      se_valore_auto: "Deduci da meta.ordine se presente; altrimenti dichiara che l'informazione non è disponibile e mantieni struttura generale sezioni."
    },
    regole_generali: [
      "Usare prioritariamente ICF (documentazione + funzionamento osservato clinico/educativo/sociale) e ICD come cornice descrittiva.",
      "Evidenziare bisogni, punti di forza e priorità trasversali con coerenza rispetto alle dimensioni PEI (a/b/c/d).",
      "Non inventare dati mancanti: se una sezione richiede info assenti nel JSON, dichiarare esplicitamente che l'informazione non è disponibile.",
      "Collegare obiettivi, interventi e strategie a esiti osservabili e strumenti concreti.",
      "Evitare duplicazioni: se nel JSON compaiono codici o obiettivi sovrapposti, accorparli in modo coerente e dichiarare l'accorpamento in modo discreto (es. 'area funzioni esecutive')."
    ],
    output_policy: {
      includi_codici_icf: "solo_tra_parentesi_quando_utili",
      evita_ripetizioni_codici: true,
      tono: "professionale, chiaro, orientato alla progettazione"
    },
    // Preferenza d'uso (prompt) per chi rielabora il JSON in una chat/AI.
    // Questo testo viene incluso nel JSON ponte così che, al caricamento,
    // sia chiaro cosa l'utente desidera ottenere.
    richiesta_utente_predefinita: "Voglio il PEI completo, stile discorsivo, tutte le sezioni con particolare attenzione alle sezioni 4 e 5 che voglio molto curate dal punto di vista pedagogico.",
    sezioni_unificate: (ordine_scuola === "secondaria_I_grado" ? {
  "1": {
    titolo: "Quadro informativo",
    istruzioni: "Dati anagrafici scolastici disponibili, contesto familiare e scolastico, riferimenti ad accertamento, PF/DF/PDF (se presenti nel JSON)."
  },
  "2": {
    titolo: "Elementi generali desunti dal Profilo di Funzionamento",
    istruzioni: "Sintesi descrittiva basata su PF; se non disponibile, su DF/PDF. Integrare ICD e ICF (funzionamento e bisogni) senza inventare dati."
  },
  "3": {
    titolo: "Raccordo con il Progetto Individuale (L. 328/2000)",
    istruzioni: [
      "Se il Progetto Individuale è assente, indicare esplicitamente che non è stato redatto.",
      "Se presente, raccordare obiettivi e interventi scolastici con i servizi e le azioni extrascolastiche."
    ]
  },
  "4": {
    titolo: "Osservazioni sull’alunno/a per progettare gli interventi di sostegno didattico",
    istruzioni: [
      "Indicare punti di forza e bisogni osservati.",
      "Organizzare in sottosezioni 4.A–4.D."
    ],
    sottosezioni: {
      "4A": "Dimensione Relazione / Interazione / Socializzazione",
      "4B": "Dimensione Comunicazione / Linguaggio",
      "4C": "Dimensione Autonomia / Orientamento",
      "4D": "Dimensione Cognitiva, Neuropsicologica e dell'Apprendimento"
    }
  },
  "5": {
    titolo: "Interventi per l’alunno/a: obiettivi educativi e didattici, strumenti, strategie e modalità",
    istruzioni: [
      "Compilare per ciascuna dimensione A–D: Obiettivi (con esiti attesi), Interventi/strategie/strumenti, Verifica (metodi/criteri/strumenti).",
      "Limitare gli obiettivi SMART generati automaticamente a massimo 1 per ciascuna dimensione (A–D); l'utente può comunque aggiungerne altri manualmente se necessario."
    ],
    vincoli_smart: { max_per_dimension: 1 }
  },
  "6": {
    titolo: "Osservazioni sul contesto: barriere e facilitatori",
    istruzioni: "Descrivere barriere e facilitatori nel contesto fisico, organizzativo e relazionale, richiamando fattori ambientali ICF (e) e osservazioni in classe."
  },
  "7": {
    titolo: "Interventi sul contesto per realizzare un ambiente di apprendimento inclusivo",
    istruzioni: "Azioni su setting, routine, accessibilità, comunicazione, clima di classe e criteri condivisi, coerenti con quanto emerso nelle sezioni 5 e 6."
  },
  "8": {
    titolo: "Interventi sul percorso curricolare",
    istruzioni: [
      "Articolare in 8.1 (modalità di sostegno e ulteriori interventi), 8.2 (progettazione disciplinare) e 8.4 (comportamento).",
      "Se il percorso (A/B) non è indicato, dichiarare che sarà definito/validato in GLO."
    ],
    sottosezioni: {
      "8_1": "Modalità di sostegno didattico e ulteriori interventi di inclusione",
      "8_2": "Progettazione disciplinare",
      "8_4": "Criteri di valutazione del comportamento ed eventuali obiettivi specifici"
    }
  },
  "9": {
    titolo: "Organizzazione generale del progetto di inclusione e utilizzo delle risorse",
    istruzioni: "Orario, presenze, sostegno, assistenza, risorse e accordi operativi; se mancano dati (ore/figure), indicare 'da definire in sede di GLO'."
  },
  "10": {
    titolo: "Certificazione delle competenze (DM 742/2017)",
    istruzioni: "Compilare solo per alunni/e in uscita dalla classe terza; altrimenti indicare 'non applicabile'."
  },
  "11": {
    titolo: "Verifica finale/Proposte per le risorse professionali e i servizi di supporto necessari",
    istruzioni: "Esiti, efficacia di interventi, aggiornamento delle condizioni di contesto e proposte di risorse per l’a.s. successivo."
  },
  "12": {
    titolo: "PEI provvisorio per l’a.s. successivo",
    istruzioni: "Da compilare a seguito del primo accertamento; se non applicabile, indicare 'non necessario'."
  }
} : {
  "1": {
    titolo: "Quadro informativo",
    istruzioni: "Includere dati anagrafici scolastici disponibili, elementi desunti dalla descrizione di sé dello studente (se presenti) e la situazione familiare (se presente)."
  },
  "2": {
    titolo: "Elementi generali desunti dal Profilo di Funzionamento",
    istruzioni: "Sintesi descrittiva: considerare in particolare le dimensioni su cui prevedere intervento. Usare quadro ICD e soprattutto ICF da documentazione + eventuale funzionamento osservato (clinico + educativo + sociale)."
  },
  "3": {
    titolo: "Raccordo con il Progetto Individuale",
    istruzioni: [
      "Se il Progetto Individuale è assente, indicare esplicitamente che non è ancora stato redatto.",
      "Inserire comunque 'obiettivi ponte' orientati al Progetto di Vita (autonomia sociale, inclusione nel territorio, prospettive extrascolastiche) quando coerenti con i bisogni emersi."
    ]
  },
  "4": {
    titolo: "Osservazioni sullo studente per progettare gli interventi",
    istruzioni: [
      "Integrare informazioni da ICF e note su contesto familiare/relazionale e pregresso se presenti.",
      "Organizzare in sottosezioni 4.A–4.D."
    ],
    sottosezioni: {
      "4A": "Dimensione Relazione / Interazione / Socializzazione",
      "4B": "Dimensione Comunicazione / Linguaggio",
      "4C": "Dimensione Autonomia / Orientamento",
      "4D": "Dimensione Cognitiva, Neuropsicologica e dell'Apprendimento"
    }
  },
  "5": {
    titolo: "Interventi per lo studente (obiettivi, strategie e strumenti)",
    istruzioni: [
      "Strutturare in 4 parti: a, b, c, d coerenti con le dimensioni PEI (relazione; comunicazione; autonomia; cognitivo-apprendimento).",
      "Limitare gli obiettivi SMART generati automaticamente a massimo 1 per ciascuna dimensione (a/b/c/d); lo/a studente e il team possono aggiungerne altri manualmente se necessario.",
      "Per ogni dimensione: presentare obiettivi (con esiti attesi), interventi/strategie/strumenti, e verifica (metodi/criteri/strumenti)."
    ],
    vincoli_smart: {
      max_per_dimension: 1
    }
  },
  "6": {
    titolo: "Osservazioni sul contesto: barriere e facilitatori",
    istruzioni: "Descrivere barriere e facilitatori derivando principalmente da ICF e dalle note contestuali presenti nel JSON (attenzione a clima di classe, rumore, accessibilità materiali, tempi, comunicazione scuola-famiglia)."
  },
  "7": {
    titolo: "Interventi sul contesto per realizzare un ambiente di apprendimento inclusivo",
    istruzioni: "Proporre azioni su setting, routine, comunicazione, strumenti, criteri di valutazione e clima di classe, attingendo soprattutto a ICF (e) e alle barriere rilevate."
  },
  "8": {
    titolo: "Interventi sul percorso curricolare (Percorso A, B o C / Progettazione disciplinare)",
    istruzioni: [
      "Sezione articolata in 8.1 (Modalità di sostegno e progettazione trasversale) e 8.2 (Progettazione disciplinare dei docenti).",
      "In 8.1 inserire metodologie trasversali del sostegno, adattamenti comuni e criteri condivisi; lasciare in 8.2 spazio alla compilazione disciplinare.",
      "Se nel JSON non è specificato il percorso (A/B/C), indicare che sarà definito/validato in sede di GLO."
    ],
    sottosezioni: {
      "8_1": "Modalità di sostegno e progettazione trasversale",
      "8_2": "Progettazione disciplinare"
    }
  },
  "9": {
    titolo: "Percorsi per le Competenze Trasversali e per l'Orientamento (PCTO)",
    istruzioni: [
      "Secondaria di II grado: compilare se pertinente e se ci sono dati; altrimenti indicare 'non disponibile' o 'da definire'."
    ]
  },
  "10": {
    titolo: "Organizzazione generale del progetto di inclusione e utilizzo delle risorse",
    istruzioni: "Rimandare alla compilazione manuale (ruoli, ore, figure, accordi operativi)."
  },
  "11": {
    titolo: "Certificazione delle competenze",
    istruzioni: [
      "Secondaria di II grado: solo se pertinente/previsto.",
      "Se non pertinente o non richiesto: tralasciare."
    ]
  },
  "12": {
    titolo: "Verifica finale del PEI e proposte per l'a.s. successivo",
    istruzioni: "Da compilare manualmente (esiti, proposte, continuità)."
  }
})

  };
}

function buildPEIJsonBridge(s = state){
  // Assicura che l'output sia aggiornato e che esista lo snapshot del piano
  try{ buildPEIHTML(); }catch(e){}
  const snap = (window.__peiLast && typeof window.__peiLast === "object") ? window.__peiLast : {};
  const dDocs = (s && s.docs && typeof s.docs === "object") ? s.docs : {};
  const hasDocDate = (v) => {
    if(v === null || typeof v === "undefined") return false;
    const sVal = String(v).trim();
    return sVal.length > 0;
  };

  
  // Profilo ADA (tabella)
  const profRows = [];
  for(const d of DISABILITA){
    const r = (s.rows && s.rows[d.id]) ? s.rows[d.id] : null;
    if(!r) continue;
    const flags = [];
    for(const k of ["comm","mot","cog","pluri"]){ if(r[k]) flags.push(k); }
    if(r.severity || flags.length){
      profRows.push({
        id: d.id,
        label: d.label,
        severity: r.severity || "",
        severityLabel: r.severity ? (d.severity && d.severity[r.severity] ? d.severity[r.severity] : r.severity) : "",
        flags
      });
    }
  }

  // ICD-10
  ensureIcdState(s);
  const icd = (s.icd && Array.isArray(s.icd.codes)) ? s.icd.codes : [];
  const icdArr = icd.map(c => ({ code: String(c), label: icdTitle(String(c)) || "" }))
                    .sort((a,b)=>a.code.localeCompare(b.code,"it"));

  // ICF DF/PF (qualificatori)
  ensureDfpfState(s);
  const dfpfSel = (s.icf && s.icf.dfpf && s.icf.dfpf.selected && typeof s.icf.dfpf.selected === "object") ? s.icf.dfpf.selected : {};
  const dfpfArr = Object.entries(dfpfSel)
    .map(([code,q]) => ({ code:String(code), qualificatore: Number(q) }))
    .filter(x => Number.isFinite(x.qualificatore))
    .sort((a,b)=>a.code.localeCompare(b.code,"it"))
    .map(x => ({ ...x, label: dfpfTitle(x.code) || "" }));

  // ICF obiettivi selezionati (check)
  const icfObj = getSelectedICFObjectives(); // [{key,code,label}]
  const icfObjArr = (icfObj || []).map(o => ({ key:o.key, code:o.code, label:o.label || "" }));

  // Ambientali (facilitatori/barriere) + override
  const facSel = ICF_FACILITATORS.filter(it => s.icf && s.icf.facilitators && s.icf.facilitators[it.key])
    .map(it => ({ key:it.key, code:it.code, label:it.label }));
  const barSel = ICF_BARRIERS.filter(it => s.icf && s.icf.barriers && s.icf.barriers[it.key])
    .map(it => ({ key:it.key, code:it.code, label:it.label }));

  const oFac = (s.icf && s.icf.overrides && s.icf.overrides.facilitators) ? s.icf.overrides.facilitators : {};
  const oBar = (s.icf && s.icf.overrides && s.icf.overrides.barriers) ? s.icf.overrides.barriers : {};
  const oFacArr = Object.entries(oFac).filter(([k,v])=>!!v).map(([k])=>k).sort();
  const oBarArr = Object.entries(oBar).filter(([k,v])=>!!v).map(([k])=>k).sort();

  // Bisogni trasversali
  const needsArr = NEEDS.filter(n => s.needs && s.needs[n.key]).map(n => ({ key:n.key, label:n.label }));

  // Risorse
  const resArr = RESOURCES.filter(r => s.icf && s.icf.resources && s.icf.resources[r.key]).map(r => ({ key:r.key, label:r.label }));

  // SMART + monitoraggio
  const smartGoals = Array.isArray(s.icf && s.icf.smartGoals) ? s.icf.smartGoals : [];
  const mon = (s.icf && s.icf.monitor) ? s.icf.monitor : {};

  // Sezione 10 (organizzazione inclusione) – testo suggerito, senza inventare ore/figure non presenti
  const sezione10Text = (()=>{
    const freq = (mon && mon.frequency) ? String(mon.frequency).trim() : "";
    const rev  = (mon && mon.reviewEvery) ? String(mon.reviewEvery).trim() : "";
    const hasCollab = Array.isArray(snap.collaboration) && snap.collaboration.length;
    const collabHint = hasCollab ? snap.collaboration.join(" ") : "";
    const resLabels = Array.isArray(resArr) ? resArr.map(r=>r.label).filter(Boolean) : [];
    const resPart = resLabels.length ? ("Le risorse indicate includono: " + resLabels.join(", ") + ". ") : "";
    const monPart = (freq || rev) ? (`È previsto un monitoraggio ${freq || "periodico"} con revisione ${rev || "periodica"} in sede di team/GLO. `) : "È previsto un monitoraggio periodico con revisione in sede di team/GLO. ";
    const familyPart = collabHint ? ("Il raccordo con la famiglia è curato tramite comunicazioni regolari e sostenibili, orientate a micro-obiettivi e alla continuità delle routine. ") : "Il raccordo con la famiglia è curato tramite comunicazioni regolari e sostenibili, orientate alla continuità delle routine. ";
    return (
      "Il progetto di inclusione è realizzato attraverso il lavoro coordinato del team dei docenti, con una progettazione condivisa e coerente tra le discipline e gli interventi di supporto. " +
      resPart +
      "Gli interventi sono integrati nelle attività di classe, privilegiando modalità inclusive e la partecipazione attiva dell’alunna. " +
      monPart +
      familyPart +
      "Eventuali ulteriori risorse professionali e organizzative saranno definite in sede di GLO in base ai bisogni emergenti."
    ).trim();
  })();


  const premessa = buildPremessaAI((s.meta && s.meta.ordine) || "");

  return {
    document_preamble: "Documento di progettazione educativa a supporto della redazione del PEI. Non costituisce PEI formale.",
    _premessa_ai: premessa,
    pei_miur: {
      versione_modello: "DM182_2020",
      allegato: premessa.allegato_preferito || "",
      ordine_scuola: premessa.ordine_scuola || "",
      tipo_pei: ((s.meta && s.meta.tipo_pei) || (s.meta && s.meta.tipoPEI) || "ordinario")
    },
    sezioni_miur: (() => {
      const isI = (premessa.ordine_scuola === "secondaria_I_grado");
      const classeStr = String((s.meta && s.meta.classe) || "").toLowerCase();
      const isTerza = /(^|\b)3(\b|$)|terza/.test(classeStr);

      const sez1 = {
        titolo: "Quadro informativo",
        dati: { meta: (s.meta || {}), contesto: { famiglia: (s.familyCtx||{}), scuola: (s.schoolCtx||{}) } },
        documenti: {
          accertamento_disabilita: {
            presente: hasDocDate(dDocs.accertamentoDate),
            data_rilascio: dDocs.accertamentoDate || "",
            rivedibilita_presente: hasDocDate(dDocs.scadenzaDate),
            rivedibilita_data: dDocs.scadenzaDate || ""
          },
          profilo_funzionamento: {
            presente: hasDocDate(dDocs.pfRedattoDate),
            data_redazione: dDocs.pfRedattoDate || ""
          },
          diagnosi_funzionale: {
            presente: hasDocDate(dDocs.dfDate),
            data_redazione: dDocs.dfDate || ""
          },
          profilo_dinamico_funzionale: {
            presente: hasDocDate(dDocs.pdfDate),
            data_approvazione: dDocs.pdfDate || ""
          },
          progetto_individuale: {
            presente: hasDocDate(dDocs.progettoIndDate),
            data: dDocs.progettoIndDate || ""
          }
        }
      };

      const sez2 = {
        titolo: "Elementi generali desunti dal Profilo di Funzionamento",
        profilo_ada: { righe: (typeof profRows !== 'undefined' ? profRows : []) },
        diagnosi: { icd10: (typeof icdArr !== 'undefined' ? icdArr : []) },
        icf_dfpf: (typeof dfpfArr !== 'undefined' ? dfpfArr : []),
        icf_obiettivi_selezionati: (typeof icfObjArr !== 'undefined' ? icfObjArr : []),
        bisogni_trasversali: (typeof needsArr !== 'undefined' ? needsArr : [])
      };

      const sez3 = {
        titolo: "Raccordo con il Progetto Individuale (L. 328/2000)",
        note: (s.meta && s.meta.raccordo_progetto_individuale) || ""
      };

      const sez4 = {
        titolo: "Osservazioni sull’alunno/a",
        punti_forza: (s.meta && s.meta.puntiForza) || "",
        osservazioni_dimensioni: {
          A: (s.meta && s.meta.osservazioni_4A) || "",
          B: (s.meta && s.meta.osservazioni_4B) || "",
          C: (s.meta && s.meta.osservazioni_4C) || "",
          D: (s.meta && s.meta.osservazioni_4D) || ""
        }
      };

      const sez5 = {
        titolo: "Interventi per l’alunno/a (A–D)",
        obiettivi_annuali: (snap.goalsAnnual || []),
        priorita_breve: (snap.prioritiesShort || []),
        obiettivi_smart: (typeof smartGoals !== 'undefined' ? smartGoals : []),
        metodologie: (snap.methods || []),
        azioni_attivita: (snap.actions || []),
        strumenti_compensativi: (snap.tools || []),
        misure_dispensative: (snap.dispensations || []),
        valutazione_verifica: (snap.assessment || [])
      };

      const sez6 = {
        titolo: "Barriere e facilitatori",
        facilitatori: (typeof facSel !== 'undefined' ? facSel : []),
        barriere: (typeof barSel !== 'undefined' ? barSel : []),
        note: (s.meta && s.meta.note_contesto_6) || ""
      };

      const sez7 = {
        titolo: "Interventi sul contesto",
        setting_accessibilita: (snap.setting || []),
        indicazioni: (s.meta && s.meta.interventi_contesto_7) || ""
      };

      const sez8 = {
        titolo: "Interventi sul percorso curricolare",
        sostegno_8_1: (snap.methods || []),
        progettazione_disciplinare_8_2: { note: (s.meta && s.meta.progettazione_disciplinare) || "", righe: [] },
        comportamento_8_4: { note: (s.meta && s.meta.comportamento) || "" },
        strumenti_compensativi: (snap.tools || []),
        misure_dispensative: (snap.dispensations || []),
        valutazione_verifica: (snap.assessment || [])
      };

      const sez9 = {
        titolo: "Organizzazione generale del progetto di inclusione e utilizzo delle risorse",
        risorse_selezionate: (typeof resArr !== 'undefined' ? resArr : []),
        testo_sintesi: (typeof sezione10Text !== 'undefined' ? sezione10Text : ""),
        orario_settimanale: []
      };

      const sez10 = {
        titolo: "Certificazione delle competenze",
        applicabile: isI ? isTerza : false,
        note: isI ? (isTerza ? "Da compilare per la classe terza." : "Non applicabile (non classe terza).") : ""
      };

      const sez11 = {
        titolo: "Verifica finale / Proposte per l’a.s. successivo",
        monitoraggio: {
          frequenza: (s.icf && s.icf.monitor && s.icf.monitor.frequency) || "",
          revisione_ogni: (s.icf && s.icf.monitor && s.icf.monitor.reviewEvery) || "",
          data_verifica_intermedia: (s.icf && s.icf.monitor && s.icf.monitor.midDate) || "",
          data_verifica_finale: (s.icf && s.icf.monitor && s.icf.monitor.annualDate) || ""
        },
        note: (s.meta && s.meta.verifica_finale_note) || ""
      };

      const sez12 = {
        titolo: "PEI provvisorio per l’a.s. successivo",
        applicabile: !!(s.meta && s.meta.pei_provvisorio_applicabile),
        note: (s.meta && s.meta.pei_provvisorio_note) || ""
      };

      return isI ? {
        "1": sez1,
        "2": sez2,
        "3": sez3,
        "4": sez4,
        "5": sez5,
        "6": sez6,
        "7": sez7,
        "8": sez8,
        "9": sez9,
        "10": sez10,
        "11": sez11,
        "12": sez12
      } : {
        "1": sez1,
        "2": sez2,
        "3": sez3,
        "4": sez4,
        "5": sez5,
        "6": sez6,
        "7": sez7,
        "8": sez8,
        "9": { titolo: "PCTO", applicabile: true, note: "Se pertinente, compilare." },
        "10": sez9,
        "11": sez10,
        "12": sez11
      };
    })(),
    meta: {
  profileName: (s.meta && s.meta.profileName) || "",
  eta: (s.meta && s.meta.eta) || "",
  ordine: (s.meta && s.meta.ordine) || "",
  classe: (s.meta && s.meta.classe) || "",

  // ✅ AGGIUNTE: utili al Quadro Informativo
  famiglia: (s.meta && s.meta.famiglia) || "",
  storico: (s.meta && s.meta.storico) || "",
  puntiForza: (s.meta && s.meta.puntiForza) || ""
},
contesto: {
  famiglia: {
    crit: (s.familyCtx && s.familyCtx.crit) ? s.familyCtx.crit : {},
    pos: (s.familyCtx && s.familyCtx.pos) ? s.familyCtx.pos : {},
    siblings: (s.familyCtx && s.familyCtx.siblings) || "",
    note: (s.familyCtx && s.familyCtx.note) || ""
  },
  scuola: {
    classLabel: (s.schoolCtx && s.schoolCtx.classLabel) || "",
    total: (s.schoolCtx && s.schoolCtx.total) || "",
    male: (s.schoolCtx && s.schoolCtx.male) || "",
    female: (s.schoolCtx && s.schoolCtx.female) || "",
    ada: (s.schoolCtx && s.schoolCtx.ada) || "",
    dsa: (s.schoolCtx && s.schoolCtx.dsa) || "",
    bes: (s.schoolCtx && s.schoolCtx.bes) || "",
    ctx: (s.schoolCtx && s.schoolCtx.ctx) ? s.schoolCtx.ctx : {},
    note: (s.schoolCtx && s.schoolCtx.note) || ""
  }
},

    profilo_ADA: {
      righe: profRows,
      sintesi: []
    },
    diagnosi: {
      icd10: icdArr
    },
    icf_documentazione_dfpf: dfpfArr,
    icf_obiettivi_selezionati: icfObjArr,
    ambientali_icf: {
      facilitatori: facSel,
      barriere: barSel,
      override: {
        facilitatori: oFacArr,
        barriere: oBarArr
      }
    },
    bisogni_trasversali: needsArr,
    risorse: resArr,
    sezione8_1_modalita_sostegno: {
  testo: sezione10Text,
  fonte: "auto",
  note: "Testo generato automaticamente come premessa alla Sezione 8.2 (progettazione disciplinare): integrare/validare in sede di GLO."
},
sezione10_organizzazione: {
  testo: 'Sezione da compilare manualmente in sede di GLO (ruoli, ore, figure professionali, accordi operativi e utilizzo delle risorse).',
  fonte: "placeholder",
  note: "Compilazione manuale richiesta."
},


    progetto_operativo: {
      priorita_brevi: snap.prioritiesShort || [],
      obiettivi_annuali: snap.goalsAnnual || [],
      azioni_attivita: snap.actions || [],
      metodologie: snap.methods || [],
      setting_accessibilita: snap.setting || [],
      strumenti_compensativi: snap.tools || [],
      misure_dispensative: snap.dispensations || [],
      valutazione_verifica: snap.assessment || [],
      collaborazione: snap.collaboration || []
    },
    smart: {
      obiettivi: smartGoals,
      monitoraggio: {
        frequenza: mon.frequency || "",
        reviewEvery: mon.reviewEvery || "",
        midDate: mon.midDate || "",
        annualDate: mon.annualDate || ""
      }
    }
  };
}

function exportPEIJSON(){
  const data = buildPEIJsonBridge(state);
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);

  const rawName = (state.meta && state.meta.profileName ? state.meta.profileName : "").trim();
  const safe = rawName
    ? rawName.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60)
    : "pei_planner_ponte";

  a.download = safe + "_PEI_PONTE.json";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("PEI JSON ponte esportato ⬇️");
}

/** =========================
 *  Import: supporta sia lo stato interno dell'app sia il JSON ponte (PEI_PONTE)
 *  ========================= */
function isBridgeJson(obj){
  return !!(obj && typeof obj === "object" && obj._premessa_ai && obj.sezioni_miur && obj.meta && obj.profilo_ADA);
}

function bridgeToState(b){
  const s = createDefaultState();
  if(!b || typeof b !== "object") return s;

  // Meta (stringhe)
  const m = (b.meta && typeof b.meta === "object") ? b.meta : {};
  for(const k of Object.keys(s.meta)){
    if(typeof m[k] === "string") s.meta[k] = m[k];
  }
  // Tipo PEI / ordine, se presenti
  if(b.pei_miur && typeof b.pei_miur === "object"){
    if(typeof b.pei_miur.tipo_pei === "string") s.meta.tipo_pei = b.pei_miur.tipo_pei;
    if(typeof b.pei_miur.ordine_scuola === "string" && !s.meta.ordine){
      s.meta.ordine = b.pei_miur.ordine_scuola;
    }
  }

  // Contesti
  const cx = (b.contesto && typeof b.contesto === "object") ? b.contesto : {};
  if(cx.famiglia && typeof cx.famiglia === "object"){
    const f = cx.famiglia;
    if(f.crit && typeof f.crit === "object") s.familyCtx.crit = { ...s.familyCtx.crit, ...f.crit };
    if(f.pos && typeof f.pos === "object") s.familyCtx.pos = { ...s.familyCtx.pos, ...f.pos };
    if(typeof f.siblings === "string") s.familyCtx.siblings = f.siblings;
    if(typeof f.note === "string") s.familyCtx.note = f.note;
  }
  if(cx.scuola && typeof cx.scuola === "object"){
    const sc = cx.scuola;
    for(const k of ["classLabel","total","male","female","ada","dsa","bes","note"]){
      if(typeof sc[k] === "string") s.schoolCtx[k] = sc[k];
    }
    if(sc.ctx && typeof sc.ctx === "object") s.schoolCtx.ctx = { ...s.schoolCtx.ctx, ...sc.ctx };
  }

  // Profilo ADA -> righe tabella disabilità
  const ada = (b.profilo_ADA && typeof b.profilo_ADA === "object") ? b.profilo_ADA : {};
  const righe = Array.isArray(ada.righe) ? ada.righe : [];
  for(const row of righe){
    if(!row || typeof row !== "object") continue;
    const id = String(row.id || "");
    if(!s.rows[id]) continue;
    const sev = String(row.severity || "");
    if(sev === "lieve" || sev === "media" || sev === "grave") s.rows[id].severity = sev;
    const flags = Array.isArray(row.flags) ? row.flags : [];
    for(const fk of ["comm","mot","cog","pluri"]) s.rows[id][fk] = flags.includes(fk);
  }

  // ICD-10
  const diag = (b.diagnosi && typeof b.diagnosi === "object") ? b.diagnosi : {};
  const icdArr = Array.isArray(diag.icd10) ? diag.icd10 : [];
  s.icd.codes = icdArr.map(x => String((x && x.code) || "")).filter(Boolean);

  // DF/PF ICF qualificatori
  const dfpf = Array.isArray(b.icf_documentazione_dfpf) ? b.icf_documentazione_dfpf : [];
  s.icf.dfpf.selected = {};
  for(const it of dfpf){
    const code = String((it && it.code) || "");
    const q = Number(it && it.qualificatore);
    if(code && Number.isFinite(q)) s.icf.dfpf.selected[code] = q;
  }

  // ICF obiettivi selezionati
  const objArr = Array.isArray(b.icf_obiettivi_selezionati) ? b.icf_obiettivi_selezionati : [];
  for(const it of objArr){
    const key = String((it && it.key) || "");
    if(key && (key in s.icf.objectives)) s.icf.objectives[key] = true;
  }

  // Ambientali
  const env = (b.ambientali_icf && typeof b.ambientali_icf === "object") ? b.ambientali_icf : {};
  const fac = Array.isArray(env.facilitatori) ? env.facilitatori : [];
  const bar = Array.isArray(env.barriere) ? env.barriere : [];
  for(const it of fac){
    const key = String((it && it.key) || "");
    if(key && (key in s.icf.facilitators)) s.icf.facilitators[key] = true;
  }
  for(const it of bar){
    const key = String((it && it.key) || "");
    if(key && (key in s.icf.barriers)) s.icf.barriers[key] = true;
  }
  // Override (se presenti come array di key)
  if(env.override && typeof env.override === "object"){
    const of = Array.isArray(env.override.facilitatori) ? env.override.facilitatori : [];
    const ob = Array.isArray(env.override.barriere) ? env.override.barriere : [];
    for(const k of of){ if(k in s.icf.overrides.facilitators) s.icf.overrides.facilitators[k] = true; }
    for(const k of ob){ if(k in s.icf.overrides.barriers) s.icf.overrides.barriers[k] = true; }
  }

  // Bisogni trasversali
  const needs = Array.isArray(b.bisogni_trasversali) ? b.bisogni_trasversali : [];
  for(const it of needs){
    const k = String((it && it.key) || "");
    if(k && (k in s.needs)) s.needs[k] = true;
  }

  // Risorse
  const res = Array.isArray(b.risorse) ? b.risorse : [];
  for(const it of res){
    const k = String((it && it.key) || "");
    if(k && (k in s.icf.resources)) s.icf.resources[k] = true;
  }

  // SMART
  if(b.smart && typeof b.smart === "object"){
    if(Array.isArray(b.smart.obiettivi)) s.icf.smartGoals = b.smart.obiettivi;
    if(b.smart.monitoraggio && typeof b.smart.monitoraggio === "object"){
      const mm = b.smart.monitoraggio;
      s.icf.monitor.frequency = String(mm.frequenza || s.icf.monitor.frequency || "");
      s.icf.monitor.reviewEvery = String(mm.reviewEvery || s.icf.monitor.reviewEvery || "");
      s.icf.monitor.midDate = String(mm.midDate || "");
      s.icf.monitor.annualDate = String(mm.annualDate || "");
    }
  }

  return s;
}


function importJSON(file){
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const data = JSON.parse(String(reader.result || ""));
      if(data && typeof data === "object"){
        const raw = isBridgeJson(data) ? bridgeToState(data) : data;
        state = normalizeState(raw);
        hydrateMetaUI();
        hydrateICFUI();
        renderTable();
        renderFamilyCtx();
        renderSchoolCtx();
        renderNeeds();
        renderICF();
        ensureIcdState();
        renderICD();
        ensureDfpfState();
        renderDiagICF();
        renderAllSide();
        toast("Import completato ✅");
      } else toast("JSON non valido.");
    } catch(e){
      toast("Errore: JSON non leggibile.");
    }
  };
  reader.readAsText(file);
}

function copyOutputRich(){
  const html = buildPEIHTML();
  const plain = htmlToPlainText(getPEIHTMLDocument());

  const tryRich = () => {
    if(navigator.clipboard && window.ClipboardItem){
      const item = new ClipboardItem({
        "text/html": new Blob([html], {type:"text/html"}),
        "text/plain": new Blob([plain], {type:"text/plain"})
      });
      return navigator.clipboard.write([item]).then(() => {
        toast("Copiato (formattato) 📋");
      });
    }
    return Promise.reject(new Error("Rich copy not supported"));
  };

  return tryRich().catch(() => {
    const out = document.getElementById("output");
    const range = document.createRange();
    range.selectNodeContents(out);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    try{
      document.execCommand("copy");
      toast("Copiato 📋");
    } catch(e){
      toast("Copia non supportata in questo browser.");
    }
    sel.removeAllRanges();
  });
}


function exportDocx(){
  if(!window.htmlDocx || typeof window.htmlDocx.asBlob !== "function"){
    toast("Libreria DOCX non disponibile (serve online o file locale)."
    );
    return;
  }
  const html = getPEIHTMLDocument();
  const blob = window.htmlDocx.asBlob(html);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "Scheda_sintesi_PEI.docx";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("DOCX esportato 🟦");
}

function runTests(){
  const results = [];
  const assert = (name, cond) => {
    if(!cond) throw new Error("Test failed: " + name);
    results.push("✅ " + name);
  };

  // Test: la variante NoSmart esiste e non richiama renderSmart (evita perdita focus durante digitazione)
  assert("renderAllSideNoSmart esiste", typeof renderAllSideNoSmart === "function");
  assert("renderAllSideNoSmart non richiama renderSmart", !renderAllSideNoSmart.toString().includes("renderSmart"));

  assert("splitToBullets: vuoto", Array.isArray(splitToBullets("")) && splitToBullets("").length === 0);
  assert("splitToBullets: singola riga", splitToBullets("ciao").length === 1 && splitToBullets("ciao")[0] === "ciao");
  {
    // IMPORTANT: nessun newline reale dentro stringhe con doppi apici.
    const r = splitToBullets("a\n\n b\n c ");
    assert("splitToBullets: multiline", r.length === 3 && r[0] === "a" && r[1] === "b" && r[2] === "c");
  }

  {
    const plain = htmlToPlainText("<div><p>Uno</p><p>Due</p></div>");
    assert("htmlToPlainText: contiene testo", plain.includes("Uno") && plain.includes("Due"));
  }

  {
    const html = buildPEIHTML();
    assert("buildPEIHTML: genera stringa", typeof html === "string" && html.length > 20);
  }

  {
    const s = createDefaultState();
    s.needs.lettura = true;
    applyRecommendedSection("S4", s);
    assert("Preset S4: seleziona d166", s.icf.objectives.d166 === true);
    assert("Preset S4: seleziona e130", s.icf.facilitators.e130 === true);
  }
  {
    const s = createDefaultState();
    s.meta.eta = "13";
    s.meta.classe = "critico";
    applyRecommendedSection("S1", s);
    assert("Preset S1 (classe critica): seleziona d720", s.icf.objectives.d720 === true);
  }

  {
    const s = createDefaultState();
    s.rows.vista.severity = "grave";
    const rec = getRecommendedForSection("S2", s);
    assert("Vista grave -> S2 include d320", rec.objectives.includes("d320"));
    assert("Vista grave -> S2 include d172c", rec.objectives.includes("d172c"));
  }
  {
    const s = createDefaultState();
    s.rows.fisica.severity = "grave";
    const rec = getRecommendedForSection("S3", s);
    assert("Fisica grave -> S3 include d450", rec.objectives.includes("d450"));
    assert("Fisica grave -> S3 include d460", rec.objectives.includes("d460"));
    assert("Fisica grave -> S3 include e150", rec.facilitators.includes("e150"));
  }
  {
    const s = createDefaultState();
    s.rows.udito.severity = "grave";
    const rec = getRecommendedForSection("S2", s);
    assert("Udito grave -> S2 include e250", rec.facilitators.includes("e250"));
  }


  {
    const s = createDefaultState();
    ensureDfpfState(s);
    s.icf.dfpf.selected = { "b140": 3, "d160": 2 };
    const rec = getRecommendedForSection("S4", s);
    assert("DF/PF b140 -> S4 include b140", rec.objectives.includes("b140"));
    assert("DF/PF d160 -> S4 include d160", rec.objectives.includes("d160"));
  }

  {
    const older = { meta:{}, rows:{}, needs:{}, icf:{ objectives:{}, facilitators:{}, barriers:{}, resources:{}, preset:{}, smartGoals:[], monitor:{} }, familyCtx:{}, schoolCtx:{} };
    const n = normalizeState(older);
    assert("normalizeState: DF/PF presente", !!(n.icf && n.icf.dfpf && typeof n.icf.dfpf.selected === "object"));
  }
{
  const prev = state;
  state = createDefaultState();
  state.icd.codes = ["F84.0", "F90.0"];
  const html = buildPEIHTML();
  assert("buildPEIHTML: include ICD-10", html.includes("ICD-10") && html.includes("F84.0"));
  state = prev;
}




{
  const prev = state;
  state = createDefaultState();
  state.icf.objectives.d160 = true;
  const added = syncSmartGoalsFromSelections();
  assert("SMART sync: aggiunge almeno 1", added >= 1);
  assert("SMART sync: crea goal icf", state.icf.smartGoals.some(g => g.sourceType === "icf" && g.sourceKey === "d160"));
  state = prev;
}
  {
    const prev = state;
    state = createDefaultState();
    state.needs.lettura = true;
    state.icf.objectives.d160 = true;

    const r1 = toggleRecommendedSection("S4");
    assert("Toggle S4: ON", r1.on === true && state.icf.preset.S4.on === true);
    assert("Toggle S4: seleziona d166", state.icf.objectives.d166 === true);
    assert("Toggle S4: seleziona e130", state.icf.facilitators.e130 === true);

    const r2 = toggleRecommendedSection("S4");
    assert("Toggle S4: OFF", r2.on === false && state.icf.preset.S4.on === false);
    assert("Toggle S4: ripristina d166", state.icf.objectives.d166 === false);
    assert("Toggle S4: mantiene preesistente d160", state.icf.objectives.d160 === true);
    assert("Toggle S4: ripristina e130", state.icf.facilitators.e130 === false);

    state = prev;
  }

  
  {
    const s = createDefaultState();
    s.schoolCtx.ctx.rumoreAffollamento = true;
    s.schoolCtx.ctx.cambiFrequenti = true;
    const env = deriveEnvFromContext(s);
    assert("deriveEnvFromContext: rumore -> e250b", env.barriers.includes("e250b"));
    assert("deriveEnvFromContext: cambi -> e580b", env.barriers.includes("e580b"));
    autoApplyEnvFromContext(s);
    assert("autoApplyEnvFromContext: setta barriera e250b", s.icf.barriers.e250b === true);
  }
  {
    const s = createDefaultState();
    s.schoolCtx.ctx.rumoreAffollamento = true;
    s.icf.overrides.barriers.e250b = true; // utente ha toccato
    s.icf.barriers.e250b = false;
    autoApplyEnvFromContext(s);
    assert("autoApplyEnvFromContext: rispetta override", s.icf.barriers.e250b === false);
  }
assert("storageAvailable: boolean", typeof storageAvailable() === "boolean");
  assert("saveLocal: definita", typeof saveLocal === "function");
  assert("loadLocal: definita", typeof loadLocal === "function");
  assert("updateSaveStatus: definita", typeof updateSaveStatus === "function");

  const show = new URLSearchParams(location.search).has("tests");
  if(show){
    const box = document.getElementById("testbox");
    box.classList.add("show");
    box.innerHTML = `<b>Test OK</b><br>${results.map(textEscape).join("<br>")}`;
  }
}

function init(){
  renderTable();
  renderDocs();
  renderNeeds();
  renderFamilyCtx();
  renderSchoolCtx();
  renderICF();
  ensureIcdState();
  renderICD();

  // Documentazione (atti/date)
  const bindDocDate = (id, key) => {
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener("change", () => {
      ensureDocs();
      state.docs[key] = el.value || "";
      renderDocs();
      renderOutput();
      saveLocal();
    });
  };

  bindDocDate("accertamentoDate", "accertamentoDate");
  bindDocDate("scadenzaDate", "scadenzaDate");
  bindDocDate("pfRedattoDate", "pfRedattoDate");
  bindDocDate("dfDate", "dfDate");
  bindDocDate("pdfDate", "pdfDate");

  bindDocDate("progettoIndDate", "progettoIndDate");

  ensureDfpfState();
  renderDiagICF();
  bindMeta();

  // DF/PF ICF UI bindings
  const diagSearch = document.getElementById("diagIcfSearch");
  const diagCat = document.getElementById("diagIcfCat");
  const diagOnly = document.getElementById("diagIcfOnlySel");
  const btnDiagClear = document.getElementById("btnDiagIcfClear");
  const btnDiagReset = document.getElementById("btnDiagIcfReset");

  if(diagSearch) diagSearch.addEventListener("input", renderDiagICF);
  if(diagCat) diagCat.addEventListener("change", renderDiagICF);
  if(diagOnly) diagOnly.addEventListener("change", renderDiagICF);

  if(btnDiagClear) btnDiagClear.addEventListener("click", () => {
    if(diagSearch) diagSearch.value = "";
    if(diagOnly) diagOnly.checked = false;
    renderDiagICF();
  });

  bindICD();
  bindMethods();

  if(btnDiagReset) btnDiagReset.addEventListener("click", () => {
    ensureDfpfState();
    state.icf.dfpf.selected = {};
    renderDiagICF();
    renderAllSide();
    toast("ICF DF/PF azzerati.");
  });

  renderAllSide();
  bindMonitor();

  document.getElementById("btnSmartSync").addEventListener("click", () => {
    const added = syncSmartGoalsFromSelections();
    renderSmart();
    renderAllSide();
    toast(added ? ("SMART creati: " + added) : "SMART aggiornati");
  });
  document.getElementById("btnSmartAddFree").addEventListener("click", () => {
    addFreeSmartGoal();
    renderSmart();
    renderAllSide();
    toast("Obiettivo SMART aggiunto");
  });

  document.getElementById("btnGenerate").addEventListener("click", () => {
    renderAllSide();
    toast("PEI aggiornato ⚙️");
  });
  document.getElementById("btnCopy").addEventListener("click", copyOutputRich);
  document.getElementById("btnDocx").addEventListener("click", exportDocx);

  document.getElementById("btnSave").addEventListener("click", saveLocal);
  document.getElementById("btnLoad").addEventListener("click", loadLocal);
  document.getElementById("btnReset").addEventListener("click", resetAll);

  // Help mode (tooltips)
  initHelpMode();

  document.getElementById("btnExport").addEventListener("click", exportJSON);
  document.getElementById("btnExportPEI").addEventListener("click", exportPEIJSON);
  document.getElementById("btnImport").addEventListener("click", () => {
    document.getElementById("fileImport").click();
  });
  document.getElementById("fileImport").addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if(f) importJSON(f);
    e.target.value = "";
  });

  runTests();
}

/* =========================
 *  Help mode (tooltips)
 *  ========================= */
function initHelpMode(){
  const btn = document.getElementById("btnHelpMode");
  if(!btn) return;

  // Map of concise explanations: you can extend it freely.
  const HELP = {
    tableMount: {
      title: "Tabella profilo",
      body: "Seleziona gravità e compromissioni: queste scelte guidano la compilazione automatica delle sezioni ICF e la bozza di PEI (aree di funzionamento, bisogni e priorità)."
    },
    icdCard: {
      title: "ICD-10",
      body: "Aggiunge codici diagnostici (se presenti nella documentazione): vengono riportati nel quadro iniziale (profilo di sintesi) come riferimento, senza cambiare da soli gli obiettivi didattici."
    },
    btnGenerate: {
      title: "Aggiorna PEI",
      body: "Rigenera l'output (bozza) in base a tabella profilo, contesto e obiettivi selezionati. Non invia dati: aggiorna solo il testo a destra."
    },
    btnSave: {
      title: "Salva (local)",
      body: "Salva nel browser (storage locale) le selezioni e i campi compilati, per riprendere il lavoro anche offline."
    },
    btnLoad: {
      title: "Carica (local)",
      body: "Ricarica dal browser l'ultimo salvataggio locale, ripristinando selezioni e campi."
    },
    btnReset: {
      title: "Azzera selezioni",
      body: "Ripulisce profilo, contesto e obiettivi selezionati. Utile quando inizi un nuovo caso o vuoi ripartire da zero."
    },
    profileName: {
      title: "Nome profilo",
      body: "Etichetta interna per riconoscere i file/salvataggi. Evita dati identificativi reali (nome, diagnosi completa)."
    },
    eta: {
      title: "Età",
      body: "Serve a tarare il linguaggio e alcuni suggerimenti (es. autonomia, socialità, didattica) nella bozza di output."
    },
    ordine: {
      title: "Ordine/grado",
      body: "Influenza l'impostazione didattica proposta (metodologie, strumenti e contesto) e alcune formulazioni nell'output."
    },
    output: {
      title: "Output",
      body: "Qui compare la bozza generata. Puoi copiarla o esportarla: controlla e adatta sempre con il GLO e i documenti ufficiali."
    }
  };

  // Attach help text as data-help attributes (so it works also for dynamic tooltips)
  Object.keys(HELP).forEach((id) => {
    const el = document.getElementById(id);
    if(!el) return;
    const t = HELP[id];
    el.dataset.helpTitle = t.title;
    el.dataset.help = t.body;
  });

  // Auto-help: copre *tutti* i controlli dell'index (input/select/textarea/button e container principali).
  // Se un elemento non è presente nella mappa HELP, genera un tooltip leggendo la label associata o il testo del bottone.
  const ACTION_FALLBACK = {
    btnIcdAdd: "Aggiunge il codice ICD selezionato alla lista; il codice verrà riportato nel quadro iniziale (profilo di sintesi).",
    btnIcdReset: "Svuota la lista ICD selezionata; rimuove i riferimenti ICD dall'output.",
    btnDiagIcfClear: "Pulisce ricerca e filtri della lista ICF DF/PF.",
    btnDiagIcfReset: "Azzera tutte le selezioni ICF DF/PF (riparti da zero).",
    btnIcfClear: "Pulisce la ricerca degli obiettivi ICF e mostra di nuovo l'elenco completo.",
    btnMethodAdd: "Aggiunge la metodologia scelta alla lista; confluisce nella Strategie educative e metodologiche nell'output.",
    btnMethodsAuto: "Ripristina i suggerimenti automatici di metodologie coerenti con il profilo/ICF.",
    btnMethodsClear: "Azzera la selezione delle metodologie (imposta override per evitare riattivazioni automatiche).",
    btnSmartSync: "Crea/Aggiorna obiettivi SMART partendo dagli obiettivi ICF selezionati; influisce su Obiettivi operativi verificabili e monitoraggio nell'output.",
    btnSmartAddFree: "Aggiunge un obiettivo SMART non collegato direttamente agli ICF selezionati.",
    btnCopy: "Copia l'output formattato negli appunti per incollarlo nel PEI.",
    btnDocx: "Esporta l'output in DOCX (richiede la libreria html-docx).",
    btnExport: "Esporta le selezioni e i campi in JSON per backup/condivisione.",
    btnExportPEI: "Esporta un JSON 'ponte' (struttura utile per integrazioni/import in altri strumenti).",
    btnImport: "Importa un file JSON esportato in precedenza, ripristinando lo stato del progetto."
  };

  function _guessHelpTitle(el){
    const id = el.id || "";
    // 1) label[for=id]
    const lab = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
    if(lab) return lab.textContent.trim().replace(/\s+/g," ");
    // 2) dentro una .row: prima label
    const row = el.closest(".row");
    const lab2 = row ? row.querySelector("label") : null;
    if(lab2) return lab2.textContent.trim().replace(/\s+/g," ");
    // 3) button text
    if(el.tagName === "BUTTON") return el.textContent.trim().replace(/\s+/g," ") || id || "Azione";
    // 4) fallback
    return id || "Campo";
  }

  function _guessHelpBody(el){
    const id = el.id || "";
    // fallback specifico per bottoni/azioni note
    if(id && ACTION_FALLBACK[id]) return ACTION_FALLBACK[id];

    const tag = el.tagName;
    if(tag === "BUTTON"){
      return "Esegue un'azione dell'app. Se la modalità spiegazioni è attiva, passa sopra il bottone per capire come incide su stato, salvataggi ed output.";
    }
    if(tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA"){
      const kind = (tag === "INPUT" ? (el.getAttribute("type") || "input") : tag.toLowerCase());
      return `Campo (${kind}) usato per costruire la bozza di output e/o per salvare/esportare lo stato. Compilalo in modo sintetico e verificabile.`;
    }
    // container / mount
    return "Area interattiva: le selezioni qui effettuate contribuiscono alla generazione dell'output e vengono salvate/esportate insieme al profilo.";
  }

  // Scansiona tutti gli elementi con id nell'index e, se non hanno già data-help, assegnalo.
  // Nota: manteniamo le spiegazioni già definite in HELP come prioritarie.
  document.querySelectorAll("[id]").forEach((el) => {
    // Evita di sovrascrivere testi già presenti
    if(el.dataset && el.dataset.help) return;

    // Copri solo elementi utili (controlli o container principali)
    const isControl = ["INPUT","SELECT","TEXTAREA","BUTTON"].includes(el.tagName);
    const isMount = /Mount$/.test(el.id) || /(Card|List|Count|Search|Chips|kpis|output|testbox|storico)/i.test(el.id);
    if(!isControl && !isMount) return;

    el.dataset.helpTitle = _guessHelpTitle(el);
    el.dataset.help = _guessHelpBody(el);
  });

  // Also cover some containers that are created/filled dynamically
  const table = document.getElementById("tableMount");
  if(table && !table.dataset.help){
    table.dataset.helpTitle = HELP.tableMount.title;
    table.dataset.help = HELP.tableMount.body;
  }

  // Tooltip element
  const tip = document.createElement("div");
  tip.className = "helpTooltip";
  tip.setAttribute("role","tooltip");
  tip.innerHTML = '<div class="tTitle" id="helpTipTitle"></div><div class="tBody" id="helpTipBody"></div>';
  document.body.appendChild(tip);

  let enabled = false;
  let lastTarget = null;

  const setEnabled = (on) => {
    enabled = !!on;
    document.body.classList.toggle("helpMode", enabled);
    btn.classList.toggle("isOn", enabled);
    btn.setAttribute("aria-pressed", enabled ? "true" : "false");

    // Prevent native browser tooltips from fighting ours
    const titled = document.querySelectorAll("[title]");
    titled.forEach((el) => {
      if(enabled){
        if(!el.dataset._title && el.getAttribute("title")){
          el.dataset._title = el.getAttribute("title");
          el.removeAttribute("title");
        }
      }else{
        if(el.dataset._title){
          el.setAttribute("title", el.dataset._title);
          delete el.dataset._title;
        }
      }
    });

    if(!enabled){
      tip.classList.remove("on");
      lastTarget = null;
    }
  };

  const getHelpFromTarget = (target) => {
    if(!target) return null;
    const el = target.closest("[data-help], [data-help-title], [title]");
    if(!el) return null;
    const body = el.dataset.help || el.getAttribute("title") || "";
    if(!body) return null;
    const title = el.dataset.helpTitle || el.getAttribute("aria-label") || "Spiegazione";
    return { el, title, body };
  };

  const show = (help, x, y) => {
    if(!help) return;
    document.getElementById("helpTipTitle").textContent = help.title;
    document.getElementById("helpTipBody").textContent = help.body;
    // position with a small offset and keep inside viewport
    const pad = 12;
    tip.style.left = (x + 14) + "px";
    tip.style.top  = (y + 14) + "px";
    tip.classList.add("on");

    // clamp after content is painted
    requestAnimationFrame(() => {
      const r = tip.getBoundingClientRect();
      let nx = x + 14;
      let ny = y + 14;
      if(nx + r.width > window.innerWidth - pad) nx = window.innerWidth - pad - r.width;
      if(ny + r.height > window.innerHeight - pad) ny = window.innerHeight - pad - r.height;
      tip.style.left = Math.max(pad, nx) + "px";
      tip.style.top  = Math.max(pad, ny) + "px";
    });
  };

  // Toggle button
  btn.addEventListener("click", () => setEnabled(!enabled));

  // Event delegation: hover + move
  document.addEventListener("mousemove", (e) => {
    if(!enabled || !lastTarget) return;
    const help = getHelpFromTarget(lastTarget);
    if(!help) return;
    show(help, e.clientX, e.clientY);
  }, { passive:true });

  document.addEventListener("mouseover", (e) => {
    if(!enabled) return;
    const help = getHelpFromTarget(e.target);
    if(!help) return;
    lastTarget = help.el;
    show(help, e.clientX, e.clientY);
  });

  document.addEventListener("mouseout", (e) => {
    if(!enabled) return;
    if(!lastTarget) return;
    if(e.relatedTarget && lastTarget.contains(e.relatedTarget)) return;
    tip.classList.remove("on");
    lastTarget = null;
  });

  // Keyboard escape
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && enabled) setEnabled(false);
  });
}

init();

/* =========================
 *  Offline caching (Service Worker)
 *  ========================= */
(function registerServiceWorker(){
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
  });
})();

function ensureDocs(){ if(!state.docs) state.docs={}; }
