export type EnvironmentType = 'production' | 'staging' | 'development';

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  environment: EnvironmentType;
  servicesCount: number;
  tablesCount: number;
  status: 'healthy' | 'degraded' | 'deploying' | 'offline';
  lastUpdated?: string;
  framework: 'FastAPI' | 'Go Gin' | 'Node.js Express' | 'Rust Axum' | string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiEndpoint {
  id: string;
  project_id?: string;
  name: string;
  description?: string;
  method: HttpMethod;
  path: string;
  request_schema?: Record<string, any> | string | null;
  response_schema?: Record<string, any> | string | null;
  auth_required?: boolean;
  status?: string | number;
  created_at?: string;
  updated_at?: string;
  category?: string;
  latencyMs?: number;
  requestsPerMin?: number;
  lastCalled?: string;
}

export interface ApiTestResult {
  status_code: number;
  execution_time_ms: number;
  request_sent: Record<string, any>;
  response_body: Record<string, any>;
  validation_status: 'valid' | 'schema_error';
  message: string;
}

export interface DatabaseTable {
  name: string;
  columnsCount: number;
  recordsCount: number;
  sizeMb: number;
  primaryKey: string;
  relationshipsCount: number;
}

export interface SystemService {
  name: string;
  type: 'API Gateway' | 'Auth Service' | 'Database Pool' | 'Redis Cache' | 'Task Queue' | 'AI Router';
  status: 'operational' | 'high_latency' | 'error' | 'restarting';
  cpuUsage: number; // percentage
  memoryUsageMb: number;
  memoryLimitMb: number;
  uptime: string;
  latencyMs: number;
}

export interface RecentActivity {
  id: string;
  timestamp: string;
  method: HttpMethod;
  endpoint: string;
  statusCode: number;
  latencyMs: number;
  ip: string;
  userAgent: string;
  payloadSize: string;
}

export interface LatencyMetric {
  timestamp: string;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

export interface SystemMetricSummary {
  activeEndpoints: number;
  totalRequests24h: string;
  avgLatencyMs: number;
  uptimePercentage: number;
  activeTables: number;
  cpuTotalPercentage: number;
  memoryUsedGb: number;
  memoryTotalGb: number;
  errorRatePercentage: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
}

export interface AiExplanation {
  why_method: string;
  why_auth: string;
  request_details: string;
  response_details: string;
}

export interface AiApiDesign {
  generation_id?: string;
  name: string;
  method: HttpMethod;
  path: string;
  description: string;
  authentication_required: boolean;
  request_schema: Record<string, any>;
  response_schema: Record<string, any>;
  explanation: AiExplanation;
}

export interface AiGenerationRecord {
  id: string;
  project_id: string;
  prompt: string;
  generated_design: {
    name: string;
    method: HttpMethod;
    path: string;
    description: string;
    authentication_required: boolean;
    request_schema: Record<string, any>;
    response_schema: Record<string, any>;
  };
  explanation: AiExplanation;
  provider: string;
  model: string;
  created_at: string;
}

export interface ArchitectureComponent {
  id: string;
  name: string;
  type: 'api_gateway' | 'auth' | 'service' | 'database' | 'cache' | 'message_broker' | 'external' | string;
  description: string;
  technology: string;
  connections: string[];
}

export interface DataStoreRecommendation {
  name: string;
  type: string;
  technology: string;
  purpose: string;
  rationale: string;
}

export interface CommunicationStrategy {
  pattern: string;
  technology: string;
  use_case: string;
  rationale: string;
}

export interface SecurityStrategy {
  category: string;
  recommendation: string;
  rationale: string;
}

export interface ScalabilityStrategy {
  dimension: string;
  approach: string;
  rationale: string;
}

export interface ReliabilityStrategy {
  pattern: string;
  approach: string;
  rationale: string;
}

export interface ArchitectureAnalysisResult {
  analysis_id?: string;
  architecture_style: string;
  summary: string;
  components: ArchitectureComponent[];
  data_stores: DataStoreRecommendation[];
  communication: CommunicationStrategy[];
  security: SecurityStrategy[];
  scalability: ScalabilityStrategy[];
  reliability: ReliabilityStrategy[];
  bottlenecks: string[];
  recommendations: string[];
  rationale: string;
}

export interface ArchitectureAnalysisRecord {
  id: string;
  project_id: string;
  prompt: string;
  architecture_result: ArchitectureAnalysisResult;
  provider: string;
  model: string;
  created_at: string;
}

export interface ReadinessFinding {
  id: string;
  title: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  description: string;
  recommendation: string;
  impact: string;
}

export interface ReadinessCategoryScore {
  category: string;
  name: string;
  score: number;
  weight: number;
  status: 'PASS' | 'WARNING' | 'FAIL' | string;
  findings_count: number;
}

export interface ReadinessAISummary {
  executive_summary: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  top_priorities: string[];
  verdict: string;
}

export interface ProductionReadinessReport {
  report_id?: string;
  project_id: string;
  overall_score: number;
  status: 'READY' | 'NEEDS ATTENTION' | 'NOT READY' | string;
  categories: ReadinessCategoryScore[];
  findings: ReadinessFinding[];
  recommendations: string[];
  ai_summary?: ReadinessAISummary;
  created_at?: string;
}

export interface ProductionReadinessHistoryItem {
  id: string;
  project_id: string;
  score: number;
  status: string;
  report_data: {
    overall_score: number;
    status: string;
    categories: ReadinessCategoryScore[];
    findings: ReadinessFinding[];
    recommendations: string[];
  };
  ai_summary?: ReadinessAISummary;
  created_at: string;
}

