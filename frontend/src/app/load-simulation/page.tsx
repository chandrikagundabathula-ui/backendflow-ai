'use client';

import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Zap, Play, Square, Gauge, Activity, AlertTriangle } from 'lucide-react';

export default function LoadSimulationPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [usersCount, setUsersCount] = useState('500');
  const [duration, setDuration] = useState('60s');

  const handleStart = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 3000);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-400" /> Stress & Load Simulation Studio
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Synthetic traffic generator & microservice bottleneck load testing engine
            </p>
          </div>
        </div>

        {/* Configuration Card */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Load Test Configuration</CardTitle>
            <CardDescription>Configure concurrent Virtual Users (VUs) and request rate</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Virtual Users (VUs)"
              value={usersCount}
              onChange={(e) => setUsersCount(e.target.value)}
              className="font-mono"
            />
            <Input
              label="Test Duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="font-mono"
            />
            <div className="flex items-end">
              <Button
                variant={isRunning ? 'danger' : 'glow'}
                isLoading={isRunning}
                icon={isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                onClick={handleStart}
                className="w-full"
              >
                {isRunning ? 'Running Simulation...' : 'Launch Load Test'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="default" className="p-4">
            <span className="text-xs font-mono text-slate-400">THROUGHPUT (RPS)</span>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {isRunning ? '4,850 req/s' : '0 req/s'}
            </div>
            <span className="text-[10px] text-emerald-400">Peak capacity: 10,000 req/s</span>
          </Card>
          <Card variant="default" className="p-4">
            <span className="text-xs font-mono text-slate-400">P95 LATENCY</span>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {isRunning ? '38 ms' : '--'}
            </div>
            <span className="text-[10px] text-emerald-400">Target SLA: &lt;50ms</span>
          </Card>
          <Card variant="default" className="p-4">
            <span className="text-xs font-mono text-slate-400">ERROR RATE</span>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {isRunning ? '0.01%' : '0.00%'}
            </div>
            <span className="text-[10px] text-emerald-400">0 dropped connections</span>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
