import { EmailValidationForm } from "@/components/EmailValidationForm";
import { WalletInfo } from "@/components/WalletInfo";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Demo de Validación de Email SaaS
          </h1>
          <p className="text-xl text-gray-600">
            Valida emails con micropagos usando x402 y WalletAPIv2
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <WalletInfo />
          <EmailValidationForm />
        </div>
      </div>
    </main>
  );
}
