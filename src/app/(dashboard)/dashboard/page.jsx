import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ambassador from "@/models/Ambassador";
import UploadSection from "@/components/dashboard/upload-section";
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
    .select("name referralCode totalReferrals whatsapp_status instagram_story whatsapp_group")
    .lean();

  if (!ambassador) {
    redirect("/login");
  }

  const referralCode = ambassador.referralCode ?? "";
  const totalReferrals = ambassador.totalReferrals ?? 0;
  const name = ambassador.name ?? "Ambassador";

  const serializeUploads = (entries = []) =>
    entries.map((entry) => ({
      url: entry.url,
      public_id: entry.public_id,
      approval_status: entry.approval_status ?? "pending",
      points: typeof entry.points === "number" ? entry.points : 0,
      uploadedAt:
        entry.uploadedAt instanceof Date
          ? entry.uploadedAt.toISOString()
          : entry.uploadedAt ?? new Date().toISOString(),
    }));

  const initialUploads = {
    whatsapp_status: serializeUploads(ambassador.whatsapp_status),
    instagram_story: serializeUploads(ambassador.instagram_story),
    whatsapp_group: serializeUploads(ambassador.whatsapp_group),
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-4 py-16 sm:px-8 lg:px-12">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">SpaceUp Ambassador Portal</p>
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

      <UploadSection userId={session.user.id} initialUploads={initialUploads} />

      <div className="flex items-center justify-between gap-4 text-sm">
        <Link href="/" className="text-white/60 transition hover:text-white">
          ← Back to home
        </Link>
        <LogoutButton />
      </div>
    </main>
  );
}
