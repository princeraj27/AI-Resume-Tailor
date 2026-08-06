'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Brain,
  Sparkles,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Brain },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/practice', label: 'Practice Hub', icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="md:hidden p-4 flex items-center justify-between border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <span className="font-bold text-sm">AI Career Intel</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      <aside
        className={cn(
          "hidden md:flex flex-col h-screen border-r border-border bg-card text-card-foreground relative transition-all duration-200",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="p-5 flex items-center gap-3 border-b border-border">
          <div className="relative">
            <Brain className="w-7 h-7 text-primary" />
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 absolute -top-1 -right-1" />
          </div>
          {!collapsed && (
            <span className="font-bold text-base tracking-tight whitespace-nowrap overflow-hidden">
              AI Career Intel
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1.5 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors font-medium",
                    isActive 
                      ? "bg-primary text-primary-foreground font-semibold" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="whitespace-nowrap overflow-hidden">
                      {item.label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border mt-auto">
          {!collapsed && (
            <div className="text-xs text-center text-muted-foreground mb-3">
              Multi-Agent • RAG • Voice
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center hover:bg-muted"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>
      </aside>
    </>
  );
}
