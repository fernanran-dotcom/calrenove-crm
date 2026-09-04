"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createBudget, createCustomer, createCustomBrandAndModel } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import type { Company, BoilerBrand, BoilerModel } from "@/types";

const CUSTOM_BRAND_VALUE = "__custom__";

interface LineItem {
  id: string;
  concepto: string;
  cantidad: number;
  precio: number;
}

export function NuevoPresupuestoForm({
  companies,
  brands,
  models,
}: {
  companies: Company[];
  brands: BoilerBrand[];
  models: BoilerModel[];
}) {
  const router = useRouter();

  const [companyId, setCompanyId] = useState(companies[0]?.id || "");
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedOptionals, setSelectedOptionals] = useState<string[]>([]);
  const [optionalPrices, setOptionalPrices] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientDni, setClientDni] = useState("");

  const [customBrandName, setCustomBrandName] = useState("");
  const [customModelName, setCustomModelName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customIncludes, setCustomIncludes] = useState<string[]>([""]);
  const [customExcludes, setCustomExcludes] = useState<string[]>([""]);
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", concepto: "", cantidad: 1, precio: 0 },
  ]);

  const today = new Date().toISOString().split("T")[0];
  const isCustom = brandId === CUSTOM_BRAND_VALUE;

  const brandModels = useMemo(
    () => (brandId && !isCustom ? models.filter((m) => m.brand_id === brandId) : []),
    [brandId, isCustom, models]
  );
  const selectedModel = useMemo(
    () => brandModels.find((m) => m.id === modelId) || null,
    [brandModels, modelId]
  );
  const optionals = selectedModel?.optionals || [];

  const basePrice = customPrice ? parseFloat(customPrice) : selectedModel?.price_final || 0;
  const getOptionalPrice = (o: { id: string; price: number }) => {
    const raw = optionalPrices[o.id];
    if (raw === undefined || raw === "") return o.price;
    const parsed = parseFloat(raw);
    return isNaN(parsed) ? o.price : parsed;
  };
  const optTotal = optionals
    .filter((o) => selectedOptionals.includes(o.id))
    .reduce((s, o) => s + getOptionalPrice(o), 0);
  const catalogoSubtotal = basePrice + optTotal;
  const catalogoIva = catalogoSubtotal * 0.21;
  const catalogoTotal = catalogoSubtotal + catalogoIva;

  const itemsSubtotal = items.reduce((s, item) => s + item.cantidad * item.precio, 0);
  const templateSubtotal = customPrice ? parseFloat(customPrice) : itemsSubtotal;
  const templateIva = templateSubtotal * 0.21;
  const templateTotal = templateSubtotal + templateIva;

  function addItem() {
    setItems((prev) => [...prev, { id: crypto.randomUUID(), concepto: "", cantidad: 1, precio: 0 }]);
  }
  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }
  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }
  function addInclude() {
    setCustomIncludes((prev) => [...prev, ""]);
  }
  function updateInclude(idx: number, value: string) {
    setCustomIncludes((prev) => prev.map((s, i) => (i === idx ? value : s)));
  }
  function removeInclude(idx: number) {
    setCustomIncludes((prev) => prev.filter((_, i) => i !== idx));
  }
  function addExclude() {
    setCustomExcludes((prev) => [...prev, ""]);
  }
  function updateExclude(idx: number, value: string) {
    setCustomExcludes((prev) => prev.map((s, i) => (i === idx ? value : s)));
  }
  function removeExclude(idx: number) {
    setCustomExcludes((prev) => prev.filter((_, i) => i !== idx));
  }

  const canSubmit =
    companyId &&
    clientName.trim() &&
    !saving &&
    (isCustom ? customBrandName.trim() : selectedModel);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) return;
    if (!clientName.trim()) {
      alert("Introduce el nombre del cliente");
      return;
    }
    if (isCustom && !customBrandName.trim()) {
      alert("Introduce el nombre de la marca");
      return;
    }
    if (!isCustom && !selectedModel) {
      alert("Selecciona un modelo");
      return;
    }

    setSaving(true);

    try {
      const customer = await createCustomer({
        name: clientName.trim(),
        phone: clientPhone.trim() || null,
        address: clientAddress.trim() || null,
        email: clientEmail.trim() || null,
        dni: clientDni.trim() || null,
      });
      if (!customer) throw new Error("No se pudo crear el cliente");

      if (isCustom) {
        const custom = await createCustomBrandAndModel({
          brandName: customBrandName.trim(),
          modelName: customModelName.trim(),
          description: customDescription || "",
          includes: customIncludes,
          excludes: customExcludes,
          subtotal: templateSubtotal,
        });
        if (!custom) throw new Error("Error al crear la marca o el modelo");

        const budget = await createBudget({
          company_id: companyId,
          customer_id: customer.id,
          brand_id: custom.brandId,
          model_id: custom.modelId,
          subtotal: templateSubtotal,
          iva_rate: 21.0,
          iva_amount: templateIva,
          total: templateTotal,
          brand_name: customBrandName.trim() || null,
          model_name: customModelName.trim() || null,
          description: customDescription || null,
          items: items.filter((i) => i.concepto.trim()),
          notes: notes || null,
          issue_date: today,
          valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        });
        if (!budget) throw new Error("No se pudo crear el presupuesto");
        router.push(`/presupuestos/${budget.id}`);
      } else {
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
            .map((o) => ({ optional_id: o.id, name: o.name, price: getOptionalPrice(o) })),
        });
        if (!budget) throw new Error("No se pudo crear el presupuesto");
        router.push(`/presupuestos/${budget.id}`);
      }
    } catch (err: any) {
      alert("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Empresa */}
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

      {/* Cliente */}
      <Card>
        <CardHeader><CardTitle>Datos del cliente</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Nombre *</Label>
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} required />
          </div>
          <div>
            <Label>DNI</Label>
            <Input value={clientDni} onChange={(e) => setClientDni(e.target.value)} placeholder="12345678A" />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Email</Label>
            <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Dirección</Label>
            <Input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Marca / Modelo */}
      <Card>
        <CardHeader><CardTitle>Caldera</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Marca</Label>
              <Select
                value={brandId}
                onValueChange={(v) => {
                  setBrandId(v);
                  if (v !== CUSTOM_BRAND_VALUE) setModelId("");
                }}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar marca" /></SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                  <SelectItem value={CUSTOM_BRAND_VALUE}>Otra marca</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isCustom && (
              <div>
                <Label>Modelo</Label>
                <Select value={modelId} onValueChange={setModelId} disabled={!brandId}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar modelo" /></SelectTrigger>
                  <SelectContent>
                    {brandModels.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} — {formatCurrency(m.price_final)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {isCustom && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Nombre de la marca</Label>
                  <Input value={customBrandName} onChange={(e) => setCustomBrandName(e.target.value)} placeholder="Ej: Nueva Marca" required />
                </div>
                <div>
                  <Label>Modelo</Label>
                  <Input value={customModelName} onChange={(e) => setCustomModelName(e.target.value)} placeholder="Ej: Modelo X" />
                </div>
              </div>
              <div>
                <Label>Descripción</Label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  placeholder=""
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <span>Precio total (opcional)</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={itemsSubtotal > 0 ? itemsSubtotal.toFixed(2) : "0.00"}
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-36 h-8 text-sm"
                  />
                </Label>
              </div>
            </div>
          )}

          {/* Catálogo: detalles del modelo */}
          {!isCustom && selectedModel && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <p className="text-sm">{selectedModel.description}</p>
              <div className="flex gap-4 flex-wrap text-sm">
                <span className="font-semibold">Precio instalación: {formatCurrency(selectedModel.price_final)}</span>
                <span className="font-semibold text-emerald-700">Con IVA: {formatCurrency(selectedModel.price_final * 1.21)}</span>
              </div>
              <div className="flex gap-2">
                <Label className="flex items-center gap-2">
                  <span className="text-xs">Precio personalizado</span>
                  <Input type="number" step="0.01" min="0" placeholder={selectedModel.price_final.toFixed(2)}
                    value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} className="w-32 h-8 text-sm" />
                </Label>
              </div>
              {optionals.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Opcionales (precio editable):</p>
                  {optionals.map((o: any) => {
                    const checked = selectedOptionals.includes(o.id);
                    return (
                      <div key={o.id} className="flex items-center gap-2 text-sm py-1 flex-wrap">
                        <label className="flex items-center gap-2 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setSelectedOptionals((prev) =>
                                prev.includes(o.id) ? prev.filter((id) => id !== o.id) : [...prev, o.id]
                              );
                              setOptionalPrices((prev) =>
                                prev[o.id] !== undefined ? prev : { ...prev, [o.id]: o.price.toString() }
                              );
                            }}
                            className="rounded shrink-0"
                          />
                          <span className="min-w-0">{o.name}</span>
                        </label>
                        {checked && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Precio:</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={optionalPrices[o.id] ?? o.price}
                              onChange={(e) =>
                                setOptionalPrices((prev) => ({ ...prev, [o.id]: e.target.value }))
                              }
                              className="w-24 h-8 text-sm text-right"
                            />
                            <span className="text-xs">€</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Catálogo: totales */}
          {!isCustom && selectedModel && (
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="pt-6 space-y-2">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(catalogoSubtotal)}</span></div>
                <div className="flex justify-between text-sm"><span>IVA 21%</span><span>{formatCurrency(catalogoIva)}</span></div>
                <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total</span><span>{formatCurrency(catalogoTotal)}</span></div>
              </CardContent>
            </Card>
          )}

          {/* Otra marca: conceptos, incluye, no incluye */}
          {isCustom && (
            <>
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
                    <div key={item.id} className="border rounded-lg p-3 space-y-2 bg-muted/20">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1 min-w-0">
                          <Input value={item.concepto} onChange={(e) => updateItem(item.id, "concepto", e.target.value)} placeholder="Concepto" className="text-sm h-9" />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)}
                          disabled={items.length === 1} className="h-9 w-9 text-destructive shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <label className="text-[10px] text-muted-foreground block mb-0.5">Cantidad</label>
                          <Input type="number" min="1" value={item.cantidad}
                            onChange={(e) => updateItem(item.id, "cantidad", parseInt(e.target.value) || 1)} className="text-sm h-8 text-center" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-muted-foreground block mb-0.5">Precio</label>
                          <Input type="number" step="0.01" min="0" value={item.precio || ""}
                            onChange={(e) => updateItem(item.id, "precio", e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)} className="text-sm h-8 text-right" placeholder="0.00" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-muted-foreground block mb-0.5">Total</label>
                          <div className="text-sm font-medium h-8 flex items-center justify-end px-2">
                            {formatCurrency(item.cantidad * item.precio)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-emerald-700">Incluye</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addInclude}>
                      <Plus className="h-4 w-4 mr-1" /> Añadir
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {customIncludes.map((text, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input value={text} onChange={(e) => updateInclude(idx, e.target.value)}
                        placeholder="" className="text-sm" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeInclude(idx)}
                        disabled={customIncludes.length === 1} className="h-8 w-8 text-destructive shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-red-600">No incluye</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addExclude}>
                      <Plus className="h-4 w-4 mr-1" /> Añadir
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {customExcludes.map((text, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input value={text} onChange={(e) => updateExclude(idx, e.target.value)}
                        placeholder="" className="text-sm" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeExclude(idx)}
                        disabled={customExcludes.length === 1} className="h-8 w-8 text-destructive shrink-0">
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
        </CardContent>
      </Card>

      {/* Notas */}
      <Card>
        <CardHeader><CardTitle>Notas adicionales</CardTitle></CardHeader>
        <CardContent>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            placeholder="Observaciones adicionales..." />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-3">
        <Button type="submit" disabled={!canSubmit} size="lg" className="flex-1">
          {saving ? "Guardando..." : "Generar presupuesto"}
        </Button>
      </div>
    </form>
  );
}
