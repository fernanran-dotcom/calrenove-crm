"use client";

import { updateCommercialStatus } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { CommercialStatus } from "@/types";

export function UpdateStatusForm({
  budgetId,
  currentStatus,
}: {
  budgetId: string;
  currentStatus: CommercialStatus;
}) {
  const router = useRouter();

  async function handleAction(status: CommercialStatus) {
    await updateCommercialStatus(budgetId, status);
    router.refresh();
  }

  if (currentStatus !== "pending") return null;

  return (
    <div className="flex gap-1">
      <form action={() => handleAction("accepted")}>
        <Button type="submit" size="sm" variant="success" className="h-7 text-xs px-2">
          Aceptar
        </Button>
      </form>
      <form action={() => handleAction("rejected")}>
        <Button type="submit" size="sm" variant="destructive" className="h-7 text-xs px-2">
          Rechazar
        </Button>
      </form>
    </div>
  );
}
