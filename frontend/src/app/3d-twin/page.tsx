'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Project, ArchitectureAnalysisResult, ArchitectureComponent } from '../../types';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Interactive3DTwinCanvas } from '../../components/architecture/Interactive3DTwinCanvas';
import { Box, Sparkles, Cpu, FolderGit2, Loader2, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export default function ThreeDTwinPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<ArchitectureAnalysisResult | null>(null);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      api.getProjects()
        .then((data) => {
          setProjects(data);
          if (data.length > 0) {
            setSelectedProjectId(data[0].id);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedProjectId) {
      api.getArchitectureHistory(selectedProjectId)
        .then((records) => {
          if (records.length > 0) {
            setAnalysisResult(records[0].architecture_result);
          } else {
            setAnalysisResult(null);
          }
        })
        .catch(() => setAnalysisResult(null));
    }
  }, [selectedProjectId]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Box className="w-6 h-6 text-indigo-400" /> 3D Digital Architecture Twin
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live spatial interactive view of microservices, database tiers, auth gates, and real-time packet flow telemetry
            </p>
          </div>

          {projects.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-48 sm:w-64">
                <Select
                  options={projects.map((p) => ({ value: p.id, label: p.name }))}
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                />
              </div>
              <Badge variant="purple" pulse>
                Spatial Engine Active
              </Badge>
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-indigo-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-mono text-slate-400">Initializing spatial 3D viewport...</span>
          </div>
        )}

        {/* No Projects Empty State */}
        {!isLoading && projects.length === 0 && (
          <Card variant="glass" className="p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">No Active Workspaces</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create a project and analyze its architecture to visualize its 3D digital twin.
            </p>
            <Link href="/projects">
              <Button variant="glow" icon={<Cpu className="w-4 h-4" />}>
                Create New Project
              </Button>
            </Link>
          </Card>
        )}

        {/* Interactive 3D Visualizer Canvas */}
        {!isLoading && projects.length > 0 && (
          <div className="space-y-6">
            <Interactive3DTwinCanvas analysisResult={analysisResult} />

            {/* Link to Architecture Analyzer for Re-synthesis */}
            <Card variant="glass" className="p-4 border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Want to generate a new architecture layout?</h4>
                  <p className="text-xs text-slate-400">Run the AI Architecture Analyzer to synthesize new microservices & data tiers.</p>
                </div>
              </div>

              <Link href="/architecture">
                <Button variant="glow" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                  Open Architecture Analyzer
                </Button>
              </Link>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
