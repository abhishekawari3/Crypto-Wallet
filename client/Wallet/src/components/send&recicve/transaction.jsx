import { useState } from "react";
import { ethers } from "ethers";
import {
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";

export default function MultiChainWallet({ mnemonic, solSecret }) {
  const [chain, setChain] = useState("eth"); // "eth" or "sol"
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  // 🔹 Ethereum Setup
  const ethProvider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth_sepolia"); // testnet
  const ethWallet = ethers.Wallet.fromPhrase(mnemonic, ethProvider);

  // 🔹 Solana Setup
  const solConnection = new Connection("https://api.devnet.solana.com"); // testnet
  const solSecretKey = Uint8Array.from(solSecret);
  const solWallet = Keypair.fromSecretKey(solSecretKey);

  // Load Wallet Info
  const loadWallet = async () => {
    if (chain === "eth") {
      setAddress(ethWallet.address);
      const bal = await ethProvider.getBalance(ethWallet.address);
      setBalance(ethers.formatEther(bal) + " ETH");
    } else {
      setAddress(solWallet.publicKey.toBase58());
      const bal = await solConnection.getBalance(solWallet.publicKey);
      setBalance(bal / 1e9 + " SOL");
    }
  };

  // Send Transaction
  const sendCrypto = async () => {
    if (chain === "eth") {
      const tx = await ethWallet.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });
      alert("ETH Tx Sent: " + tx.hash);
      await tx.wait();
      alert("ETH Tx Confirmed!");
    } else {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: solWallet.publicKey,
          toPubkey: new PublicKey(to),
          lamports: amount * 1e9,
        })
      );
      const sig = await sendAndConfirmTransaction(solConnection, tx, [solWallet]);
      alert("SOL Tx Sent: " + sig);
    }
  };

  return (
    <div className="p-5 text-white">
      {/* Chain Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setChain("eth")}
          className={`p-2 rounded ${chain === "eth" ? "bg-blue-600" : "bg-gray-500"}`}
        >
          Ethereum
        </button>
        <button
          onClick={() => setChain("sol")}
          className={`p-2 rounded ${chain === "sol" ? "bg-purple-600" : "bg-gray-500"}`}
        >
          Solana
        </button>
      </div>

      {/* Load Wallet */}
      <button onClick={loadWallet} className="bg-green-500 p-2 rounded mb-4">
        Load {chain.toUpperCase()} Wallet
      </button>

      {address && (
        <div>
          <p>Address: {address}</p>
          <p>Balance: {balance}</p>

          <input
            type="text"
            placeholder="Recipient Address"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="text-black p-2 my-2 w-full"
          />
          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-black p-2 my-2 w-full"
          />
          <button onClick={sendCrypto} className="bg-yellow-500 p-2 rounded">
            Send {chain.toUpperCase()}
          </button>
        </div>
      )}
    </div>
  );
}
