import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { Copy, Download, RefreshCw, Send } from "lucide-react";
import { decodeBase58 } from "../crypto/base58";

const ETH_RPC_URL = import.meta.env.VITE_ETH_RPC_URL || "https://rpc.ankr.com/eth_sepolia";
const SOL_RPC_URL = import.meta.env.VITE_SOL_RPC_URL || "https://api.devnet.solana.com";

export default function TransactionPanel({ chain, address, privateKey }) {
  const [mode, setMode] = useState("receive");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState("");
  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState("");

  const symbol = chain === "ethereum" ? "ETH" : "SOL";

  const loadBalance = useCallback(async () => {
    setStatus("Loading balance...");
    try {
      if (chain === "ethereum") {
        const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
        const value = await provider.getBalance(address);
        setBalance(`${Number(ethers.formatEther(value)).toFixed(6)} ETH`);
      } else {
        const { Connection, PublicKey } = await import("@solana/web3.js");
        const connection = new Connection(SOL_RPC_URL, "confirmed");
        const value = await connection.getBalance(new PublicKey(address));
        setBalance(`${(value / 1e9).toFixed(6)} SOL`);
      }
      setStatus("");
    } catch (error) {
      setStatus(error.message || "Could not load balance");
    }
  }, [address, chain]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  const sendCrypto = async (event) => {
    event.preventDefault();
    setStatus("Sending transaction...");
    setTxHash("");

    try {
      if (!to || !amount || Number(amount) <= 0) {
        throw new Error("Enter a valid recipient and amount");
      }

      if (chain === "ethereum") {
        const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
        const wallet = new ethers.Wallet(privateKey, provider);
        const tx = await wallet.sendTransaction({
          to,
          value: ethers.parseEther(amount),
        });
        setTxHash(tx.hash);
        setStatus("Transaction sent. Waiting for confirmation...");
        await tx.wait();
      } else {
        const { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } = await import("@solana/web3.js");
        const connection = new Connection(SOL_RPC_URL, "confirmed");
        const sender = Keypair.fromSecretKey(decodeBase58(privateKey));
        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: sender.publicKey,
            toPubkey: new PublicKey(to),
            lamports: Math.round(Number(amount) * 1e9),
          })
        );
        const signature = await sendAndConfirmTransaction(connection, tx, [sender]);
        setTxHash(signature);
      }

      setStatus("Transaction confirmed");
      setTo("");
      setAmount("");
      await loadBalance();
    } catch (error) {
      setStatus(error.message || "Transaction failed");
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setStatus("Address copied");
  };

  return (
    <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Balance</p>
          <p className="mt-1 text-lg font-bold text-[var(--text)]">{balance || "Not loaded"}</p>
        </div>
        <button onClick={loadBalance} className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--border)] px-3 text-sm text-[var(--text)]">
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-soft)] p-1">
        <ModeButton active={mode === "receive"} onClick={() => setMode("receive")} icon={<Download size={15} />} label="Receive" />
        <ModeButton active={mode === "send"} onClick={() => setMode("send")} icon={<Send size={15} />} label="Send" />
      </div>

      {mode === "receive" ? (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-3">
          <p className="text-sm text-[var(--muted)]">Receive {symbol} at this address</p>
          <div className="mt-2 flex min-w-0 items-center gap-2">
            <code className="min-w-0 flex-1 truncate text-sm text-[var(--text)]">{address}</code>
            <button onClick={copyAddress} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] text-[var(--text)]" aria-label="Copy receive address">
              <Copy size={15} />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={sendCrypto} className="mt-4 space-y-3">
          <Field label="Recipient address" value={to} onChange={setTo} />
          <Field label={`Amount (${symbol})`} type="number" value={amount} onChange={setAmount} />
          <button className="h-10 w-full rounded-full bg-[var(--text)] text-sm font-bold text-[var(--app-bg)]">
            Send {symbol}
          </button>
        </form>
      )}

      {status && <p className="mt-3 text-sm text-[var(--muted)]">{status}</p>}
      {txHash && <p className="mt-2 truncate text-xs text-[var(--muted)]">Tx: {txHash}</p>}
    </div>
  );
}

function ModeButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-full text-sm ${active ? "bg-[var(--panel)] text-[var(--text)]" : "text-[var(--muted)]"}`}
    >
      {icon}
      {label}
    </button>
  );
}

function Field({ label, type = "text", value, onChange }) {
  return (
    <label className="block">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <input
        type={type}
        step={type === "number" ? "any" : undefined}
        min={type === "number" ? "0" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-3 text-sm text-[var(--text)] outline-none"
        required
      />
    </label>
  );
}
