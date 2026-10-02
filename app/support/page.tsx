import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Supporto — Mida",
  description: "Hai bisogno di aiuto con Mida? Contatta lo sviluppatore o consulta le domande frequenti.",
};

export default function SupportPage() {
  return (
    <main className="legal">
      <div className="container">
        <Link href="/" className="legal-back">
          ← Torna alla home
        </Link>

        <h1>Supporto</h1>
        <p className="legal-lead">
          Mida è un progetto indipendente, sviluppato e mantenuto da una sola persona. Per qualsiasi domanda,
          segnalazione di bug o suggerimento, scrivi pure: rispondo personalmente.
        </p>

        <h2>Contatto</h2>
        <a href="mailto:mazzeodavidevittorio@gmail.com" className="legal-contact">
          mazzeodavidevittorio@gmail.com
        </a>
        <p>Riceverai una risposta appena possibile.</p>

        <h2>Domande frequenti</h2>

        <p>
          <strong>I miei dati sono al sicuro?</strong>
          <br />
          Sì. Tutti i dati restano esclusivamente sul tuo iPhone, in un database locale. Non esistono server, account
          o sincronizzazioni: nemmeno lo sviluppatore può vederli. Dettagli nella{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <p>
          <strong>Come faccio un backup dei miei dati?</strong>
          <br />
          Poiché i dati vivono sul dispositivo, sono inclusi nel backup del tuo iPhone (iCloud o computer). Disinstallando
          l&apos;app i dati vengono rimossi in modo definitivo.
        </p>

        <p>
          <strong>Come importo i movimenti dalla mia banca?</strong>
          <br />
          Scarica l&apos;estratto conto in formato CSV dall&apos;app o dal sito della banca (Revolut: Conto › Estratto
          conto › Excel/CSV; Fineco e Intesa Sanpaolo: esporta i movimenti e salvali come CSV). Poi in Mida vai su
          Impostazioni › Importa da banca, scegli il file e il conto di destinazione. Mida riconosce le colonne da
          sola, esclude i movimenti che hai già registrato e suggerisce le categorie: tocca l&apos;icona di un
          movimento per cambiarla, e Mida se la ricorderà per gli import successivi. Il saldo del conto non cambia, a
          meno che tu non attivi &quot;Aggiorna il saldo&quot;. Funziona anche con altre banche, purché il CSV abbia
          colonne con data, importo e descrizione.
        </p>

        <p>
          <strong>Come esporto i miei movimenti, ad esempio per il commercialista?</strong>
          <br />
          Vai su Impostazioni › Esporta movimenti, scegli il periodo e il conto (o tutti i conti) e tocca Esporta.
          Ottieni un file CSV che si apre in Excel, Numbers o Google Fogli, con una riga per movimento: data, nome,
          importo, categoria, conto, note e luogo. Puoi inviarlo con Mail, WhatsApp, AirDrop o salvarlo in File: il
          file viene creato sul telefono e lo condividi solo tu.
        </p>

        <p>
          <strong>Mida è davvero gratis?</strong>
          <br />
          Sì, gratis e senza piani premium o funzioni bloccate. Se vuoi sostenere lo sviluppo puoi offrire un caffè,
          ma è del tutto facoltativo.
        </p>

        <p>
          <strong>Cosa sono i loghi dei servizi?</strong>
          <br />
          Una funzione facoltativa (disattivata di default) che mostra il logo di servizi noti accanto alle tue
          transazioni. Quando è attiva, il riconoscimento avviene sul dispositivo e viene richiesto solo il logo del
          marchio a un CDN pubblico — mai il nome completo della transazione. Puoi attivarla o disattivarla in
          Impostazioni.
        </p>

        <p>
          <strong>Su quali dispositivi funziona?</strong>
          <br />
          Mida è disponibile per iPhone (ed è ottimizzata anche per iPad).
        </p>

        <div className="legal-note">
          Vedi anche la <Link href="/privacy">Privacy Policy</Link> e i <Link href="/terms">Termini</Link>.
        </div>
      </div>
    </main>
  );
}
