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

  return (
    <div className="flex gap-1 flex-wrap">
      {currentStatus !== "accepted" && (
        <form action={() => handleAction("accepted")}>
          <Button type="submit" size="sm" variant="success" className="h-7 text-xs px-2">
            Aceptar
          </Button>
        </form>
      )}
      {currentStatus !== "rejected" && (
        <form action={() => handleAction("rejected")}>
          <Button type="submit" size="sm" variant="destructive" className="h-7 text-xs px-2">
            Rechazar
          </Button>
        </form>
      )}
      {currentStatus !== "pending" && (
        <form action={() => handleAction("pending")}>
          <Button type="submit" size="sm" variant="outline" className="h-7 text-xs px-2">
            Pendiente
          </Button>
        </form>
      )}
    </div>
  );
}
