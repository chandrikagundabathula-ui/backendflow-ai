'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Settings, Save, Server, Database, Sparkles, Check, RefreshCw } from 'lucide-react';
import { api, HealthResponse } from '../../lib/api';

export default function SettingsPage() {
  const [fastApiUrl, setFastApiUrl] = useState(
    process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'
  );
  const [dbConnection, setDbConnection] = useState('sqlite:///./backendflow.db');
  const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const status = await api.getHealth();
      setHealthStatus(status);
    } catch (err) {
      setHealthStatus(null);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Settings className="w-6 h-6 text-slate-400" /> Platform Settings
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure FastAPI backend URL, database connection strings, and platform settings
            </p>
          </div>

          <Button
            variant="primary"
            icon={isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            onClick={handleSave}
          >
            {isSaved ? 'Settings Saved!' : 'Save Configuration'}
          </Button>
        </div>

        {/* FastAPI Settings */}
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-400" />
                <CardTitle>FastAPI Backend Connection</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                isLoading={isChecking}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={checkHealth}
              >
                Test Connection
              </Button>
            </div>
            <CardDescription>Target URL for the FastAPI backend engine server</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="FastAPI Base URL (NEXT_PUBLIC_API_URL)"
              value={fastApiUrl}
              onChange={(e) => setFastApiUrl(e.target.value)}
              className="font-mono"
            />
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Health Endpoint Check:</span>
              {healthStatus ? (
                <Badge variant="success" pulse>
                  ONLINE • {healthStatus.service} v{healthStatus.version}
                </Badge>
              ) : (
                <Badge variant="error">
                  OFFLINE / UNREACHABLE
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              <CardTitle>Database Connection String</CardTitle>
            </div>
            <CardDescription>SQLite / PostgreSQL SQLAlchemy connection target</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="DATABASE_URL"
              value={dbConnection}
              onChange={(e) => setDbConnection(e.target.value)}
              className="font-mono"
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
