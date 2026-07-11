"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, register, requestPasswordReset } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Mode = "login" | "register" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);

    if (mode === "login") {
      const result = await login(formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } else if (mode === "register") {
      const password = formData.get("password") as string;
      const confirm = formData.get("confirm") as string;
      if (password !== confirm) {
        setError("Las contraseñas no coinciden");
        return;
      }
      const result = await register(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Cuenta creada. Ya puedes iniciar sesión.");
        setMode("login");
      }
    } else if (mode === "forgot") {
      const result = await requestPasswordReset(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Te hemos enviado un email con las instrucciones para restablecer tu contraseña.");
      }
    }
  }

  return (
    <Card className="shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Calrenove CRM</CardTitle>
        <CardDescription>
          {mode === "login" && "Inicia sesión para continuar"}
          {mode === "register" && "Crea una cuenta nueva"}
          {mode === "forgot" && "Recuperar contraseña"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mode !== "forgot" && (
          <div className="flex mb-4 rounded-lg border p-1 bg-muted">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === "register" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Registrarse
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
          </div>
          {mode !== "forgot" && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
            </div>
          )}
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar contraseña</Label>
              <Input id="confirm" name="confirm" type="password" placeholder="••••••••" required />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}
          <Button type="submit" className="w-full">
            {mode === "login" && "Iniciar sesión"}
            {mode === "register" && "Crear cuenta"}
            {mode === "forgot" && "Enviar email de recuperación"}
          </Button>
        </form>

        {mode === "login" && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}
        {mode === "forgot" && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Volver a iniciar sesión
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
