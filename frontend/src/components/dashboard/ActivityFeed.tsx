'use client';

import React, { useState } from 'react';
import { MOCK_RECENT_ACTIVITIES } from '../../lib/mockData';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Activity, Clock, ShieldCheck, Filter } from 'lucide-react';

export const ActivityFeed: React.FC = () => {
  const [filterMethod, setFilterMethod] = useState<string>('ALL');

  const filtered = MOCK_RECENT_ACTIVITIES.filter((act) =>
    filterMethod === 'ALL' ? true : act.method === filterMethod
  );

  return (
    <Card variant="default">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <CardTitle>Recent API Activity</CardTitle>
            <CardDescription>Live traffic events & request latencies across microservices</CardDescription>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {['ALL', 'GET', 'POST', 'PUT'].map((method) => (
            <button
              key={method}
              onClick={() => setFilterMethod(method)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                filterMethod === method
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Method</th>
                <th className="py-3 px-4 font-semibold">Endpoint Path</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Latency</th>
                <th className="py-3 px-4 font-semibold hidden sm:table-cell">Payload</th>
                <th className="py-3 px-4 font-semibold hidden md:table-cell">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((item) => {
                const statusVariant =
                  item.statusCode >= 200 && item.statusCode < 300
                    ? 'success'
                    : item.statusCode >= 400
                    ? 'error'
                    : 'warning';

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-default"
                  >
                    <td className="py-3 px-4">
                      <Badge variant={item.method as any} size="sm">
                        {item.method}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium group-hover:text-cyan-300 transition-colors">
                      {item.endpoint}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusVariant} size="sm">
                        {item.statusCode}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span
                        className={
                          item.latencyMs > 50
                            ? 'text-amber-400 font-bold'
                            : 'text-emerald-400'
                        }
                      >
                        {item.latencyMs} ms
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">
                      {item.payloadSize}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] hidden md:table-cell">
                      {item.timestamp}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
