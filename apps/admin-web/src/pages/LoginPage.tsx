import { useState, type SyntheticEvent } from "react";

import { AuthenticationError, login } from "../auth/authClient.js";

type LoginPageProps = {
  onAuthenticated: () => void;
};

type LoginState = "idle" | "submitting" | "invalid" | "limited" | "unavailable";

export const LoginPage = ({ onAuthenticated }: LoginPageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>("idle");

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    setLoginState("submitting");
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    if (typeof email !== "string" || typeof password !== "string") {
      setLoginState("invalid");
      return;
    }

    try {
      await login(email, password);
      onAuthenticated();
    } catch (error) {
      if (error instanceof AuthenticationError) {
        setLoginState(error.status === 429 ? "limited" : "invalid");
      } else {
        setLoginState("unavailable");
      }
    }
  };

  const errorMessages: Partial<Record<LoginState, string>> = {
    invalid: "No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo.",
    limited: "Se realizaron varios intentos. Espera unos minutos antes de volver a intentarlo.",
    unavailable:
      "El servicio no está disponible ahora. Tu información no se envió; vuelve a intentar.",
  };

  const errorMessage = errorMessages[loginState];

  return (
    <main className="login-page">
      <section className="login-story" aria-label="Presentación de FollowRead Admin">
        <a className="brand brand--login" href="/" aria-label="FollowRead Admin">
          <span className="brand__mark" aria-hidden="true">
            F
          </span>
          <span>
            <strong>FollowRead</strong>
            <small>Administración</small>
          </span>
        </a>
        <div className="login-story__content">
          <p className="login-story__eyebrow">Un espacio para crear lecturas que acompañan</p>
          <h1>Historias bien cuidadas, listas para cobrar voz.</h1>
          <p>
            Organiza texto, traducciones y audio desde un flujo editorial claro, accesible y
            preparado para trabajar en equipo.
          </p>
          <div className="login-story__workflow" aria-label="Flujo editorial">
            <span>
              <b>1</b> Escribe
            </span>
            <i aria-hidden="true" />
            <span>
              <b>2</b> Revisa
            </span>
            <i aria-hidden="true" />
            <span>
              <b>3</b> Publica
            </span>
          </div>
        </div>
        <p className="login-story__footer">FollowRead · Lectura accesible, palabra por palabra.</p>
      </section>

      <section className="login-form-section">
        <div className="login-form-wrap">
          <div className="login-heading">
            <p className="eyebrow">Área protegida</p>
            <h2>Bienvenida de nuevo</h2>
            <p>Ingresa con tu cuenta del equipo editorial.</p>
          </div>

          {errorMessage === undefined ? null : (
            <div className="form-alert" role="alert">
              <span aria-hidden="true">!</span>
              <p>{errorMessage}</p>
            </div>
          )}

          <form
            className="login-form"
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
          >
            <label>
              <span>Correo electrónico</span>
              <input
                autoComplete="username"
                name="email"
                type="email"
                placeholder="nombre@equipo.com"
                required
              />
            </label>
            <label>
              <span>Contraseña</span>
              <span className="password-field">
                <input
                  autoComplete="current-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => {
                    setShowPassword((visible) => !visible);
                  }}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </span>
            </label>
            <div className="login-options">
              <label className="checkbox-label">
                <input type="checkbox" name="remember" />
                <span>Recordar mi correo</span>
              </label>
              <span title="Disponible en una fase posterior">Recuperar acceso</span>
            </div>
            <button
              className="button button--primary button--wide"
              type="submit"
              disabled={loginState === "submitting"}
            >
              {loginState === "submitting" ? "Ingresando…" : "Iniciar sesión"}
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <div className="preview-callout">
            <span aria-hidden="true">◉</span>
            <div>
              <strong>¿Quieres ver el avance visual?</strong>
              <p>La demostración usa información de ejemplo y no modifica el catálogo.</p>
            </div>
            <a href="/">Abrir vista previa</a>
          </div>
        </div>
        <a className="login-help" href="/documentation">
          Ayuda y documentación
        </a>
      </section>
    </main>
  );
};
