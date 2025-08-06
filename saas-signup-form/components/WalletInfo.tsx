"use client";

import { useState, useEffect } from "react";

export function WalletInfo() {
  const [balance, setBalance] = useState<{
    address: string;
    usdcBalance: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [funding, setFunding] = useState(false);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/wallet");
      if (!response.ok) {
        throw new Error("Failed to fetch wallet balance");
      }
      const walletBalance = await response.json();
      setBalance(walletBalance);
    } catch (error) {
      console.error("Error al obtener saldo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFundWallet = async () => {
    setFunding(true);
    try {
      const response = await fetch("/api/wallet", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to fund wallet");
      }
      // Esperar un poco para que se procese el fondeo
      setTimeout(() => {
        fetchBalance();
      }, 5000);
    } catch (error) {
      console.error("Error al fondear wallet:", error);
    } finally {
      setFunding(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  if (loading) return <div>Cargando wallet...</div>;

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-6">
      <h3 className="font-semibold mb-2">Información de Wallet</h3>
      {balance && (
        <>
          <p className="text-sm text-gray-600">Dirección: {balance.address}</p>
          <p className="text-sm text-gray-600">
            Saldo USDC: ${balance.usdcBalance.toFixed(4)}
          </p>
          {balance.usdcBalance < 0.01 && (
            <button
              onClick={handleFundWallet}
              disabled={funding}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {funding ? "Solicitando fondos..." : "Fondear Wallet (Testnet)"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
