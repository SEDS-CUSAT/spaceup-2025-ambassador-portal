import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = {
  title: "Forgot Password | SpaceUp Ambassador Portal",
  description: "Reset your password for the SpaceUp Ambassador Portal.",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-24 sm:px-8">
      <div className="w-full max-w-md space-y-10">
        <div className="space-y-3 text-center">
          <span className="inline-flex items-center justify-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-white/70 ring-1 ring-white/18">
            Account Recovery
          </span>
          <h1 className="text-3xl font-semibold">Forgot Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="surface-card p-8">
          <ForgotPasswordForm />

          <div className="mt-6 flex items-center justify-center text-sm">
            <Link href="/login" className="text-white/60 transition hover:text-white">
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
