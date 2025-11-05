import { Crown, Rocket } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ambassador from "@/models/Ambassador";
import { HeroActions } from "@/components/home/hero-actions";
import { cn } from "@/lib/utils";

const CROWN_COLORS = {
  1: "text-[#facc15] bg-[#0f172a]",
  2: "text-[#e5e7eb] bg-[#0f172a]",
  3: "text-[#f97316] bg-[#0f172a]",
};

export default async function Home() {
  await connectDB();

  const [session, leaderboardDocs, totalAmbassadors] = await Promise.all([
    getServerSession(authOptions),
    Ambassador.find({})
      .sort({ totalReferrals: -1, createdAt: 1 })
      .limit(10)
      .select("name college totalReferrals _id")
      .lean(),
    Ambassador.countDocuments(),
  ]);

  const leaderboard = leaderboardDocs.map((doc, index) => ({
    id: doc._id.toString(),
    rank: index + 1,
    name: doc.name,
    college: doc.college,
    referrals: doc.totalReferrals ?? 0,
  }));

  let userStanding = null;

  if (session?.user?.id) {
    const userDoc = await Ambassador.findById(session.user.id)
      .select("name college totalReferrals _id")
      .lean();

    if (userDoc) {
      const userReferrals = userDoc.totalReferrals ?? 0;
      const higherCount = await Ambassador.countDocuments({ totalReferrals: { $gt: userReferrals } });
      const rank = higherCount + 1;
      const userId = userDoc._id.toString();
      const isInLeaderboard = leaderboard.some((entry) => entry.id === userId);

      userStanding = {
        id: userId,
        rank,
        name: userDoc.name,
        college: userDoc.college,
        referrals: userReferrals,
        isInLeaderboard,
      };

      if (isInLeaderboard) {
        leaderboard.forEach((entry) => {
          if (entry.id === userId) {
            entry.isCurrentUser = true;
          }
        });
      }
    }
  }

  return (
    <main className="flex flex-1 flex-col px-6 py-24 sm:px-10">
      <section className="mx-auto w-full max-w-3xl space-y-10 text-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/70 ring-1 ring-white/15">
            <Rocket className="h-4 w-4" />
            SpaceUp Ambassador 2025
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Space for every student leader.
          </h1>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-muted-foreground">
            Join the SpaceUp ambassador program and get direct access to resources, referrals, and support from the SEDS CUSAT core team.
          </p>
        </div>

        <HeroActions />
      </section>

      <LeaderboardSection
        entries={leaderboard}
        totalAmbassadors={totalAmbassadors}
        userStanding={userStanding}
      />
    </main>
  );
}

function LeaderboardSection({ entries, totalAmbassadors, userStanding }) {
  if (!entries.length) {
    return null;
  }

  return (
    <section className="mx-auto mt-16 w-full max-w-3xl">
      <div className="surface-card space-y-6 p-6">
        <header className="flex flex-col gap-1 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Leaderboard</p>
          <h2 className="text-xl font-semibold text-white">Top ambassadors</h2>
          <p className="text-sm text-muted-foreground">
            Showing {Math.min(entries.length, 10)} of {totalAmbassadors} ambassadors ranked by total referrals.
          </p>
        </header>

        <div className="space-y-3">
          {entries.map((entry) => (
            <LeaderboardRow key={entry.id} entry={entry} />
          ))}
        </div>

        {userStanding ? (
          <UserStanding standing={userStanding} />
        ) : (
          <p className="text-xs text-muted-foreground">
            Sign in to view your personal rank and referral stats.
          </p>
        )}
      </div>
    </section>
  );
}

function LeaderboardRow({ entry }) {
  const crownStyle = CROWN_COLORS[entry.rank] ?? "bg-white/10 text-white";
  const isTopThree = entry.rank <= 3;

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-left transition",
        entry.isCurrentUser && "border-[#7c3aed]/60 bg-[#7c3aed]/15",
      )}
    >
      <div className="flex items-center gap-3">
        {isTopThree ? (
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", crownStyle)}>
            <Crown className="h-5 w-5" strokeWidth={1.5} fill="currentColor" />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white/70">
            #{entry.rank}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-white">{entry.name}</p>
          <p className="text-xs text-muted-foreground">{entry.college}</p>
        </div>
      </div>
      <p className="text-sm font-semibold text-white">{entry.referrals}</p>
    </div>
  );
}

function UserStanding({ standing }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/12 bg-white/5 p-4 text-left",
        standing.isInLeaderboard ? "border-[#7c3aed]/60 bg-[#7c3aed]/20" : "",
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Your position</p>
      <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-white">#{standing.rank}</p>
          <p className="text-sm text-muted-foreground">{standing.name}</p>
          {standing.college ? (
            <p className="text-xs text-muted-foreground">{standing.college}</p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">Referrals</p>
          <p className="text-2xl font-semibold text-white">{standing.referrals}</p>
        </div>
      </div>
      {!standing.isInLeaderboard ? (
        <p className="mt-3 text-xs text-muted-foreground">Keep pushing to break into the top 10!</p>
      ) : null}
    </div>
  );
}
