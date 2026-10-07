'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Workflow,
  Database,
  Gauge,
  Activity,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Box,
  Plus,
  LogIn,
} from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { QuickActions } from './QuickActions';
import { ActivityFeed } from './ActivityFeed';
import { SystemHealthGrid } from './SystemHealthGrid';
import { LatencyChartMock } from './LatencyChartMock';
import { MOCK_SUMMARY } from '../../lib/mockData';
import { useAuth } from '../../context/AuthContext';
import { api, HealthResponse } from '../../lib/api';
import { Project } from '../../types';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check backend health
    api.getHealth()
      .then((res) => setHealth(res))
      .catch((err) => console.warn('Backend health check error:', err));

    if (user) {
      api.getProjects()
        .then((data) => setProjects(data))
        .catch((err) => console.warn('Failed to load dashboard projects:', err))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const activeProject = projects.length > 0 ? projects[0] : null;

  return (
    <div className="space-y-6">
      {/* Project Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-8 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> FastAPI Engine v{health?.version || '0.1.0'}
              </span>
              <Badge variant={health?.status === 'healthy' ? 'success' : 'warning'} pulse>
                {health?.status === 'healthy' ? 'FastAPI Backend Online' : 'Connecting to API...'}
              </Badge>
              {user && (
                <Badge variant="cyan">
                  {user.role}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight">
              {activeProject ? activeProject.name : 'BackendFlow AI Workspace'}
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {activeProject
                ? activeProject.description || 'Production FastAPI microservices architecture'
                : 'High-performance visual backend engineering platform connected to FastAPI & SQLite.'}
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-3">
            <QuickActions />
          </div>
        </div>
      </div>

      {/* 4 StatCards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Projects"
          value={user ? `${projects.length} Persisted` : '0 (Sign in)'}
          change={user ? 'SQLite Database' : 'Authentication required'}
          changeType="positive"
          subtext={projects.length > 0 ? `${projects.length} microservices active` : 'Create your first project'}
          icon={<Layers className="w-5 h-5 text-cyan-400" />}
          accentColor="cyan"
        />

        <StatCard
          title="Database Tables & Schemas"
          value={user && projects.length > 0 ? `${projects.reduce((acc, p) => acc + (p.tablesCount || 0), 0)} Tables` : '28 Tables'}
          change="PostgreSQL + SQLite"
          changeType="neutral"
          subtext="Relational ERD modeler"
          icon={<Database className="w-5 h-5 text-purple-400" />}
          accentColor="purple"
        />

        <StatCard
          title="Average Latency (p95)"
          value={`${MOCK_SUMMARY.avgLatencyMs} ms`}
          change="-3.2 ms"
          changeType="positive"
          subtext="Sub-50ms SLA maintained"
          icon={<Gauge className="w-5 h-5 text-emerald-400" />}
          accentColor="emerald"
        />

        <StatCard
          title="System Health & Load"
          value={`${MOCK_SUMMARY.cpuTotalPercentage}% CPU`}
          change="FastAPI + SQLAlchemy"
          changeType="neutral"
          subtext="Backend engine operational"
          icon={<Cpu className="w-5 h-5 text-indigo-400" />}
          accentColor="indigo"
        />
      </div>

      {/* Main Grid: Activity Feed & Latency Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ActivityFeed />
        </div>
        <div className="lg:col-span-5">
          <LatencyChartMock />
        </div>
      </div>

      {/* Microservice Infrastructure Grid */}
      <SystemHealthGrid />
    </div>
  );
};
