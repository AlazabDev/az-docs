import { useMemo, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useMinioBuckets, useMinioListing, useMinioUpload, useMinioDelete, getMinioUrl } from "@/hooks/useMinio";
import { toast } from "sonner";
import {
  HardDrive,
  Folder,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  File as FileIcon,
  Download,
  Eye,
  Trash2,
  Upload,
  RefreshCw,
  Plus,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";

const formatSize = (bytes: number) => {
  if (!bytes) return "0 بايت";
  const sizes = ["بايت", "ك.ب", "م.ب", "ج.ب"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3);
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const fileIcon = (key: string) => {
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "heic"].includes(ext)) return ImageIcon;
  if (ext === "pdf") return FileText;
  if (["xls", "xlsx", "csv"].includes(ext)) return FileSpreadsheet;
  return FileIcon;
};

const formatDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })
    : "—";

const StorageBrowser = () => {
  const [bucket, setBucket] = useState<string | null>(null);
  const [prefix, setPrefix] = useState("");
  const [newFolder, setNewFolder] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const buckets = useMinioBuckets();
  const listing = useMinioListing(bucket ?? undefined, prefix);
  const upload = useMinioUpload();
  const del = useMinioDelete();

  const parts = prefix.split("/").filter(Boolean);

  const folders = useMemo(() => {
    const set = new Set<string>(listing.data?.folders ?? []);
    (listing.data?.objects ?? []).forEach((o) => {
      if (o.size === 0 && o.key.endsWith("/")) set.add(o.key);
    });
    return Array.from(set);
  }, [listing.data]);

  const files = useMemo(
    () => (listing.data?.objects ?? []).filter((o) => !(o.size === 0 && o.key.endsWith("/"))),
    [listing.data]
  );

  const open = async (key: string, download = false) => {
    if (!bucket) return;
    try {
      window.open(await getMinioUrl(bucket, key, download), "_blank");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onFiles = async (list: FileList | null) => {
    if (!list?.length || !bucket) return;
    try {
      for (const f of Array.from(list)) {
        await upload.mutateAsync({ bucket, key: `${prefix}${f.name}`, file: f });
      }
      toast.success("تم رفع الملفات إلى مخزن العزب");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const createFolder = async () => {
    const name = newFolder.trim();
    if (!name || !bucket) return;
    try {
      await upload.mutateAsync({
        bucket,
        key: `${prefix}${name}/`,
        file: new Blob([]),
        contentType: "application/x-directory",
      });
      setNewFolder("");
      toast.success("تم إنشاء المجلد");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const remove = async (key: string) => {
    if (!bucket || !window.confirm("هل تريد حذف هذا الملف نهائياً من مخزن العزب؟")) return;
    try {
      await del.mutateAsync({ bucket, key });
      toast.success("تم حذف الملف");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const actions = bucket ? (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => listing.refetch()}>
        <RefreshCw className="h-4 w-4 ml-2" />
        تحديث
      </Button>
      <Button size="sm" onClick={() => fileInput.current?.click()} disabled={upload.isPending}>
        <Upload className="h-4 w-4 ml-2" />
        {upload.isPending ? "جارٍ الرفع..." : "رفع ملفات"}
      </Button>
      <input ref={fileInput} type="file" multiple hidden onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
    </div>
  ) : undefined;

  return (
    <AppLayout
      title="مخزن العزب"
      subtitle="كل ملفات الشركة مباشرة من المخزن المركزي minio.alazab.cloud"
      actions={actions}
    >
      <input hidden />

      {!bucket ? (
        /* ---------- Buckets view ---------- */
        buckets.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : buckets.error ? (
          <div className="glass-card rounded-xl p-8 text-center text-destructive">{(buckets.error as Error).message}</div>
        ) : (buckets.data?.length ?? 0) === 0 ? (
          <div className="glass-card rounded-xl p-10 text-center text-muted-foreground">لا توجد دلاء في المخزن.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {buckets.data!.map((b) => (
              <button
                key={b.name}
                onClick={() => { setBucket(b.name); setPrefix(""); }}
                className="glass-card rounded-xl p-6 text-right hover:shadow-md hover:border-primary/40 transition-all duration-200 animate-fade-in"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <HardDrive className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate" dir="ltr">{b.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {b.creationDate ? formatDate(b.creationDate) : "دلو تخزين"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )
      ) : (
        /* ---------- Inside a bucket ---------- */
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="glass-card rounded-lg px-3 py-2 flex items-center gap-1 text-sm flex-wrap min-w-0">
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setBucket(null)}>
                <ArrowRight className="h-4 w-4" />
                الدلاء
              </Button>
              <ChevronLeft className="h-3 w-3 text-muted-foreground rotate-180" />
              <button className="px-1 font-medium hover:text-primary transition-colors truncate" onClick={() => setPrefix("")}>
                {bucket}
              </button>
              {parts.map((p, i) => (
                <span key={i} className="flex items-center gap-1 min-w-0">
                  <ChevronLeft className="h-3 w-3 text-muted-foreground rotate-180 shrink-0" />
                  <button
                    className="px-1 font-medium hover:text-primary transition-colors truncate"
                    onClick={() => setPrefix(parts.slice(0, i + 1).join("/") + "/")}
                  >
                    {p}
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 md:mr-auto">
              <Input
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createFolder()}
                placeholder="اسم مجلد جديد..."
                className="w-44 h-9"
              />
              <Button variant="outline" size="sm" className="h-9" onClick={createFolder} disabled={!newFolder.trim() || upload.isPending}>
                <Plus className="h-4 w-4 ml-1" />
                مجلد
              </Button>
            </div>
          </div>

          {/* Listing */}
          {listing.isLoading ? (
            <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : listing.error ? (
            <div className="glass-card rounded-xl p-8 text-center text-destructive">{(listing.error as Error).message}</div>
          ) : folders.length === 0 && files.length === 0 ? (
            <div className="glass-card rounded-xl p-10 text-center text-muted-foreground">هذا المجلد فارغ.</div>
          ) : (
            <div className="space-y-2">
              {folders.map((f) => (
                <button
                  key={f}
                  onClick={() => setPrefix(f)}
                  className="glass-card rounded-lg px-4 py-3 w-full flex items-center gap-3 text-right hover:shadow-md hover:border-primary/40 transition-all duration-200"
                >
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Folder className="h-5 w-5 text-accent" />
                  </div>
                  <span className="font-medium text-foreground truncate" dir="ltr">{f.slice(prefix.length)}</span>
                </button>
              ))}
              {files.map((f) => {
                const Icon = fileIcon(f.key);
                const name = f.key.slice(prefix.length);
                return (
                  <div key={f.key} className="glass-card rounded-lg px-4 py-3 flex items-center gap-3 hover:shadow-md transition-all duration-200">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate" dir="ltr">{name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatSize(f.size)} · {formatDate(f.lastModified)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="عرض" onClick={() => open(f.key)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="تنزيل" onClick={() => open(f.key, true)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="حذف" onClick={() => remove(f.key)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {listing.data?.truncated && (
                <p className="text-xs text-muted-foreground text-center py-2">يُعرض أول 500 عنصر فقط من هذا المجلد.</p>
              )}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default StorageBrowser;
