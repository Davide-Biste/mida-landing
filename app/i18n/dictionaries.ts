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

const it = {
  metadata: {
    title: "Mida — La finanza personale, davvero tua",
    description:
      "L'app di finanza personale gratuita per iPhone. Più portafogli, trasferimenti, statistiche e obiettivi. E i tuoi dati restano sul tuo dispositivo.",
  },
  nav: {
    features: "Funzioni",
    privacy: "Privacy",
    support: "Supporto",
    download: "Beta",
    backToTop: "Torna su",
  },
  hero: {
    badge: "In arrivo · beta privata",
    titleTop: "Finanza personale.",
    titleEm: "Davvero tua.",
    lede: "Più portafogli, trasferimenti, statistiche e obiettivi in un'unica app per iPhone. E i tuoi dati non lasciano mai il telefono.",
    ctaPrimary: "Presto disponibile",
    ctaSecondary: "Scopri come funziona",
    chips: [
      { top: "Entrate", value: "€ 1.855", tone: "pos" },
      { top: "Obiettivo casa", value: "64%", tone: "neutral" },
      { top: "Budget mensile", value: "78%", tone: "neutral" },
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
    body: "Conti, contanti, carte, investimenti: crea tutti i portafogli che vuoi, ognuno indipendente dagli altri. Visualizza il tuo patrimonio complessivo e gli ultimi movimenti senza aprire dieci app diverse.",
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
    body: "Importo, conto di partenza, conto di arrivo: confermi ed è fatta. Storico completo, animazioni fluide e gli importi che usi più spesso sempre a portata di mano.",
  },
  kpi: {
    eyebrow: "Statistiche",
    title: ["I numeri", "che contano."],
    body: "Entrate, uscite, tasso di risparmio, andamento per categoria. Nessuna dashboard da centro di controllo: solo i dati che ti aiutano davvero a cambiare abitudini.",
  },
  budget: {
    eyebrow: "Budget",
    title: ["Tetti di spesa.", "Sempre sotto controllo."],
    body: "Budget settimanali, mensili o su misura per ogni categoria. Mida ti avvisa quando ti avvicini al limite, riporta l'avanzo al periodo successivo e stima come chiuderai il mese.",
  },
  add: {
    eyebrow: "Aggiungi al volo",
    title: ["Una spesa.", "Due secondi."],
    body: "Tastierino comodo, categorie a portata di pollice, spesa o entrata in un tocco. Oppure fotografa lo scontrino con l'AI Scan: importo, data e categoria li compila l'app.",
  },
  search: {
    eyebrow: "Ricerca e ricorrenze",
    title: ["Trova tutto.", "Ricorda niente."],
    body: "Stipendio, affitto e abbonamenti si registrano da soli: in automatico, o con una conferma quando l'importo cambia. E quando cerchi una spesa la trovi in un istante, per nome, categoria o portafoglio.",
  },
  features: {
    eyebrow: "E poi c'è tutto il resto",
    title: "Pensata nei dettagli.",
    cards: [
      {
        title: "AI Scan",
        desc: "Fotografa lo scontrino: importo, data e dettagli compilati in automatico.",
      },
      {
        title: "Ricorrenze",
        desc: "Stipendio, affitto e abbonamenti: in automatico, o con conferma quando l'importo varia.",
      },
      {
        title: "Proiezioni",
        desc: "Stima il saldo fino a 36 mesi, con criterio prudente o sulla base del tuo storico.",
      },
      {
        title: "Spese condivise",
        desc: "Dividi una spesa e tieni il conto di chi deve ancora restituirti il denaro.",
      },
      {
        title: "Categorie",
        desc: "Categorie e sottocategorie, con emoji e colori, più una ricerca avanzata con vista a mappa.",
      },
      {
        title: "Multi-valuta",
        desc: "Scegli la tua valuta, con interfaccia in italiano e inglese. Sempre e solo sul dispositivo.",
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
      store: "App Store",
    },
  },
  alts: {
    walletsHero: "Schermata dei portafogli di Mida",
    cards: "Schermata delle carte di credito di Mida",
    home: "Schermata Home di Mida",
    budgetsHero: "Schermata dei budget di Mida",
    transfer: "Schermata dei trasferimenti di Mida",
    charts: "Schermata delle statistiche di Mida",
    add: "Schermata per aggiungere una transazione su Mida",
    search: "Schermata di ricerca e ricorrenze di Mida",
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
      "The free personal-finance app for iPhone. Multiple wallets, transfers, stats and goals. And your data stays on your device.",
  },
  nav: {
    features: "Features",
    privacy: "Privacy",
    support: "Support",
    download: "Beta",
    backToTop: "Back to top",
  },
  hero: {
    badge: "Coming soon · private beta",
    titleTop: "Personal finance.",
    titleEm: "Truly yours.",
    lede: "Multiple wallets, transfers, stats and goals in a single iPhone app. And your data never leaves your phone.",
    ctaPrimary: "Coming soon",
    ctaSecondary: "See how it works",
    chips: [
      { top: "Income", value: "€1,855", tone: "pos" },
      { top: "House goal", value: "64%", tone: "neutral" },
      { top: "Monthly budget", value: "78%", tone: "neutral" },
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
    body: "Accounts, cash, cards, investments: create as many wallets as you like, each one independent. See your total net worth and latest activity without opening ten different apps.",
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
    body: "Amount, from, to: confirm and you're done. Complete history, smooth animations and the amounts you use most always within reach.",
  },
  kpi: {
    eyebrow: "Stats",
    title: ["The numbers", "that matter."],
    body: "Income, expenses, savings rate, trends by category. No mission-control dashboard, just the figures that actually help you change your habits.",
  },
  budget: {
    eyebrow: "Budgets",
    title: ["Spending caps.", "Always in check."],
    body: "Weekly, monthly or custom budgets for each category. We warn you as you near the limit, roll any leftover into the next period and project how you'll close the month.",
  },
  add: {
    eyebrow: "Add in a flash",
    title: ["One expense.", "Two seconds."],
    body: "A roomy keypad, categories within thumb's reach, expense or income in a single tap. Or snap the receipt with AI Scan: it fills in the amount, date and category for you.",
  },
  search: {
    eyebrow: "Search & recurring",
    title: ["Find everything.", "Remember nothing."],
    body: "Salary, rent and subscriptions log themselves: automatically, or with a quick confirmation when the amount changes. And when you look for an expense, you'll find it in an instant, by name, category or wallet.",
  },
  features: {
    eyebrow: "And then there's the rest",
    title: "Designed down to the detail.",
    cards: [
      {
        title: "AI Scan",
        desc: "Snap the receipt: amount, date and details filled in automatically.",
      },
      {
        title: "Recurring",
        desc: "Salary, rent and subscriptions: automatic, or confirmed when the amount changes.",
      },
      {
        title: "Projections",
        desc: "Estimate your balance up to 36 months out, with a cautious or history-based approach.",
      },
      {
        title: "Shared expenses",
        desc: "Split a bill and keep track of who still owes you money.",
      },
      {
        title: "Categories",
        desc: "Categories and subcategories, with emoji and colours, plus advanced search with a map view.",
      },
      {
        title: "Multi-currency",
        desc: "Pick your currency, with an interface in Italian and English. Always on-device, only.",
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
      store: "App Store",
    },
  },
  alts: {
    walletsHero: "Mida wallets screen",
    cards: "Mida credit cards screen",
    home: "Mida home screen",
    budgetsHero: "Mida budgets screen",
    transfer: "Mida transfers screen",
    charts: "Mida stats screen",
    add: "Mida add-transaction screen",
    search: "Mida search and recurring screen",
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
      "La app gratuita de finanzas personales para iPhone. Varias carteras, transferencias, estadísticas y objetivos. Y tus datos se quedan en tu dispositivo.",
  },
  nav: {
    features: "Funciones",
    privacy: "Privacidad",
    support: "Soporte",
    download: "Beta",
    backToTop: "Volver arriba",
  },
  hero: {
    badge: "Próximamente · beta privada",
    titleTop: "Finanzas personales.",
    titleEm: "De verdad tuyas.",
    lede: "Varias carteras, transferencias, estadísticas y objetivos en una sola app para iPhone. Y tus datos nunca salen de tu teléfono.",
    ctaPrimary: "Próximamente",
    ctaSecondary: "Descubre cómo funciona",
    chips: [
      { top: "Ingresos", value: "€1.855", tone: "pos" },
      { top: "Objetivo casa", value: "64%", tone: "neutral" },
      { top: "Presupuesto mensual", value: "78%", tone: "neutral" },
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
    body: "Cuentas, efectivo, tarjetas, inversiones: crea todas las carteras que quieras, cada una independiente. Consulta tu patrimonio total y los últimos movimientos sin abrir diez apps distintas.",
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
    body: "Importe, origen, destino: confirmas y listo. Historial completo, animaciones fluidas y los importes que más usas siempre a mano.",
  },
  kpi: {
    eyebrow: "Estadísticas",
    title: ["Los números", "que importan."],
    body: "Ingresos, gastos, tasa de ahorro, evolución por categoría. Nada de paneles de control complejos: solo los datos que de verdad te ayudan a cambiar de hábitos.",
  },
  budget: {
    eyebrow: "Presupuestos",
    title: ["Límites de gasto.", "Siempre bajo control."],
    body: "Presupuestos semanales, mensuales o a medida para cada categoría. Te avisamos cuando te acercas al límite, trasladamos lo que sobra al periodo siguiente y estimamos cómo cerrarás el mes.",
  },
  add: {
    eyebrow: "Añade al vuelo",
    title: ["Un gasto.", "Dos segundos."],
    body: "Un teclado cómodo, categorías al alcance del pulgar, gasto o ingreso en un solo toque. O fotografía el ticket con AI Scan: rellena el importe, la fecha y la categoría por ti.",
  },
  search: {
    eyebrow: "Búsqueda y recurrentes",
    title: ["Encuéntralo todo.", "No recuerdes nada."],
    body: "Nómina, alquiler y suscripciones se registran solos: de forma automática, o con una confirmación rápida cuando el importe cambia. Y cuando buscas un gasto, lo encuentras al instante, por nombre, categoría o cartera.",
  },
  features: {
    eyebrow: "Y además, todo lo demás",
    title: "Pensada hasta el detalle.",
    cards: [
      {
        title: "AI Scan",
        desc: "Fotografía el ticket: importe, fecha y detalles rellenados automáticamente.",
      },
      {
        title: "Recurrentes",
        desc: "Nómina, alquiler y suscripciones: automáticos, o con confirmación cuando el importe cambia.",
      },
      {
        title: "Proyecciones",
        desc: "Estima tu saldo hasta 36 meses, con un enfoque prudente o basado en tu historial.",
      },
      {
        title: "Gastos compartidos",
        desc: "Divide un gasto y lleva la cuenta de quién todavía te debe dinero.",
      },
      {
        title: "Categorías",
        desc: "Categorías y subcategorías, con emoji y colores, además de una búsqueda avanzada con vista de mapa.",
      },
      {
        title: "Multidivisa",
        desc: "Elige tu divisa, con interfaz en italiano e inglés. Siempre y solo en el dispositivo.",
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
      store: "App Store",
    },
  },
  alts: {
    walletsHero: "Pantalla de carteras de Mida",
    cards: "Pantalla de tarjetas de crédito de Mida",
    home: "Pantalla de inicio de Mida",
    budgetsHero: "Pantalla de presupuestos de Mida",
    transfer: "Pantalla de transferencias de Mida",
    charts: "Pantalla de estadísticas de Mida",
    add: "Pantalla para añadir una transacción en Mida",
    search: "Pantalla de búsqueda y recurrentes de Mida",
    paletteEnergia: "Mida con la paleta Energía",
    paletteCalma: "Mida con la paleta Calma",
    paletteNatura: "Mida con la paleta Naturaleza",
    paletteNotte: "Mida con la paleta Noche",
  },
};

export type Dictionary = typeof it;

export const dictionaries: Record<Locale, Dictionary> = { it, en, es };
