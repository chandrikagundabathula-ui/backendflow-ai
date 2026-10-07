'use client';

import React from 'react';
import { MOCK_LATENCY_METRICS } from '../../lib/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Gauge, TrendingDown, Clock, ShieldCheck } from 'lucide-react';

export const LatencyChartMock: React.FC = () => {
  const maxVal = 120;

  return (
    <Card variant="default">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <CardTitle>Latency Distribution & Percentiles</CardTitle>
            <CardDescription>P50, P90, P95, and P99 latency trends (ms)</CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> p50: 18ms
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-400" /> p95: 42ms
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> p99: 78ms
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {/* Latency Visual Bar Graph Mock */}
        <div className="h-44 flex items-end justify-between gap-2 sm:gap-6 pt-6 pb-2 border-b border-slate-800">
          {MOCK_LATENCY_METRICS.map((metric) => {
            const p50Height = (metric.p50 / maxVal) * 100;
            const p95Height = (metric.p95 / maxVal) * 100;
            const p99Height = (metric.p99 / maxVal) * 100;

            return (
              <div key={metric.timestamp} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-full max-w-[40px] relative">
                  {/* p50 bar */}
                  <div
                    className="w-2 sm:w-3 bg-cyan-400/80 group-hover:bg-cyan-300 rounded-t transition-all"
                    style={{ height: `${p50Height}%` }}
                    title={`p50: ${metric.p50}ms`}
                  />
                  {/* p95 bar */}
                  <div
                    className="w-2 sm:w-3 bg-indigo-500/80 group-hover:bg-indigo-400 rounded-t transition-all"
                    style={{ height: `${p95Height}%` }}
                    title={`p95: ${metric.p95}ms`}
                  />
                  {/* p99 bar */}
                  <div
                    className="w-2 sm:w-3 bg-rose-500/80 group-hover:bg-rose-400 rounded-t transition-all"
                    style={{ height: `${p99Height}%` }}
                    title={`p99: ${metric.p99}ms`}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400">{metric.timestamp}</span>
              </div>
            );
          })}
        </div>

        {/* Footer Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-2 text-xs">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase font-mono">Fastest Endpoint</span>
            <span className="font-bold text-slate-200 font-mono text-sm mt-0.5">9 ms</span>
            <span className="text-[10px] text-emerald-400">DELETE /sessions</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase font-mono">Slower Endpoint</span>
            <span className="font-bold text-slate-200 font-mono text-sm mt-0.5">82 ms</span>
            <span className="text-[10px] text-amber-400">POST /stripe</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase font-mono">Global SLA Target</span>
            <span className="font-bold text-slate-200 font-mono text-sm mt-0.5">&lt; 50 ms</span>
            <span className="text-[10px] text-emerald-400">98.4% within SLA</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase font-mono">Error Rate</span>
            <span className="font-bold text-slate-200 font-mono text-sm mt-0.5">0.04%</span>
            <span className="text-[10px] text-emerald-400">Nominal range</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
