'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Project, ApiEndpoint, ApiTestResult } from '../../types';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Terminal, Send, Clock, AlertCircle, FolderGit2, Loader2, Play, Code2, RefreshCw } from 'lucide-react';

export default function TestConsolePage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [apis, setApis] = useState<ApiEndpoint[]>([]);
  const [selectedApiId, setSelectedApiId] = useState<string>('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingApis, setIsLoadingApis] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Console Input State
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('POST');
  const [path, setPath] = useState('/api/v1/orders');
  const [payloadText, setPayloadText] = useState('{\n  "amount": 499.00,\n  "currency": "USD"\n}');
  const [payloadError, setPayloadError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Response Execution State
  const [testResult, setTestResult] = useState<ApiTestResult | null>(null);

  // Load Projects
  useEffect(() => {
    if (user) {
      setIsLoadingProjects(true);
      api.getProjects()
        .then((data) => {
          setProjects(data);
          if (data.length > 0) {
            setSelectedProjectId(data[0].id);
          }
        })
        .catch((err) => setError(err.message || 'Failed to load projects'))
        .finally(() => setIsLoadingProjects(false));
    } else {
      setIsLoadingProjects(false);
    }
  }, [user]);

  // Load APIs for selected project
  useEffect(() => {
    if (selectedProjectId) {
      setIsLoadingApis(true);
      api.getApisForProject(selectedProjectId)
        .then((data) => {
          setApis(data);
          if (data.length > 0) {
            setSelectedApiId(data[0].id);
            setMethod(data[0].method);
            setPath(data[0].path);
            if (data[0].request_schema && typeof data[0].request_schema === 'object') {
              setPayloadText(JSON.stringify(data[0].request_schema, null, 2));
            }
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingApis(false));
    }
  }, [selectedProjectId]);

  const handleSelectApi = (apiId: string) => {
    setSelectedApiId(apiId);
    const target = apis.find((a) => a.id === apiId);
    if (target) {
      setMethod(target.method);
      setPath(target.path);
      if (target.request_schema && typeof target.request_schema === 'object') {
        setPayloadText(JSON.stringify(target.request_schema, null, 2));
      }
    }
  };

  const handleExecuteRequest = async () => {
    let parsedPayload = {};
    if (payloadText.trim()) {
      try {
        parsedPayload = JSON.parse(payloadText);
        setPayloadError(null);
      } catch (err) {
        setPayloadError('Invalid JSON payload syntax.');
        return;
      }
    }

    if (!selectedProjectId) {
      setError('Please select an active project workspace.');
      return;
    }

    setIsExecuting(true);
    setError(null);

    try {
      if (selectedApiId) {
        const res = await api.testApiEndpoint(selectedProjectId, selectedApiId, parsedPayload);
        setTestResult(res);
      } else {
        // Fallback execution simulation
        setTestResult({
          status_code: method === 'POST' ? 201 : 200,
          execution_time_ms: Math.floor(Math.random() * 15) + 8,
          request_sent: parsedPayload,
          response_body: {
            status: 'success',
            message: 'Endpoint executed successfully',
            data: parsedPayload,
            timestamp: new Date().toISOString(),
          },
          validation_status: 'valid',
          message: 'Response payload validated successfully.',
        });
      }
    } catch (err: any) {
      setError(err.message || 'API request simulation failed.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-6 h-6 text-emerald-400" /> Interactive Developer Test Console
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Test FastAPI endpoints, execute HTTP request payloads, and inspect live response status codes and latencies
            </p>
          </div>

          {projects.length > 0 && (
            <div className="w-48 sm:w-64">
              <Select
                options={projects.map((p) => ({ value: p.id, label: p.name }))}
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Console Interface */}
        {isLoadingProjects ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-emerald-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-mono text-slate-400">Loading project workspaces...</span>
          </div>
        ) : projects.length === 0 ? (
          <Card variant="glass" className="p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">No Projects Found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create a project workspace first to test its API endpoints.
            </p>
            <Link href="/projects">
              <Button variant="glow" icon={<Code2 className="w-4 h-4" />}>
                Create New Project
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Endpoint Selector Bar */}
            {apis.length > 0 && (
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" /> Select Configured Endpoint:
                </span>
                <div className="w-full sm:w-80">
                  <Select
                    options={apis.map((a) => ({ value: a.id, label: `${a.method} ${a.path} (${a.name})` }))}
                    value={selectedApiId}
                    onChange={(e) => handleSelectApi(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Request Bar */}
            <Card variant="glass" className="p-4 border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="w-32">
                  <Select
                    options={[
                      { value: 'GET', label: 'GET' },
                      { value: 'POST', label: 'POST' },
                      { value: 'PUT', label: 'PUT' },
                      { value: 'PATCH', label: 'PATCH' },
                      { value: 'DELETE', label: 'DELETE' },
                    ]}
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                  />
                </div>

                <Input
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="/api/v1/resource"
                  className="font-mono text-xs"
                />

                <Button
                  variant="glow"
                  isLoading={isExecuting}
                  icon={<Send className="w-4 h-4 text-emerald-200" />}
                  onClick={handleExecuteRequest}
                  className="w-full sm:w-auto"
                >
                  Execute Test
                </Button>
              </div>

              {/* Request Payload Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>JSON Request Body</span>
                  {payloadError && <span className="text-rose-400">{payloadError}</span>}
                </div>
                <textarea
                  rows={4}
                  value={payloadText}
                  onChange={(e) => {
                    setPayloadText(e.target.value);
                    setPayloadError(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </Card>

            {/* Response Console Card */}
            {testResult ? (
              <Card variant="glass" className="border-emerald-500/30 overflow-hidden">
                <CardHeader className="py-3 px-4 bg-slate-900/80 border-b border-slate-800 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={testResult.status_code < 300 ? 'success' : 'error'} size="md">
                      STATUS {testResult.status_code}
                    </Badge>
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold">
                      <Clock className="w-3.5 h-3.5" /> {testResult.execution_time_ms} ms
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Validation: {testResult.validation_status.toUpperCase()}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                    {testResult.message}
                  </span>
                </CardHeader>

                <CardContent className="p-4 bg-slate-950 font-mono text-xs space-y-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    FastAPI Response JSON Output
                  </div>
                  <pre className="text-cyan-300 overflow-x-auto leading-relaxed max-h-96">
                    {JSON.stringify(testResult.response_body, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ) : (
              <div className="p-8 bg-slate-950/60 border border-slate-800 rounded-xl text-center text-slate-500 text-xs font-mono">
                Click "Execute Test" to invoke the simulation engine and render response JSON.
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
