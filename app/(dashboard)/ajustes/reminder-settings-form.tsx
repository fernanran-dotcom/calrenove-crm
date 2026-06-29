"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertReminderSettings } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ReminderSettingsForm({
  initialEnabled,
  initialFrequency,
}: {
  initialEnabled: boolean;
  initialFrequency: number;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [frequency, setFrequency] = useState(initialFrequency);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await upsertReminderSettings({ enabled, frequency_days: frequency });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="rounded"
        />
        Recordatorios activados
      </label>

      <div className="flex items-center gap-3">
        <Label htmlFor="frequency" className="text-sm">Enviar cada</Label>
        <Input
          id="frequency"
          type="number"
          min={1}
          max={90}
          value={frequency}
          onChange={(e) => setFrequency(parseInt(e.target.value) || 7)}
          className="w-20 h-8 text-sm"
        />
        <span className="text-sm text-muted-foreground">días</span>
      </div>

      <Button size="sm" onClick={handleSave} disabled={saving}>
        {saving ? "Guardando..." : "Guardar configuración"}
      </Button>
    </div>
  );
}
