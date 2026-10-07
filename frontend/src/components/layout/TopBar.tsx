'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Bell,
  ChevronDown,
  Layers,
  Globe,
  Check,
  Menu,
  Sparkles,
  User,
  LogOut,
  LogIn,
} from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../../lib/mockData';
import { EnvironmentType, Project } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface TopBarProps {
  currentProject: Project | null;
  projects?: Project[];
  onSelectProject?: (proj: Project) => void;
  environment: EnvironmentType;
  onSelectEnvironment: (env: EnvironmentType) => void;
  onOpenSearch: () => void;
  onToggleMobileSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentProject,
  projects = [],
  onSelectProject,
  environment,
  onSelectEnvironment,
  onOpenSearch,
  onToggleMobileSidebar,
}) => {
  const { user, logout } = useAuth();
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isEnvDropdownOpen, setIsEnvDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const environments: EnvironmentType[] = ['production', 'staging', 'development'];

  const envColorMap: Record<EnvironmentType, string> = {
    production: 'emerald',
    staging: 'amber',
    development: 'cyan',
  };

  const unreadNotifCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left section: Mobile menu trigger + Project Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Project Selector Dropdown */}
        {currentProject && (
          <div className="relative">
            <button
              onClick={() => {
                setIsProjectDropdownOpen(!isProjectDropdownOpen);
                setIsEnvDropdownOpen(false);
                setIsNotifOpen(false);
                setIsProfileOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-200 text-sm font-medium transition-colors"
            >
              <div className="w-6 h-6 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-slate-100 max-w-[140px] sm:max-w-[200px] truncate">
                {currentProject.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isProjectDropdownOpen && projects.length > 0 && (
              <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Active Backend Project
                </div>
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      if (onSelectProject) onSelectProject(proj);
                      setIsProjectDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      proj.id === currentProject.id
                        ? 'bg-slate-800 text-cyan-300 font-medium border border-slate-700/60'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-slate-200">{proj.name}</span>
                      <span className="text-[10px] text-slate-400">{proj.framework} • {proj.servicesCount} services</span>
                    </div>
                    {proj.id === currentProject.id && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Environment Selector */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => {
              setIsEnvDropdownOpen(!isEnvDropdownOpen);
              setIsProjectDropdownOpen(false);
              setIsNotifOpen(false);
              setIsProfileOpen(false);
            }}
            className="flex items-center gap-1.5"
          >
            <Badge
              variant={envColorMap[environment] as any}
              pulse={environment === 'production'}
              className="cursor-pointer hover:brightness-110"
            >
              <Globe className="w-3 h-3 inline mr-1" />
              {environment.toUpperCase()}
              <ChevronDown className="w-3 h-3 inline ml-1 opacity-70" />
            </Badge>
          </button>

          {isEnvDropdownOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-1 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Environment Scope
              </div>
              {environments.map((env) => (
                <button
                  key={env}
                  onClick={() => {
                    onSelectEnvironment(env);
                    setIsEnvDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-colors ${
                    env === environment
                      ? 'bg-slate-800 text-cyan-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{env}</span>
                  {env === environment && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle section: Quick Search Command Bar */}
      <button
        onClick={onOpenSearch}
        className="hidden md:flex items-center justify-between w-64 lg:w-96 px-3.5 py-1.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 text-xs transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          <span>Search endpoints, tables, logs...</span>
        </div>
        <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-mono border border-slate-700">
          ⌘K
        </kbd>
      </button>

      {/* Right section: Search Mobile Icon, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search icon for mobile */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* AI Engine Pulse indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-cyan-950/40 border border-cyan-800/50 rounded-lg text-xs text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-mono text-[11px]">AI Copilot Ready</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProjectDropdownOpen(false);
              setIsEnvDropdownOpen(false);
              setIsProfileOpen(false);
            }}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800/80 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <span className="text-xs font-semibold text-slate-200">System Notifications</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                  {unreadNotifCount} unread
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {MOCK_NOTIFICATIONS.map((item) => (
                  <div key={item.id} className="p-3.5 hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-slate-200">{item.title}</span>
                      <span className="text-[10px] text-slate-500 shrink-0">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Auth Action */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsProjectDropdownOpen(false);
                setIsEnvDropdownOpen(false);
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 border border-slate-800/80 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user.email.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  {user.full_name || user.email.split('@')[0]}
                </span>
                <span className="text-[10px] text-slate-400 leading-none">{user.role}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 space-y-1">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-semibold text-slate-100">
                    {user.full_name || 'Architect User'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg text-left font-medium transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <Button variant="primary" size="sm" icon={<LogIn className="w-3.5 h-3.5" />}>
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};
