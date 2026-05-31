import { Copy, KeyRound, Plus, ShieldAlert, Upload, WalletCards } from "lucide-react";
import { Suspense, lazy, useState } from "react";
import { Link } from "react-router-dom";
import { generateMnemonic, validateMnemonic } from "../crypto/bip39";
import MarketPanel from "./MarketPanel";
import Navbar from "./navbar";

const LazyEthWallet = lazy(() => import("./EthWallet").then((module) => ({ default: module.EthWallet })));
const LazySolanaWallet = lazy(() => import("./SolanaWallet").then((module) => ({ default: module.SolanaWallet })));

const GenMnemonic = ({ isSolana }) => {
  const [mnemonic, setMnemonic] = useState([]);
  const [seedInput, setSeedInput] = useState("");
  const [seedStatus, setSeedStatus] = useState("");
  const networkName = isSolana ? "Solana" : "Ethereum";

  const handleGenerate = () => {
    const mn = generateMnemonic();
    setMnemonic(mn.split(" "));
    setSeedInput("");
    setSeedStatus("New seed phrase created. Add a wallet to save it to your account.");
  };

  const handleImport = () => {
    const normalized = seedInput.trim().toLowerCase().replace(/\s+/g, " ");

    if (!validateMnemonic(normalized)) {
      setSeedStatus("Enter a valid 12 or 24 word seed phrase.");
      return;
    }

    setMnemonic(normalized.split(" "));
    setSeedStatus("Seed phrase imported. Add a wallet to save it to your account.");
  };

  const handleCopy = () => {
    if (mnemonic.length > 0) {
      navigator.clipboard.writeText(mnemonic.join(" "));
      alert("Seed phrase copied!");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <section className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{networkName} workspace</p>
              <h1 className="mt-2 text-3xl font-bold text-[var(--text)] sm:text-4xl">{networkName} wallet</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">Create or import a recovery phrase, then derive and manage demo testnet accounts.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] text-[var(--text)]">
                <WalletCards size={24} />
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-soft)] p-1">
                <NetworkTab to="/solana" active={isSolana} label="Solana" />
                <NetworkTab to="/ethereum" active={!isSolana} label="Ethereum" />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] text-[var(--text)]">
                  <ShieldAlert size={21} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text)]">Recovery phrase</h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Never share your seed phrase, private key, screenshots, or clipboard contents. Imported phrases stay in your browser; only derived wallet keys are saved to your account.</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <SeedWord key={i} index={i} value={mnemonic[i] || ""} />
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleGenerate}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--text)] px-5 text-sm font-bold text-[var(--app-bg)] transition"
                >
                  <Plus size={18} />
                  Create Seed
                </button>
                <button
                  onClick={handleCopy}
                  disabled={mnemonic.length === 0}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-5 text-sm font-semibold text-[var(--text)] transition disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Copy size={18} />
                  Copy Phrase
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6">
              <label className="block">
                <span className="text-sm font-semibold text-[var(--text)]">Import seed phrase</span>
                <textarea
                  value={seedInput}
                  onChange={(event) => setSeedInput(event.target.value)}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2 text-sm text-[var(--text)] outline-none"
                  placeholder="Enter your 12 or 24 word seed phrase"
                />
              </label>
              <button
                onClick={handleImport}
                className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-4 text-sm font-semibold text-[var(--text)]"
              >
                <Upload size={17} />
                Import Phrase
              </button>
              {seedStatus && <p className="mt-3 text-sm text-[var(--muted)]">{seedStatus}</p>}
            </div>
          </section>

          <section className="min-w-0 space-y-6">
            {mnemonic.length > 0 ? (
              <Suspense fallback={<div className="min-h-[380px] rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8" />}>
                {isSolana ? (
                  <LazySolanaWallet mnemonic={mnemonic.join(" ")} />
                ) : (
                  <LazyEthWallet mnemonic={mnemonic.join(" ")} />
                )}
              </Suspense>
            ) : (
              <div className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel)] p-8 text-center">
                <div>
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-xl bg-[var(--panel-soft)] text-[var(--text)]">
                    <KeyRound size={30} />
                  </div>
                  <h2 className="mt-5 text-2xl font-bold text-[var(--text)]">No {networkName} wallet yet</h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">Create or import a seed phrase, then add your first {networkName} account.</p>
                </div>
              </div>
            )}

            <div>
              <MarketPanel />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

function NetworkTab({ to, active, label }) {
  return (
    <Link
      to={to}
      className={`inline-flex h-9 min-w-24 items-center justify-center rounded-full px-4 text-sm font-semibold transition ${
        active ? "bg-[var(--panel)] text-[var(--text)]" : "text-[var(--muted)]"
      }`}
    >
      {label}
    </Link>
  );
}

function SeedWord({ index, value }) {
  return (
    <label className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-3">
      <span className="mb-1 block text-xs text-[var(--muted)]">{String(index + 1).padStart(2, "0")}</span>
      <input
        type="text"
        value={value}
        readOnly
        className="w-full bg-transparent text-sm font-semibold text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
        placeholder="empty"
      />
    </label>
  );
}

export default GenMnemonic;
