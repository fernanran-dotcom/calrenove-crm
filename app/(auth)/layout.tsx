export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-slate-800">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
