import { promises as dns } from "dns";
import validator from "validator";
import { disposableDomains } from "./disposable-domains";

export interface ValidationResult {
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

export async function validateEmail(email: string): Promise<ValidationResult> {
  const domain = email.split("@")[1];

  // Verificación 1: Validación del formato de email
  const formatValid = validator.isEmail(email);

  // Verificación 2: Verificación de dominio desechable
  const isDisposable = disposableDomains.has(domain);

  // Verificación 3: Validación de registros MX
  let mxRecords: string[] = [];
  let hasMxRecords = false;

  try {
    const records = await dns.resolveMx(domain);
    hasMxRecords = records.length > 0;
    mxRecords = records.map((record) => record.exchange);
  } catch (error) {
    //remover antes de irnos a producción
    console.error(error);
    hasMxRecords = false;
  }

  // Calcular puntuación de riesgo (0-100)
  let riskScore = 0;
  if (!formatValid) riskScore += 40;
  if (isDisposable) riskScore += 40;
  if (!hasMxRecords) riskScore += 20;

  // Determinar recomendación
  let recommendation: "accept" | "review" | "reject";
  if (riskScore >= 60) {
    recommendation = "reject";
  } else if (riskScore >= 30) {
    recommendation = "review";
  } else {
    recommendation = "accept";
  }

  return {
    email,
    valid: formatValid && !isDisposable && hasMxRecords,
    checks: {
      format: formatValid,
      disposable: !isDisposable,
      mx_records: hasMxRecords,
    },
    risk_score: riskScore,
    recommendation,
    details: {
      domain,
      mx_hosts: mxRecords,
      disposable_domain: isDisposable,
    },
  };
}
