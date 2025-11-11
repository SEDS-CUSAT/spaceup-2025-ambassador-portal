import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ambassador from "@/models/Ambassador";
import AdminPanel from "@/components/admin/admin-panel";

const CATEGORY_FIELDS = ["whatsapp_status", "instagram_story", "whatsapp_group"];

export const metadata = {
  title: "Admin Panel | SpaceUp Ambassador Portal",
  description: "Review ambassador submissions and assign points.",
};

function serializeAmbassador(doc) {
  let imagePoints = 0;
  let uploadCount = 0;

  CATEGORY_FIELDS.forEach((field) => {
    const entries = doc[field] || [];
    uploadCount += entries.length;
    entries.forEach((entry) => {
      imagePoints += Number(entry.points) || 0;
    });
  });

  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    college: doc.college,
    totalReferrals: doc.totalReferrals ?? 0,
    manualPoints: Number(doc.manualPoints) || 0,
    imagePoints,
    uploadCount,
    totalPoints: (Number(doc.manualPoints) || 0) + imagePoints,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
  };
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  await connectDB();

  const ambassadors = await Ambassador.find({})
    .sort({ createdAt: 1 })
    .select(
      "name email phone college totalReferrals manualPoints whatsapp_status instagram_story whatsapp_group createdAt",
    )
    .lean();

  const serialized = ambassadors.map(serializeAmbassador);

  return (
    <main className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-12 px-4 py-16 sm:px-10 lg:px-16">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">Admin Console</p>
        <h1 className="text-3xl font-semibold text-white">Field team performance overview</h1>
        <p className="text-sm text-muted-foreground">
          Inspect submissions, adjust scores, and keep the leaderboard fair.
        </p>
      </header>

      <AdminPanel ambassadors={serialized} />
    </main>
  );
}
