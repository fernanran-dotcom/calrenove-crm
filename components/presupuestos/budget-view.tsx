"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateCommercialStatus, registerPayment } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CommercialStatusBadge, PaymentStatusBadge } from "@/components/presupuestos/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Company } from "@/types";

interface BudgetData {
  id: string;
  budget_number: string;
  company_id: string;
  commercial_status: "pending" | "accepted" | "rejected";
  payment_status: "pending" | "partial" | "paid";
  subtotal: number;
  iva_amount: number;
  total: number;
  custom_price: number | null;
  notes: string | null;
  brand_name: string | null;
  model_name: string | null;
  description: string | null;
  items: { concepto: string; cantidad: number; precio: number }[];
  issue_date: string;
  customer: { name?: string; phone?: string; address?: string; email?: string; dni?: string } | null;
  brand: { name?: string; slug?: string } | null;
  model: {
    name?: string;
    slug?: string;
    description?: string;
    price_final?: number;
    notes?: string;
    brochure_url?: string | null;
    includes?: { description: string }[];
    excludes?: { description: string }[];
  } | null;
}

export function BudgetView({
  budget,
  company,
  optionals,
  payments,
}: {
  budget: BudgetData;
  company: Company;
  optionals: { id: string; name: string; price: number }[];
  payments: { id: string; amount: number; payment_date: string; payment_method: string | null }[];
}) {
  const router = useRouter();
  const pdfRef = useRef<HTMLDivElement>(null);

  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("");
  const [localPayments, setLocalPayments] = useState(payments);
  const [localStatus, setLocalStatus] = useState(budget.commercial_status);
  const [localPaymentStatus, setLocalPaymentStatus] = useState(budget.payment_status);
  const [showShare, setShowShare] = useState(false);

  const getFileName = () =>
    `Presupuesto_${budget.budget_number}_${budget.customer?.name?.replace(/[^a-z0-9]/gi, "_")}.pdf`;

  const buildPdfBlob = async (): Promise<Blob> => {
    const html2pdf = (await import("html2pdf.js")).default;
    const el = pdfRef.current!;
    const budgetBlob = await (html2pdf as any)()
      .set({
        margin: [5, 5, 5, 5],
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(el)
      .outputPdf("blob");

    const brochureUrl = budget.model?.brochure_url as string | null | undefined;
    if (!brochureUrl) return budgetBlob;

    try {
      const resp = await fetch(brochureUrl);
      if (!resp.ok) return budgetBlob;
      const { PDFDocument } = await import("pdf-lib");
      const budgetDoc = await PDFDocument.load(await budgetBlob.arrayBuffer());
      const brochureDoc = await PDFDocument.load(await resp.arrayBuffer(), { ignoreEncryption: true });
      const pages = await budgetDoc.copyPages(brochureDoc, brochureDoc.getPageIndices());
      pages.forEach((p) => budgetDoc.addPage(p));
      const merged = await budgetDoc.save();
      const arrayBuffer = new ArrayBuffer(merged.byteLength);
      new Uint8Array(arrayBuffer).set(merged);
      return new Blob([arrayBuffer], { type: "application/pdf" });
    } catch {
      return budgetBlob;
    }
  };

  const handlePrint = async () => {
    if (!pdfRef.current) return;
    setPdfGenerating(true);
    try {
      const pdfBlob = await buildPdfBlob();
      const url = URL.createObjectURL(pdfBlob);
      const w = window.open(url, "_blank");
      if (!w) {
        const a = document.createElement("a");
        a.href = url;
        a.download = getFileName();
        a.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 120000);
    } catch {
      window.print();
    } finally {
      setPdfGenerating(false);
    }
  };

  const generatePDF = async () => {
    if (!pdfRef.current) return;
    setPdfGenerating(true);

    try {
      const fileName = getFileName();
      const pdfBlob = await buildPdfBlob();

      const url = URL.createObjectURL(pdfBlob);
      const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

      if (navigator.share && navigator.canShare?.({ files: [pdfFile] })) {
        await navigator.share({ title: `Presupuesto ${budget.budget_number}`, files: [pdfFile] });
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        setShowShare(true);
      }

      // Guardar copia en el servidor
      try {
        const fd = new FormData();
        fd.append("file", pdfFile);
        fd.append("budgetId", budget.id);
        const res = await fetch("/api/pdfs/upload", { method: "POST", body: fd });
        if (res.ok) {
          const { url: storedUrl } = await res.json();
          if (storedUrl) {
            await fetch("/api/budgets/pdf-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ budgetId: budget.id, url: storedUrl }),
            });
          }
        }
      } catch {}

      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err: any) {
      alert("Error al generar PDF: " + err.message);
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleStatusChange = async (status: "pending" | "accepted" | "rejected") => {
    await updateCommercialStatus(budget.id, status);
    setLocalStatus(status);
    if (status === "rejected") setLocalPaymentStatus("paid");
    if (status === "pending") setLocalPaymentStatus("pending");
    router.refresh();
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) return;

    const amountCents = Math.round(amount * 100);
    const newPaidCents =
      Math.round(localPayments.reduce((s, p) => s + Number(p.amount), 0) * 100) + amountCents;
    const totalCents = Math.round(Number(budget.total) * 100);

    await registerPayment({
      budget_id: budget.id,
      amount,
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: payMethod || undefined,
    });

    setLocalPayments([...localPayments, { id: crypto.randomUUID(), amount, payment_date: new Date().toISOString().split("T")[0], payment_method: payMethod || null }]);
    setLocalPaymentStatus(newPaidCents >= totalCents ? "paid" : newPaidCents > 0 ? "partial" : "pending");
    setShowPayment(false);
    setPayAmount("");
    setPayMethod("");
  };

  const pending = Math.max(
    0,
    Math.round(Number(budget.total) * 100) - Math.round(localPayments.reduce((s, p) => s + Number(p.amount), 0) * 100)
  ) / 100;

  const estadoClass = (() => {
    if (localStatus === "accepted") return "border-emerald-500";
    if (localStatus === "rejected") return "border-red-500";
    return "border-amber-500";
  })();

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex flex-wrap gap-2 no-print">
        <Button variant="outline" size="sm" onClick={handlePrint} disabled={pdfGenerating}>
          {pdfGenerating ? "Generando..." : "Imprimir / PDF"}
        </Button>
        <Button variant="success" size="sm" onClick={generatePDF} disabled={pdfGenerating}>
          {pdfGenerating ? "..." : "Compartir"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => (window.location.href = "/presupuestos/nuevo")}>Nuevo</Button>
        <Button variant="outline" size="sm" onClick={() => (window.location.href = "/presupuestos")}>Historial</Button>
      </div>

      {showShare && (
        <div className="flex gap-2 no-print flex-wrap">
          <Button
            variant="destructive"
            onClick={() => window.open(`mailto:?subject=Presupuesto Nº ${budget.budget_number}&body=${encodeURIComponent(`Presupuesto Nº ${budget.budget_number} - ${budget.customer?.name}`)}`)}
          >
            ✉ Email
          </Button>
          <Button
            variant="success"
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Presupuesto Nº ${budget.budget_number} - ${budget.customer?.name} - ${formatCurrency(budget.total)}`)}`)}
          >
            📱 WhatsApp
          </Button>
          <Button variant="outline" onClick={() => setShowShare(false)}>Cerrar</Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 no-print items-center">
        <CommercialStatusBadge status={localStatus} />
        {localStatus !== "rejected" && <PaymentStatusBadge status={localPaymentStatus} />}
        {localStatus === "pending" && (
          <>
            <Button size="sm" variant="success" onClick={() => handleStatusChange("accepted")}>Aceptar</Button>
            <Button size="sm" variant="destructive" onClick={() => handleStatusChange("rejected")}>Rechazar</Button>
          </>
        )}
        {localStatus === "accepted" && (
          <>
            <Button size="sm" variant="destructive" onClick={() => handleStatusChange("rejected")}>Rechazar</Button>
            <Button size="sm" variant="outline" onClick={() => handleStatusChange("pending")}>Volver a pendiente</Button>
            {localPaymentStatus !== "paid" && (
              <Button size="sm" onClick={() => setShowPayment(true)}>Registrar cobro</Button>
            )}
          </>
        )}
        {localStatus === "rejected" && (
          <>
            <Button size="sm" variant="success" onClick={() => handleStatusChange("accepted")}>Aceptar</Button>
            <Button size="sm" variant="outline" onClick={() => handleStatusChange("pending")}>Volver a pendiente</Button>
          </>
        )}
      </div>

      {localStatus === "accepted" && localPayments.length > 0 && (
        <Card className="no-print">
          <CardContent className="p-4 space-y-2">
            <p className="font-semibold text-sm">
              Cobrado: {formatCurrency(localPayments.reduce((s, p) => s + p.amount, 0))} / {formatCurrency(budget.total)} — Pendiente: {formatCurrency(pending)}
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              {localPayments.map((p) => (
                <p key={p.id}>{formatDate(p.payment_date)} — {formatCurrency(p.amount)}{p.payment_method ? ` (${p.payment_method})` : ""}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {budget.model?.brochure_url && (
        <Card className="no-print">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-sm font-medium">Folleto del equipo — se añade automáticamente al final del PDF al imprimir o compartir</p>
              <Button size="sm" variant="outline" onClick={() => window.open(budget.model!.brochure_url!, "_blank")}>
                Abrir folleto
              </Button>
            </div>
            <iframe
              src={budget.model.brochure_url}
              title="Folleto del equipo"
              className="w-full h-96 rounded-md border bg-white"
            />
          </CardContent>
        </Card>
      )}

      <div className={`border-2 ${estadoClass} rounded-lg`}>
        <div ref={pdfRef}>
          <div className="presupuesto-print p-6" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
            <style>{`
              .ps-emp-header { border-bottom: 3px solid ${company.color}; display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; margin-bottom: 16px; }
              .ps-emp-header h1 { color: ${company.color}; font-size: 16px; margin: 0; }
              .ps-num { color: ${company.color}; font-size: 15px; font-weight: 700; text-align: right; }
              .ps-cliente h3 { color: ${company.color}; font-size: 12px; font-weight: 700; margin-bottom: 4px; }
              .ps-table th { background: ${company.color}; color: #fff; padding: 6px 8px; text-align: left; font-size: 11px; font-weight: 600; }
              .ps-table .total-row td { font-weight: 700; font-size: 13px; border-top: 2px solid #333; }
              .ps-footer { border-top: 2px solid ${company.color}; text-align: center; padding-top: 10px; font-size: 10px; color: #666; }
            `}</style>

            <div className="ps-emp-header">
              <div>
                {company.logo_url && <img src={company.logo_url} alt={company.name} style={{ maxHeight: 55, marginBottom: 4, display: "block" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                {company.address && <p style={{ margin: 0, fontSize: 11 }}>{company.address}</p>}
              </div>
              <div>
                <div className="ps-num">PRESUPUESTO Nº: {budget.budget_number}</div>
                <div style={{ fontSize: 12, textAlign: "right" }}>Fecha: {formatDate(budget.issue_date)}</div>
              </div>
            </div>

            <div className="ps-cliente" style={{ marginBottom: 14 }}>
              <h3>DATOS DEL CLIENTE</h3>
              <p style={{ margin: 0, fontSize: 11 }}>
                <strong>{budget.customer?.name}</strong><br />
                {budget.customer?.dni && (
                  <>DNI: {budget.customer.dni}<br /></>
                )}
                {budget.customer?.address}{budget.customer?.address ? <br /> : ""}
                {budget.customer?.phone ? `Tel.: ${budget.customer?.phone}` : ""}
                {budget.customer?.email ? ` | Email: ${budget.customer?.email}` : ""}
              </p>
            </div>

            {(() => {
              const isTemplate = budget.brand_name || (budget.items?.length > 0);
              const modelName = budget.model_name || budget.model?.name || "";
              const brandName = budget.brand_name || budget.brand?.name || "";
              const descText = budget.description || budget.model?.description || budget.model?.name || "";
              const fullName = (budget.brand?.name || brandName) + " " + (budget.model?.name || modelName);
              const isAC = /aire acondicionado/i.test(fullName) || (budget.model?.description || "").toLowerCase().includes("aire acondicionado");

              return (
                <>
                  <div style={{ marginBottom: 12, fontSize: 11 }}>
                    <strong>DESCRIPCIÓN:</strong><br />
                    {isTemplate ? (
                      <>{descText || (brandName ? `Suministro e instalación de ${brandName}${modelName ? " " + modelName : ""}` : "")}</>
                    ) : (
                      <>{isAC
                        ? `Suministro e instalación de aire acondicionado ${budget.brand?.name || ""} ${budget.model?.name || ""}. Se incluye instalación completa, soporte, mando y 3 metros de tubería.`
                        : `Suministro e instalación de ${budget.model?.description || budget.model?.name} Se incluyen los tramos de chimenea y materiales para su instalación, así como el transporte a vertedero autorizado de la caldera retirada.`
                      }</>
                    )}
                  </div>

                  <table className="ps-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
                    <thead>
                      <tr>
                        <th>Concepto</th>
                        <th style={{ width: 60 }}>Ud.</th>
                        <th style={{ width: 130, textAlign: "right" }}>Precio</th>
                        <th style={{ width: 130, textAlign: "right" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isTemplate && budget.items?.length > 0 ? (
                        <>
                          {budget.items.filter((i: any) => i.concepto?.trim()).map((item: any, idx: number) => (
                            <tr key={idx}>
                              <td style={{ padding: "5px 8px", borderBottom: "1px solid #ddd", fontSize: 11 }}>{item.concepto}</td>
                              <td style={{ padding: "5px 8px", borderBottom: "1px solid #ddd", fontSize: 11, textAlign: "center" }}>{item.cantidad}</td>
                              <td style={{ padding: "5px 8px", borderBottom: "1px solid #ddd", fontSize: 11, textAlign: "right" }}>{formatCurrency(item.precio)}</td>
                              <td style={{ padding: "5px 8px", borderBottom: "1px solid #ddd", fontSize: 11, textAlign: "right" }}>{formatCurrency(item.cantidad * item.precio)}</td>
                            </tr>
                          ))}
                        </>
                      ) : (
                        <tr>
                          <td style={{ padding: "5px 8px", borderBottom: "1px solid #ddd", fontSize: 11 }}>{modelName}</td>
                          <td style={{ padding: "5px 8px", borderBottom: "1px solid #ddd", fontSize: 11, textAlign: "center" }}>1</td>
                          <td style={{ padding: "5px 8px", borderBottom: "1px solid #ddd", fontSize: 11, textAlign: "right" }}>{formatCurrency(Number(budget.custom_price || budget.model?.price_final || budget.subtotal || 0))}</td>
                          <td style={{ padding: "5px 8px", borderBottom: "1px solid #ddd", fontSize: 11, textAlign: "right" }}>{formatCurrency(Number(budget.custom_price || budget.model?.price_final || budget.subtotal || 0))}</td>
                        </tr>
                      )}
                      {optionals.map((opt) => (
                        <tr key={opt.id}>
                          <td style={{ padding: "5px 8px", borderBottom: "1px solid #ddd", fontSize: 11 }}>Opcional: {opt.name}</td>
                          <td style={{ padding: "5px 8px", borderBottom: "1px solid #ddd", fontSize: 11, textAlign: "center" }}>1</td>
                          <td style={{ padding: "5px 8px", borderBottom: "1px solid #ddd", fontSize: 11, textAlign: "right" }}>{formatCurrency(opt.price)}</td>
                          <td style={{ padding: "5px 8px", borderBottom: "1px solid #ddd", fontSize: 11, textAlign: "right" }}>{formatCurrency(opt.price)}</td>
                        </tr>
                      ))}
                      <tr><td colSpan={3} style={{ textAlign: "right", fontWeight: 600, padding: "5px 8px", fontSize: 11 }}>SUB-TOTAL</td><td style={{ padding: "5px 8px", fontSize: 11, textAlign: "right" }}>{formatCurrency(budget.subtotal)}</td></tr>
                      <tr><td colSpan={3} style={{ textAlign: "right", padding: "5px 8px", fontSize: 11 }}>IVA 21%</td><td style={{ padding: "5px 8px", fontSize: 11, textAlign: "right" }}>{formatCurrency(budget.iva_amount)}</td></tr>
                      <tr className="total-row"><td colSpan={3} style={{ textAlign: "right", padding: "5px 8px", fontSize: 11 }}>TOTAL</td><td style={{ padding: "5px 8px", fontSize: 11, textAlign: "right" }}>{formatCurrency(budget.total)}</td></tr>
                    </tbody>
                  </table>

                  {(() => {
                    const norm = (s: string) =>
                      (s || "")
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9 ]/g, " ")
                        .replace(/\s+/g, " ")
                        .trim();

                    const optionalNames = optionals.map((o) => norm(o.name)).filter(Boolean);

                    const allExcludes = budget.model?.excludes || [];
                    const filteredExcludes = allExcludes.filter((e) => {
                      const en = norm(e.description);
                      if (!en) return true;
                      return !optionalNames.some((on) => on && (en === on || en.includes(on) || on.includes(en)));
                    });

                    const hasIncludes = (budget.model?.includes?.length || 0) > 0 || optionalNames.length > 0;

                    return (
                      <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
                        {hasIncludes && (
                          <div>
                            <h4 style={{ color: "#28a745", marginBottom: 8, fontSize: 11 }}>INCLUYE</h4>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 10.5 }}>
                              {budget.model?.includes?.map((i, idx: number) => (
                                <li key={idx} style={{ listStyle: '"✓ "', color: "#28a745" }}>{i.description}</li>
                              ))}
                              {optionals.map((o) => (
                                <li key={o.id} style={{ listStyle: '"✓ "', color: "#28a745" }}>{o.name} (incluido como opcional)</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {filteredExcludes.length > 0 && (
                          <div>
                            <h4 style={{ color: "#dc3545", marginBottom: 8, fontSize: 11 }}>NO INCLUYE</h4>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 10.5 }}>
                              {filteredExcludes.map((e, idx: number) => (
                                <li key={idx} style={{ listStyle: '"✗ "', color: "#dc3545" }}>{e.description}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {budget.model?.notes && (
                    <div style={{ background: "#fffde7", borderLeft: "3px solid #f9a825", padding: "8px 12px", marginBottom: 12, fontSize: 10.5 }}>
                      <strong>Nota:</strong> {budget.model.notes}
                    </div>
                  )}
                </>
              );
            })()}
            {budget.notes && (
              <div style={{ background: "#fffde7", borderLeft: "3px solid #f9a825", padding: "8px 12px", marginBottom: 12, fontSize: 10.5 }}>
                <strong>Observaciones:</strong><br />{budget.notes}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", margin: "24px 0 16px" }}>
              <div><div style={{ width: 200, borderTop: "1px solid #333", paddingTop: 6, fontSize: 11, textAlign: "center" }}>Firma del cliente</div></div>
              <div><div style={{ width: 200, borderTop: "1px solid #333", paddingTop: 6, fontSize: 11, textAlign: "center" }}>{company.name}</div></div>
            </div>

            <div className="ps-footer">
              <p style={{ margin: 0 }}>{company.name}</p>
              <p style={{ margin: 0 }}>Presupuesto válido durante 30 días</p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar cobro</DialogTitle>
            <DialogDescription>
              Presupuesto Nº {budget.budget_number} — {formatCurrency(budget.total)}
              {localPayments.length > 0 && ` — Cobrado: ${formatCurrency(localPayments.reduce((s, p) => s + p.amount, 0))} — Pendiente: ${formatCurrency(pending)}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <Label>Importe</Label>
              <Input type="number" step="0.01" min="0.01" max={pending} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} required />
            </div>
            <div>
              <Label>Método de pago (opcional)</Label>
              <Input value={payMethod} onChange={(e) => setPayMethod(e.target.value)} placeholder="Transferencia, efectivo, tarjeta..." />
            </div>
            <Button type="submit" className="w-full">Registrar pago</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
