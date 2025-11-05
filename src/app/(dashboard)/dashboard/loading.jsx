export default function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 items-center justify-center px-6 py-16 sm:px-10">
      <div className="w-full space-y-4 rounded-2xl border border-white/12 bg-white/5 p-6">
        <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
        <div className="h-10 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-24 animate-pulse rounded-xl bg-white/10" />
          <div className="h-24 animate-pulse rounded-xl bg-white/10" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}
