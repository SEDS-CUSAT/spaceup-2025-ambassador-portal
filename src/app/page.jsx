"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  function handleLaunch() {
    router.push("/dashboard");
  }

  function handleRegister() {
    router.push("/register");
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

        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={handleLaunch} className="rounded-full px-6">
            Launch dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleRegister}
            variant="secondary"
            className="rounded-full border-white/25 px-5 text-white/80 hover:border-white/50"
          >
            Become an ambassador
          </Button>
        </div>
      </section>
    </main>
  );
}
