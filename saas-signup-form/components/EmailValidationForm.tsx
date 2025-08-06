"use client";

import { useState } from "react";

interface ValidationResult {
  email: string;
  valid: boolean;
  checks: {
    format: boolean;
    disposable: boolean;
    mx_records: boolean;
  };
  risk_score: number;
  recommendation: "accept" | "review" | "reject";
  details: {
    domain: string;
    mx_hosts: string[];
    disposable_domain: boolean;
  };
}

interface PaymentInfo {
  transactionHash: string;
  amount: string;
  token: string;
}

export function EmailValidationForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [error, setError] = useState("");

  const validateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Validación falló");
      }

      setResult(data.validation);
      if (data.payment) {
        setPayment(data.payment);
        setTotalCost(
          (prev) =>
            prev + parseFloat(process.env.NEXT_PUBLIC_VALIDATION_PRICE!),
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al validar email";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (recommendation: string) => {
    switch (recommendation) {
      case "accept":
        return "text-green-600";
      case "review":
        return "text-yellow-600";
      case "reject":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getCheckIcon = (passed: boolean) => {
    return passed ? "✓" : "✗";
  };

  const getCheckColor = (passed: boolean) => {
    return passed ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={validateEmail} className="mb-8">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingrese email para validar"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Validando..." : "Validar"}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Costo: ${process.env.NEXT_PUBLIC_VALIDATION_PRICE} por validación
        </p>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white border rounded-lg p-6 mb-4">
          <h3 className="text-lg font-semibold mb-4">
            Resultados de Validación
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{result.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <p
                className={`font-medium capitalize ${getStatusColor(result.recommendation)}`}
              >
                {result.recommendation}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Verificaciones de Validación
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={getCheckColor(result.checks.format)}>
                  {getCheckIcon(result.checks.format)}
                </span>
                <span>Formato de email válido</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={getCheckColor(result.checks.disposable)}>
                  {getCheckIcon(result.checks.disposable)}
                </span>
                <span>No es un email desechable</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={getCheckColor(result.checks.mx_records)}>
                  {getCheckIcon(result.checks.mx_records)}
                </span>
                <span>El dominio tiene registros MX</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Puntuación de Riesgo</p>
              <p className="font-medium">{result.risk_score}/100</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Dominio</p>
              <p className="font-medium">{result.details.domain}</p>
            </div>
          </div>

          {payment && payment.transactionHash && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                TX de Pago: {payment.transactionHash.slice(0, 10)}...
              </p>
            </div>
          )}
        </div>
      )}

      {totalCost > 0 && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total gastado en validaciones</p>
          <p className="text-2xl font-semibold">${totalCost.toFixed(3)}</p>
        </div>
      )}
    </div>
  );
}
