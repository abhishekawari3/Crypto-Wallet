import { Link, NavLink } from "react-router-dom";
import { Moon, Sun, Wallet } from "lucide-react";
import logo from "../assets/nexa-logo.svg";
import { useTheme } from "../useTheme";
import { useAuth } from "../useAuth";

const links = [
  ["Home", "/home"],
  ["Solana", "/solana"],
  ["Ethereum", "/ethereum"],
];

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--panel)]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/home" className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-[var(--border)] bg-slate-950">
            <img src={logo} alt="NexaWallet" className="h-10 w-10 object-cover" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-wide text-[var(--text)]">NexaWallet</span>
            <span className="hidden text-xs text-[var(--muted)] sm:block">Simple multi-chain wallet</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--panel-soft)] p-1 md:flex">
          {links.map(([label, to]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm transition ${
                  isActive ? "bg-[var(--text)] text-[var(--app-bg)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button className="hidden h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-3 text-sm text-[var(--text)] sm:flex">
            <Wallet size={16} />
            {user?.name || "Wallet"}
          </button>
          <button
            onClick={logout}
            className="hidden h-10 rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-3 text-sm text-[var(--muted)] sm:block"
          >
            Sign out
          </button>
          <button
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] bg-[var(--panel-soft)] text-[var(--text)]"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
