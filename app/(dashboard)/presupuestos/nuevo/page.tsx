"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { createBudget } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import type { Company, BoilerBrand, BoilerModel, ModelOptional } from "@/types";

type Mode = "catalogo" | "plantilla";

interface LineItem {
  id: string;
  concepto: string;
  cantidad: number;
  precio: number;
}

export default function NuevoPresupuestoPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("catalogo");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [brands, setBrands] = useState<BoilerBrand[]>([]);
  const [models, setModels] = useState<BoilerModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<BoilerModel | null>(null);
  const [optionals, setOptionals] = useState<ModelOptional[]>([]);

  const [companyId, setCompanyId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedOptionals, setSelectedOptionals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [templateBrand, setTemplateBrand] = useState("");
  const [templateModel, setTemplateModel] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", concepto: "", cantidad: 1, precio: 0 },
  ]);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function load() {
      const { data: co } = await supabase.from("companies").select("*");
      if (co) setCompanies(co);
      if (co?.length) setCompanyId(co[0].id);

      const { data: br } = await supabase.from("boiler_brands").select("*").order("name");
      if (br) setBrands(br);
    }
    load();
  }, []);

  const loadModels = useCallback(async (brandId: string) => {
    if (!brandId) { setModels([]); setModelId(""); setSelectedModel(null); return; }
    const { data } = await supabase
      .from("boiler_models")
      .select("*, optionals:model_optionals(*)")
      .eq("brand_id", brandId)
      .order("name");
    if (data) setModels(data);
    setModelId("");
    setSelectedModel(null);
  }, []);

  useEffect(() => { loadModels(brandId); }, [brandId, loadModels]);

  useEffect(() => {
    if (!modelId || !models.length) { setSelectedModel(null); setOptionals([]); return; }
    const m = models.find((x) => x.id === modelId) || null;
    setSelectedModel(m);
    setOptionals(m?.optionals || []);
    setSelectedOptionals([]);
  }, [modelId, models]);

  const price = customPrice ? parseFloat(customPrice) : (selectedModel?.price_final || 0);
  const optTotal = optionals.filter((o) => selectedOptionals.includes(o.id)).reduce((s, o) => s + o.price, 0);
  const catalogoSubtotal = price + optTotal;
  const catalogoIva = catalogoSubtotal * 0.21;
  const catalogoTotal = catalogoSubtotal + catalogoIva;

  const templateSubtotal = items.reduce((s, item) => s + item.cantidad * item.precio, 0);
  const templateIva = templateSubtotal * 0.21;
  const templateTotal = templateSubtotal + templateIva;

  function addItem() {
    setItems((prev) => [...prev, { id: crypto.randomUUID(), concepto: "", cantidad: 1, precio: 0 }]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) return;
    if (!clientName.trim()) { alert("Introduce el nombre del cliente"); return; }

    if (mode === "catalogo" && !selectedModel) { alert("Selecciona un modelo"); return; }
    if (mode === "plantilla" && !templateBrand.trim()) { alert("Introduce la marca"); return; }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data: customer, error: custErr } = await supabase
        .from("customers")
        .insert({
          user_id: user.id,
          name: clientName.trim(),
          phone: clientPhone.trim() || null,
          address: clientAddress.trim() || null,
          email: clientEmail.trim() || null,
        })
        .select()
        .single();

      if (custErr) throw custErr;

      if (mode === "catalogo") {
        const budget = await createBudget({
          company_id: companyId,
          customer_id: customer.id,
          brand_id: selectedModel!.brand_id,
          model_id: selectedModel!.id,
          subtotal: catalogoSubtotal,
          iva_rate: 21.0,
          iva_amount: catalogoIva,
          total: catalogoTotal,
          custom_price: customPrice ? parseFloat(customPrice) : null,
          notes: notes || null,
          issue_date: today,
          valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          selected_optionals: optionals
            .filter((o) => selectedOptionals.includes(o.id))
            .map((o) => ({ optional_id: o.id, name: o.name, price: o.price })),
        });
        router.push(`/presupuestos/${budget.id}`);
      } else {
        const brandSlug = templateBrand.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const modelSlug = templateModel.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "personalizado";

        let brandId: string | undefined = brands.find((b) => b.slug === brandSlug)?.id;
        if (!brandId) {
          const { data: newBrand } = await supabase
            .from("boiler_brands")
            .insert({ name: templateBrand.trim(), slug: brandSlug })
            .select()
            .single();
          brandId = newBrand!.id;
          setBrands((prev) => [...prev, newBrand!]);
        }

        let modelRecord = models.find((m) => m.slug === modelSlug);
        if (!modelRecord) {
          const { data: newModel } = await supabase
            .from("boiler_models")
            .insert({
              brand_id: brandId,
              name: templateModel.trim() || "Personalizado",
              slug: modelSlug,
              description: templateDescription || "Presupuesto personalizado",
              price_base: 0,
              price_final: templateSubtotal,
              price_rounded: templateSubtotal,
            })
            .select()
            .single();
          modelRecord = newModel!;
          setModels((prev) => [...prev, newModel!]);
        }

        if (!brandId) { alert("Error al crear la marca"); setSaving(false); return; }
        const budget = await createBudget({
          company_id: companyId,
          customer_id: customer.id,
          brand_id: brandId,
          model_id: modelRecord!.id,
          subtotal: templateSubtotal,
          iva_rate: 21.0,
          iva_amount: templateIva,
          total: templateTotal,
          brand_name: templateBrand.trim() || null,
          model_name: templateModel.trim() || null,
          description: templateDescription || null,
          items: items.filter((i) => i.concepto.trim()),
          notes: notes || null,
          issue_date: today,
          valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        });
        router.push(`/presupuestos/${budget.id}`);
      }
    } catch (err: any) {
      alert("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Nuevo Presupuesto</h1>

      <div className="flex rounded-lg border p-1 bg-muted">
        <button
          type="button"
          onClick={() => setMode("catalogo")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === "catalogo" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Catálogo
        </button>
        <button
          type="button"
          onClick={() => setMode("plantilla")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === "plantilla" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Plantilla libre
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Empresa emisora</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {companies.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCompanyId(c.id)}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    companyId === c.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Datos del cliente</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Nombre *</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} required />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Dirección</Label>
              <Input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {mode === "catalogo" ? (
          <>
            <Card>
              <CardHeader><CardTitle>Caldera</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Marca</Label>
                    <Select value={brandId} onValueChange={setBrandId}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar marca" /></SelectTrigger>
                      <SelectContent>
                        {brands.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Modelo</Label>
                    <Select value={modelId} onValueChange={setModelId} disabled={!brandId}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar modelo" /></SelectTrigger>
                      <SelectContent>
                        {models.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name} — {formatCurrency(m.price_final)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedModel && (
                  <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                    <p className="text-sm">{selectedModel.description}</p>
                    <div className="flex gap-4 flex-wrap text-sm">
                      <span className="font-semibold">
                        Precio instalación: {formatCurrency(selectedModel.price_final)}
                      </span>
                      <span className="font-semibold text-emerald-700">
                        Con IVA: {formatCurrency(selectedModel.price_final * 1.21)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Label className="flex items-center gap-2">
                        <span className="text-xs">Precio personalizado</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={selectedModel.price_final.toFixed(2)}
                          value={customPrice}
                          onChange={(e) => setCustomPrice(e.target.value)}
                          className="w-32 h-8 text-sm"
                        />
                      </Label>
                    </div>

                    {optionals.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Opcionales:</p>
                        {optionals.map((o) => (
                          <label key={o.id} className="flex items-center gap-2 text-sm py-1">
                            <input
                              type="checkbox"
                              checked={selectedOptionals.includes(o.id)}
                              onChange={() =>
                                setSelectedOptionals((prev) =>
                                  prev.includes(o.id) ? prev.filter((id) => id !== o.id) : [...prev, o.id]
                                )
                              }
                              className="rounded"
                            />
                            {o.name} (+{formatCurrency(o.price)})
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedModel && (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="pt-6 space-y-2">
                  <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(catalogoSubtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span>IVA 21%</span><span>{formatCurrency(catalogoIva)}</span></div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total</span><span>{formatCurrency(catalogoTotal)}</span></div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            <Card>
              <CardHeader><CardTitle>Datos del presupuesto</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Marca *</Label>
                    <Input
                      value={templateBrand}
                      onChange={(e) => setTemplateBrand(e.target.value)}
                      placeholder="Ej: Saunier Duval"
                      required
                    />
                  </div>
                  <div>
                    <Label>Modelo</Label>
                    <Input
                      value={templateModel}
                      onChange={(e) => setTemplateModel(e.target.value)}
                      placeholder="Ej: Thema Condens 25"
                    />
                  </div>
                </div>
                <div>
                  <Label>Descripción</Label>
                  <textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    rows={2}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                    placeholder="Descripción del suministro e instalación..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Conceptos</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-1" /> Añadir línea
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        value={item.concepto}
                        onChange={(e) => updateItem(item.id, "concepto", e.target.value)}
                        placeholder="Concepto"
                        className="text-sm"
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => updateItem(item.id, "cantidad", parseInt(e.target.value) || 1)}
                        className="text-sm text-center"
                      />
                    </div>
                    <div className="w-28">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.precio}
                        onChange={(e) => updateItem(item.id, "precio", parseFloat(e.target.value) || 0)}
                        className="text-sm text-right"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="w-24 text-right pt-2 text-sm font-medium">
                      {formatCurrency(item.cantidad * item.precio)}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="h-9 w-9 text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="pt-6 space-y-2">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(templateSubtotal)}</span></div>
                <div className="flex justify-between text-sm"><span>IVA 21%</span><span>{formatCurrency(templateIva)}</span></div>
                <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total</span><span>{formatCurrency(templateTotal)}</span></div>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader><CardTitle>Notas adicionales</CardTitle></CardHeader>
          <CardContent>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              placeholder="Observaciones adicionales..."
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={
              saving ||
              (mode === "catalogo" ? !selectedModel : !templateBrand.trim())
            }
            size="lg"
            className="flex-1"
          >
            {saving ? "Guardando..." : "Generar presupuesto"}
          </Button>
        </div>
      </form>
    </div>
  );
}
