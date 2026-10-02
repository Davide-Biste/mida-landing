// Translation dictionaries for the landing page.
// `it` is the source of truth for the shape; `en` must match it (typeof it).

export const locales = ["it", "en", "es"] as const;
export type Locale = (typeof locales)[number];

// Fallback for browsers whose language isn't one we ship.
// English is the broader international default — flip to "it" to prefer Italian.
export const defaultLocale: Locale = "en";

// Native names shown in the language menu, keyed by locale.
export const localeNames: Record<Locale, string> = {
  it: "Italiano",
  en: "English",
  es: "Español",
};

type RoadmapState = "done" | "now" | "next" | "later";
type RoadmapItem = {
  title: string;
  desc: string;
  wide?: boolean;
  note?: string;
  noteLabel?: string;
  chips?: string[];
  chipsLabel?: string;
  chipsMore?: string;
};
type RoadmapPhase = { state: RoadmapState; status: string; when?: string; items: RoadmapItem[] };

const it = {
  metadata: {
    title: "Mida — La finanza personale, davvero tua",
    description:
      "L'app di finanza personale gratuita per iPhone. Portafogli, carte, budget, ricorrenze e proiezioni. E i tuoi dati restano sul tuo dispositivo.",
  },
  nav: {
    features: "Funzioni",
    privacy: "Privacy",
    roadmap: "Roadmap",
    support: "Supporto",
    download: "Beta",
    backToTop: "Torna su",
  },
  hero: {
    badge: "In arrivo · beta privata",
    titleTop: "Finanza personale.",
    titleEm: "Davvero tua.",
    lede: "Conti, carte, budget, ricorrenze e proiezioni in un'unica app per iPhone. Veloce da usare, bella da guardare. E i tuoi dati non lasciano mai il telefono.",
    ctaPrimary: "Presto disponibile",
    ctaSecondary: "Scopri come funziona",
    chips: [
      { top: "Patrimonio", value: "€ 25.304", tone: "pos" },
      { top: "Ti devono", value: "€ 143", tone: "neutral" },
      { top: "Budget spesa", value: "82%", tone: "neutral" },
    ],
  },
  overview: {
    title: ["I tuoi risparmi.", "Sotto controllo."],
  },
  stats: [
    { value: 100, suffix: "%", label: "Sul tuo dispositivo" },
    { value: 0, suffix: "", label: "Account richiesti" },
    { value: 36, suffix: "", label: "Mesi di proiezioni" },
    { value: 4, suffix: "", label: "Palette di colori" },
  ],
  multi: {
    eyebrow: "Più portafogli",
    title: ["Tutti i tuoi risparmi.", "In una sola schermata."],
    body: "Conto corrente, contanti, carte di debito e prepagate, conto deposito, crypto, buoni pasto: crea tutti i portafogli che vuoi. Patrimonio totale, andamento degli ultimi mesi e i conti chiusi archiviati, senza perderne lo storico.",
    cta: "Scarica per iPhone",
  },
  cards: {
    eyebrow: "Carte di credito",
    title: ["Le carte di credito.", "Si saldano da sole."],
    body: "Imposta giorno di chiusura, giorno di addebito e conto collegato: le spese si accumulano come debito e l'estratto viene saldato in automatico alla scadenza. Sai sempre quanto devi e quando ti verrà addebitato.",
  },
  transfer: {
    eyebrow: "Trasferimenti",
    title: ["Sposta denaro.", "In due tap."],
    body: "Importo, conto di partenza, conto di arrivo: confermi ed è fatta. Mida impara i trasferimenti che fai più spesso e te li ripropone: un tocco su «Ripeti» e il giroconto è registrato.",
  },
  kpi: {
    eyebrow: "Statistiche",
    title: ["I numeri", "che contano."],
    body: "Entrate, uscite, tasso di risparmio, spesa media al giorno. Filtra per portafoglio, categoria o importo, confronta con il periodo precedente e apri i grafici da qualsiasi conto, categoria o budget.",
  },
  budget: {
    eyebrow: "Budget",
    title: ["Tetti di spesa.", "Sempre sotto controllo."],
    body: "Budget settimanali, mensili o su misura per ogni categoria. Mida ti avvisa quando ti avvicini al limite, riporta l'avanzo al periodo successivo e stima come chiuderai il mese.",
  },
  add: {
    eyebrow: "Aggiungi al volo",
    title: ["Una spesa.", "Due secondi."],
    body: "Un tastierino che fa anche i conti (+ e −), le categorie che usi di più sempre in prima fila, spesa o entrata in un tocco. Oppure fotografa lo scontrino con l'AI Scan e lascia che l'importo lo compili Mida.",
  },
  autopay: {
    eyebrow: "Pagamenti automatici",
    title: ["Paghi con Apple Pay.", "Mida se lo ricorda."],
    body: "Dopo ogni pagamento con Apple Pay ricevi un avviso con importo ed esercente: un tocco e la spesa è registrata, già compilata. Mida impara da sola categoria e portafoglio di ogni negozio e carta. Tutto sul tuo iPhone, senza collegarti alla banca.",
  },
  projection: {
    eyebrow: "Proiezioni",
    title: ["Il tuo saldo.", "Fra un anno."],
    body: "Mida unisce ricorrenze, budget e il tuo storico per stimare il saldo fino a 36 mesi, mese per mese. Scegli un criterio prudente o realistico e scopri subito se resterai sempre in positivo.",
  },
  recurring: {
    eyebrow: "Ricorrenze",
    title: ["Stipendio e bollette.", "Si registrano da soli."],
    body: "Settimanali, mensili o annuali: le ricorrenze si applicano in automatico, oppure ti chiedono conferma quando l'importo cambia, come per le bollette. Una notifica ti avvisa, anche ad app chiusa.",
  },
  widgets: {
    eyebrow: "Widget",
    title: ["Il tuo budget.", "Già nella Home."],
    body: "Quanto puoi spendere oggi, come arrivi a fine mese e cosa c'è da confermare, direttamente sulla schermata Home dell'iPhone. Il calcolo tiene già conto delle bollette in arrivo, e le ricorrenze si confermano con un tocco, senza aprire l'app.",
  },
  importCsv: {
    eyebrow: "Importa dalla banca",
    title: ["Il tuo storico.", "In un attimo."],
    body: "Carica il CSV esportato da Revolut, Fineco, Intesa Sanpaolo o da qualsiasi altra banca: Mida riconosce le colonne, suggerisce le categorie e salta i movimenti che hai già registrato. Il saldo resta com'è, a meno che tu non voglia aggiornarlo.",
  },
  more: {
    eyebrow: "E non finisce qui",
    title: "Ogni dettaglio, al suo posto.",
    items: [
      { title: "Spese condivise", desc: "Dividi il conto con gli amici e tieni traccia di chi deve ancora restituirti i soldi." },
      { title: "Mappa delle spese", desc: "Ogni transazione può avere un luogo: rivivi i tuoi viaggi, spesa per spesa." },
      { title: "Notifiche utili", desc: "Budget quasi esaurito, ricorrenze applicate, bollette da confermare. Niente spam." },
      { title: "Anche al buio", desc: "Tema scuro curato quanto quello chiaro, automatico con il sistema." },
    ],
  },
  features: {
    eyebrow: "E poi c'è tutto il resto",
    title: "Pensata nei dettagli.",
    cards: [
      {
        title: "AI Scan",
        desc: "Fotografa lo scontrino: il testo viene letto sul telefono con Apple Vision. La foto non va da nessuna parte.",
      },
      {
        title: "Carte di ogni tipo",
        desc: "Credito, debito e prepagate. Le carte di credito accumulano il debito e si saldano da sole alla scadenza.",
      },
      {
        title: "Face ID",
        desc: "Blocca l'app con Face ID o Touch ID e nascondi gli importi con un tocco quando sei in pubblico.",
      },
      {
        title: "Loghi dei marchi",
        desc: "Negozi e abbonamenti si riconoscono al volo grazie al logo, accanto alla transazione.",
      },
      {
        title: "Categorie su misura",
        desc: "Categorie e sottocategorie con emoji e colori, ordinate da sole in base a quanto le usi.",
      },
      {
        title: "Multi-valuta",
        desc: "Scegli la tua valuta, con interfaccia in italiano e inglese. Tutto calcolato sul dispositivo.",
      },
    ],
  },
  palette: {
    eyebrow: "Aspetto",
    title: "Vestita come piace a te.",
    lede: "Quattro famiglie di colori, ognuna con cinque tonalità. Tema chiaro o scuro: cambi tutto in un tocco.",
    tiles: [
      { name: "Energia", desc: "Corallo, ciliegia, magenta" },
      { name: "Calma", desc: "Glicine, iris e rosa tenui" },
      { name: "Natura", desc: "Verdi profondi e salvia" },
      { name: "Notte", desc: "Blu, indaco e oceano" },
    ],
  },
  privacy: {
    eyebrow: "Privacy, ma per davvero",
    title: ["I tuoi dati.", "Sul tuo telefono.", "Punto."],
    body: "Mida non ha server, non chiede account e non traccia nulla. Tutto resta sul tuo iPhone: quando disinstalli l'app, i dati spariscono con lei.",
    pills: [
      "Nessun account",
      "Funziona offline",
      "Dati sul dispositivo",
    ],
    link: "Leggi l'informativa completa",
  },
  roadmap: {
    eyebrow: "Roadmap",
    title: "Dove sta andando Mida.",
    lede: "Cosa è già uscito, cosa è sul banco di lavoro e cosa arriva dopo.",
    phases: [
      {
        state: "done",
        status: "Rilasciato",
        when: "v1.1",
        items: [
          { title: "Pagamenti Apple Pay automatici", desc: "Paghi con l'iPhone e la spesa si registra da sola, con il luogo in cui l'hai fatta." },
        ],
      },
      {
        state: "done",
        status: "Rilasciato",
        when: "v1.2",
        items: [
          { title: "Widget, import CSV e nuove schermate", desc: "Widget per la Home, import ed export degli estratti conto e schermate di modifica ridisegnate." },
        ],
      },
      {
        state: "now",
        status: "In sviluppo",
        items: [
          {
            title: "Portafogli d'investimento",
            desc: "Azioni, ETF e cripto accanto ai tuoi conti, per vedere tutto il patrimonio in un posto solo.",
            wide: true,
            noteLabel: "Perché non in tempo reale",
            note: "Per aggiornare le quotazioni Mida dovrebbe parlare con servizi esterni. Non lo fa, per scelta: l'app non comunica con nessuno, così cosa possiedi resta solo tra te e il tuo telefono.",
          },
          { title: "Backup su iCloud", desc: "Una copia dei tuoi dati nel tuo iCloud privato, da ripristinare quando cambi iPhone. Mida non ha server: non vede nulla." },
          { title: "Mida in spagnolo", desc: "Dopo italiano e inglese, l'app parla anche spagnolo." },
        ],
      },
      {
        state: "next",
        status: "Prossimamente",
        items: [
          { title: "Modalità viaggio", desc: "Le spese del viaggio si raggruppano da sole, in valuta locale, con il totale sempre sotto controllo." },
          { title: "Live Activity", desc: "Il totale del viaggio o il budget del giorno sempre visibili nella Dynamic Island." },
          {
            title: "Più banche nell'import",
            desc: "Altri estratti conto riconosciuti al volo, senza dover sistemare le colonne a mano.",
            wide: true,
            chipsLabel: "Banche già supportate",
            chips: ["Revolut", "Fineco", "Intesa Sanpaolo"],
            chipsMore: "+ la tua banca",
          },
          { title: "Regole automatiche", desc: "Mida riconosce il negozio e assegna la categoria giusta a ogni movimento importato." },
        ],
      },
      {
        state: "later",
        status: "Più avanti",
        items: [
          { title: "Apple Watch", desc: "Il budget del giorno al polso e una spesa aggiunta in due tocchi." },
          { title: "Siri e Comandi rapidi", desc: "\u201CEhi Siri, aggiungi 12 euro di pranzo.\u201D E la spesa è registrata." },
          { title: "Il tuo anno in Mida", desc: "Un riepilogo annuale da sfogliare e condividere: dove sono andati i soldi, mese per mese." },
          { title: "Prestiti e mutuo", desc: "Rate, interessi e piano di ammortamento: quanto hai pagato e quanto manca." },
          { title: "Obiettivi di risparmio", desc: "Metti da parte per un viaggio o un acquisto e guarda la barra riempirsi." },
        ],
      },
    ] as RoadmapPhase[],
    donate: {
      status: "Poi?",
      title: "Il prossimo passo lo scegli tu.",
      body: "Mida è gratis, senza pubblicità e senza abbonamenti. Le donazioni sostengono lo sviluppo e decidono le priorità: cosa sale nella lista e quali banche aggiungere all'import.",
      cta: "Offrimi un caffè",
      soon: "Donazioni presto disponibili",
      fine: "Facoltative, ora e sempre.",
    },
  },
  free: {
    price: "€ 4,99 / mese",
    title: "Gratis. Per sempre.",
    lede: "Nessun abbonamento, nessuna versione premium, nessuna funzione bloccata. Mida è ancora in beta: il download arriverà a breve.",
    ctaStore: "Presto su App Store",
    ctaCoffee: "Offrimi un caffè",
  },
  footer: {
    brand: "© 2026 Mida · Fatto con ☕ in Italia",
    links: {
      privacy: "Privacy",
      terms: "Termini",
      support: "Supporto",
      tip: "Offrimi un caffè",
      store: "App Store",
    },
  },
  alts: {
    widgets: "Widget di Mida nella schermata Home dell'iPhone",
    importCsv: "Anteprima dell'importazione di un estratto conto CSV in Mida",
    autopay: "Pagamenti Apple Pay da registrare nella Home di Mida",
    walletsHero: "Schermata dei portafogli di Mida",
    cards: "Schermata delle carte di credito di Mida",
    home: "Schermata Home di Mida",
    budgetsHero: "Schermata dei budget di Mida",
    transfer: "Schermata dei trasferimenti di Mida",
    charts: "Schermata delle statistiche di Mida",
    add: "Schermata per aggiungere una transazione su Mida",
    projection: "Schermata delle proiezioni del saldo di Mida",
    recurring: "Schermata delle ricorrenze di Mida",
    split: "Schermata delle spese condivise di Mida",
    map: "Mappa delle spese di Mida",
    notifications: "Schermata delle notifiche di Mida",
    dark: "Mida con il tema scuro",
    paletteEnergia: "Mida con la palette Energia",
    paletteCalma: "Mida con la palette Calma",
    paletteNatura: "Mida con la palette Natura",
    paletteNotte: "Mida con la palette Notte",
  },
};

