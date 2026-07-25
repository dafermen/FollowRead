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
      <h2>Levantar todo</h2>
      <p>
        Después de preparar y migrar el proyecto, ejecuta <code>pnpm dev</code> para iniciar API,
        Admin y Reader. Presiona <code>Ctrl+C</code> para detenerlos.
      </p>
      <div className="actions">
        <a className="button-link" href="/">
          Volver al Admin
        </a>
        <a className="text-link" href="http://localhost:8000/docs">
          Abrir documentación de la API
        </a>
      </div>
    </article>
  </main>
);

const AdminHome = () => (
  <main className="shell">
    <section className="status-card" aria-labelledby="admin-title">
      <p className="eyebrow">Aplicación en desarrollo</p>
      <h1 id="admin-title">FollowRead Admin</h1>
      <p>
        El espacio editorial está preparado. Los flujos de contenido se implementarán en una fase
        posterior.
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
  window.location.pathname === "/documentation" ? <Documentation /> : <AdminHome />;
