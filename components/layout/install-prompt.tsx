"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "install-prompt-dismissed-at";
const DISMISS_DAYS = 7;

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    if (ios) {
      const t = setTimeout(() => setVisible(true), 2000);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  if (!visible) return null;

  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border border-slate-200 bg-white p-4 shadow-xl md:left-auto md:right-6 md:max-w-sm">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📲</span>
          <div className="flex-1 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Instala Calrenove CRM</p>
            <p className="mt-1">
              En Safari: pulsa <span className="font-medium">Compartir</span> y luego{" "}
              <span className="font-medium">Añadir a pantalla de inicio</span>
            </p>
          </div>
          <button onClick={dismiss} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar">
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border border-slate-200 bg-white p-4 shadow-xl md:left-auto md:right-6 md:max-w-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a3a5c] text-white text-lg font-bold">
          C
        </div>
        <div className="flex-1 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Instala Calrenove CRM</p>
          <p>Acceso directo desde tu escritorio o pantalla de inicio</p>
        </div>
        <Button size="sm" onClick={install} className="shrink-0 bg-[#1a3a5c] hover:bg-[#1a3a5c]/90">
          Instalar
        </Button>
        <button onClick={dismiss} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar">
          ✕
        </button>
      </div>
    </div>
  );
}
