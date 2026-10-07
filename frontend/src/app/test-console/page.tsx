'use client';

import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { Terminal, Play, Send, CheckCircle2, Clock, Code2 } from 'lucide-react';

export default function TestConsolePage() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('/api/v1/products?category=electronics');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>({
    status: 200,
    timeMs: 18,
    size: '14.2 KB',
    headers: { 'content-type': 'application/json', 'x-backendflow-engine': 'FastAPI' },
    body: {
      status: 'success',
      total: 42,
      items: [
        { id: 'prod_991', name: 'High Performance API Gateway Unit', price: 299.99, in_stock: true },
        { id: 'prod_992', name: 'Low-latency Redis Micro-node', price: 149.50, in_stock: true }
      ]
    }
  });

  const handleSend = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-6 h-6 text-emerald-400" /> Interactive Test Console
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Issue HTTP request payloads, verify headers, and test FastAPI route responses
            </p>
          </div>
        </div>

        {/* Request Input Bar */}
        <Card variant="default">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-32">
                <Select
                  options={[
                    { value: 'GET', label: 'GET' },
                    { value: 'POST', label: 'POST' },
                    { value: 'PUT', label: 'PUT' },
                    { value: 'DELETE', label: 'DELETE' },
                  ]}
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                />
              </div>

              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="font-mono"
              />

              <Button
                variant="primary"
                isLoading={isLoading}
                icon={<Send className="w-4 h-4" />}
                onClick={handleSend}
                className="w-full sm:w-auto"
              >
                Send Request
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Response Inspector */}
        <Card variant="default">
          <CardHeader className="py-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="success" size="md">
                STATUS {response.status} OK
              </Badge>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> {response.timeMs} ms
              </span>
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                Size: {response.size}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-4 bg-slate-950 border-t border-slate-800 font-mono text-xs">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-bold">
              JSON Response Payload
            </div>
            <pre className="text-cyan-300 overflow-x-auto leading-relaxed">
              {JSON.stringify(response.body, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
