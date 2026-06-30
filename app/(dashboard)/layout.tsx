import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 lg:p-8 pt-14 lg:pt-8 pb-20 lg:pb-8">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
