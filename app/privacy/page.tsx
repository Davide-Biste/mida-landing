import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Mida",
  description:
    "Come Mida gestisce i tuoi dati: tutto resta sul tuo dispositivo. Nessun account, nessun server, nessun tracciamento.",
};

export default function PrivacyPage() {
  return (
    <main className="legal">
      <div className="container">
        <Link href="/" className="legal-back">
          ← Torna alla home
        </Link>

        <h1>Privacy Policy</h1>
        <p className="updated">Ultimo aggiornamento: 7 giugno 2026</p>

        <p className="legal-lead">
          Mida è progettata attorno a un principio semplice: i tuoi dati finanziari sono tuoi e restano sul tuo
          dispositivo. Questa pagina spiega esattamente cosa succede ai tuoi dati.
        </p>

        <h2>1. Introduzione</h2>
        <p>
          La presente informativa sulla privacy descrive le modalità con cui l&apos;applicazione Mida
          (&quot;l&apos;App&quot;) gestisce i dati dell&apos;utente. Utilizzando l&apos;App, l&apos;utente accetta i
          termini qui descritti.
        </p>

        <h2>2. Dati raccolti</h2>
        <p>
          L&apos;App raccoglie e memorizza esclusivamente i dati inseriti volontariamente dall&apos;utente, tra cui:
          nome, transazioni finanziarie, portafogli, categorie, budget e preferenze di utilizzo. Se l&apos;utente
          concede i relativi permessi, l&apos;App può inoltre salvare la posizione associata a una transazione e
          accedere alle foto del dispositivo per impostare l&apos;immagine del profilo. Anche questi dati restano
          esclusivamente sul dispositivo e non vengono mai trasmessi a terzi.
        </p>

        <h2>3. Archiviazione locale</h2>
        <p>
          Tutti i dati vengono archiviati esclusivamente sul dispositivo dell&apos;utente tramite un database SQLite
          locale. Nessun dato viene trasmesso, sincronizzato o archiviato su server remoti, servizi cloud o
          infrastrutture di terze parti. Lo sviluppatore non ha accesso in alcun modo ai dati dell&apos;utente.
        </p>

        <h2>4. Condivisione dei dati</h2>
        <p>
          L&apos;App non condivide, vende, cede o trasmette dati personali a terzi. Non sono presenti SDK di analisi,
          tracciamento pubblicitario o strumenti di telemetria. Non vengono utilizzati cookie né tecnologie di
          tracciamento.
        </p>

        <h2>5. Sicurezza</h2>
        <p>
          L&apos;App offre la possibilità di proteggere l&apos;accesso tramite autenticazione biometrica (Face ID /
          Touch ID). La sicurezza dei dati dipende dalle misure di protezione del dispositivo dell&apos;utente. Lo
          sviluppatore non può garantire la sicurezza dei dati in caso di accesso non autorizzato al dispositivo,
          smarrimento, furto o compromissione dello stesso.
        </p>

        <h2>6. Cancellazione dei dati</h2>
        <p>
          L&apos;utente può cancellare tutti i propri dati in qualsiasi momento dalla sezione Impostazioni
          dell&apos;App. La disinstallazione dell&apos;App comporta la rimozione completa e irreversibile di tutti i
          dati memorizzati.
        </p>

        <h2>7. Servizi di terze parti</h2>
        <p>
          L&apos;App non integra servizi di terze parti a scopo di raccolta dati, analisi o pubblicità. Non sono
          presenti funzionalità di accesso tramite account social. L&apos;unica eccezione, attivabile e disattivabile
          dall&apos;utente e disattivata per impostazione predefinita, è il recupero dei loghi dei servizi: se
          abilitata, quando il nome di una transazione contiene un marchio noto viene inviato a un CDN pubblico
          (jsDelivr) soltanto l&apos;identificativo di quel marchio (es. &quot;netflix&quot;), al solo scopo di
          scaricare l&apos;icona corrispondente. Il nome completo della transazione non viene mai trasmesso e i nomi
          privi di marchi riconosciuti non generano alcuna richiesta.
        </p>

        <h2>8. Minori</h2>
        <p>
          L&apos;App non è rivolta a minori di 16 anni. Lo sviluppatore non raccoglie consapevolmente dati relativi a
          minori.
        </p>

        <h2>9. Modifiche alla presente informativa</h2>
        <p>
          Lo sviluppatore si riserva il diritto di aggiornare la presente informativa. Eventuali modifiche saranno
          rese disponibili all&apos;interno dell&apos;App e su questa pagina. L&apos;uso continuato dell&apos;App dopo
          la pubblicazione delle modifiche costituisce accettazione delle stesse.
        </p>

        <h2>10. Esclusione di responsabilità</h2>
        <p>
          L&apos;App viene fornita &quot;così com&apos;è&quot; senza garanzie di alcun tipo, esplicite o implicite. Lo
          sviluppatore non è responsabile per eventuali perdite di dati, decisioni finanziarie errate, danni diretti o
          indiretti derivanti dall&apos;utilizzo dell&apos;App. L&apos;utente utilizza l&apos;App sotto la propria
          esclusiva responsabilità.
        </p>

        <div className="legal-note">
          Loghi dei servizi da <a href="https://github.com/homarr-labs/dashboard-icons">homarr-labs/dashboard-icons</a>{" "}
          (Apache 2.0). Tutti i marchi sono di proprietà dei rispettivi titolari e sono usati solo a scopo
          identificativo, senza alcuna affiliazione o endorsement.
          <br />
          <br />
          Per domande relative alla privacy: <Link href="/support">contattaci</Link>.
        </div>
      </div>
    </main>
  );
}
