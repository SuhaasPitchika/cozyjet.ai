import { FirebaseClientProvider } from "@/firebase";
import DashboardShell from "./DashboardShell";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <DashboardShell>{children}</DashboardShell>
    </FirebaseClientProvider>
  );
}
