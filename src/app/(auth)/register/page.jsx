import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata = {
  title: "Register | SpaceUp Ambassador Portal",
  description: "Join the SpaceUp ambassador network and unlock your referral toolkit.",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-24 sm:px-8">
      <div className="w-full max-w-xl space-y-12">
        <div className="space-y-3 text-center">
          <span className="inline-flex items-center justify-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-white/70 ring-1 ring-white/18">
            Ambassador onboarding
          </span>
          <h1 className="text-3xl font-semibold">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Provide a few details to get access to your referral link, progress tracking, and official SpaceUp assets.
          </p>
        </div>

        <div className="surface-card p-10">
          <RegisterForm />

          <div className="mt-8 flex items-center justify-between text-sm">
            <Link href="/" className="text-white/60 transition hover:text-white">
              ← Back to home
            </Link>
            <p className="text-muted-foreground">
              Have an account?{" "}
              <Link href="/login" className="font-medium text-white hover:text-[#d0b3ff]">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
