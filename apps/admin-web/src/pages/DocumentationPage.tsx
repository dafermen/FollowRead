export const DocumentationPage = () => (
  <main className="documentation-page">
    <aside className="docs-aside">
      <a className="brand brand--sidebar" href="/" aria-label="Volver a FollowRead Admin">
        <span className="brand__mark" aria-hidden="true">
          F
        </span>
        <span>
          <strong>FollowRead</strong>
          <small>Documentación</small>
        </span>
      </a>
      <nav aria-label="Secciones de documentación">
        <a className="docs-nav-active" href="#inicio">
          Inicio rápido
        </a>
        <a href="#levantar">Levantar el proyecto</a>
        <a href="#calidad">Calidad y seguridad</a>
        <a href="#pruebas-despliegue">Pruebas predespliegue</a>
        <a href="#despliegue">Despliegue</a>
        <a href="http://localhost:8000/docs">API interactiva</a>
      </nav>
      <a className="docs-back" href="/">
        <span aria-hidden="true">←</span> Volver al panel
      </a>
    </aside>
    <article className="docs-content">
      <p className="eyebrow">Guía de desarrollo</p>
      <h1 id="inicio">Documentación de FollowRead</h1>
      <p className="docs-lead">
        Todo lo necesario para preparar y ejecutar el proyecto localmente en Windows.
      </p>

      <section className="docs-section">
        <span className="step-number">01</span>
        <div>
          <h2>Preparar el equipo</h2>
          <ol>
            <li>Instala Node.js 24 y abre una nueva terminal de PowerShell.</li>
            <li>
              Instala pnpm con <code>npm install --global pnpm@11.9.0</code>.
            </li>
            <li>
              Desde <code>C:\Projects\FollowRead</code>, ejecuta <code>pnpm setup</code>.
            </li>
          </ol>
          <div className="docs-note">
            <strong>Nota para PowerShell</strong>
            <p>
              Si el sistema bloquea <code>pnpm.ps1</code>, usa <code>pnpm.cmd</code>.
            </p>
          </div>
        </div>
      </section>

      <section className="docs-section" id="levantar">
        <span className="step-number">02</span>
        <div>
          <h2>Levantar todo con un comando</h2>
          <p>
            Después de preparar y migrar el proyecto, ejecuta el siguiente comando para iniciar API,
            Admin y Reader al mismo tiempo.
          </p>
          <div className="command-box">
            <code>pnpm dev</code>
            <span>API · Admin · Reader</span>
          </div>
          <p>
            Presiona <kbd>Ctrl</kbd> + <kbd>C</kbd> para detener todos los servicios.
          </p>
        </div>
      </section>

      <section className="docs-section" id="calidad">
        <span className="step-number">03</span>
        <div>
          <h2>Comprobar calidad y seguridad</h2>
          <p>
            Con los servicios activos, estos comandos revisan pruebas, accesibilidad, rendimiento,
            carga, cabeceras, métricas y dependencias.
          </p>
          <div className="command-box">
            <code>pnpm quality:regression</code>
            <span>Regresión integral</span>
          </div>
          <div className="command-box">
            <code>pnpm security:audit</code>
            <span>Dependencias JavaScript y Python</span>
          </div>
          <p>
            Las métricas locales están disponibles en <code>http://localhost:8000/metrics</code>.
          </p>
        </div>
      </section>

      <section className="docs-section" id="pruebas-despliegue">
        <span className="step-number">04</span>
        <div>
          <h2>Validar antes de desplegar</h2>
          <p>
            Todo despliegue compartido exige trece categorías: aceptación, unitarias, propiedades,
            mutation testing, fuzzing, integración, contrato, extremo a extremo, regresión,
            seguridad, concurrencia, rendimiento y compatibilidad.
          </p>
          <div className="command-box">
            <code>pnpm docs:validate</code>
            <span>Estructura · enlaces · matriz obligatoria</span>
          </div>
          <p>
            La matriz está en <code>docs/testing/PRE_DEPLOYMENT_TESTS.md</code>. Una categoría
            parcial, no implementada o bloqueada impide el despliegue salvo excepción aprobada.
          </p>
        </div>
      </section>

      <section className="docs-section" id="despliegue">
        <span className="step-number">05</span>
        <div>
          <h2>Preparar un despliegue</h2>
          <p>
            La definición se puede revisar sin instalar Docker. El comando habitual de desarrollo
            local no cambia.
          </p>
          <div className="command-box">
            <code>pnpm deploy:validate</code>
            <span>Contenedores · CI · release</span>
          </div>
          <p>
            Si Docker está instalado, <code>pnpm deploy:local</code> levanta las tres imágenes y{" "}
            <code>pnpm deploy:smoke</code> comprueba API, Admin y Reader.
          </p>
        </div>
      </section>

      <div className="docs-actions">
        <a className="button button--primary" href="http://localhost:8000/docs">
          Abrir documentación de la API
        </a>
        <a className="button button--secondary" href="/">
          Volver al panel
        </a>
      </div>
    </article>
  </main>
);
