import { useEffect, useState } from "react";
import { mnemonicToSeed } from "bip39";
import { HDNodeWallet, Wallet } from "ethers";
import { Copy, Eye, EyeOff, Plus } from "lucide-react";
import { apiRequest } from "../api";
import TransactionPanel from "./TransactionPanel";

const mask = "****************";

export const EthWallet = ({ mnemonic }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wallets, setWallets] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;

    async function loadWallets() {
      try {
        const result = await apiRequest("/api/wallets");
        const ethWallets = result.data
          .filter((wallet) => wallet.chain === "ethereum")
          .map((wallet) => ({ ...wallet, showPrivate: false }));

        if (!active) return;
        setWallets(ethWallets);
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
    const derivationPath = `m/44'/60'/${currentIndex}'/0'`;
    const hdNode = HDNodeWallet.fromSeed(seed);
    const child = hdNode.derivePath(derivationPath);
    const wallet = new Wallet(child.privateKey);

    try {
      const result = await apiRequest("/api/wallets", {
        method: "POST",
        body: JSON.stringify({
          chain: "ethereum",
          index: currentIndex,
          address: wallet.address,
          privateKey: child.privateKey,
        }),
      });

      setCurrentIndex((index) => index + 1);
      setWallets((items) => {
        if (items.some((item) => item.address === result.wallet.address)) return items;
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
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Ethereum accounts</p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--text)]">EVM wallet manager</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Derive addresses from your seed phrase using the Ethereum HD path.</p>
        </div>
        <button onClick={addWallet} className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--text)] px-4 text-sm font-bold text-[var(--app-bg)]">
          <Plus size={18} />
          Add ETH wallet
        </button>
      </div>
      {status && <p className="mt-4 text-sm text-[var(--muted)]">{status}</p>}

      <div className="mt-6 space-y-3">
        {wallets.length === 0 && <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">No Ethereum accounts yet.</div>}

        {wallets.map((wallet, idx) => (
          <article key={wallet.address} className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Account {idx + 1}</p>
                <p className="mt-1 font-semibold text-[var(--text)]">Ethereum</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <KeyRow label="Address" value={wallet.address} onCopy={() => copy(wallet.address)} />
              <KeyRow label="Private key" value={wallet.showPrivate ? wallet.privateKey : mask} onCopy={() => copy(wallet.privateKey)}>
                <button onClick={() => togglePrivate(idx)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--panel)] text-[var(--text)]" aria-label={wallet.showPrivate ? "Hide private key" : "Show private key"}>
                  {wallet.showPrivate ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </KeyRow>
            </div>
            <TransactionPanel chain="ethereum" address={wallet.address} privateKey={wallet.privateKey} />
          </article>
        ))}
      </div>
    </div>
  );
};

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
