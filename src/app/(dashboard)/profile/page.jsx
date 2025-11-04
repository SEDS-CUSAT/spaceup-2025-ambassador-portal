const profileSections = [
  {
    title: "Personal information",
    description: "Keep your name, contact number, and campus details current for program updates.",
  },
  {
    title: "Security",
    description: "Change your password and review recent sign-ins once authentication is wired up.",
  },
  {
    title: "Program stats",
    description: "Review referral totals, earned points, and rankings as data becomes available.",
  },
];

export const metadata = {
  title: "Profile | SpaceUp Ambassador Portal",
  description: "Manage your ambassador profile, security preferences, and statistics.",
};

export default function ProfilePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-16 sm:px-10">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
          Ambassador profile
        </p>
        <h1 className="text-3xl font-semibold">Account settings</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Manage your personal details and preferences. Each section below will connect to dedicated API routes
          and forms in the next development milestone.
        </p>
      </header>

      <div className="grid gap-6">
        {profileSections.map((section) => (
          <section key={section.title} className="surface-card space-y-4 p-8">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </div>
            <div className="rounded-xl border border-dashed border-white/12 bg-white/5 p-5 text-xs text-white/60">
              Form fields will be introduced here. For now this placeholder clarifies the upcoming structure.
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
