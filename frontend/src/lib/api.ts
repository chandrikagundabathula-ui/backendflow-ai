import { Project, EnvironmentType, ApiEndpoint, ApiTestResult, AiApiDesign, AiGenerationRecord, ArchitectureAnalysisResult, ArchitectureAnalysisRecord, ProductionReadinessReport, ProductionReadinessHistoryItem } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
}

// Token storage helper
export const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('backendflow_token');
  }
  return null;
};

export const setStoredToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('backendflow_token', token);
  }
};

export const clearStoredToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('backendflow_token');
  }
};

// Generic fetch wrapper with Authorization header
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `HTTP Error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Health
  getHealth: (): Promise<HealthResponse> => apiFetch<HealthResponse>('/health'),

  // Auth
  register: (data: { email: string; password: string; full_name?: string; role?: string }): Promise<UserProfile> =>
    apiFetch<UserProfile>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: async (data: { email: string; password: string }): Promise<AuthTokenResponse> => {
    const res = await apiFetch<AuthTokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.access_token) {
      setStoredToken(res.access_token);
    }
    return res;
  },

  getMe: (): Promise<UserProfile> => apiFetch<UserProfile>('/auth/me'),

  // Projects CRUD
  getProjects: (): Promise<Project[]> => apiFetch<Project[]>('/projects'),

  getProject: (id: string): Promise<Project> => apiFetch<Project>(`/projects/${id}`),

  createProject: (data: {
    name: string;
    description?: string;
    environment?: EnvironmentType;
    framework?: string;
    services_count?: number;
    tables_count?: number;
  }): Promise<Project> =>
    apiFetch<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProject: (
    id: string,
    data: Partial<{
      name: string;
      description: string;
      environment: EnvironmentType;
      framework: string;
      services_count: number;
      tables_count: number;
      status: 'healthy' | 'degraded' | 'deploying' | 'offline';
    }>
  ): Promise<Project> =>
    apiFetch<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProject: (id: string): Promise<{ message: string; id: string }> =>
    apiFetch<{ message: string; id: string }>(`/projects/${id}`, {
      method: 'DELETE',
    }),

  // API Builder Endpoints CRUD & Testing
  getApisForProject: (projectId: string): Promise<ApiEndpoint[]> =>
    apiFetch<ApiEndpoint[]>(`/projects/${projectId}/apis`),

  getApiEndpoint: (projectId: string, apiId: string): Promise<ApiEndpoint> =>
    apiFetch<ApiEndpoint>(`/projects/${projectId}/apis/${apiId}`),

  createApiEndpoint: (projectId: string, data: Partial<ApiEndpoint>): Promise<ApiEndpoint> =>
    apiFetch<ApiEndpoint>(`/projects/${projectId}/apis`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateApiEndpoint: (projectId: string, apiId: string, data: Partial<ApiEndpoint>): Promise<ApiEndpoint> =>
    apiFetch<ApiEndpoint>(`/projects/${projectId}/apis/${apiId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteApiEndpoint: (projectId: string, apiId: string): Promise<{ message: string; id: string }> =>
    apiFetch<{ message: string; id: string }>(`/projects/${projectId}/apis/${apiId}`, {
      method: 'DELETE',
    }),

  testApiEndpoint: (projectId: string, apiId: string, payload?: Record<string, any>): Promise<ApiTestResult> =>
    apiFetch<ApiTestResult>(`/projects/${projectId}/apis/${apiId}/test`, {
      method: 'POST',
      body: JSON.stringify({ payload }),
    }),

  // AI API Designer Endpoints
  generateAiApi: (data: { project_id: string; prompt: string }): Promise<AiApiDesign> =>
    apiFetch<AiApiDesign>('/ai/generate-api', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAiHistory: (projectId: string): Promise<AiGenerationRecord[]> =>
    apiFetch<AiGenerationRecord[]>(`/projects/${projectId}/ai-generations`),

  // Architecture Analyzer Endpoints
  analyzeArchitecture: (data: { project_id: string; prompt: string }): Promise<ArchitectureAnalysisResult> =>
    apiFetch<ArchitectureAnalysisResult>('/ai/analyze-architecture', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getArchitectureHistory: (projectId: string): Promise<ArchitectureAnalysisRecord[]> =>
    apiFetch<ArchitectureAnalysisRecord[]>(`/projects/${projectId}/architecture-analyses`),

  // Production Readiness Engine Endpoints
  analyzeProductionReadiness: (projectId: string, includeAiSummary: boolean = true): Promise<ProductionReadinessReport> =>
    apiFetch<ProductionReadinessReport>(`/projects/${projectId}/production-readiness/analyze`, {
      method: 'POST',
      body: JSON.stringify({ include_ai_summary: includeAiSummary }),
    }),

  getProductionReadinessHistory: (projectId: string): Promise<ProductionReadinessHistoryItem[]> =>
    apiFetch<ProductionReadinessHistoryItem[]>(`/projects/${projectId}/production-readiness/history`),
};
