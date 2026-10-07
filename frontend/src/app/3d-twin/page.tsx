'use client';

import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Box, Sparkles, Cpu, Database, Server, Workflow, ArrowRight, Zap } from 'lucide-react';

export default function ThreeDTwinPage() {
  const [selectedNode, setSelectedNode] = useState('FastAPI Gateway Router');

  const nodes = [
    { name: 'Client App / SDK', type: 'Frontend Client', status: 'active', latency: '2ms', color: 'cyan' },
    { name: 'FastAPI Gateway Router', type: 'API Gateway', status: 'active', latency: '4ms', color: 'cyan' },
    { name: 'JWT Auth & Security', type: 'Auth Service', status: 'active', latency: '8ms', color: 'indigo' },
    { name: 'PostgreSQL Primary DB', type: 'Database Pool', status: 'active', latency: '14ms', color: 'purple' },
    { name: 'Redis Cache Cluster', type: 'In-Memory Cache', status: 'active', latency: '1.2ms', color: 'emerald' },
    { name: 'Celery Worker Queue', type: 'Async Task Queue', status: 'degraded', latency: '145ms', color: 'amber' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Box className="w-6 h-6 text-indigo-400" /> 3D Architecture Digital Twin
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live spatial topology of microservices, database connections, and real-time packet flows
            </p>
          </div>

          <Badge variant="purple" pulse>
            Spatial Engine Active
          </Badge>
        </div>

        {/* 3D Canvas / Diagram Grid */}
        <Card variant="default" className="relative min-h-[420px] bg-slate-950 border border-slate-800 flex flex-col justify-between p-6">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Canvas header controls */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Interactive Spatial View (WebGL Engine)
            </span>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">Nodes: 6</span>
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">Connections: 12</span>
            </div>
          </div>

          {/* Node Flow Representation */}
          <div className="relative z-10 my-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {nodes.map((node) => (
              <div
                key={node.name}
                onClick={() => setSelectedNode(node.name)}
                className={`p-4 rounded-xl bg-slate-900/90 border transition-all cursor-pointer ${
                  selectedNode === node.name
                    ? 'border-indigo-500 shadow-xl shadow-indigo-950/40 ring-2 ring-indigo-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-100">{node.name}</span>
                  </div>
                  <Badge variant={node.status === 'active' ? 'success' : 'warning'} size="sm">
                    {node.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-800">
                  <span>Type: {node.type}</span>
                  <span className="text-cyan-400 font-bold">{node.latency}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Canvas status */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Selected Node: <strong className="text-slate-100 font-mono">{selectedNode}</strong></span>
            <Button variant="outline" size="sm" icon={<Zap className="w-3.5 h-3.5 text-amber-400" />}>
              Simulate Node Failure
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
