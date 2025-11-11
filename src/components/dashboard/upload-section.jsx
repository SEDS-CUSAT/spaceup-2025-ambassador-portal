'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';

const CATEGORY_CONFIG = [
  { value: 'whatsapp_status', label: 'WhatsApp Status' },
  { value: 'instagram_story', label: 'Instagram Story' },
  { value: 'whatsapp_group', label: 'WhatsApp Group Share' },
];

const STATUS_STYLES = {
  pending: 'bg-amber-500/15 text-amber-300 border border-amber-500/40',
  verified: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40',
  rejected: 'bg-rose-500/15 text-rose-300 border border-rose-500/40',
};

export default function UploadSection({ userId, initialUploads = {} }) {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_CONFIG[0].value);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploads, setUploads] = useState(() => ({
    whatsapp_status: initialUploads.whatsapp_status ?? [],
    instagram_story: initialUploads.instagram_story ?? [],
    whatsapp_group: initialUploads.whatsapp_group ?? [],
  }));

  const activeUploads = uploads[selectedCategory] ?? [];

  const categoryLabel = useMemo(() => {
    return CATEGORY_CONFIG.find((c) => c.value === selectedCategory)?.label ?? '';
  }, [selectedCategory]);

  function handleFiles(newFiles) {
    const picked = newFiles?.[0];
    if (!picked) return;
    if (!picked.type.startsWith('image/')) {
      toast.error('Only images allowed');
      return;
    }
    if (picked.size > 5 * 1024 * 1024) {
      toast.error('Max file size is 5MB');
      return;
    }
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
  }

  async function handleUpload() {
    if (!file) {
      toast.error('Pick an image first');
      return;
    }

    setIsUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('type', selectedCategory);
      body.append('originalName', file.name);

      const res = await fetch('/api/ambassadors/upload', { method: 'POST', body });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload.error || 'Upload failed');
        return;
      }

      toast.success('Upload submitted for review');
      const newUpload = {
        url: payload.data.url,
        public_id: payload.data.public_id,
        uploadedAt: payload.data.uploadedAt,
        approval_status: payload.data.approval_status,
        points: payload.data.points ?? 0,
      };

      setUploads((prev) => ({
        ...prev,
        [selectedCategory]: [newUpload, ...(prev[selectedCategory] ?? [])],
      }));

      setFile(null);
      setPreviewUrl(null);
    } catch (error) {
      toast.error('Unable to upload right now');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="space-y-8">
      <div className="surface-card space-y-6 p-6">
        <header className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Upload evidence</p>
              <h2 className="text-lg font-semibold text-white">Social proof submissions</h2>
            </div>
            <label className="text-xs text-muted-foreground">
              Share screenshots that prove your outreach across channels.
            </label>
          </div>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="w-full rounded-lg border border-white/15 bg-[#0f172a]/70 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
          >
            {CATEGORY_CONFIG.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr,0.9fr]">
          <div className="space-y-4">
            <FileUpload onChange={handleFiles} />
            {previewUrl ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">Preview</p>
                <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="h-56 w-full object-contain" />
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Accepted formats: JPG, JPEG, PNG, HEIC, HEIF, WEBP. Maximum size 5MB per upload.
              </p>) }
          </div>

          <div className="flex h-full flex-col justify-between gap-4 rounded-xl border border-white/12 bg-white/5 p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Category</p>
              <p className="mt-2 text-sm font-semibold text-white">{categoryLabel}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Once uploaded, submissions appear below with status updates from the core team.
              </p>
            </div>
            <Button type="button" disabled={isUploading} onClick={handleUpload} className="w-full">
              {isUploading ? 'Uploading…' : 'Submit screenshot'}
            </Button>
          </div>
        </div>
      </div>

      <UploadsGallery uploads={uploads} selectedCategory={selectedCategory} />
    </section>
  );
}

function UploadsGallery({ uploads, selectedCategory }) {
  return (
    <div className="space-y-10">
      {CATEGORY_CONFIG.map((category) => {
        const items = uploads[category.value] ?? [];
        if (!items.length && category.value !== selectedCategory) {
          return null;
        }

        return (
          <section key={category.value} className="space-y-4">
            <header className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{category.label}</h3>
              <span className="text-xs text-muted-foreground">{items.length} uploads</span>
            </header>

            {items.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((item, index) => (
                  <article
                    key={`${item.public_id}-${index}`}
                    className="rounded-xl border border-white/12 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <StatusBadge status={item.approval_status} />
                      <time className="text-xs text-muted-foreground">
                        {new Date(item.uploadedAt).toLocaleString()}
                      </time>
                    </div>
                    <p className="mt-2 text-xs font-medium text-white/80">Points awarded: {item.points ?? 0}</p>
                    <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                      <Image
                        src={item.url}
                        alt={`${category.label} upload`}
                        width={400}
                        height={300}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-white/12 bg-white/5 p-4 text-xs text-muted-foreground">
                No uploads yet. Submit evidence to see it listed here.
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  const label = status?.charAt(0).toUpperCase() + status?.slice(1);
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${style}`}>
      {label}
    </span>
  );
}
