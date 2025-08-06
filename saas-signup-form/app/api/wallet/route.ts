import { NextResponse } from "next/server";
import { getWalletBalance, fundWallet } from "@/lib/cdp-wallet";

export async function GET() {
  try {
    const balance = await getWalletBalance();
    return NextResponse.json(balance);
  } catch (error: unknown) {
    console.error("Error al obtener saldo de wallet:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error al obtener saldo de wallet";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await fundWallet();
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error al fondear wallet:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error al fondear wallet";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
