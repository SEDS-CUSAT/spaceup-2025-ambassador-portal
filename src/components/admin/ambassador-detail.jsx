'use client';

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Upload, Users, Image as ImageIcon, Plus } from "lucide-react";

const CATEGORY_LABELS = {
  whatsapp_status: "WhatsApp Status",
  instagram_story: "Instagram Story",
  whatsapp_group: "WhatsApp Group Share",
};

const STATUS_BADGE_VARIANTS = {
  pending: "secondary",
  verified: "default",
  rejected: "destructive",
};

const STATUS_COLORS = {
  pending: "text-amber-400",
  verified: "text-emerald-400",
  rejected: "text-rose-400",
};

const clampPoints = (value) => {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(5, Math.round(numeric)));
};

function normalizeResponseEntry(entry) {
  return {
    url: entry.url,
    public_id: entry.public_id,
    uploadedAt: entry.uploadedAt,
    approval_status: entry.approval_status,
    points: clampPoints(entry.points),
  };
}

function normalizeAmbassador(ambassador) {
  return {
    id: ambassador.id,
    name: ambassador.name,
    email: ambassador.email,
    phone: ambassador.phone,
    college: ambassador.college,
    totalReferrals: ambassador.totalReferrals ?? 0,
    manualPoints:
      typeof ambassador.manualPoints === "number" ? ambassador.manualPoints : Number(ambassador.manualPoints) || 0,
    uploads: {
      whatsapp_status: (ambassador.uploads?.whatsapp_status || []).map(normalizeResponseEntry),
      instagram_story: (ambassador.uploads?.instagram_story || []).map(normalizeResponseEntry),
      whatsapp_group: (ambassador.uploads?.whatsapp_group || []).map(normalizeResponseEntry),
    },
  };
}

// Utility to block invalid number input keys
const blockInvalidChar = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();

