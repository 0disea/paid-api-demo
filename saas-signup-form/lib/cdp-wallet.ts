import { CdpClient } from "@coinbase/cdp-sdk";
import type { EvmServerAccount } from "@coinbase/cdp-sdk";

let cdpInstance: CdpClient | null = null;
let walletAccount: EvmServerAccount | null = null;

export async function initializeCDP() {
  if (!cdpInstance) {
    cdpInstance = new CdpClient({
      apiKeyId: process.env.CDP_API_KEY_ID!,
      apiKeySecret: process.env.CDP_API_KEY_SECRET!,
      walletSecret: process.env.CDP_WALLET_SECRET!,
    });
  }
  return cdpInstance;
}

export async function getWalletAccount() {
  if (!walletAccount) {
    const cdp = await initializeCDP();

    // Crear cuenta EVM
    walletAccount = await cdp.evm.createAccount();
  }

  return walletAccount;
}

export async function getWalletBalance() {
  const account = await getWalletAccount();
  const cdp = await initializeCDP();

  try {
    // Obtener balances reales usando el SDK CDP
    const result = await cdp.evm.listTokenBalances({
      address: account.address,
      network: "base-sepolia",
    });

    // Buscar balance de ETH y USDC
    let ethBalance = 0;
    let usdcBalance = 0;

    // Iterar sobre los balances según la documentación
    result.balances.forEach((balance) => {
      if (balance.token.symbol === "ETH") {
        // Convertir de wei a ETH (amount es bigint)
        ethBalance = Number(balance.amount.amount) / 1e18;
      } else if (balance.token.symbol === "USDC") {
        // USDC tiene 6 decimales (amount es bigint)
        usdcBalance = Number(balance.amount.amount) / 1e6;
      }
    });

    return {
      address: account.address,
      ethBalance,
      usdcBalance,
    };
  } catch (error) {
    console.error("Error al obtener balances:", error);
    // Devolver valores por defecto en caso de error
    return {
      address: account.address,
      ethBalance: 0,
      usdcBalance: 0,
    };
  }
}

export async function fundWallet() {
  const cdp = await initializeCDP();
  const account = await getWalletAccount();

  // Solicitar ETH de testnet del faucet
  const response = await cdp.evm.requestFaucet({
    address: account.address,
    network: "base-sepolia",
    token: "eth",
  });

  return response;
}
