export default function RootLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0a0e27]">
      <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/5 px-6 py-4 text-sm font-medium text-white/80">
        <span className="h-3 w-3 animate-ping rounded-full bg-[#7c3aed]" aria-hidden />
        Preparing the ambassador portal…
      </div>
    </div>
  );
}
