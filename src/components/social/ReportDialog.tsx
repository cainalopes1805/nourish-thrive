import { useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HIGH_RISK_CATEGORIES, REPORT_CATEGORIES } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";

export function ReportDialog({
  targetType,
  targetId,
}: {
  targetType: "post" | "comment" | "profile" | "message";
  targetId: string;
}) {
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(REPORT_CATEGORIES[0]!.value);
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!user) {
      toast.error("Entre na sua conta para denunciar.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      category,
      details: details.trim() || null,
      risk_level: HIGH_RISK_CATEGORIES.includes(category) ? "high" : "normal",
      status: "pending",
    });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível enviar a denúncia.");
      return;
    }
    setOpen(false);
    setDetails("");
    toast.success("Denúncia enviada. Nossa moderação vai analisar.");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Flag className="size-4" aria-hidden="true" /> Denunciar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Denunciar conteúdo</DialogTitle>
          <DialogDescription>
            Conteúdos que incentivam práticas perigosas são priorizados pela moderação.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="categoria-denuncia">Motivo</Label>
            <select
              id="categoria-denuncia"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {REPORT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="detalhes-denuncia">Detalhes (opcional)</Label>
            <Textarea
              id="detalhes-denuncia"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
          <Button onClick={submit} disabled={saving} className="w-full">
            Enviar denúncia
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
