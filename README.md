# Mida — Landing page

Landing page di **Mida**, l'app di finanza personale gratuita per iPhone.

> **La tua finanza personale, davvero tua.**
> Più portafogli, trasferimenti, statistiche, obiettivi e proiezioni. I tuoi dati restano sul tuo device.

Il sito racconta le funzionalità dell'app e porta al download su App Store. Disponibile in italiano, inglese e spagnolo.

Costruito con [Next.js 16](https://nextjs.org), React 19 e Tailwind CSS 4, pubblicato come export statico su GitHub Pages.

## 🎬 Il film

Nella landing, subito dopo l'hero, c'è un filmato di 18 secondi generato interamente in tempo reale (WebGL2, nessuna dipendenza): la moneta di Mida cade dal cielo dell'icona, attraversa l'app e ci ritorna. Usa gli stessi testi e screenshot della pagina, ne segue lingua e tema, parte quando entra nello schermo e si ferma quando ne esce.

- Il componente è `app/Reel.tsx`; il motore (timeline, inquadrature, shader) sta in `app/reel/`
- Con il riquadro a fuoco: Spazio play/pausa · ←/→ avanti/indietro di un fotogramma · R ricomincia · F schermo intero
- Solo in sviluppo (`bun run dev`) la barra mostra anche ⤓, che esporta un master 1080p, 16:9 o 9:16 in base all'orientamento del riquadro

## 🧭 Il viaggio

La pagina si legge come un percorso a tappe: Partenza → Il film → Funzioni → Dettagli → Aspetto → Privacy → Roadmap → Arrivo. La moneta del film segna "sei qui" e rotola lungo il percorso mentre scorri.

- Su schermi larghi (≥ 1200 px) il percorso è un binario sul bordo sinistro: le etichette compaiono al passaggio del mouse e per un attimo a ogni tappa raggiunta
- Su schermi più piccoli diventa un chip in basso a sinistra con la tappa corrente (e `3/11` dentro le funzioni): un tocco apre l'elenco delle tappe
- In entrambi i casi c'è sempre "prossima tappa" a un tocco; la barra in alto mostra l'avanzamento e accende la voce della sezione in cui ti trovi
- Le tappe si dichiarano in `app/page.tsx` (`stops`); il componente è `app/Journey.tsx`

---

## 📄 Licenza

© 2026 Davide Vittorio Mazzeo. **Tutti i diritti riservati.** — vedi [`LICENSE`](LICENSE).

La repo è pubblica solo per consentire la pubblicazione via GitHub Pages e la consultazione.
Il codice sorgente, il design, i testi, gli screenshot, il logo e il nome **Mida** sono di
proprietà esclusiva dell'autore e **non** possono essere usati, copiati, modificati o
ridistribuiti senza permesso scritto.
