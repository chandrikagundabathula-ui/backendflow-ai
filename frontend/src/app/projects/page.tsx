'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Project, EnvironmentType } from '../../types';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import {
  FolderGit2,
  Plus,
  ArrowRight,
  Layers,
  Search,
  Sparkles,
  Loader2,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle2,
  LogIn,
} from 'lucide-react';

export default function ProjectsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newFramework, setNewFramework] = useState('FastAPI');
  const [newEnvironment, setNewEnvironment] = useState<EnvironmentType>('production');
  const [isCreating, setIsCreating] = useState(false);

  // Detail / Edit / Delete Modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFramework, setEditFramework] = useState('FastAPI');
  const [editEnvironment, setEditEnvironment] = useState<EnvironmentType>('production');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      const created = await api.createProject({
        name: newProjectName,
        description: newDescription,
        framework: newFramework,
        environment: newEnvironment,
        services_count: 4,
        tables_count: 8,
      });

      setProjects((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      setNewProjectName('');
      setNewDescription('');
    } catch (err: any) {
      alert(`Error creating project: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenDetail = async (project: Project) => {
    try {
      // Fetch fresh project detail from GET /api/projects/{id}
      const freshProject = await api.getProject(project.id);
      setSelectedProject(freshProject);
      setEditName(freshProject.name);
      setEditDescription(freshProject.description || '');
      setEditFramework(freshProject.framework);
      setEditEnvironment(freshProject.environment);
      setIsEditMode(false);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      alert(`Failed to fetch project detail: ${err.message}`);
    }
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;
    setIsUpdating(true);
    try {
      const updated = await api.updateProject(selectedProject.id, {
        name: editName,
        description: editDescription,
        framework: editFramework,
        environment: editEnvironment,
      });

      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSelectedProject(updated);
      setIsEditMode(false);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    if (!confirm(`Are you sure you want to delete "${selectedProject.name}"?`)) return;

    setIsDeleting(true);
    try {
      await api.deleteProject(selectedProject.id);
      setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
      setIsDetailModalOpen(false);
      setSelectedProject(null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <FolderGit2 className="w-6 h-6 text-cyan-400" /> Backend Projects
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live FastAPI backend project workspaces persisted in SQLite
            </p>
          </div>

          {user && (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              New Backend Project
            </Button>
          )}
        </div>

        {/* Not Logged In State */}
        {!user && !authLoading && (
          <Card variant="glass" className="p-8 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <LogIn className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Authentication Required</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sign in to create, manage, and inspect real FastAPI backend project records.
            </p>
            <Link href="/login">
              <Button variant="glow" icon={<LogIn className="w-4 h-4" />}>
                Go to Sign In Page
              </Button>
            </Link>
          </Card>
        )}

        {/* Logged in state search and project grid */}
        {user && (
          <>
            {/* Search bar */}
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search projects by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
                className="max-w-md"
              />
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 bg-rose-950/80 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="p-12 flex flex-col items-center justify-center gap-3 text-cyan-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xs font-mono text-slate-400">Fetching projects from SQLite DB...</span>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredProjects.length === 0 && (
              <Card variant="bordered" className="p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-200">No Projects Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {searchTerm ? 'No projects match your search query.' : 'Get started by creating your first FastAPI backend project workspace!'}
                </p>
                {!searchTerm && (
                  <Button
                    variant="glow"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Create First Project
                  </Button>
                )}
              </Card>
            )}

            {/* Projects Grid */}
            {!isLoading && filteredProjects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((project) => (
                  <Card key={project.id} variant="interactive" className="group" onClick={() => handleOpenDetail(project)}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="group-hover:text-cyan-300 transition-colors">
                              {project.name}
                            </CardTitle>
                            <span className="text-[10px] font-mono text-slate-500 truncate block max-w-[180px]">
                              ID: {project.id}
                            </span>
                          </div>
                        </div>
                        <Badge variant={project.status === 'healthy' ? 'success' : 'warning'} pulse>
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <CardDescription className="text-slate-300 min-h-[36px]">
                        {project.description || 'No description provided.'}
                      </CardDescription>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                        <div className="flex flex-col p-2 bg-slate-950/60 rounded-lg border border-slate-800/60">
                          <span className="text-slate-500 text-[10px]">FRAMEWORK</span>
                          <span className="font-semibold text-slate-200">{project.framework}</span>
                        </div>
                        <div className="flex flex-col p-2 bg-slate-950/60 rounded-lg border border-slate-800/60">
                          <span className="text-slate-500 text-[10px]">ENV</span>
                          <span className="font-semibold text-cyan-300 capitalize">{project.environment}</span>
                        </div>
                        <div className="flex flex-col p-2 bg-slate-950/60 rounded-lg border border-slate-800/60">
                          <span className="text-slate-500 text-[10px]">SERVICES</span>
                          <span className="font-semibold text-slate-200">{project.servicesCount || 4} endpoints</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter onClick={(e) => e.stopPropagation()}>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Slug: {project.slug}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<ArrowRight className="w-3.5 h-3.5" />}
                        iconPosition="right"
                        onClick={() => handleOpenDetail(project)}
                      >
                        Inspect Project
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Create Project Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New FastAPI Backend Project"
          description="Persisted directly to SQLite via FastAPI POST /api/projects"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" isLoading={isCreating} onClick={handleCreateProject}>
                Save to SQLite
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateProject} className="space-y-4">
            <Input
              label="Project Name"
              placeholder="e.g. Identity Auth Gateway"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              required
            />
            <Input
              label="Description"
              placeholder="Microservice handling token generation & RBAC scopes"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <Select
              label="Environment Scope"
              options={[
                { value: 'production', label: 'Production' },
                { value: 'staging', label: 'Staging' },
                { value: 'development', label: 'Development' },
              ]}
              value={newEnvironment}
              onChange={(e) => setNewEnvironment(e.target.value as EnvironmentType)}
            />
            <Select
              label="Framework Target"
              options={[
                { value: 'FastAPI', label: 'FastAPI (Python 3.12)' },
                { value: 'Go Gin', label: 'Go Gin (Experimental)' },
              ]}
              value={newFramework}
              onChange={(e) => setNewFramework(e.target.value)}
            />
          </form>
        </Modal>

        {/* Project Detail / Edit / Delete Modal */}
        {selectedProject && (
          <Modal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            title={isEditMode ? 'Edit Project' : selectedProject.name}
            description={`Database Record ID: ${selectedProject.id}`}
            footer={
              isEditMode ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditMode(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" isLoading={isUpdating} onClick={handleUpdateProject}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="danger" isLoading={isDeleting} icon={<Trash2 className="w-4 h-4" />} onClick={handleDeleteProject}>
                    Delete Project
                  </Button>
                  <Button variant="secondary" icon={<Edit className="w-4 h-4" />} onClick={() => setIsEditMode(true)}>
                    Edit Parameters
                  </Button>
                </>
              )
            }
          >
            {isEditMode ? (
              <div className="space-y-4">
                <Input
                  label="Project Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <Input
                  label="Description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <Select
                  label="Environment Scope"
                  options={[
                    { value: 'production', label: 'Production' },
                    { value: 'staging', label: 'Staging' },
                    { value: 'development', label: 'Development' },
                  ]}
                  value={editEnvironment}
                  onChange={(e) => setEditEnvironment(e.target.value as EnvironmentType)}
                />
              </div>
            ) : (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Database Record ID:</span>
                    <span className="text-cyan-300">{selectedProject.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">URL Slug:</span>
                    <span className="text-slate-200">{selectedProject.slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Framework:</span>
                    <span className="text-slate-200">{selectedProject.framework}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Environment:</span>
                    <span className="text-cyan-300 capitalize">{selectedProject.environment}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Project Description</span>
                  <p className="text-slate-200 font-sans text-xs">
                    {selectedProject.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            )}
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
