import { Badge } from "@/components/ui/badge";
import type { CommercialStatus, PaymentStatus } from "@/types";

const commercialLabels: Record<CommercialStatus, string> = {
  pending: "Pendiente",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

const paymentLabels: Record<PaymentStatus, string> = {
  pending: "Pte. cobro",
  partial: "Cobro parcial",
  paid: "Cobrado",
};

const commercialVariants: Record<CommercialStatus, "warning" | "success" | "destructive"> = {
  pending: "warning",
  accepted: "success",
  rejected: "destructive",
};

const paymentVariants: Record<PaymentStatus, "warning" | "info" | "success"> = {
  pending: "warning",
  partial: "info",
  paid: "success",
};

export function CommercialStatusBadge({ status }: { status: CommercialStatus }) {
  return <Badge variant={commercialVariants[status]}>{commercialLabels[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={paymentVariants[status]}>{paymentLabels[status]}</Badge>;
}
