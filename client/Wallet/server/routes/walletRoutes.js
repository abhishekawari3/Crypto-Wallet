import { requireUser } from "../middleware/auth.js";
import { getWallets, saveWallet } from "../services/walletService.js";
import { readBody, sendJson } from "../utils/http.js";

export async function handleWalletRoutes(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/wallets") {
    const user = await requireUser(req, res);
    if (!user) return true;

    sendJson(res, 200, { data: await getWallets(user.id) });
    return true;
  }

  if (req.method === "POST" && pathname === "/api/wallets") {
    const user = await requireUser(req, res);
    if (!user) return true;

    const wallet = await saveWallet(user.id, await readBody(req));
    sendJson(res, 201, { wallet });
    return true;
  }

  return false;
}
