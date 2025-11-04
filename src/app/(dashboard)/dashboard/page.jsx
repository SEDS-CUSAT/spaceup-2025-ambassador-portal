import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ambassador from "@/models/Ambassador";
import { CopyReferralButton } from "./copy-referral-button";
import { LogoutButton } from "./logout-button";

export const metadata = {
  title: "Dashboard | SpaceUp Ambassador Portal",
  description: "Quick glance at your referral code and outreach count.",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectDB();
  const ambassador = await Ambassador.findById(session.user.id)
    .select("name referralCode totalReferrals")
    .lean();

  if (!ambassador) {
    redirect("/login");
  }

  const referralCode = ambassador.referralCode ?? "";
  const totalReferrals = ambassador.totalReferrals ?? 0;
  const name = ambassador.name ?? "Ambassador";

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 py-16 sm:px-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">SpaceUp Portal</p>
        <h1 className="text-3xl font-semibold text-white">Welcome back, {name.split(' ')[0]}.</h1>
        <p className="text-sm text-muted-foreground">
          Copy your referral code, check totals, and you&apos;re good to go.
        </p>
      </header>

      <section className="surface-card space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/55">Referral code</p>
            <p className="mt-2 text-2xl font-semibold text-white">{referralCode || '—'}</p>
          </div>
          <CopyReferralButton referralCode={referralCode} />
        </div>
        <div className="rounded-xl border border-white/12 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">Total referrals</p>
          <p className="mt-3 text-3xl font-semibold text-white">{totalReferrals}</p>
        </div>
      </section>

      <div className="flex justify-end">
        <LogoutButton />
      </div>
    </main>
  );
}
