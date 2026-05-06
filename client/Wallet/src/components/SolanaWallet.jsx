import { useEffect, useState } from "react";
import { Copy, Eye, EyeOff, Plus } from "lucide-react";
import nacl from "tweetnacl";
import { apiRequest } from "../api";
import { encodeBase58 } from "../crypto/base58";
import { mnemonicToSeed } from "../crypto/bip39";
import { deriveEd25519Path } from "../crypto/ed25519Derive";
import TransactionPanel from "./TransactionPanel";

const mask = "****************";

export function SolanaWallet({ mnemonic }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wallets, setWallets] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;

    async function loadWallets() {
      try {
        const result = await apiRequest("/api/wallets");
        const solWallets = result.data
          .filter((wallet) => wallet.chain === "solana")
          .map((wallet) => ({ ...wallet, showPrivate: false }));

        if (!active) return;
        setWallets(solWallets);
      } catch (error) {
        if (active) setStatus(error.message);
      }
    }

    loadWallets();

    return () => {
      active = false;
    };
  }, []);

  const addWallet = async () => {
    setStatus("Saving wallet...");
    const seed = await mnemonicToSeed(mnemonic);
    const path = `m/44'/501'/${currentIndex}'/0'`;
    const { key: derivedSeed } = await deriveEd25519Path(path, seed);
    const keypair = nacl.sign.keyPair.fromSeed(derivedSeed);

    try {
      const result = await apiRequest("/api/wallets", {
        method: "POST",
        body: JSON.stringify({
          chain: "solana",
          index: currentIndex,
          publicKey: encodeBase58(keypair.publicKey),
          privateKey: encodeBase58(keypair.secretKey),
        }),
      });

      setCurrentIndex((index) => index + 1);
      setWallets((items) => {
        if (items.some((item) => item.publicKey === result.wallet.publicKey)) return items;
        return [...items, { ...result.wallet, showPrivate: false }];
      });
      setStatus("Wallet saved to your account");
    } catch (error) {
      setStatus(error.message || "Could not save wallet");
    }
  };

  const togglePrivate = (idx) => {
    setWallets((items) => items.map((wallet, index) => (index === idx ? { ...wallet, showPrivate: !wallet.showPrivate } : wallet)));
  };

  const copy = (value) => navigator.clipboard.writeText(value);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Solana accounts</p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--text)]">SOL wallet manager</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Derive Solana accounts from your seed phrase with a standard path.</p>
        </div>
        <button onClick={addWallet} className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--text)] px-4 text-sm font-bold text-[var(--app-bg)]">
          <Plus size={18} />
          Add SOL wallet
        </button>
      </div>
      {status && <p className="mt-4 text-sm text-[var(--muted)]">{status}</p>}

      <div className="mt-6 space-y-3">
        {wallets.length === 0 && <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">No Solana accounts yet.</div>}

        {wallets.map((wallet, idx) => (
          <article key={wallet.publicKey} className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Account {idx + 1}</p>
                <p className="mt-1 font-semibold text-[var(--text)]">Solana</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <KeyRow label="Public key" value={wallet.publicKey} onCopy={() => copy(wallet.publicKey)} />
              <KeyRow label="Private key" value={wallet.showPrivate ? wallet.privateKey : mask} onCopy={() => copy(wallet.privateKey)}>
                <button onClick={() => togglePrivate(idx)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--panel)] text-[var(--text)]" aria-label={wallet.showPrivate ? "Hide private key" : "Show private key"}>
                  {wallet.showPrivate ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </KeyRow>
            </div>
            <TransactionPanel chain="solana" address={wallet.publicKey} privateKey={wallet.privateKey} />
          </article>
        ))}
      </div>
    </div>
  );
}

function KeyRow({ label, value, onCopy, children }) {
  return (
    <div className="min-w-0 rounded-xl bg-[var(--panel)] p-3">
      <p className="text-xs font-semibold text-[var(--muted)]">{label}</p>
      <div className="mt-1 flex min-w-0 items-center gap-2">
        <code className="min-w-0 flex-1 truncate text-sm text-[var(--text)]">{value}</code>
        {children}
        <button onClick={onCopy} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--panel-soft)] text-[var(--text)]" aria-label={`Copy ${label}`}>
          <Copy size={16} />
        </button>
      </div>
    </div>
  );
}
