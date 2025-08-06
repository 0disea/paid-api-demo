import { CdpClient } from "@coinbase/cdp-sdk";
import { toAccount } from "viem/accounts";

let cdpInstance: CdpClient | null = null;
let walletAccount: any = null;

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

    // Crear cuenta
    const cdpAccount = await cdp.evm.createAccount();

    // Convertir a cuenta viem para compatibilidad con x402
    walletAccount = toAccount(cdpAccount);
  }

  return walletAccount;
}

export async function getWalletBalance() {
  const account = await getWalletAccount();

  // Para propósitos de demo, devolver saldo simulado
  // En producción, consultarías el saldo real
  return {
    address: account.address,
    ethBalance: 0.1, // Saldo simulado
    usdcBalance: 10, // Saldo USDC simulado
  };
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