const en: typeof it = {
  metadata: {
    title: "Mida — Personal finance, truly yours",
    description:
      "The free personal-finance app for iPhone. Wallets, cards, budgets, recurring payments and projections. And your data stays on your device.",
  },
  nav: {
    features: "Features",
    privacy: "Privacy",
    roadmap: "Roadmap",
    support: "Support",
    download: "Beta",
    backToTop: "Back to top",
  },
  hero: {
    badge: "Coming soon · private beta",
    titleTop: "Personal finance.",
    titleEm: "Truly yours.",
    lede: "Accounts, cards, budgets, recurring payments and projections in a single iPhone app. Quick to use, lovely to look at. And your data never leaves your phone.",
    ctaPrimary: "Coming soon",
    ctaSecondary: "See how it works",
    chips: [
      { top: "Net worth", value: "€25,304", tone: "pos" },
      { top: "Owed to you", value: "€143", tone: "neutral" },
      { top: "Groceries budget", value: "82%", tone: "neutral" },
    ],
  },
  overview: {
    title: ["Your money.", "Under control."],
  },
  stats: [
    { value: 100, suffix: "%", label: "On your device" },
    { value: 0, suffix: "", label: "Accounts required" },
    { value: 36, suffix: "", label: "Months of projections" },
    { value: 4, suffix: "", label: "Colour palettes" },
  ],
  multi: {
    eyebrow: "Multiple wallets",
    title: ["All your money.", "On a single screen."],
    body: "Current account, cash, debit and prepaid cards, savings, crypto, meal vouchers: create as many wallets as you like. See your total net worth and how it's trending, and archive closed accounts without losing their history.",
    cta: "Download for iPhone",
  },
  cards: {
    eyebrow: "Credit cards",
    title: ["Credit cards.", "That settle themselves."],
    body: "Set the closing day, the payment day and the linked account: expenses build up as debt and the statement is paid off automatically on its due date. Always know how much you owe and when it'll be charged.",
  },
  transfer: {
    eyebrow: "Transfers",
    title: ["Move money.", "In two taps."],
    body: "Amount, from, to: confirm and you're done. Mida learns the transfers you make most often and suggests them again: one tap on “Repeat” and it's logged.",
  },
  kpi: {
    eyebrow: "Stats",
    title: ["The numbers", "that matter."],
    body: "Income, expenses, savings rate, average daily spend. Filter by wallet, category or amount, compare with the previous period, and open the charts from any account, category or budget.",
  },
  budget: {
    eyebrow: "Budgets",
    title: ["Spending caps.", "Always in check."],
    body: "Weekly, monthly or custom budgets for each category. We warn you as you near the limit, roll any leftover into the next period and project how you'll close the month.",
  },
  add: {
    eyebrow: "Add in a flash",
    title: ["One expense.", "Two seconds."],
    body: "A keypad that does the maths too (+ and −), your most-used categories always up front, expense or income in a single tap. Or snap the receipt with AI Scan and let Mida fill in the amount.",
  },
  autopay: {
    eyebrow: "Automatic payments",
    title: ["Pay with Apple Pay.", "Mida remembers."],
    body: "After every Apple Pay payment you get a reminder with the amount and merchant: one tap and the expense is logged, already filled in. Mida learns the category and wallet for every shop and card on its own. All on your iPhone, with no bank connection.",
  },
  projection: {
    eyebrow: "Projections",
    title: ["Your balance.", "A year from now."],
    body: "Mida combines recurring payments, budgets and your history to project your balance up to 36 months ahead, month by month. Pick a cautious or realistic approach and see right away whether you'll stay in the black.",
  },
  recurring: {
    eyebrow: "Recurring",
    title: ["Salary and bills.", "They log themselves."],
    body: "Weekly, monthly or yearly: recurring payments apply automatically, or ask for a quick confirmation when the amount changes, like utility bills. A notification lets you know, even with the app closed.",
  },
  widgets: {
    eyebrow: "Widgets",
    title: ["Your budget.", "Right on your Home Screen."],
    body: "How much you can spend today, where you'll land at month end and what's waiting for confirmation, right on your iPhone Home Screen. Upcoming bills are already factored in, and recurring payments can be confirmed with a tap, without opening the app.",
  },
  importCsv: {
    eyebrow: "Bank import",
    title: ["Your history.", "In a moment."],
    body: "Upload the CSV exported from Revolut, Fineco, Intesa Sanpaolo or any other bank: Mida recognizes the columns, suggests categories and skips transactions you've already logged. Your balance stays as it is, unless you want it updated.",
  },
  more: {
    eyebrow: "And there's more",
    title: "Every detail, in its place.",
    items: [
      { title: "Shared expenses", desc: "Split the bill with friends and keep track of who still owes you." },
      { title: "Spending map", desc: "Any transaction can have a place: relive your trips, expense by expense." },
      { title: "Useful notifications", desc: "Budget nearly spent, recurring payments applied, bills to confirm. No spam." },
      { title: "Lights off", desc: "A dark theme crafted as carefully as the light one, following your system." },
    ],
  },
  features: {
    eyebrow: "And then there's the rest",
    title: "Designed down to the detail.",
    cards: [
      {
        title: "AI Scan",
        desc: "Snap the receipt: the text is read on your phone with Apple Vision. The photo goes nowhere.",
      },
      {
        title: "Every kind of card",
        desc: "Credit, debit and prepaid. Credit cards build up the balance and settle themselves on the due date.",
      },
      {
        title: "Face ID",
        desc: "Lock the app with Face ID or Touch ID, and hide amounts with one tap when you're out and about.",
      },
      {
        title: "Brand logos",
        desc: "Shops and subscriptions are recognisable at a glance, with their logo next to the transaction.",
      },
      {
        title: "Your categories",
        desc: "Categories and subcategories with emoji and colours, sorted automatically by how often you use them.",
      },
      {
        title: "Multi-currency",
        desc: "Pick your currency, with an interface in Italian and English. Everything computed on-device.",
      },
    ],
  },
  palette: {
    eyebrow: "Looks",
    title: "Dressed the way you like.",
    lede: "Four colour families, each with five shades, plus a light or dark theme. Switch it all with one tap.",
    tiles: [
      { name: "Energy", desc: "Coral, cherry, magenta" },
      { name: "Calm", desc: "Soft wisteria, iris and rose" },
      { name: "Nature", desc: "Deep greens and sage" },
      { name: "Night", desc: "Blue, indigo and ocean" },
    ],
  },
  privacy: {
    eyebrow: "Privacy, for real",
    title: ["Your data.", "On your phone.", "Full stop."],
    body: "Mida has no servers, asks for no account and tracks nothing. Everything stays on your iPhone: when you delete the app, your data goes with it.",
    pills: [
      "No account",
      "Works offline",
      "On-device data",
    ],
    link: "Read the full privacy policy",
  },
  roadmap: {
    eyebrow: "Roadmap",
    title: "Where Mida is heading.",
    lede: "What's already out, what's on the workbench and what comes next.",
    phases: [
      {
        state: "done",
        status: "Shipped",
        when: "v1.1",
        items: [
          { title: "Automatic Apple Pay logging", desc: "Pay with your iPhone and the expense logs itself, along with where you made it." },
        ],
      },
      {
        state: "done",
        status: "Shipped",
        when: "v1.2",
        items: [
          { title: "Widgets, CSV import and new screens", desc: "Home Screen widgets, bank statement import and export, and redesigned edit screens." },
        ],
      },
      {
        state: "now",
        status: "In progress",
        items: [
          {
            title: "Investment portfolios",
            desc: "Stocks, ETFs and crypto next to your accounts, so your whole net worth lives in one place.",
            wide: true,
            noteLabel: "Why not real time",
            note: "Live prices would mean Mida talking to outside services. It doesn't, on purpose: the app talks to no one, so what you own stays between you and your phone.",
          },
          { title: "iCloud backup", desc: "A copy of your data in your private iCloud, ready to restore on a new iPhone. Mida has no servers: it sees nothing." },
          { title: "Mida in Spanish", desc: "After Italian and English, the app speaks Spanish too." },
        ],
      },
      {
        state: "next",
        status: "Up next",
        items: [
          { title: "Travel mode", desc: "Trip expenses group themselves, in the local currency, with the running total always in view." },
          { title: "Live Activities", desc: "Your trip total or today's budget, always visible in the Dynamic Island." },
          {
            title: "More banks for import",
            desc: "More bank statements recognised on the spot, with no columns to fix by hand.",
            wide: true,
            chipsLabel: "Banks already supported",
            chips: ["Revolut", "Fineco", "Intesa Sanpaolo"],
            chipsMore: "+ your bank",
          },
          { title: "Automatic rules", desc: "Mida recognises the merchant and files every imported transaction under the right category." },
        ],
      },
      {
        state: "later",
        status: "Later",
        items: [
          { title: "Apple Watch", desc: "Today's budget on your wrist, and an expense added in two taps." },
          { title: "Siri and Shortcuts", desc: "\u201CHey Siri, add 12 euros for lunch.\u201D Done." },
          { title: "Your year in Mida", desc: "A yearly recap to flip through and share: where the money went, month by month." },
          { title: "Loans and mortgages", desc: "Instalments, interest and the full schedule: what you've paid and what's left." },
          { title: "Savings goals", desc: "Put money aside for a trip or a purchase and watch the bar fill up." },
        ],
      },
    ] as RoadmapPhase[],
    donate: {
      status: "Then?",
      title: "You pick the next step.",
      body: "Mida is free, with no ads and no subscriptions. Donations fund development and set the priorities: what moves up the list and which banks get added to import.",
      cta: "Buy me a coffee",
      soon: "Donations coming soon",
      fine: "Optional, now and always.",
    },
  },
  free: {
    price: "€4.99 / month",
    title: "Free. Forever.",
    lede: "No subscription, no premium tier, no locked features. Mida is still in beta: the download is coming soon.",
    ctaStore: "Coming soon on the App Store",
    ctaCoffee: "Buy me a coffee",
  },
  footer: {
    brand: "© 2026 Mida · Made with ☕ in Italy",
    links: {
      privacy: "Privacy",
      terms: "Terms",
      support: "Support",
      tip: "Buy me a coffee",
      store: "App Store",
    },
  },
  alts: {
    widgets: "Mida widgets on the iPhone Home Screen",
    importCsv: "Preview of a CSV bank statement import in Mida",
    autopay: "Apple Pay payments waiting to be logged on the Mida Home screen",
    walletsHero: "Mida wallets screen",
    cards: "Mida credit cards screen",
    home: "Mida home screen",
    budgetsHero: "Mida budgets screen",
    transfer: "Mida transfers screen",
    charts: "Mida stats screen",
    add: "Mida add-transaction screen",
    projection: "Mida balance projection screen",
    recurring: "Mida recurring payments screen",
    split: "Mida shared expenses screen",
    map: "Mida spending map",
    notifications: "Mida notifications screen",
    dark: "Mida in dark mode",
    paletteEnergia: "Mida in the Energy palette",
    paletteCalma: "Mida in the Calm palette",
    paletteNatura: "Mida in the Nature palette",
    paletteNotte: "Mida in the Night palette",
  },
};

