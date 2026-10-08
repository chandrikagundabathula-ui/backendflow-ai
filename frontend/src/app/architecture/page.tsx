'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Project, ArchitectureAnalysisResult, ArchitectureAnalysisRecord, ArchitectureComponent } from '../../types';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Interactive3DTwinCanvas } from '../../components/architecture/Interactive3DTwinCanvas';
import {
  Cpu,
  Sparkles,
  Database,
  Shield,
  Zap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  History,
  ArrowRight,
  HelpCircle,
  Server,
  Network,
  Activity,
  Lock,
  Layers,
  Box,
  RefreshCw,
  Share2,
  AlertTriangle,
} from 'lucide-react';

const EXAMPLE_SYSTEM_PROMPTS = [
  {
    label: "Design an e-commerce backend",
    prompt: "I need an e-commerce backend supporting 100,000 users with authentication, products, orders, payments and notifications."
  },
  {
    label: "Design a banking transaction system",
    prompt: "Design a real-time banking transaction processing backend with double-entry ledgers, fraud detection, and instant clearing."
  },
  {
    label: "Design a real-time chat backend",
    prompt: "Design a real-time chat backend supporting websockets, media attachments, channel permissions, and read receipts."
  },
  {
    label: "Design a scalable video streaming backend",
    prompt: "Design a high-scale video streaming backend supporting adaptive bitrate encoding, CDN edge distribution, and user watch telemetry."
  }
];

export default function ArchitectureAnalyzerPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Analysis State
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [analysisResult, setAnalysisResult] = useState<ArchitectureAnalysisResult | null>(null);
  
  // History State
  const [history, setHistory] = useState<ArchitectureAnalysisRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Selected Component for Inspection
  const [inspectedComponent, setInspectedComponent] = useState<ArchitectureComponent | null>(null);

  // Load Projects on Auth
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

  // Load History when selected project changes
  useEffect(() => {
    if (selectedProjectId) {
      setIsLoadingHistory(true);
      api.getArchitectureHistory(selectedProjectId)
        .then((records) => setHistory(records))
        .catch(() => {})
        .finally(() => setIsLoadingHistory(false));
    }
  }, [selectedProjectId]);

  const handleAnalyzeArchitecture = async (promptToUse?: string) => {
    const finalPrompt = promptToUse || prompt;
    if (!selectedProjectId || !finalPrompt.trim()) return;

    setIsAnalyzing(true);
    setStatusMsg('Analyzing system requirements & traffic constraints...');
    setError(null);

    const statusSteps = [
      'Evaluating architectural patterns & microservice boundaries...',
      'Selecting optimal database engines & caching strategy...',
      'Synthesizing communication protocols & fault tolerance policies...',
      'Running security sanitization & structural validation...',
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < statusSteps.length) {
        setStatusMsg(statusSteps[stepIdx]);
        stepIdx++;
      }
    }, 450);

    try {
      const result = await api.analyzeArchitecture({
        project_id: selectedProjectId,
        prompt: finalPrompt,
      });

      setAnalysisResult(result);
      setPrompt(finalPrompt);
      if (result.components.length > 0) {
        setInspectedComponent(result.components[0]);
      }

      // Refresh History list
      const updatedHistory = await api.getArchitectureHistory(selectedProjectId);
      setHistory(updatedHistory);
    } catch (err: any) {
      setError(err.message || 'Architecture analysis failed.');
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
      setStatusMsg('');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-purple-400" /> Backend Architecture Analyzer
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              AI-assisted system architecture synthesis, database selection rationale, dynamic 3D topology diagrams, and fault-tolerance design
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
            </div>
          )}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Global Loading Projects */}
        {isLoadingProjects && (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-purple-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-mono text-slate-400">Loading project workspaces...</span>
          </div>
        )}

        {/* No Projects Empty State */}
        {!isLoadingProjects && projects.length === 0 && (
          <Card variant="glass" className="p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">No Projects Found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create a backend project workspace first to analyze system architecture.
            </p>
            <Link href="/projects">
              <Button variant="glow" icon={<Cpu className="w-4 h-4" />}>
                Create New Project
              </Button>
            </Link>
          </Card>
        )}

        {/* Main Interface */}
        {!isLoadingProjects && projects.length > 0 && (
          <div className="space-y-6">
            {/* Requirements Form Card */}
            <Card variant="glass" className="p-6 space-y-6 border-purple-500/20 shadow-xl shadow-purple-950/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      Describe the system you want to build
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Specify expected load, traffic patterns, security compliance, and core microservices
                    </p>
                  </div>
                </div>

                <Badge variant="purple" size="md" className="shrink-0">
                  AI Architecture Engine v1.0
                </Badge>
              </div>

              {/* Requirements Editor */}
              <div className="space-y-3">
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. I need an e-commerce backend supporting 100,000 users with authentication, products, orders, payments and notifications."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl p-4 text-sm text-slate-100 font-sans focus:outline-none transition-all placeholder:text-slate-600"
                />

                {/* Example Prompts */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-purple-400" /> Click an example system design prompt:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_SYSTEM_PROMPTS.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(ex.prompt)}
                        className="text-xs bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-purple-300 border border-slate-800 hover:border-purple-500/40 px-3 py-1.5 rounded-lg transition-all text-left truncate max-w-full"
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-end pt-2">
                  <Button
                    variant="glow"
                    isLoading={isAnalyzing}
                    icon={<Cpu className="w-4 h-4 text-purple-200" />}
                    onClick={() => handleAnalyzeArchitecture()}
                    disabled={!prompt.trim()}
                  >
                    {isAnalyzing ? 'Analyzing Architecture...' : 'Analyze Architecture'}
                  </Button>
                </div>
              </div>

              {/* Status Indicator */}
              {isAnalyzing && (
                <div className="p-8 bg-slate-950/80 border border-purple-500/30 rounded-xl flex flex-col items-center justify-center gap-3 animate-pulse">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  <span className="text-xs font-mono text-purple-300 font-semibold">{statusMsg}</span>
                  <span className="text-[10px] text-slate-500">Synthesizing node topology, databases, and trade-off rationales...</span>
                </div>
              )}
            </Card>

            {/* HERO FEATURE: INTERACTIVE 3D ARCHITECTURE VISUALIZER CANVAS */}
            <div className="space-y-4">
              <Interactive3DTwinCanvas
                analysisResult={analysisResult}
                onSelectComponent={(comp) => setInspectedComponent(comp)}
              />
            </div>

            {/* Architecture Analysis Results Details */}
            {analysisResult && !isAnalyzing && (
              <div className="space-y-6">
                {/* Overview & Style */}
                <Card variant="glass" className="p-6 space-y-4 border-purple-500/30 ring-1 ring-purple-500/20 shadow-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                        Architecture Style
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold">
                        {analysisResult.architecture_style}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      icon={<RefreshCw className="w-3.5 h-3.5" />}
                      onClick={() => handleAnalyzeArchitecture()}
                    >
                      Re-Analyze
                    </Button>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed font-sans font-medium">
                    {analysisResult.summary}
                  </p>
                </Card>

                {/* Data Layer Strategy & Rationale ("Why PostgreSQL?") */}
                <Card variant="glass" className="p-6 space-y-4 border-emerald-500/20">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Database className="w-4 h-4 text-emerald-400" /> Data Layer Strategy & Rationale
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResult.data_stores.map((ds, i) => (
                      <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-300">{ds.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                            {ds.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 font-semibold font-mono">Engine: {ds.technology}</p>
                        <p className="text-xs text-slate-400">{ds.purpose}</p>
                        <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-1">
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <HelpCircle className="w-3 h-3" /> Architectural Rationale:
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed italic">{ds.rationale}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Communication, Security, Scalability, Reliability */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Communication */}
                  <Card variant="glass" className="p-6 space-y-4 border-sky-500/20">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                      <Activity className="w-4 h-4 text-sky-400" /> Communication Patterns
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.communication.map((comm, i) => (
                        <div key={i} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-sky-300">{comm.pattern}</span>
                            <span className="font-mono text-[10px] text-slate-400">{comm.technology}</span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium">{comm.use_case}</p>
                          <p className="text-[11px] text-slate-400 italic">{comm.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Security */}
                  <Card variant="glass" className="p-6 space-y-4 border-purple-500/20">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                      <Lock className="w-4 h-4 text-purple-400" /> Security & Compliance
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.security.map((sec, i) => (
                        <div key={i} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-purple-300">{sec.category}</span>
                          </div>
                          <p className="text-xs text-slate-200 font-medium">{sec.recommendation}</p>
                          <p className="text-[11px] text-slate-400 italic">{sec.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Scalability */}
                  <Card variant="glass" className="p-6 space-y-4 border-amber-500/20">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                      <Zap className="w-4 h-4 text-amber-400" /> Scalability Strategy
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.scalability.map((scale, i) => (
                        <div key={i} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                          <span className="text-xs font-bold text-amber-300">{scale.dimension}</span>
                          <p className="text-xs text-slate-200 font-medium">{scale.approach}</p>
                          <p className="text-[11px] text-slate-400 italic">{scale.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Reliability */}
                  <Card variant="glass" className="p-6 space-y-4 border-rose-500/20">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                      <Shield className="w-4 h-4 text-rose-400" /> Reliability & Resilience
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.reliability.map((rel, i) => (
                        <div key={i} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                          <span className="text-xs font-bold text-rose-300">{rel.pattern}</span>
                          <p className="text-xs text-slate-200 font-medium">{rel.approach}</p>
                          <p className="text-[11px] text-slate-400 italic">{rel.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Bottlenecks & Trade-off Rationale */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bottlenecks */}
                  <Card variant="glass" className="p-6 space-y-3 border-rose-900/40">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Potential System Bottlenecks
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.bottlenecks.map((item, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Recommendations */}
                  <Card variant="glass" className="p-6 space-y-3 border-cyan-900/40">
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Recommended Engineering Improvements
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((item, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>

                {/* Overarching Decision & Rationale */}
                <Card variant="glass" className="p-6 space-y-2 border-purple-500/30 bg-purple-950/10">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-purple-400" /> Overarching Architecture Decision & Rationale
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{analysisResult.rationale}</p>
                </Card>
              </div>
            )}

            {/* Architecture History Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-400" /> Architecture Analysis History ({history.length})
                </span>
                <span className="text-xs text-slate-500 font-mono">Persisted in Database</span>
              </div>

              {isLoadingHistory ? (
                <div className="p-6 text-center text-slate-500 text-xs">Loading history...</div>
              ) : history.length === 0 ? (
                <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl text-center text-slate-500 text-xs">
                  No previous architecture analysis history recorded for this project workspace.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl transition-all space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-purple-300 truncate max-w-[220px]">
                            {item.architecture_result.architecture_style}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 italic">"{item.prompt}"</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] font-mono text-cyan-400">
                          {item.architecture_result.components?.length || 0} Components
                        </span>
                        <button
                          onClick={() => {
                            setAnalysisResult(item.architecture_result);
                            setPrompt(item.prompt);
                            if (item.architecture_result.components?.length > 0) {
                              setInspectedComponent(item.architecture_result.components[0]);
                            }
                          }}
                          className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                        >
                          Reopen Analysis <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
