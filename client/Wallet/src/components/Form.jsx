import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";

const Form = ({ isSigninPage = false }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setStatus("Please wait...");
    setError("");

    try {
      if (isSigninPage) {
        await login(data.email, data.password);
      } else {
        await register(data.name, data.email, data.password);
      }

      setStatus("Signed in");
      navigate("/home");
    } catch (err) {
      setStatus("");
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1fr]">
        <section className="hidden min-w-0 lg:block">
          <p className="text-sm font-semibold text-[var(--muted)]">NexaWallet</p>
          <h1 className="mt-2 max-w-xl text-4xl font-bold leading-tight text-[var(--text)]">
            Your wallets, keys, and live market view in one place.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--muted)]">
            Demo testnet wallet dashboard for creating accounts, checking balances, and following market prices.
          </p>
        </section>

      <form onSubmit={submit} className="mx-auto w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <p className="text-sm font-semibold text-[var(--muted)]">NexaWallet</p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--text)]">{isSigninPage ? "Sign in" : "Create account"}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {isSigninPage ? "Use your NexaWallet account to continue." : "Create an account to use the wallet dashboard."}
        </p>

        <div className="mt-6 space-y-4">
          {!isSigninPage && (
            <Field label="Name" value={data.name} onChange={(value) => setData({ ...data, name: value })} />
          )}
          <Field label="Email" type="email" value={data.email} onChange={(value) => setData({ ...data, email: value })} />
          <Field label="Password" type="password" value={data.password} onChange={(value) => setData({ ...data, password: value })} />
        </div>

        {error && <p className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
        {status && <p className="mt-4 text-sm text-[var(--muted)]">{status}</p>}

        <button className="mt-6 h-11 w-full rounded-full bg-[var(--text)] text-sm font-bold text-[var(--app-bg)]">
          {isSigninPage ? "Sign in" : "Sign up"}
        </button>

        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          {isSigninPage ? "Need an account?" : "Already have an account?"}{" "}
          <Link className="font-semibold text-[var(--text)] underline" to={isSigninPage ? "/user/sign_up" : "/user/sign_in"}>
            {isSigninPage ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </form>
      </div>
    </div>
  );
};

function Field({ label, type = "text", value, onChange }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--text)]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="mt-2 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-3 text-sm text-[var(--text)] outline-none"
      />
    </label>
  );
}

export default Form;
