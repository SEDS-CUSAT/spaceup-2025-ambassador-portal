'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

export default function AdminPanel({ ambassadors }) {
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const totalAmbassadors = ambassadors.length;
    const totalUploads = ambassadors.reduce((acc, item) => acc + (item.uploadCount || 0), 0);
    const imagePoints = ambassadors.reduce((acc, item) => acc + (item.imagePoints || 0), 0);
    const manualPoints = ambassadors.reduce((acc, item) => acc + (item.manualPoints || 0), 0);
    return {
      totalAmbassadors,
      totalUploads,
      imagePoints,
      manualPoints,
    };
  }, [ambassadors]);

  const filtered = useMemo(() => {
    if (!query.trim()) return ambassadors;
    const value = query.trim().toLowerCase();
    return ambassadors.filter((ambassador) => {
      return [ambassador.name, ambassador.email, ambassador.college, ambassador.phone]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(value));
    });
  }, [ambassadors, query]);

  if (!ambassadors.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-sm text-white/70">
        No ambassadors found yet.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Ambassadors" value={stats.totalAmbassadors} />
        <SummaryCard label="Evidence uploads" value={stats.totalUploads} />
        <SummaryCard label="Image points" value={stats.imagePoints} />
        <SummaryCard label="Manual points" value={stats.manualPoints} />
      </div>

      <div className="rounded-2xl border border-white/12 bg-white/5">
        <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Ambassador roster</h2>
            <p className="text-xs text-white/60">Select a field member to manage uploads and scoring.</p>
          </div>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, or college"
            className="bg-black/30"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-left text-sm text-white/80">
            <thead className="text-xs uppercase tracking-[0.2em] text-white/50">
              <tr className="border-b border-white/10">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">College</th>
                <th className="px-6 py-3 text-right">Referrals</th>
                <th className="px-6 py-3 text-right">Image pts</th>
                <th className="px-6 py-3 text-right">Manual pts</th>
                <th className="px-6 py-3 text-right">Total pts</th>
                <th className="px-6 py-3 text-right">Uploads</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((ambassador) => (
                  <tr key={ambassador.id} className="border-b border-white/5 last:border-b-0">
                    <td className="max-w-[220px] px-6 py-4 font-medium text-white whitespace-normal">
                      {ambassador.name}
                    </td>
                    <td className="max-w-[260px] px-6 py-4 text-white/70 whitespace-normal">
                      {ambassador.email}
                    </td>
                    <td className="max-w-[260px] px-6 py-4 text-white/70 whitespace-normal">
                      {ambassador.college}
                    </td>
                    <td className="px-6 py-4 text-right text-white/80">{ambassador.totalReferrals}</td>
                    <td className="px-6 py-4 text-right text-white/80">{ambassador.imagePoints}</td>
                    <td className="px-6 py-4 text-right text-white/80">{ambassador.manualPoints}</td>
                    <td className="px-6 py-4 text-right font-semibold text-white">{ambassador.totalPoints}</td>
                    <td className="px-6 py-4 text-right text-white/70">{ambassador.uploadCount}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/user-details/${ambassador.id}`}
                        className="text-sm font-medium text-white/80 transition hover:text-white"
                      >
                        View details →
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-6 text-center text-sm text-white/60">
                    No ambassadors match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-transparent p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-white/60">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
