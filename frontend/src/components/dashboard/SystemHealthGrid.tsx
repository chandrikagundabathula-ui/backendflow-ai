'use client';

import React from 'react';
import { MOCK_SERVICES } from '../../lib/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Cpu, HardDrive, Server, RefreshCw } from 'lucide-react';

export const SystemHealthGrid: React.FC = () => {
  return (
    <Card variant="default">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <CardTitle>Microservice Nodes & Infrastructure</CardTitle>
            <CardDescription>Live telemetry from active container instances</CardDescription>
          </div>
        </div>

        <button
          onClick={() => alert('Infrastructure status synced!')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors"
          title="Refresh Services Telemetry"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </CardHeader>

      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_SERVICES.map((srv) => {
          const isHealthy = srv.status === 'operational';
          const isHighLatency = srv.status === 'high_latency';
          const memPercentage = Math.round((srv.memoryUsageMb / srv.memoryLimitMb) * 100);

          return (
            <div
              key={srv.name}
              className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl flex flex-col justify-between gap-3 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-200">{srv.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{srv.type}</span>
                </div>
                <Badge
                  variant={isHealthy ? 'success' : isHighLatency ? 'warning' : 'error'}
                  size="sm"
                  pulse={isHealthy}
                >
                  {srv.status.replace('_', ' ')}
                </Badge>
              </div>

              {/* Resource Usage Gauges */}
              <div className="space-y-2 pt-1 border-t border-slate-800/60 text-[11px]">
                {/* CPU Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-cyan-400" /> CPU
                    </span>
                    <span>{srv.cpuUsage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        srv.cpuUsage > 70 ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${srv.cpuUsage}%` }}
                    />
                  </div>
                </div>

                {/* Memory Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-indigo-400" /> RAM
                    </span>
                    <span>
                      {srv.memoryUsageMb}MB / {srv.memoryLimitMb}MB
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 transition-all duration-500"
                      style={{ width: `${memPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                <span>Uptime: {srv.uptime}</span>
                <span className={srv.latencyMs > 50 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                  {srv.latencyMs} ms
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
