import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAssignFile } from "@/hooks/useData";
import type { Project, ProjectFile } from "@/types/database";

interface Analysis {
  project_id: string | null;
  document_type: string;
  confidence: number;
  summary: string;
  reason: string;
}

export const AnalyzeFileButton = ({ file, projects }: { file: ProjectFile; projects: Project[] }) => {
  const saved = (file.metadata as { ai_analysis?: Analysis })?.ai_analysis ?? null;
  const [result, setResult] = useState<Analysis | null>(saved);
  const [busy, setBusy] = useState(false);
  const assign = useAssignFile();
  const qc = useQueryClient();

  const run = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-file", { body: { fileId: file.id } });
      if (error) {
        let msg = "تعذر تحليل الملف";
        try { msg = (await (error as any).context?.json())?.error ?? msg; } catch { /* ignore */ }
        throw new Error(msg);
      }
      setResult(data as Analysis);
      qc.invalidateQueries({ queryKey: ["files"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const project = projects.find((p) => p.id === result?.project_id);

  return (
    <div className="pr-4 space-y-2 text-sm">
      <Button size="sm" variant="outline" onClick={run} disabled={busy}>
        <Sparkles className="h-4 w-4 ml-2 text-accent" />
        {busy ? "جارٍ التحليل..." : result ? "إعادة التحليل بالذكاء الاصطناعي" : "تحليل بالذكاء الاصطناعي"}
      </Button>
      {result && (
        <div className="rounded-lg border bg-muted/40 p-3 space-y-1">
          <p><span className="font-semibold">نوع المستند:</span> {result.document_type}</p>
          <p><span className="font-semibold">المشروع المقترح:</span> {project ? project.name : "لا يوجد تطابق واضح"}
            <span className="text-muted-foreground"> (ثقة {Math.round(result.confidence * 100)}%)</span></p>
          <p className="text-muted-foreground">{result.summary}</p>
          <p className="text-xs text-muted-foreground">{result.reason}</p>
          {project && file.project_id !== project.id && (
            <Button size="sm" disabled={assign.isPending}
              onClick={() => assign.mutate({ id: file.id, projectId: project.id }, { onSuccess: () => toast.success("تم ربط الملف بالمشروع المقترح") })}>
              اعتماد الاقتراح وربط الملف
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
