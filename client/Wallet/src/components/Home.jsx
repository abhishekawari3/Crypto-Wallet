import { Link } from "react-router-dom";
import { ArrowRight, Download, Repeat2, Send, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import MarketPanel from "./MarketPanel";
import Navbar from "./navbar";
import NexaScene from "./NexaScene";

const quickActions = [
  { label: "Send", icon: <Send size={19} /> },
  { label: "Receive", icon: <Download size={19} /> },
  { label: "Swap", icon: <Repeat2 size={19} /> },
];

const Home = () => {
  const [wallets, setWallets] = useState([]);
  const [status, setStatus] = useState("Loading wallets...");

  useEffect(() => {
    let active = true;

    async function loadWallets() {
      try {
        const result = await apiRequest("/api/wallets");
        if (!active) return;
        setWallets(result.data);
        setStatus("");
      } catch (error) {
        if (active) setStatus(error.message || "Could not load wallets");
      }
    }

    loadWallets();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <Navbar />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:py-8">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--muted)]">NexaWallet</p>
              <h1 className="mt-2 max-w-xl text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl">
                Create and manage Ethereum or Solana wallets.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                Generate seed phrases, derive accounts, and watch live market prices from your local price server.
              </p>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] text-[var(--text)]">
              <WalletCards size={25} />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <NetworkLink to="/solana" title="Solana Wallet" description="Create SOL accounts" />
            <NetworkLink to="/ethereum" title="Ethereum Wallet" description="Create EVM accounts" />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {quickActions.map(({ label, icon }) => (
              <button
                key={label}
                className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] text-sm font-medium text-[var(--text)]"
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-[var(--text)]">Your wallets</h2>
              <span className="text-sm text-[var(--muted)]">{wallets.length} saved</span>
            </div>

            {status && <p className="mt-3 text-sm text-[var(--muted)]">{status}</p>}

            {!status && wallets.length === 0 && (
              <div className="mt-3 rounded-xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                No saved wallets yet. Create or import a seed phrase, then add a wallet.
              </div>
            )}

            <div className="mt-3 space-y-3">
              {wallets.map((wallet) => (
                <SavedWallet key={wallet.id} wallet={wallet} />
              ))}
            </div>
          </div>
        </section>

        <section className="min-w-0">
          <div className="mb-5 overflow-hidden">
            <NexaScene />
          </div>
          <MarketPanel />
        </section>
      </main>
    </div>
  );
};

function SavedWallet({ wallet }) {
  const address = wallet.address || wallet.publicKey;
  const label = wallet.chain === "ethereum" ? "Ethereum" : "Solana";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--text)]">{label}</p>
          <p className="text-xs text-[var(--muted)]">Account {Number(wallet.index || 0) + 1}</p>
        </div>
        <Link
          to={wallet.chain === "ethereum" ? "/ethereum" : "/solana"}
          className="rounded-full border border-[var(--border)] px-3 py-1 text-sm text-[var(--text)]"
        >
          Open
        </Link>
      </div>
      <code className="mt-3 block truncate text-sm text-[var(--muted)]">{address}</code>
    </div>
  );
}

function NetworkLink({ to, title, description }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4 text-[var(--text)] transition hover:border-[var(--accent)]"
    >
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="text-sm text-[var(--muted)]">{description}</span>
      </span>
      <ArrowRight className="transition group-hover:translate-x-1" size={18} />
    </Link>
  );
}

export default Home;
