import { Copy, KeyRound, Plus, ShieldAlert, Upload } from "lucide-react";
import { Suspense, lazy, useState } from "react";
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
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-10">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{networkName} vault</p>
              <h1 className="mt-2 text-3xl font-bold text-[var(--text)] sm:text-4xl">Create your secret recovery phrase</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Store this phrase offline. Anyone with these words can control the wallets generated from it.
              </p>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] text-[var(--text)]">
              <KeyRound size={28} />
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4 text-[var(--text)]">
            <div className="flex gap-3">
              <ShieldAlert className="mt-0.5 shrink-0" size={20} />
              <p className="text-sm leading-6">Never share your seed phrase, private key, screenshots, or clipboard contents with anyone. Imported phrases stay in your browser; only derived wallet keys are saved to your account.</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <label className="block">
              <span className="text-sm font-semibold text-[var(--text)]">Import using seed phrase</span>
              <textarea
                value={seedInput}
                onChange={(event) => setSeedInput(event.target.value)}
                rows={3}
                className="mt-2 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text)] outline-none"
                placeholder="Enter your 12 or 24 word seed phrase"
              />
            </label>
            <button
              onClick={handleImport}
              className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 text-sm font-semibold text-[var(--text)]"
            >
              <Upload size={17} />
              Import Seed Phrase
            </button>
            {seedStatus && <p className="mt-3 text-sm text-[var(--muted)]">{seedStatus}</p>}
          </div>

          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <label key={i} className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3">
                  <span className="mb-1 block text-xs text-[var(--muted)]">{String(i + 1).padStart(2, "0")}</span>
                  <input
                    type="text"
                    value={mnemonic[i] || ""}
                    readOnly
                    className="w-full bg-transparent text-sm font-semibold text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
                    placeholder="empty"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleGenerate}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--text)] px-5 text-sm font-bold text-[var(--app-bg)] transition"
            >
              <Plus size={18} />
              Create Seed Phrase
            </button>
            <button
              onClick={handleCopy}
              disabled={mnemonic.length === 0}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-5 text-sm font-semibold text-[var(--text)] transition disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Copy size={18} />
              Copy to Clipboard
            </button>
          </div>
        </section>

        <section className="min-w-0">
          {mnemonic.length > 0 ? (
            <Suspense fallback={<div className="min-h-[380px] rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8" />}>
              {isSolana ? (
                <LazySolanaWallet mnemonic={mnemonic.join(" ")} />
              ) : (
                <LazyEthWallet mnemonic={mnemonic.join(" ")} />
              )}
            </Suspense>
          ) : (
            <div className="grid min-h-[380px] place-items-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel)] p-8 text-center">
              <div>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-xl bg-[var(--panel-soft)] text-[var(--text)]">
                  <KeyRound size={30} />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-[var(--text)]">No wallet generated yet</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">Create a seed phrase first, then add as many {networkName} accounts as you need.</p>
              </div>
            </div>
          )}
        </section>

        <div className="lg:col-span-2">
          <MarketPanel />
        </div>
      </main>
    </div>
  );
};

export default GenMnemonic;
