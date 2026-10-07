'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderGit2,
  Workflow,
  Database,
  Code2,
  Terminal,
  Box,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const navItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderGit2,
    badge: '4 Active',
  },
  {
    name: 'API Builder',
    href: '/api-builder',
    icon: Workflow,
    badge: 'FastAPI',
  },
  {
    name: 'Architecture',
    href: '/architecture',
    icon: Cpu,
    badge: 'AI Analyzer',
    highlight: true,
  },
  {
    name: 'Production Readiness',
    href: '/production-readiness',
    icon: ShieldCheck,
    badge: 'Auditor',
    highlight: true,
  },
  {
    name: 'Schema',
    href: '/schema',
    icon: Database,
    badge: '28 Tables',
  },
  {
    name: 'Code',
    href: '/code',
    icon: Code2,
    badge: null,
  },
  {
    name: 'Test Console',
    href: '/test-console',
    icon: Terminal,
    badge: null,
  },
  {
    name: '3D Twin',
    href: '/3d-twin',
    icon: Box,
    badge: 'Live',
    highlight: true,
  },
  {
    name: 'Load Simulation',
    href: '/load-simulation',
    icon: Zap,
    badge: null,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    badge: null,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-slate-950/95 border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Toggle Header */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
            <Link
              href="/"
              className="flex items-center gap-3 group overflow-hidden"
              onClick={onCloseMobile}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-100 tracking-tight text-base">
                      BackendFlow
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                      AI
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                    SYSTEM PLATFORM
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)]">
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-slate-900 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-950/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 hover:border-slate-800 border border-transparent'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                        item.highlight
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / System Status */}
        <div className="p-3 border-t border-slate-800/80">
          {!isCollapsed ? (
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-200">Engine Online</span>
                  <span className="text-[10px] text-slate-400 font-mono">FastAPI v0.110</span>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
          ) : (
            <div className="flex justify-center py-2" title="Engine Online (FastAPI v0.110)">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
