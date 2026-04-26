import { useEffect, useMemo, useState } from "react";
import { Activity, WifiOff } from "lucide-react";
import { API_URL } from "../api";

const COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function applyPriceUpdates(current, updates = []) {
  return current.map((coin) => {
    const update = updates.find((item) => item.id === coin.id);
    if (!update) return coin;

    const nextHistory = typeof update.price === "number" ? [...coin.history, update.price].slice(-40) : coin.history;
    return {
      ...coin,
      price: update.price,
      change24h: update.change24h,
      updatedAt: update.updatedAt,
      history: nextHistory,
    };
  });
}

function Sparkline({ points = [] }) {
  const path = useMemo(() => {
    if (points.length < 2) return "";
    const width = 220;
    const height = 62;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    return points
      .map((point, index) => {
        const x = (index / (points.length - 1)) * width;
        const y = height - ((point - min) / range) * height;
        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }, [points]);

  return (
    <svg viewBox="0 0 220 62" className="h-14 w-full" preserveAspectRatio="none" aria-hidden="true">
      <path d={path} fill="none" stroke="var(--accent)" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

export default function MarketPanel() {
  const [status, setStatus] = useState("connecting");
  const [prices, setPrices] = useState(() =>
    COINS.map((coin) => ({
      ...coin,
      price: null,
      updatedAt: null,
      history: [],
    }))
  );

  useEffect(() => {
    let socket;
    let retryTimer;
    let pollTimer;
    let closedByEffect = false;
    const wsUrl = import.meta.env.VITE_PRICE_WS_URL || (import.meta.env.DEV ? "ws://localhost:8787/prices" : "");

    const pollPrices = async () => {
      try {
        const response = await fetch(`${API_URL}/api/prices`);
        if (!response.ok) throw new Error("Price request failed");

        const payload = await response.json();
        setPrices((current) => applyPriceUpdates(current, payload.data));
        setStatus("live");
      } catch {
        setStatus("offline");
      }
    };

    if (!wsUrl) {
      pollPrices();
      pollTimer = window.setInterval(pollPrices, 15000);
      return () => {
        closedByEffect = true;
        window.clearInterval(pollTimer);
      };
    }

    const connect = () => {
      socket = new WebSocket(wsUrl);

      socket.addEventListener("open", () => setStatus("connected"));
      socket.addEventListener("close", () => {
        if (closedByEffect) return;
        setStatus("offline");
        retryTimer = window.setTimeout(connect, 2000);
      });
      socket.addEventListener("error", () => setStatus("offline"));
      socket.addEventListener("message", (event) => {
        const payload = JSON.parse(event.data);

        if (payload.type === "status") {
          setStatus(payload.status);
          return;
        }

        if (payload.type === "snapshot" || payload.type === "prices") {
          setPrices((current) => applyPriceUpdates(current, payload.data));
        }
      });
    };

    connect();

    return () => {
      closedByEffect = true;
      window.clearTimeout(retryTimer);
      window.clearInterval(pollTimer);
      socket?.close();
    };
  }, []);

  const isLive = status === "live" || status === "connected";

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-[var(--muted)]">
            <Activity size={16} />
            Realtime prices
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[var(--text)]">Market feed</h2>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm ${
            isLive ? "text-[var(--text)]" : "text-[var(--muted)]"
          }`}
        >
          {!isLive && <WifiOff size={15} />}
          {isLive ? "Live" : status}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {prices.map((coin) => (
          <article key={coin.id} className="rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[var(--text)]">{coin.name}</h3>
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{coin.symbol}</p>
              </div>
              <span className="rounded-full border border-[var(--border)] px-2 py-1 text-xs text-[var(--muted)]">{coin.symbol}</span>
            </div>
            <p className="mt-5 text-2xl font-bold text-[var(--text)]">{coin.price ? currency.format(coin.price) : "Waiting..."}</p>
            {typeof coin.change24h === "number" && (
              <p className={`mt-1 text-sm ${coin.change24h >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {coin.change24h >= 0 ? "+" : ""}
                {coin.change24h.toFixed(2)}% 24h
              </p>
            )}
            <div className="mt-4">
              <Sparkline points={coin.history} />
            </div>
            <p className="mt-3 text-xs text-[var(--muted)]">
              {coin.updatedAt ? `Updated ${new Date(coin.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Waiting for market data"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
