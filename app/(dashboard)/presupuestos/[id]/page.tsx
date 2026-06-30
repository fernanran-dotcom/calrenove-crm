"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { updateCommercialStatus, registerPayment } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CommercialStatusBadge, PaymentStatusBadge } from "@/components/presupuestos/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Budget, Company, ModelOptional } from "@/types";

export default function BudgetViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const pdfRef = useRef<HTMLDivElement>(null);

  const [budget, setBudget] = useState<Budget | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [optionals, setOptionals] = useState<ModelOptional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("");
  const [payments, setPayments] = useState<any[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: b } = await supabase
        .from("budgets")
        .select("*, customer:customers(*), brand:boiler_brands(*), model:boiler_models(*, includes:model_includes(*), excludes:model_excludes(*))")
        .eq("id", id)
        .single();
      if (!b) { router.push("/presupuestos"); return; }

      const { data: c } = await supabase.from("companies").select("*").eq("id", b.company_id).single();
      const { data: opt } = await supabase.from("budget_selected_optionals").select("*, optional:model_optionals(*)").eq("budget_id", b.id);
      const { data: pay } = await supabase.from("payments").select("*").eq("budget_id", b.id).order("payment_date", { ascending: false });

      setBudget(b);
      setCompany(c);
      setOptionals(opt || []);
      setPayments(pay || []);
      setTotalPaid(pay?.reduce((s, p) => s + Number(p.amount), 0) || 0);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleStatusChange = async (status: "accepted" | "rejected") => {
    if (!budget) return;
    await updateCommercialStatus(budget.id, status);
    setBudget((prev) => prev ? { ...prev, commercial_status: status } : prev);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budget) return;
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) return;

    await registerPayment({
      budget_id: budget.id,
      amount,
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: payMethod || undefined,
      notes: undefined,
    });

    const { data: pay } = await supabase.from("payments").select("*").eq("budget_id", budget.id);
    setPayments(pay || []);
    setTotalPaid(pay?.reduce((s, p) => s + Number(p.amount), 0) || 0);
    setShowPayment(false);
    setPayAmount("");
    setPayMethod("");

    const newTotalPaid = pay?.reduce((s, p) => s + Number(p.amount), 0) || 0;
    const status = newTotalPaid >= Number(budget.total) ? "paid" : newTotalPaid > 0 ? "partial" : "pending";
    setBudget((prev) => prev ? { ...prev, payment_status: status } : prev);
  };

  const generatePDF = async () => {
    if (!pdfRef.current) return;
    setPdfGenerating(true);

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const el = pdfRef.current;
      const fileName = `Presupuesto_${budget!.budget_number}_${budget!.customer?.name?.replace(/[^a-z0-9]/gi, "_")}.pdf`;

      const pdfBlob = await (html2pdf as any)()
        .set({
          margin: [5, 5, 5, 5],
          filename: fileName,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(el)
        .outputPdf("blob");

      const url = URL.createObjectURL(pdfBlob);
      const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

      if (navigator.share && navigator.canShare?.({ files: [pdfFile] })) {
        await navigator.share({ title: `Presupuesto ${budget!.budget_number}`, files: [pdfFile] });
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        setShowShare(true);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: uploadErr } = await supabase.storage
          .from("pdfs")
          .upload(`${user.id}/${fileName}`, pdfBlob, { contentType: "application/pdf", upsert: true });

        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("pdfs").getPublicUrl(`${user.id}/${fileName}`);
          if (urlData) {
            await supabase.from("budgets").update({ pdf_url: urlData.publicUrl }).eq("id", budget!.id);
            setBudget((prev) => prev ? { ...prev, pdf_url: urlData.publicUrl } : prev);
          }
        }
      }

      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err: any) {
      alert("Error al generar PDF: " + err.message);
    } finally {
      setPdfGenerating(false);
    }
  };

  if (loading) return <p className="text-center py-8">Cargando...</p>;
  if (!budget || !company) return null;

  const pending = Number(budget.total) - totalPaid;

  const estadoClass = (() => {
    if (budget.commercial_status === "accepted") return "border-emerald-500";
    if (budget.commercial_status === "rejected") return "border-red-500";
    return "border-amber-500";
  })();

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex flex-wrap gap-2 no-print">
        <Button variant="outline" size="sm" onClick={() => window.print()}>Imprimir</Button>
        <Button variant="success" size="sm" onClick={generatePDF} disabled={pdfGenerating}>
          {pdfGenerating ? "..." : "Compartir"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => router.push("/presupuestos/nuevo")}>Nuevo</Button>
        <Button variant="outline" size="sm" onClick={() => router.push("/presupuestos")}>Historial</Button>
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
        <CommercialStatusBadge status={budget.commercial_status} />
        <PaymentStatusBadge status={budget.payment_status} />
        {budget.commercial_status === "pending" && (
          <>
            <Button size="sm" variant="success" onClick={() => handleStatusChange("accepted")}>Aceptar</Button>
            <Button size="sm" variant="destructive" onClick={() => handleStatusChange("rejected")}>Rechazar</Button>
          </>
        )}
        {budget.commercial_status === "accepted" && budget.payment_status !== "paid" && (
          <Button size="sm" onClick={() => setShowPayment(true)}>Registrar cobro</Button>
        )}
      </div>

      {budget.commercial_status === "accepted" && payments.length > 0 && (
        <Card className="no-print">
          <CardContent className="p-4 space-y-2">
            <p className="font-semibold text-sm">
              Cobrado: {formatCurrency(totalPaid)} / {formatCurrency(budget.total)} — Pendiente: {formatCurrency(pending)}
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              {payments.map((p) => (
                <p key={p.id}>{formatDate(p.payment_date)} — {formatCurrency(p.amount)}{p.payment_method ? ` (${p.payment_method})` : ""}</p>
              ))}
            </div>
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
                {budget.customer?.address}{budget.customer?.address ? <br /> : ""}
                {budget.customer?.phone ? `Tel.: ${budget.customer?.phone}` : ""}
                {budget.customer?.email ? ` | Email: ${budget.customer?.email}` : ""}
              </p>
            </div>

            <div style={{ marginBottom: 12, fontSize: 11 }}>
              <strong>DESCRIPCIÓN:</strong><br />
              Suministro e instalación de {budget.model?.description || budget.model?.name}
              {" "}Se incluyen los tramos de chimenea y materiales para su instalación, así como el transporte a vertedero autorizado de la caldera retirada.
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
                <tr>
                  <td style={{ padding: "5px 8px", borderBottom: "1px solid #ddd", fontSize: 11 }}>{budget.model?.name}</td>
                  <td style={{ padding: "5px 8px", borderBottom: "1px solid #ddd", fontSize: 11, textAlign: "center" }}>1</td>
                  <td style={{ padding: "5px 8px", borderBottom: "1px solid #ddd", fontSize: 11, textAlign: "right" }}>{formatCurrency(Number(budget.custom_price || budget.model?.price_final || 0))}</td>
                  <td style={{ padding: "5px 8px", borderBottom: "1px solid #ddd", fontSize: 11, textAlign: "right" }}>{formatCurrency(Number(budget.custom_price || budget.model?.price_final || 0))}</td>
                </tr>
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

            <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
              {(budget.model as any)?.includes?.length > 0 && (
                <div>
                  <h4 style={{ color: "#28a745", marginBottom: 8, fontSize: 11 }}>INCLUYE</h4>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 10.5 }}>
                    {(budget.model as any).includes?.map((i: any, idx: number) => (
                      <li key={idx} style={{ listStyle: '"✓ "', color: "#28a745" }}>{i.description}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(budget.model as any)?.excludes?.length > 0 && (
                <div>
                  <h4 style={{ color: "#dc3545", marginBottom: 8, fontSize: 11 }}>NO INCLUYE</h4>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 10.5 }}>
                    {(budget.model as any).excludes?.map((e: any, idx: number) => (
                      <li key={idx} style={{ listStyle: '"✗ "', color: "#dc3545" }}>{e.description}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {(budget.model as any)?.notes && (
              <div style={{ background: "#fffde7", borderLeft: "3px solid #f9a825", padding: "8px 12px", marginBottom: 12, fontSize: 10.5 }}>
                <strong>Nota:</strong> {(budget.model as any).notes}
              </div>
            )}
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
              {totalPaid > 0 && ` — Cobrado: ${formatCurrency(totalPaid)} — Pendiente: ${formatCurrency(pending)}`}
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
