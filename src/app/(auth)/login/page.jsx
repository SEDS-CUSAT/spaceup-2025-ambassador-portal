import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Login | SpaceUp Ambassador Portal",
  description: "Access your SpaceUp ambassador dashboard and track your referrals.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-24 sm:px-8">
      <div className="w-full max-w-md space-y-10">
        <div className="space-y-3 text-center">
          <span className="inline-flex items-center justify-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-white/70 ring-1 ring-white/18">
            Ambassador access
          </span>
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Continue to your personalized dashboard to review referrals, points, and announcements.
          </p>
        </div>

        <div className="surface-card p-8">
          <LoginForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to the program?{" "}
            <Link href="/register" className="font-medium text-white hover:text-[#d0b3ff]">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
