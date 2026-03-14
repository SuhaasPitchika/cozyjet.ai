
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Rocket, LayoutDashboard, Brain, MessageSquare, Sparkles, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { CustomCursor } from "@/components/layout/custom-cursor";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden relative">
        <CustomCursor name="Cozy User" />
        
        <Sidebar className="border-r border-white/5 bg-black">
          <SidebarHeader className="p-6">
            <Link href="/" className="flex items-center gap-2">
              <Rocket className="w-8 h-8 text-primary" />
              <span className="font-headline text-xl font-bold tracking-tighter">CozyJet</span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard Overview">
                  <Link href="/dashboard" className="flex items-center gap-3">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <div className="mt-8 mb-2 px-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                The Agents
              </div>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Skippy Intelligence">
                  <Link href="/dashboard/skippy" className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#C9B8FF]" />
                    <span>Skippy Agent</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Flippo Productivity">
                  <Link href="/dashboard/flippo" className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#6297FF]" />
                    <span>Flippo Agent</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Snooks Marketing">
                  <Link href="/dashboard/snooks" className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#A36BEE]" />
                    <span>Snooks Agent</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem className="opacity-40">
                <SidebarMenuButton asChild tooltip="Coming Soon">
                  <Link href="/dashboard/coming-soon" className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    <span>Studio X</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-white/5">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-destructive hover:text-destructive" tooltip="Log Out">
                  <LogOut className="w-5 h-5" />
                  <span>Log Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-y-auto bg-background/50 relative">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
