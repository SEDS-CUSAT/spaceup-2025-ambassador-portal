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
            Portal access
          </span>
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Continue to your workspace—ambassadors see their stats, admins manage submissions.
          </p>
        </div>

        <div className="surface-card p-8">
          <LoginForm />

          <div className="mt-6 flex items-center justify-center text-sm">
            {/* <Link href="/" className="text-white/60 transition hover:text-white">
              ← Back to home
            </Link> */}
            <p className="text-muted-foreground text-center">Contact <Link href="https://api.whatsapp.com/send/?phone=918590546651&text=I+forgot+my+password+for+the+SpaceUp+Ambassador+Portal&type=phone_number&app_absent=0" className="underline">support</Link> if password is forgotten.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
