import { useEffect, useState, type SyntheticEvent } from "react";
import { adminHref } from "../navigation.js";

const api = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const PasswordResetPage = () => {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get("token"));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  useEffect(() => {
    if (window.location.hash) window.history.replaceState({}, "", window.location.pathname);
  }, []);

  const submit = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const rawPassword = form.get("password");
    const password = typeof rawPassword === "string" ? rawPassword : "";
    const rawEmail = form.get("email");
    const email = typeof rawEmail === "string" ? rawEmail : "";
    if (token && password !== form.get("confirmation")) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`${api}/auth/password-reset/${token ? "confirm" : "request"}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(token ? { token, password } : { email }),
      });
      if (response.ok) {
        setComplete(true);
        setMessage(
          token
            ? "Contraseña actualizada. Ya puedes iniciar sesión."
            : "Si la cuenta puede recuperar el acceso, recibirá un enlace con los siguientes pasos.",
        );
      } else {
        setMessage(
          response.status === 503
            ? "Solicita un enlace de recuperación al responsable del servicio."
            : response.status === 429
              ? "Espera unos minutos antes de volver a intentarlo."
              : "El enlace no es válido o ha caducado. Solicita uno nuevo.",
        );
      }
    } catch {
      setMessage("No pudimos conectar con el servicio. Vuelve a intentarlo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-form-section">
        <div className="login-form-wrap">
          <a className="brand" href={adminHref("/login")}>
            FollowRead
          </a>
          <h1>{token ? "Elige tu nueva contraseña" : "Recuperar acceso"}</h1>
          <p>
            {token
              ? "Usa al menos 15 caracteres. Al guardar se cerrarán las sesiones anteriores."
              : "Escribe el correo de tu cuenta de administración."}
          </p>
          {message && <p role="status">{message}</p>}
          {!complete && (
            <form
              className="login-form"
              onSubmit={(event) => {
                void submit(event);
              }}
            >
              {token ? (
                <>
                  <label>
                    Nueva contraseña
                    <input
                      name="password"
                      type="password"
                      minLength={15}
                      maxLength={128}
                      autoComplete="new-password"
                      required
                    />
                  </label>
                  <label>
                    Confirma la contraseña
                    <input
                      name="confirmation"
                      type="password"
                      minLength={15}
                      maxLength={128}
                      autoComplete="new-password"
                      required
                    />
                  </label>
                </>
              ) : (
                <label>
                  Correo electrónico
                  <input
                    name="email"
                    type="email"
                    autoComplete="username"
                    maxLength={320}
                    required
                  />
                </label>
              )}
              <button className="button button--primary" disabled={busy} type="submit">
                {busy ? "Procesando…" : token ? "Guardar contraseña" : "Solicitar enlace"}
              </button>
            </form>
          )}
          <a href={adminHref("/login")}>Volver a iniciar sesión</a>
        </div>
      </section>
    </main>
  );
};
