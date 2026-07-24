const Documentation = () => (
  <main className="shell">
    <article className="status-card docs-card" aria-labelledby="docs-title">
      <p className="eyebrow">Ayuda para desarrollo</p>
      <h1 id="docs-title">Documentación de FollowRead</h1>
      <h2>Preparar el proyecto en Windows</h2>
      <ol>
        <li>Instala Node.js 24 y abre una nueva terminal de PowerShell.</li>
        <li>
          Ejecuta <code>npm install --global pnpm@11.9.0</code>.
        </li>
        <li>
          En <code>C:\Projects\FollowRead</code>, ejecuta <code>pnpm setup</code>.
        </li>
      </ol>
      <p>
        Si PowerShell bloquea <code>pnpm.ps1</code>, usa <code>pnpm.cmd</code>.
      </p>
      <div className="actions">
        <a className="button-link" href="/">
          Volver al Reader
        </a>
        <a className="text-link" href="http://localhost:8000/docs">
          Abrir documentación de la API
        </a>
      </div>
    </article>
  </main>
);

const ReaderHome = () => (
  <main className="shell">
    <section className="status-card" aria-labelledby="reader-title">
      <p className="eyebrow">Aplicación en desarrollo</p>
      <h1 id="reader-title">FollowRead Reader</h1>
      <p>
        La experiencia de lectura está preparada para crecer sobre una aplicación separada y
        accesible.
      </p>
      <p role="status" className="status">
        Aplicación base disponible
      </p>
      <a className="button-link" href="/documentation">
        Ver documentación
      </a>
    </section>
  </main>
);

export const App = () =>
  window.location.pathname === "/documentation" ? <Documentation /> : <ReaderHome />;
