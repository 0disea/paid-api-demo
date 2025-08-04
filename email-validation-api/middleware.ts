import { paymentMiddleware } from "x402-next";

// Para desarrollo en testnet
export const middleware = paymentMiddleware(
  (process.env.WALLET_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`, // Tu dirección de wallet receptora
  {
    "/api/validate-email": {
      price: "$0.005",
      network: "base-sepolia",
      config: {
        description: "Servicio de validación de email",
        mimeType: "application/json",
        maxTimeoutSeconds: 30,
        outputSchema: {
          type: "object",
          properties: {
            email: { type: "string" },
            valid: { type: "boolean" },
            risk_score: { type: "number" },
            recommendation: { type: "string" },
          },
        },
      },
    },
  },
  {
    url: "<https://x402.org/facilitator>", // Facilitador de testnet
  },
);

export const config = {
  matcher: ["/api/validate-email"],
};
