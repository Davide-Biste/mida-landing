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
