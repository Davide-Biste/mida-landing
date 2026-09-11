# Mida — Landing page

Sito di presentazione di **Mida**, l'app di finanza personale gratuita per iPhone.

> **Mida — La tua finanza personale, davvero tua.**
> Multi-portafoglio, trasferimenti, KPI, obiettivi e proiezioni. I tuoi dati restano sul tuo device.

Costruito con [Next.js 16](https://nextjs.org) (App Router), React 19 e Tailwind CSS 4.

---

## 🎯 Cos'è Mida

Mida è un'app di finanza personale **iOS-first** e **offline**: ogni dato (transazioni, portafogli, budget) resta sul dispositivo, protetto da Face ID. Niente account cloud, niente tracciamento. L'app aiuta a tenere sotto controllo entrate, uscite e risparmi con analisi chiare e proiezioni intelligenti.

Questa landing serve a comunicare le funzionalità chiave e a portare al download su App Store.

---

## ✨ Funzionalità principali dell'app

Questi sono i punti di forza da raccontare nelle sezioni del sito.

### 💸 Transazioni intelligenti
- Entrate e uscite registrate in pochi secondi, con categoria, portafoglio, nota e posizione.
- **AI Scan**: scansiona lo scontrino e Mida compila importo e dati per te.
- Collegamento automatico al saldo del portafoglio (o solo registrazione, senza toccare il saldo).

### 👛 Multi-portafoglio & trasferimenti
- Gestisci più conti e portafogli in un'unica vista, con saldo totale e flusso netto.
- **Trasferimenti** tra portafogli per spostare fondi tenendo traccia di origine e destinazione.
- Dettaglio per ogni portafoglio con statistiche dedicate.

### 🔁 Transazioni ricorrenti
- Automatizza spese ed entrate fisse: abbonamenti, stipendio, affitto.
- Frequenze giornaliera, settimanale, mensile, annuale.
- Modalità **automatica** o **con conferma** per gli importi variabili.

### 🎯 Budget con avvisi
- Budget settimanali, mensili, trimestrali, annuali o su periodo personalizzato.
- Avvisi intelligenti quando ti avvicini o superi il limite (stati: in linea / attenzione / superato).
- **Rollover** del residuo e **proiezione** di fine periodo.

### 📊 Analisi e grafici
- Dashboard con saldo del periodo, entrate/uscite e statistiche rapide vs. periodo precedente.
- KPI: tasso di risparmio, spesa media giornaliera, spesa top, giorni di riserva.
- Grafici di andamento, burn rate, categorie di spesa, trend e **Insights** automatici.

### 🔮 Proiezioni
- Stima il saldo futuro fino a 12, 24 o 36 mesi.
- Modalità **Conservativa** (solo ricorrenze e budget attivi) o **Storica** (analisi stagionale degli anni precedenti).
- Indicatore di affidabilità del dato (verde / giallo / rosso).

### 🤝 Spese condivise
- Hai pagato anche per altri? Dividi la spesa equamente, per quote o per importi.
- Mida tiene traccia di chi ti deve restituire i soldi e gestisce il saldo del rimborso.

### 🗂️ Categorie & ricerca
- Categorie con gerarchia padre/figlio, emoji e colori personalizzati.
- Ricerca avanzata delle transazioni con filtri, e vista mappa per posizione.

### 🔒 Privacy by design
- Tutti i dati restano **localmente** sul dispositivo (SQLite).
- Sblocco con **Face ID** / passcode.
- Multi-valuta e multilingua (Italiano / Inglese).

---

## 🖼️ Screenshot & mockup iPhone

Gli screenshot dell'app vengono inseriti dentro un mockup iPhone con [magic-ui](https://magicui.design/).

Esempio di utilizzo del componente:

```tsx
import { Iphone } from "@/registry/magicui/iphone"

export function Demo() {
  return (
    <div className="w-[434px]">
      <Iphone />
    </div>
  )
}
```

Per mostrare uno screenshot dentro il telaio, passa l'immagine tramite la prop `src`:

```tsx
<div className="w-[434px]">
  <Iphone src="/screenshots/home.png" />
</div>
```

> 📸 **Gli screenshot vengono aggiunti a mano** in `public/screenshots/`. Usa immagini in formato verticale (proporzioni iPhone) per riempire correttamente il mockup.

---

## 🚀 Sviluppo

```bash
bun install      # installa le dipendenze
bun dev          # avvia il dev server su http://localhost:3000
bun run build    # build di produzione
bun start        # avvia la build di produzione
bun run lint     # ESLint
```

> ⚠️ Questo progetto usa **Next.js 16**, che introduce breaking change rispetto alle versioni precedenti. Consulta `node_modules/next/dist/docs/` prima di modificare la struttura o le API.

---

## 📁 Struttura

```
app/
├─ layout.tsx        # Metadata SEO + font (Inter, Geist Mono), lang="it"
├─ page.tsx          # Landing principale
├─ globals.css       # Stili globali (Tailwind 4)
├─ Reveal.tsx        # Componente di animazione on-scroll
├─ privacy/          # Informativa privacy
├─ terms/            # Termini di servizio
└─ support/          # Pagina di supporto
public/
└─ screenshots/      # Screenshot dell'app per i mockup iPhone
```

---

## 🎨 Brand

- **Nome**: Mida
- **Colore primario**: `#3A5A40` (verde)
- **Tono**: pulito, fidato, attento alla privacy
- **Font**: stack di sistema (SF Pro su device Apple), Geist Mono per i numeri

---

## 🚀 Deploy (GitHub Pages)

Il sito è un **export statico** di Next.js (`output: "export"`) pubblicato su GitHub Pages
tramite GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

1. Repo → **Settings → Pages → Source: GitHub Actions**.
2. Ogni push su `main` builda e pubblica in automatico.

Il sito è servito sotto `/<repo>`, quindi il workflow imposta `NEXT_PUBLIC_BASE_PATH=/mida-landing`.
Se rinomini la repo, aggiorna quel valore nel workflow; per un sito utente (`<user>.github.io`)
o un dominio personalizzato, lascialo vuoto. In locale `bun run dev` gira normalmente alla root.

Build statica in locale:

```bash
bun run build     # genera ./out
```

---

## 📄 Licenza

© 2026 Davide Mazzeo. **Tutti i diritti riservati.** — vedi [`LICENSE`](LICENSE).

La repo è pubblica solo per consentire la pubblicazione via GitHub Pages e la consultazione.
Il codice sorgente, il design, i testi, gli screenshot, il logo e il nome **Mida** sono di
proprietà esclusiva dell'autore e **non** possono essere usati, copiati, modificati o
ridistribuiti senza permesso scritto.