export default function AmbassadorDetail({ member }) {
  const [row, setRow] = useState(() => normalizeAmbassador(member));
  const [saving, setSaving] = useState(false);

  const imagePoints = useMemo(
    () =>
      Object.values(row.uploads).flat().reduce((total, item) => {
        const numeric = typeof item.points === "number" ? item.points : Number(item.points) || 0;
        return total + numeric;
      }, 0),
    [row.uploads]
  );
  const manualPoints = typeof row.manualPoints === "number" ? row.manualPoints : Number(row.manualPoints) || 0;
  const totalPoints = imagePoints + manualPoints;

  const handleManualInput = (rawValue) => {
    if (rawValue === "") {
      setRow((prev) => ({ ...prev, manualPoints: "" }));
      return;
    }

    const numeric = Number(rawValue);
    if (!Number.isFinite(numeric)) return;

    setRow((prev) => ({ ...prev, manualPoints: numeric }));
  };

  const commitManualPoints = () => {
    setRow((prev) => ({ ...prev, manualPoints: clampPoints(prev.manualPoints) }));
  };

  const updateUploadField = (category, publicId, field, value) => {
    setRow((prev) => {
      const nextUploads = { ...prev.uploads };
      nextUploads[category] = nextUploads[category].map((item) => {
        if (item.public_id !== publicId) return item;
        if (field === "points") {
          if (value === "") {
            return { ...item, points: "" };
          }

          const numeric = Number(value);
          if (!Number.isFinite(numeric)) return item;

          return { ...item, points: numeric };
        }
        if (field === "approval_status") {
          return { ...item, approval_status: value };
        }
        return item;
      });
      return { ...prev, uploads: nextUploads };
    });
  };

  const commitUploadPoints = (category, publicId, value) => {
    const clamped = clampPoints(value);
    updateUploadField(category, publicId, "points", clamped);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      manualPoints: clampPoints(row.manualPoints),
      imageUpdates: Object.entries(row.uploads).flatMap(([type, items]) =>
        items.map((item) => ({
          type,
          public_id: item.public_id,
          points: clampPoints(item.points),
          approval_status: item.approval_status,
        }))
      ),
    };

    try {
      const res = await fetch(`/api/admin/ambassadors/${row.id}/points`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Update failed");

      setRow(normalizeAmbassador(data.data));
      toast.success("Points updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-blue-950 to-slate-950 text-white">
      <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <p className="text-sm uppercase tracking-widest text-blue-300">Member Profile</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">{row.name}</h1>
              <p className="mt-1 text-sm text-blue-200">
                {row.email} • {row.phone}
              </p>
              <p className="text-xs text-blue-400">{row.college}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <StatCard icon={Users} label="Referrals" value={row.totalReferrals} />
            <StatCard icon={ImageIcon} label="Image Points" value={imagePoints} />
            <StatCard icon={Plus} label="Manual Points" value={manualPoints} />
          </div>
        </div>

        <Separator className="bg-white/10" />

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Uploads Section */}
          <div className="space-y-6 lg:col-span-2">
            {Object.entries(row.uploads).map(([type, items]) => (
              <Card key={type} className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-white">
                      {CATEGORY_LABELS[type]}
                    </CardTitle>
                    <Badge variant="outline" className="border-white/20 text-xs text-blue-300">
                      {items.length} {items.length === 1 ? "upload" : "uploads"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {items.length ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {items.map((item) => (
                        <UploadCard
                          key={item.public_id}
                          item={item}
                          category={type}
                          onUpdate={updateUploadField}
                          onCommit={commitUploadPoints}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 p-8 text-center">
                      <Upload className="h-10 w-10 text-blue-400" />
                      <p className="mt-3 text-sm text-blue-300">No uploads in this category</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:col-span-1">
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Manual Points</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="manual-points" className="text-sm text-blue-300">
                    Add/Adjust Points (0–5)
                  </Label>
                  <Input
                    id="manual-points"
                    type="number"
                    min={0}
                    max={5}
                    step={1}
                    value={row.manualPoints === "" ? "" : row.manualPoints}
                    onChange={(e) => handleManualInput(e.target.value)}
                    onBlur={commitManualPoints}
                    onKeyDown={blockInvalidChar}
                    className="mt-2 border-white/20 bg-white/10 text-white placeholder:text-blue-400 focus:border-blue-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-3 rounded-lg bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-blue-300">Point Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-200">Image Points</span>
                      <span className="font-mono text-sm font-semibold">{imagePoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-200">Manual Points</span>
                      <span className="font-mono text-sm font-semibold">{manualPoints}</span>
                    </div>
                    <Separator className="bg-white/10" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="font-mono text-xl text-blue-400">{totalPoints}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-linear-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                >
                  {saving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
      <Icon className="mx-auto h-5 w-5 text-blue-400" />
      <p className="mt-2 text-xs uppercase tracking-widest text-blue-300">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function UploadCard({ item, category, onUpdate, onCommit }) {
  const [imgError, setImgError] = useState(false);

  const handlePointsChange = (e) => {
    const raw = e.target.value;
    onUpdate(category, item.public_id, "points", raw === "" ? "" : raw);
  };

  const handleBlur = (e) => {
    const raw = e.target.value;
    onCommit(category, item.public_id, raw === "" ? 0 : raw);
  };

  return (
    <Card className="overflow-hidden border-white/10 bg-white/5 transition-all hover:border-blue-400/50">
      <div className="flex items-center justify-between p-3">
        <Badge
          variant={STATUS_BADGE_VARIANTS[item.approval_status]}
          className={`text-xs ${STATUS_COLORS[item.approval_status]}`}
        >
          {item.approval_status.charAt(0).toUpperCase() + item.approval_status.slice(1)}
        </Badge>
        <time className="text-xs text-blue-300">
          {new Date(item.uploadedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>

      <div className="relative aspect-video overflow-hidden bg-black/20">
        {imgError ? (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-blue-500" />
          </div>
        ) : (
          <Image
            src={item.url}
            alt="Upload evidence"
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <Label className="text-xs text-blue-300">Points (0–5)</Label>
          <Input
            type="number"
            min={0}
            max={5}
            step={1}
            value={item.points === "" ? "" : item.points}
            onChange={handlePointsChange}
            onBlur={handleBlur}
            onKeyDown={blockInvalidChar}
            className="mt-1 h-9 border-white/20 bg-white/10 text-sm text-white focus:border-blue-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>

        <div>
          <Label className="text-xs text-blue-300">Status</Label>
          <select
            value={item.approval_status}
            onChange={(e) => onUpdate(category, item.public_id, "approval_status", e.target.value)}
            className={`
              mt-1 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 pr-10 text-sm text-white
              focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30
              transition-colors appearance-none
              bg-[url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%228%22%20viewBox%3D%220%200%2012%208%22%3E%3Cpath%20fill%3D%22%234a90e2%22%20d%3D%22M0%2C0%20L12%2C0%20L6%2C8%20Z%22%2F%3E%3C%2Fsvg%3E")]
              bg-no-repeat bg-position-[right_0.75rem_center] bg-size-[12px]
            `}
          >
            {["pending", "verified", "rejected"].map((status) => (
              <option key={status} value={status} className="bg-slate-900 text-white">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
}