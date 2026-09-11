import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termini d'uso — Mida",
  description: "Termini d'uso ed esclusione di responsabilità dell'app Mida.",
};

export default function TermsPage() {
  return (
    <main className="legal">
      <div className="container">
        <Link href="/" className="legal-back">
          ← Torna alla home
        </Link>

        <h1>Termini d&apos;uso</h1>
        <p className="updated">Ultimo aggiornamento: 7 giugno 2026</p>

        <p className="legal-lead">
          Utilizzando Mida (&quot;l&apos;App&quot;) accetti i termini descritti di seguito. Mida è uno strumento
          personale di gestione delle finanze e non fornisce consulenza finanziaria di alcun tipo.
        </p>

        <h2>1. Uso dell&apos;App</h2>
        <p>
          L&apos;App è destinata a un uso personale per la gestione e l&apos;organizzazione delle proprie finanze.
          L&apos;utente è l&apos;unico responsabile dei dati che inserisce e delle decisioni che prende sulla base
          delle informazioni mostrate.
        </p>

        <h2>2. Nessuna consulenza finanziaria</h2>
        <p>
          Le informazioni, i grafici e le statistiche mostrate dall&apos;App hanno scopo puramente informativo e
          organizzativo. Non costituiscono consulenza finanziaria, fiscale o di investimento.
        </p>

        <h2>3. Esclusione di responsabilità</h2>
        <p>
          L&apos;App viene fornita &quot;così com&apos;è&quot;, senza garanzie di alcun tipo, esplicite o implicite,
          incluse, a titolo esemplificativo, garanzie di commerciabilità, idoneità per uno scopo particolare o non
          violazione di diritti di terzi. Lo sviluppatore non è in alcun modo responsabile per:
        </p>
        <ul>
          <li>Perdita parziale o totale dei dati memorizzati sul dispositivo</li>
          <li>Decisioni finanziarie prese sulla base delle informazioni mostrate dall&apos;App</li>
          <li>
            Danni diretti, indiretti, incidentali o consequenziali derivanti dall&apos;utilizzo o
            dall&apos;impossibilità di utilizzo dell&apos;App
          </li>
          <li>Malfunzionamenti dovuti ad aggiornamenti del sistema operativo o del dispositivo</li>
          <li>Accesso non autorizzato ai dati in caso di dispositivo compromesso, smarrito o rubato</li>
        </ul>

        <h2>4. Marchi di terzi</h2>
        <p>
          I loghi dei servizi mostrati nell&apos;App provengono dal progetto open source{" "}
          <a href="https://github.com/homarr-labs/dashboard-icons">homarr-labs/dashboard-icons</a> (licenza Apache
          2.0). Tutti i nomi di prodotto e i marchi sono di proprietà dei rispettivi titolari e sono utilizzati
          esclusivamente a scopo identificativo, senza implicare alcuna affiliazione o endorsement.
        </p>

        <h2>5. Modifiche</h2>
        <p>
          Lo sviluppatore si riserva il diritto di aggiornare questi termini. Le modifiche saranno pubblicate su questa
          pagina. L&apos;uso continuato dell&apos;App costituisce accettazione dei termini aggiornati.
        </p>

        <div className="legal-note">
          Vedi anche la <Link href="/privacy">Privacy Policy</Link>. Per assistenza:{" "}
          <Link href="/support">Supporto</Link>.
        </div>
      </div>
    </main>
  );
}
