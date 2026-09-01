"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Upload, Trash2, ExternalLink, CheckCircle2 } from "lucide-react";
import type { BoilerBrand, BoilerModel } from "@/types";

export default function FolletosPage() {
  const router = useRouter();
  const supabase = createClient();

  const [brands, setBrands] = useState<BoilerBrand[]>([]);
  const [brandId, setBrandId] = useState("");
  const [models, setModels] = useState<BoilerModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    supabase
      .from("boiler_brands")
      .select("*")
      .eq("is_custom", false)
      .order("name")
      .then(({ data }) => setBrands(data || []));
  }, []);

  useEffect(() => {
    if (!brandId) { setModels([]); return; }
    supabase
      .from("boiler_models")
      .select("*")
      .eq("brand_id", brandId)
      .order("name")
      .then(({ data }) => setModels(data || []));
  }, [brandId]);

  async function handleUpload(model: BoilerModel, file: File) {
    if (file.type !== "application/pdf") {
      setMessage("Solo se permiten ficheros PDF");
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      setMessage("El fichero supera los 30 MB");
      return;
    }

    setUploading(model.id);
    setMessage("");

    const path = `${model.slug}.pdf`;
    const { error: upErr } = await supabase.storage
      .from("brochures")
      .upload(path, file, { contentType: "application/pdf", upsert: true });

    if (upErr) {
      setMessage("Error al subir: " + upErr.message);
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage.from("brochures").getPublicUrl(path);

    const { error: dbErr } = await supabase
      .from("boiler_models")
      .update({ brochure_url: urlData?.publicUrl || null })
      .eq("id", model.id);

    if (dbErr) {
      setMessage("Error al guardar: " + dbErr.message);
    } else {
      setMessage("Folleto guardado correctamente");
      setModels((prev) => prev.map((m) => (m.id === model.id ? { ...m, brochure_url: urlData?.publicUrl || null } : m)));
    }
    setUploading(null);
  }

  async function handleDelete(model: BoilerModel) {
    if (!confirm(`¿Eliminar el folleto de "${model.name}"?`)) return;

    setUploading(model.id);
    setMessage("");

    await supabase.storage.from("brochures").remove([`${model.slug}.pdf`]);

    const { error: dbErr } = await supabase
      .from("boiler_models")
      .update({ brochure_url: null })
      .eq("id", model.id);

    if (dbErr) {
      setMessage("Error al eliminar: " + dbErr.message);
    } else {
      setMessage("Folleto eliminado");
      setModels((prev) => prev.map((m) => (m.id === model.id ? { ...m, brochure_url: null } : m)));
    }
    setUploading(null);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Folletos de equipos</h1>
      <p className="text-sm text-muted-foreground">
        Sube el folleto en PDF de cada equipo. Se añadirá automáticamente al final del PDF del presupuesto al imprimir o compartir.
      </p>

      <Card>
        <CardHeader><CardTitle>Selecciona la marca</CardTitle></CardHeader>
        <CardContent>
          <Select value={brandId} onValueChange={setBrandId}>
            <SelectTrigger><SelectValue placeholder="Elegir marca" /></SelectTrigger>
            <SelectContent>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {message && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">{message}</p>
      )}

      {brandId && (
        <Card>
          <CardContent className="p-0">
            {models.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No hay modelos en esta marca.</p>
            ) : (
              <div className="divide-y">
                {models.map((m) => (
                  <div key={m.id} className="flex flex-wrap items-center gap-3 p-4">
                    <div className="flex-1 min-w-40">
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(m.price_final)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.brochure_url ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" /> Folleto subido
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin folleto</span>
                      )}
                      {m.brochure_url && (
                        <Button size="sm" variant="outline" onClick={() => window.open(m.brochure_url!, "_blank")}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <input
                        ref={(el) => { fileInputs.current[m.id] = el; }}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUpload(m, f);
                          e.target.value = "";
                        }}
                      />
                      <Button
                        size="sm"
                        variant={m.brochure_url ? "outline" : "default"}
                        disabled={uploading === m.id}
                        onClick={() => fileInputs.current[m.id]?.click()}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        {uploading === m.id ? "Subiendo..." : m.brochure_url ? "Reemplazar" : "Subir PDF"}
                      </Button>
                      {m.brochure_url && (
                        <Button size="sm" variant="destructive" disabled={uploading === m.id} onClick={() => handleDelete(m)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