const es: typeof it = {
  metadata: {
    title: "Mida — Tus finanzas personales, de verdad tuyas",
    description:
      "La app gratuita de finanzas personales para iPhone. Carteras, tarjetas, presupuestos, recurrentes y proyecciones. Y tus datos se quedan en tu dispositivo.",
  },
  nav: {
    features: "Funciones",
    privacy: "Privacidad",
    roadmap: "Roadmap",
    support: "Soporte",
    download: "Beta",
    backToTop: "Volver arriba",
  },
  hero: {
    badge: "Próximamente · beta privada",
    titleTop: "Finanzas personales.",
    titleEm: "De verdad tuyas.",
    lede: "Cuentas, tarjetas, presupuestos, pagos recurrentes y proyecciones en una sola app para iPhone. Rápida de usar, bonita de ver. Y tus datos nunca salen de tu teléfono.",
    ctaPrimary: "Próximamente",
    ctaSecondary: "Descubre cómo funciona",
    chips: [
      { top: "Patrimonio", value: "€25.304", tone: "pos" },
      { top: "Te deben", value: "€143", tone: "neutral" },
      { top: "Presupuesto compra", value: "82%", tone: "neutral" },
    ],
  },
  overview: {
    title: ["Tu dinero.", "Bajo control."],
  },
  stats: [
    { value: 100, suffix: "%", label: "En tu dispositivo" },
    { value: 0, suffix: "", label: "Cuentas necesarias" },
    { value: 36, suffix: "", label: "Meses de proyecciones" },
    { value: 4, suffix: "", label: "Paletas de colores" },
  ],
  multi: {
    eyebrow: "Varias carteras",
    title: ["Todo tu dinero.", "En una sola pantalla."],
    body: "Cuenta corriente, efectivo, tarjetas de débito y prepago, ahorro, cripto, vales de comida: crea todas las carteras que quieras. Consulta tu patrimonio total y su evolución, y archiva las cuentas cerradas sin perder su historial.",
    cta: "Descargar para iPhone",
  },
  cards: {
    eyebrow: "Tarjetas de crédito",
    title: ["Las tarjetas de crédito.", "Se liquidan solas."],
    body: "Configura el día de cierre, el día de cargo y la cuenta vinculada: los gastos se acumulan como deuda y el extracto se liquida automáticamente en su vencimiento. Siempre sabes cuánto debes y cuándo se te cobrará.",
  },
  transfer: {
    eyebrow: "Transferencias",
    title: ["Mueve dinero.", "En dos toques."],
    body: "Importe, origen, destino: confirmas y listo. Mida aprende las transferencias que haces más a menudo y te las propone: un toque en «Repetir» y queda registrada.",
  },
  kpi: {
    eyebrow: "Estadísticas",
    title: ["Los números", "que importan."],
    body: "Ingresos, gastos, tasa de ahorro, gasto medio diario. Filtra por cartera, categoría o importe, compara con el periodo anterior y abre los gráficos desde cualquier cuenta, categoría o presupuesto.",
  },
  budget: {
    eyebrow: "Presupuestos",
    title: ["Límites de gasto.", "Siempre bajo control."],
    body: "Presupuestos semanales, mensuales o a medida para cada categoría. Te avisamos cuando te acercas al límite, trasladamos lo que sobra al periodo siguiente y estimamos cómo cerrarás el mes.",
  },
  add: {
    eyebrow: "Añade al vuelo",
    title: ["Un gasto.", "Dos segundos."],
    body: "Un teclado que también hace cuentas (+ y −), tus categorías más usadas siempre delante, gasto o ingreso en un toque. O fotografía el ticket con AI Scan y deja que Mida rellene el importe.",
  },
  autopay: {
    eyebrow: "Pagos automáticos",
    title: ["Pagas con Apple Pay.", "Mida lo recuerda."],
    body: "Después de cada pago con Apple Pay recibes un aviso con el importe y el comercio: un toque y el gasto queda registrado, ya completado. Mida aprende sola la categoría y la cartera de cada tienda y tarjeta. Todo en tu iPhone, sin conectarte al banco.",
  },
  projection: {
    eyebrow: "Proyecciones",
    title: ["Tu saldo.", "Dentro de un año."],
    body: "Mida combina pagos recurrentes, presupuestos y tu historial para estimar tu saldo hasta 36 meses, mes a mes. Elige un enfoque prudente o realista y descubre enseguida si seguirás en positivo.",
  },
  recurring: {
    eyebrow: "Recurrentes",
    title: ["Nómina y facturas.", "Se registran solas."],
    body: "Semanales, mensuales o anuales: los pagos recurrentes se aplican solos, o te piden confirmación cuando el importe cambia, como las facturas. Una notificación te avisa, incluso con la app cerrada.",
  },
  widgets: {
    eyebrow: "Widgets",
    title: ["Tu presupuesto.", "En la pantalla de inicio."],
    body: "Cuánto puedes gastar hoy, cómo llegarás a fin de mes y qué falta por confirmar, directamente en la pantalla de inicio del iPhone. Las facturas próximas ya están incluidas, y los pagos recurrentes se confirman con un toque, sin abrir la app.",
  },
  importCsv: {
    eyebrow: "Importa desde el banco",
    title: ["Tu historial.", "En un momento."],
    body: "Sube el CSV exportado de Revolut, Fineco, Intesa Sanpaolo o de cualquier otro banco: Mida reconoce las columnas, sugiere las categorías y omite los movimientos que ya registraste. El saldo no cambia, a menos que quieras actualizarlo.",
  },
  more: {
    eyebrow: "Y aún hay más",
    title: "Cada detalle, en su sitio.",
    items: [
      { title: "Gastos compartidos", desc: "Divide la cuenta con amigos y lleva el control de quién todavía te debe." },
      { title: "Mapa de gastos", desc: "Cada transacción puede tener un lugar: revive tus viajes, gasto a gasto." },
      { title: "Avisos útiles", desc: "Presupuesto casi agotado, recurrentes aplicados, facturas por confirmar. Sin spam." },
      { title: "También a oscuras", desc: "Un tema oscuro tan cuidado como el claro, automático con el sistema." },
    ],
  },
  features: {
    eyebrow: "Y además, todo lo demás",
    title: "Pensada hasta el detalle.",
    cards: [
      {
        title: "AI Scan",
        desc: "Fotografía el ticket: el texto se lee en tu teléfono con Apple Vision. La foto no va a ninguna parte.",
      },
      {
        title: "Todo tipo de tarjetas",
        desc: "Crédito, débito y prepago. Las tarjetas de crédito acumulan la deuda y se liquidan solas al vencimiento.",
      },
      {
        title: "Face ID",
        desc: "Bloquea la app con Face ID o Touch ID y oculta los importes con un toque cuando estés en público.",
      },
      {
        title: "Logos de marcas",
        desc: "Tiendas y suscripciones se reconocen al instante gracias al logo junto a la transacción.",
      },
      {
        title: "Categorías a medida",
        desc: "Categorías y subcategorías con emoji y colores, ordenadas solas según cuánto las usas.",
      },
      {
        title: "Multidivisa",
        desc: "Elige tu divisa, con interfaz en italiano e inglés. Todo calculado en el dispositivo.",
      },
    ],
  },
  palette: {
    eyebrow: "Aspecto",
    title: "Vestida a tu gusto.",
    lede: "Cuatro familias de colores, cada una con cinco tonos, además de tema claro u oscuro. Lo cambias todo con un toque.",
    tiles: [
      { name: "Energía", desc: "Coral, cereza, magenta" },
      { name: "Calma", desc: "Glicina, iris y rosa suaves" },
      { name: "Naturaleza", desc: "Verdes profundos y salvia" },
      { name: "Noche", desc: "Azul, índigo y océano" },
    ],
  },
  privacy: {
    eyebrow: "Privacidad, de verdad",
    title: ["Tus datos.", "En tu teléfono.", "Punto."],
    body: "Mida no tiene servidores, no pide cuenta y no rastrea nada. Todo se queda en tu iPhone: cuando eliminas la app, tus datos se van con ella.",
    pills: [
      "Sin cuenta",
      "Funciona sin conexión",
      "Datos en el dispositivo",
    ],
    link: "Lee la política de privacidad completa",
  },
  roadmap: {
    eyebrow: "Roadmap",
    title: "Hacia dónde va Mida.",
    lede: "Lo que ya ha salido, lo que está en el taller y lo que viene después.",
    phases: [
      {
        state: "done",
        status: "Publicado",
        when: "v1.1",
        items: [
          { title: "Pagos con Apple Pay automáticos", desc: "Pagas con el iPhone y el gasto se registra solo, con el lugar donde lo hiciste." },
        ],
      },
      {
        state: "done",
        status: "Publicado",
        when: "v1.2",
        items: [
          { title: "Widgets, importación CSV y nuevas pantallas", desc: "Widgets para la pantalla de inicio, importación y exportación de extractos y pantallas de edición rediseñadas." },
        ],
      },
      {
        state: "now",
        status: "En desarrollo",
        items: [
          {
            title: "Carteras de inversión",
            desc: "Acciones, ETF y cripto junto a tus cuentas, para ver todo tu patrimonio en un solo lugar.",
            wide: true,
            noteLabel: "Por qué no en tiempo real",
            note: "Actualizar las cotizaciones obligaría a Mida a hablar con servicios externos. No lo hace, a propósito: la app no se comunica con nadie, así lo que tienes queda entre tú y tu teléfono.",
          },
          { title: "Copia en iCloud", desc: "Una copia de tus datos en tu iCloud privado, lista para restaurar en un iPhone nuevo. Mida no tiene servidores: no ve nada." },
          { title: "Mida en español", desc: "Después del italiano y el inglés, la app también habla español." },
        ],
      },
      {
        state: "next",
        status: "Próximamente",
        items: [
          { title: "Modo viaje", desc: "Los gastos del viaje se agrupan solos, en la moneda local, con el total siempre a la vista." },
          { title: "Live Activities", desc: "El total del viaje o el presupuesto del día, siempre visibles en la Dynamic Island." },
          {
            title: "Más bancos para importar",
            desc: "Más extractos bancarios reconocidos al instante, sin arreglar columnas a mano.",
            wide: true,
            chipsLabel: "Bancos ya compatibles",
            chips: ["Revolut", "Fineco", "Intesa Sanpaolo"],
            chipsMore: "+ tu banco",
          },
          { title: "Reglas automáticas", desc: "Mida reconoce el comercio y asigna la categoría correcta a cada movimiento importado." },
        ],
      },
      {
        state: "later",
        status: "Más adelante",
        items: [
          { title: "Apple Watch", desc: "El presupuesto del día en tu muñeca y un gasto añadido en dos toques." },
          { title: "Siri y Atajos", desc: "\u201COye Siri, añade 12 euros de comida.\u201D Y listo." },
          { title: "Tu año en Mida", desc: "Un resumen anual para hojear y compartir: adónde fue el dinero, mes a mes." },
          { title: "Préstamos e hipoteca", desc: "Cuotas, intereses y cuadro de amortización: lo que has pagado y lo que falta." },
          { title: "Metas de ahorro", desc: "Aparta dinero para un viaje o una compra y mira cómo se llena la barra." },
        ],
      },
    ] as RoadmapPhase[],
    donate: {
      status: "¿Y luego?",
      title: "El siguiente paso lo eliges tú.",
      body: "Mida es gratis, sin anuncios y sin suscripciones. Las donaciones financian el desarrollo y marcan las prioridades: qué sube en la lista y qué bancos añadir a la importación.",
      cta: "Invítame a un café",
      soon: "Donaciones muy pronto",
      fine: "Opcionales, ahora y siempre.",
    },
  },
  free: {
    price: "€4,99 / mes",
    title: "Gratis. Para siempre.",
    lede: "Sin suscripción, sin versión premium, sin funciones bloqueadas. Mida sigue en beta: la descarga llegará muy pronto.",
    ctaStore: "Próximamente en la App Store",
    ctaCoffee: "Invítame a un café",
  },
  footer: {
    brand: "© 2026 Mida · Hecho con ☕ en Italia",
    links: {
      privacy: "Privacidad",
      terms: "Términos",
      support: "Soporte",
      tip: "Invítame a un café",
      store: "App Store",
    },
  },
  alts: {
    widgets: "Widgets de Mida en la pantalla de inicio del iPhone",
    importCsv: "Vista previa de la importación de un extracto CSV en Mida",
    autopay: "Pagos de Apple Pay pendientes de registrar en la pantalla de inicio de Mida",
    walletsHero: "Pantalla de carteras de Mida",
    cards: "Pantalla de tarjetas de crédito de Mida",
    home: "Pantalla de inicio de Mida",
    budgetsHero: "Pantalla de presupuestos de Mida",
    transfer: "Pantalla de transferencias de Mida",
    charts: "Pantalla de estadísticas de Mida",
    add: "Pantalla para añadir una transacción en Mida",
    projection: "Pantalla de proyección del saldo de Mida",
    recurring: "Pantalla de pagos recurrentes de Mida",
    split: "Pantalla de gastos compartidos de Mida",
    map: "Mapa de gastos de Mida",
    notifications: "Pantalla de notificaciones de Mida",
    dark: "Mida con el tema oscuro",
    paletteEnergia: "Mida con la paleta Energía",
    paletteCalma: "Mida con la paleta Calma",
    paletteNatura: "Mida con la paleta Naturaleza",
    paletteNotte: "Mida con la paleta Noche",
  },
};

export type Dictionary = typeof it;

export const dictionaries: Record<Locale, Dictionary> = { it, en, es };
