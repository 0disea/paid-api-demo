import { NextRequest, NextResponse } from "next/server";
import { validateEmail } from "@/lib/email-validator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "El email es requerido" },
        { status: 400 },
      );
    }

    // Validar el email
    const result = await validateEmail(email);

    // Devolver resultado de validación
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error de validación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
