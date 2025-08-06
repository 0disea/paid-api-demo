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

    // Obtener cuenta de wallet CDP
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
      // @ts-expect-error CDP account has signing methods but doesn't match viem's SignerWallet type exactly
      account,
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
  } catch (error: unknown) {
    console.error("Error de validación:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error al validar email";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
