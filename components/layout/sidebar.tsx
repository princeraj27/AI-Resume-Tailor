'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  Mic,
  BookOpen,
  Brain,
  Sparkles,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/interview', label: 'Interview', icon: MessageSquare },
  { href: '/voice-lab', label: 'Voice Lab', icon: Mic },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="md:hidden p-4 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-cyan-500" />
          <span className="font-semibold">AI Career</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        className={cn(
          "hidden md:flex flex-col h-screen border-r border-white/10 bg-black/20 backdrop-blur-xl relative",
          "transition-all duration-300 ease-in-out"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="relative">
            <Brain className="w-8 h-8 text-cyan-500" />
            <Sparkles className="w-4 h-4 text-blue-400 absolute -top-1 -right-1" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-lg bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent whitespace-nowrap overflow-hidden"
              >
                AI Career Intel
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname?.startsWith(item.href.replace('-lab', '').replace('-base', '')) && item.href !== '/');
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                    isActive 
                      ? "bg-white/10 text-white border border-white/5" 
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-cyan-400")} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-blue-500 to-cyan-500"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className="mb-4 flex gap-1 justify-center">
            {/* Agent Status Indicators */}
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" title="Resume Agent" />
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" title="Interview Agent" />
            <div className="w-2 h-2 rounded-full bg-emerald-500" title="RAG Agent" />
            <div className="w-2 h-2 rounded-full bg-cyan-500" title="Orchestrator" />
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-center text-zinc-500 mb-4 whitespace-nowrap"
              >
                Powered by Multi-Agent AI
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center hover:bg-white/5"
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
              <ChevronLeft className="w-5 h-5 text-zinc-400" />
            </motion.div>
          </Button>
        </div>
      </motion.aside>
      
      {/* Mobile Sidebar overlay could go here */}
    </>
  );
}
