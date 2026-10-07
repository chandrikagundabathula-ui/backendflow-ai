'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  Project,
  ProductionReadinessReport,
  ProductionReadinessHistoryItem,
} from '../../types';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  History,
  Activity,
  RefreshCw,
  FileCheck,
  ChevronRight,
} from 'lucide-react';

export default function ProductionReadinessPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Readiness Report State
  const [report, setReport] = useState<ProductionReadinessReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<ProductionReadinessHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  // Load User Projects
  useEffect(() => {
    if (user) {
      setIsLoadingProjects(true);
      api
        .getProjects()
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

  // Load History & Latest Audit when project changes
  useEffect(() => {
    if (selectedProjectId) {
      loadAuditHistory(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadAuditHistory = async (projId: string) => {
    setIsLoadingHistory(true);
    try {
      const records = await api.getProductionReadinessHistory(projId);
      setHistory(records);
      if (records.length > 0) {
        // Load latest stored audit record as active report
        const latest = records[0];
        setReport({
          report_id: latest.id,
          project_id: latest.project_id,
          overall_score: latest.score,
          status: latest.status,
          categories: latest.report_data.categories || [],
          findings: latest.report_data.findings || [],
          recommendations: latest.report_data.recommendations || [],
          ai_summary: latest.ai_summary,
          created_at: latest.created_at,
        });
      } else {
        setReport(null);
      }
    } catch (err: any) {
      console.warn('Failed to load audit history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleRunAudit = async () => {
    if (!selectedProjectId) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await api.analyzeProductionReadiness(selectedProjectId, true);
      setReport(res);
      // Refresh history list
      loadAuditHistory(selectedProjectId);
    } catch (err: any) {
      setError(err.message || 'Failed to run production readiness audit.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (authLoading || isLoadingProjects) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-sm text-slate-400">Loading audit workspace...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <ShieldAlert className="w-16 h-16 text-cyan-400 mb-4" />
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Authentication Required</h2>
          <p className="text-slate-400 max-w-md mb-6">
            Please log in to access the BackendFlow AI Production Readiness Engine.
          </p>
          <Link href="/login">
            <Button variant="primary">Go to Login</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Filtered findings
  const filteredFindings = report
    ? report.findings.filter((f) => {
        if (filterSeverity === 'ALL') return true;
        return f.severity.toUpperCase() === filterSeverity;
      })
    : [];

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 65) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getStatusBadge = (statusStr: string) => {
    if (statusStr === 'READY') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> READY FOR PRODUCTION
        </span>
      );
    }
    if (statusStr === 'NEEDS ATTENTION') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> NEEDS ATTENTION
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> NOT READY FOR PRODUCTION
      </span>
    );
  };

  const getSeverityBadge = (sev: string) => {
    const uppercaseSev = sev.toUpperCase();
    if (uppercaseSev === 'CRITICAL') {
      return <Badge variant="error">CRITICAL</Badge>;
    }
    if (uppercaseSev === 'HIGH') {
      return <Badge variant="warning">HIGH</Badge>;
    }
    if (uppercaseSev === 'MEDIUM') {
      return <Badge variant="purple">MEDIUM</Badge>;
    }
    return <Badge variant="cyan">LOW</Badge>;
  };

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.environment})`,
  }));

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* Header & Project Selector Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Production Readiness Engine
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                SRE AUDITOR
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Deterministic 8-category system reliability audit & AI risk analysis for backend services.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-64">
              <Select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                disabled={isAnalyzing}
                options={projectOptions}
              />
            </div>

            <Button
              variant="primary"
              onClick={handleRunAudit}
              disabled={isAnalyzing || !selectedProjectId}
              className="whitespace-nowrap shadow-lg shadow-cyan-950/40"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Auditing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" /> Run Production Audit
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading state during evaluation */}
        {isAnalyzing && (
          <Card className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-slate-900/60 border-slate-800">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin flex items-center justify-center" />
              <ShieldCheck className="w-8 h-8 text-cyan-400 absolute inset-0 m-auto" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Executing Deterministic System Audit</h3>
              <p className="text-sm text-slate-400 mt-1">
                Evaluating security, reliability, latency, database schemas, and AI risk models...
              </p>
            </div>
          </Card>
        )}

        {/* Active Audit Report Display */}
        {!isAnalyzing && report && (
          <div className="space-y-8">
            {/* Top Overview: Overall Score + AI Executive Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overall Score Badge Card */}
              <Card className="p-6 flex flex-col justify-between border-slate-800 bg-slate-900/90 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Readiness Score
                  </span>
                  {getStatusBadge(report.status)}
                </div>

                <div className="my-6 flex items-baseline gap-2">
                  <span className={`text-6xl font-extrabold tracking-tight ${getScoreColor(report.overall_score).split(' ')[0]}`}>
                    {report.overall_score}
                  </span>
                  <span className="text-slate-500 text-xl font-bold">/ 100</span>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Evaluated Target:</span>
                    <span className="font-semibold text-slate-200">{selectedProject?.name}</span>
                  </div>
                  {report.created_at && (
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Last Assessment:</span>
                      <span className="font-mono text-slate-300">
                        {new Date(report.created_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Total Findings:</span>
                    <span className="font-semibold text-cyan-400">{report.findings.length} Items</span>
                  </div>
                </div>
              </Card>

              {/* AI Executive Summary Card */}
              <Card className="lg:col-span-2 p-6 border-slate-800 bg-slate-900/90 shadow-lg flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                      <h3 className="font-bold text-slate-100 text-base">
                        AI Executive Assessment
                      </h3>
                    </div>
                    {report.ai_summary && (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Risk Level: {report.ai_summary.risk_level}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {report.ai_summary?.executive_summary ||
                      'Automated rule audit finished. Review category score breakdowns and prioritized severity findings below.'}
                  </p>

                  {report.ai_summary?.verdict && (
                    <div className="p-3 bg-slate-950/80 border border-purple-500/20 rounded-xl text-xs text-purple-200 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-purple-300">Launch Verdict: </span>
                        {report.ai_summary.verdict}
                      </div>
                    </div>
                  )}
                </div>

                {report.ai_summary?.top_priorities && report.ai_summary.top_priorities.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Top Remediation Priorities
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {report.ai_summary.top_priorities.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                          <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Category Score Breakdown (8 Categories) */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Category Evaluation Breakdown
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {report.categories.map((cat) => (
                  <Card key={cat.category} className="p-4 border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-300 truncate max-w-[150px]">
                        {cat.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          cat.status === 'PASS'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : cat.status === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {cat.status}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between my-2">
                      <span className="text-2xl font-bold text-slate-100">{cat.score}</span>
                      <span className="text-xs text-slate-400">Weight: {Math.round(cat.weight * 100)}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 my-2">
                      <div
                        className={`h-full transition-all duration-500 ${
                          cat.score >= 80 ? 'bg-emerald-400' : cat.score >= 60 ? 'bg-amber-400' : 'bg-rose-500'
                        }`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span>Findings Identified</span>
                      <span className="font-semibold text-slate-200">{cat.findings_count}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Detailed Findings & Filter Tabs */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-cyan-400" />
                  Audit Findings ({report.findings.length})
                </h2>

                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setFilterSeverity(sev)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        filterSeverity === sev
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {filteredFindings.length === 0 ? (
                <Card className="p-8 text-center text-slate-400 border-slate-800 bg-slate-900/40">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-300">
                    No findings recorded for severity level '{filterSeverity}'.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredFindings.map((finding) => (
                    <Card key={finding.id} className="p-5 border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          {getSeverityBadge(finding.severity)}
                          <h3 className="font-bold text-slate-100 text-sm">{finding.title}</h3>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          Category: {finding.category}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                        {finding.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                        <div className="p-2.5 bg-slate-950/60 rounded-lg border border-amber-500/10">
                          <span className="font-semibold text-amber-400 block mb-1">Impact:</span>
                          <span className="text-slate-300">{finding.impact}</span>
                        </div>
                        <div className="p-2.5 bg-slate-950/60 rounded-lg border border-cyan-500/10">
                          <span className="font-semibold text-cyan-400 block mb-1">Recommendation:</span>
                          <span className="text-slate-300">{finding.recommendation}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Actionable Recommendations List */}
            {report.recommendations && report.recommendations.length > 0 && (
              <Card className="p-6 border-slate-800 bg-slate-900/90 shadow-lg space-y-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-cyan-400" />
                  Actionable Mitigation Roadmap
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.recommendations.map((rec, i) => (
                    <div key={i} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-xs text-slate-300 leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Audit History Log */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                Audit Execution History ({history.length})
              </h2>

              {isLoadingHistory ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-slate-400">No prior audit records stored.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <Card key={item.id} className="p-4 border-slate-800 bg-slate-900/60 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-lg text-sm font-bold border ${getScoreColor(item.score)}`}>
                          Score: {item.score}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(item.status)}
                            <span className="text-xs text-slate-400 font-mono">
                              ID: {item.id.slice(0, 8)}...
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReport({
                            report_id: item.id,
                            project_id: item.project_id,
                            overall_score: item.score,
                            status: item.status,
                            categories: item.report_data.categories || [],
                            findings: item.report_data.findings || [],
                            recommendations: item.report_data.recommendations || [],
                            ai_summary: item.ai_summary,
                            created_at: item.created_at,
                          });
                        }}
                      >
                        Load Report
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state when no report has been run yet */}
        {!isAnalyzing && !report && selectedProject && (
          <Card className="p-12 text-center border-slate-800 bg-slate-900/60 space-y-4">
            <ShieldCheck className="w-16 h-16 text-cyan-400 mx-auto opacity-80" />
            <h3 className="text-xl font-bold text-slate-100">
              Ready to Audit {selectedProject.name}
            </h3>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Click "Run Production Audit" above to perform an instant 8-category security, reliability, performance, and architecture assessment.
            </p>
            <Button variant="primary" onClick={handleRunAudit}>
              <RefreshCw className="w-4 h-4 mr-2" /> Start First Production Audit
            </Button>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
