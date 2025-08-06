import { NextRequest, NextResponse } from "next/server";
import { withPaymentInterceptor, decodeXPaymentResponse } from "x402-axios";
import axios from "axios";
import { getWalletAccount } from "@/lib/cdp-wallet";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "El email es requerido" },
        { status: 400 },
      );
    }

    // Obtener cuenta de wallet
    const account = await getWalletAccount();

    // Crear instancia axios con interceptor de pago
    const api = withPaymentInterceptor(
      axios.create({
        baseURL: process.env.NEXT_PUBLIC_VALIDATION_API_URL!.replace(
          "/api/validate-email",
          "",
        ),
        headers: {
          "Content-Type": "application/json",
        },
      }),
      account,
      {
        maxAmount: BigInt(10000), // 0.01 USDC máximo
      },
    );

    // Hacer solicitud a la API de validación
    const response = await api.post("/api/validate-email", { email });

    // Decodificar respuesta de pago si está presente
    let paymentInfo = null;
    const paymentResponseHeader = response.headers["x-payment-response"];
    if (paymentResponseHeader) {
      paymentInfo = decodeXPaymentResponse(paymentResponseHeader);
    }

    return NextResponse.json({
      validation: response.data,
      payment: paymentInfo,
    });
  } catch (error: any) {
    console.error("Error de validación:", error);
    return NextResponse.json(
      { error: error.message || "Error al validar email" },
      { status: 500 },
    );
  }
}
