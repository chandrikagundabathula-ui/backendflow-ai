import re
from typing import Dict, Any, List
from app.core.ai.base import BaseAIProvider

class MockAIProvider(BaseAIProvider):
    """
    Deterministic Mock AI Provider for API generation and architecture analysis.
    Produces rich, structured architecture designs for testing and offline development.
    """
    
    async def generate_api_design(self, prompt: str) -> Dict[str, Any]:
        prompt_lower = prompt.lower()

        # Customer API Intent
        if "customer" in prompt_lower or "user profile" in prompt_lower:
            return {
                "name": "Customer Profile API",
                "method": "POST",
                "path": "/api/v1/customers",
                "description": "Authenticated endpoint for registering customer profile details and contact metadata.",
                "authentication_required": True,
                "request_schema": {
                    "name": "string",
                    "email": "string",
                    "phone_number": "string",
                    "organization": "string"
                },
                "response_schema": {
                    "id": "uuid",
                    "name": "string",
                    "email": "string",
                    "phone_number": "string",
                    "status": "string",
                    "created_at": "datetime"
                },
                "explanation": {
                    "why_method": "POST is chosen because creating a new customer resource creates an authoritative entity.",
                    "why_auth": "Authentication is enabled to prevent unauthenticated user registration spam.",
                    "request_details": "Contains customer identity attributes (name, email, phone_number, organization).",
                    "response_details": "Returns the created customer UUID, status indicator, and timestamp."
                }
            }

        # Order API Intent
        elif "order" in prompt_lower or "checkout" in prompt_lower:
            return {
                "name": "Order Checkout API",
                "method": "POST",
                "path": "/api/v1/orders",
                "description": "Processes e-commerce customer cart orders with itemization and billing validation.",
                "authentication_required": True,
                "request_schema": {
                    "customer_id": "uuid",
                    "items": [
                        {"product_id": "string", "quantity": "integer", "unit_price": "number"}
                    ],
                    "total_amount": "number",
                    "shipping_address": "string"
                },
                "response_schema": {
                    "order_id": "uuid",
                    "status": "string",
                    "tracking_number": "string",
                    "estimated_delivery": "string"
                },
                "explanation": {
                    "why_method": "POST is used to create a new order transaction entity.",
                    "why_auth": "Authentication protects customer financial and order history data.",
                    "request_details": "Expects customer ID, item list with pricing, and shipping destination.",
                    "response_details": "Returns confirmation order UUID, status, tracking details, and estimated delivery."
                }
            }

        # Product / Catalog API Intent
        elif "product" in prompt_lower or "catalog" in prompt_lower or "search" in prompt_lower:
            return {
                "name": "Product Catalog Search API",
                "method": "GET",
                "path": "/api/v1/products/search",
                "description": "Queryable catalog search endpoint supporting filter tags, category navigation, and pagination.",
                "authentication_required": False,
                "request_schema": {
                    "query": "string",
                    "category": "string",
                    "page": "integer",
                    "limit": "integer"
                },
                "response_schema": {
                    "total_results": "integer",
                    "page": "integer",
                    "products": [
                        {"id": "string", "title": "string", "price": "number", "in_stock": "boolean"}
                    ]
                },
                "explanation": {
                    "why_method": "GET is safe and idempotent for querying catalog items.",
                    "why_auth": "Public access is allowed to let shoppers browse products freely.",
                    "request_details": "Accepts query terms, category filters, and pagination parameters.",
                    "response_details": "Returns matching product array with total count and inventory status."
                }
            }

        # File Upload API Intent
        elif "file" in prompt_lower or "upload" in prompt_lower or "asset" in prompt_lower:
            return {
                "name": "Secure Media Upload API",
                "method": "POST",
                "path": "/api/v1/assets/upload",
                "description": "Upload endpoint for binary media assets returning CDN URIs.",
                "authentication_required": True,
                "request_schema": {
                    "file_name": "string",
                    "mime_type": "string",
                    "file_size_bytes": "integer"
                },
                "response_schema": {
                    "asset_id": "uuid",
                    "upload_url": "string",
                    "cdn_url": "string",
                    "expires_in": "integer"
                },
                "explanation": {
                    "why_method": "POST is required for uploading file metadata and generating upload tickets.",
                    "why_auth": "Authentication prevents unauthorized storage consumption and resource abuse.",
                    "request_details": "Expects file metadata including name, MIME type, and byte length.",
                    "response_details": "Returns pre-signed upload URL and public CDN distribution link."
                }
            }

        # Default Generic Fallback
        else:
            clean_slug = re.sub(r'[^a-zA-Z0-9]', '-', prompt_lower).strip('-')
            clean_slug = re.sub(r'-+', '-', clean_slug)[:20] or "resource"
            return {
                "name": f"{clean_slug.replace('-', ' ').title()} API",
                "method": "POST",
                "path": f"/api/v1/{clean_slug}",
                "description": f"AI-designed backend REST API based on developer intent: '{prompt}'",
                "authentication_required": True,
                "request_schema": {"title": "string", "payload": "object"},
                "response_schema": {"id": "uuid", "status": "string", "processed_at": "datetime"},
                "explanation": {
                    "why_method": "POST is selected for general resource mutation.",
                    "why_auth": "Authentication is enabled by default for data security.",
                    "request_details": "Contains input data schema inferred from description.",
                    "response_details": "Returns structured status output with generated entity ID."
                }
            }

    async def analyze_architecture(self, prompt: str) -> Dict[str, Any]:
        prompt_lower = prompt.lower()

        # Banking / Financial Systems Intent
        if "bank" in prompt_lower or "finance" in prompt_lower or "transaction" in prompt_lower:
            return {
                "architecture_style": "Event-Driven Microservices with Distributed Ledger Isolation",
                "summary": "High-throughput financial transaction processing architecture emphasizing ACID compliance, multi-region failover, immutable audit trails, and strict zero-trust security.",
                "components": [
                    {
                        "id": "gateway",
                        "name": "API Gateway & WAF",
                        "type": "api_gateway",
                        "description": "TLS termination, mTLS routing, rate limiting, and DDoS protection.",
                        "technology": "Kong / Envoy",
                        "connections": ["auth_svc", "tx_svc", "account_svc"]
                    },
                    {
                        "id": "auth_svc",
                        "name": "Auth & HSM Service",
                        "type": "auth",
                        "description": "OAuth2 + OIDC JWT token validation with Hardware Security Module integration.",
                        "technology": "FastAPI + Keycloak + AWS CloudHSM",
                        "connections": []
                    },
                    {
                        "id": "tx_svc",
                        "name": "Transaction Processor",
                        "type": "service",
                        "description": "Core double-entry ledger settlement engine enforcing strict balance assertions.",
                        "technology": "Go / Rust Core",
                        "connections": ["tx_db", "event_bus"]
                    },
                    {
                        "id": "account_svc",
                        "name": "Account Management Service",
                        "type": "service",
                        "description": "Manages customer checking/savings accounts and credit boundaries.",
                        "technology": "FastAPI / Python",
                        "connections": ["account_db", "cache"]
                    },
                    {
                        "id": "tx_db",
                        "name": "Transactional Financial Ledger DB",
                        "type": "database",
                        "description": "Primary transactional store with strict serializable isolation level.",
                        "technology": "PostgreSQL (Multi-Region CockroachDB)",
                        "connections": []
                    },
                    {
                        "id": "account_db",
                        "name": "Account Relational Store",
                        "type": "database",
                        "description": "Customer profiles, account metadata, and KYC documentation references.",
                        "technology": "PostgreSQL",
                        "connections": []
                    },
                    {
                        "id": "cache",
                        "name": "Hot Ledger Cache",
                        "type": "cache",
                        "description": "In-memory cache for fast sub-millisecond balance checks.",
                        "technology": "Redis Cluster",
                        "connections": []
                    },
                    {
                        "id": "event_bus",
                        "name": "Event Streaming Backbone",
                        "type": "message_broker",
                        "description": "High-throughput event bus for asynchronous clearing and audit logs.",
                        "technology": "Apache Kafka",
                        "connections": ["fraud_svc", "notification_svc"]
                    },
                    {
                        "id": "fraud_svc",
                        "name": "Fraud Detection Service",
                        "type": "service",
                        "description": "Real-time anomaly detection evaluating transaction risk scores.",
                        "technology": "Python AI Engine",
                        "connections": []
                    },
                    {
                        "id": "notification_svc",
                        "name": "Notification Dispatcher",
                        "type": "service",
                        "description": "Sends push notifications and transactional SMS/email alerts.",
                        "technology": "Node.js Workers",
                        "connections": []
                    }
                ],
                "data_stores": [
                    {
                        "name": "Primary Transactional Ledger DB",
                        "type": "SQL / Distributed SQL",
                        "technology": "PostgreSQL / CockroachDB",
                        "purpose": "Persists immutable transaction entries with strong ACID guarantees.",
                        "rationale": "PostgreSQL provides strict serializable isolation and strong consistency required for financial ledgers where data corruption or phantom reads cannot be tolerated."
                    },
                    {
                        "name": "Account State Cache",
                        "type": "In-Memory Cache",
                        "technology": "Redis Cluster",
                        "purpose": "Stores hot account balances and session tokens.",
                        "rationale": "Redis reduces primary database load during peak traffic by serving sub-millisecond balance reads."
                    }
                ],
                "communication": [
                    {
                        "pattern": "Synchronous REST / gRPC",
                        "technology": "HTTP/2 gRPC",
                        "use_case": "Inter-service communication between Gateway and Transaction Processor.",
                        "rationale": "gRPC provides strongly typed Protobuf contracts and low latency overhead."
                    },
                    {
                        "pattern": "Asynchronous Event Streaming",
                        "technology": "Apache Kafka",
                        "use_case": "Publishing transaction events to fraud and notification microservices.",
                        "rationale": "Kafka ensures high event durability and log retention for auditing."
                    }
                ],
                "security": [
                    {
                        "category": "Authentication & Authorization",
                        "recommendation": "Use OAuth2 with Short-Lived JWT Tokens & mTLS between internal microservices.",
                        "rationale": "Prevents spoofing and ensures zero-trust security boundary across all cluster nodes."
                    },
                    {
                        "category": "Data Encryption",
                        "recommendation": "AES-256 Encryption at rest with AWS KMS / HSM and TLS 1.3 in transit.",
                        "rationale": "Protects PII and financial records against data leakage and regulatory compliance violations."
                    }
                ],
                "scalability": [
                    {
                        "dimension": "Horizontal Service Scaling",
                        "approach": "Stateless microservice deployment on Kubernetes with HPA based on CPU/RAM thresholds.",
                        "rationale": "Allows dynamic pod autoscaling during high-volume trading hours."
                    },
                    {
                        "dimension": "Database Read Sharding",
                        "approach": "PostgreSQL read-replicas with pgBouncer connection pooling.",
                        "rationale": "Offloads reporting queries from the primary write master."
                    }
                ],
                "reliability": [
                    {
                        "pattern": "Circuit Breaker & Retry Policies",
                        "approach": "Implement Resilience4j / Envoy circuit breakers with exponential backoff.",
                        "rationale": "Prevents cascading failures when downstream payment gateways experience latency spikes."
                    },
                    {
                        "pattern": "Idempotency Keys",
                        "approach": "Enforce mandatory Idempotency-Key headers stored in Redis for 24 hours.",
                        "rationale": "Guarantees duplicate network requests do not result in double charges."
                    }
                ],
                "bottlenecks": [
                    "Database write lock contention during peak settlement windows.",
                    "Kafka partition imbalance if customer traffic is skewed to specific accounts."
                ],
                "recommendations": [
                    "Implement a saga pattern for multi-stage money transfers across external banking networks.",
                    "Use distributed tracing (OpenTelemetry + Jaeger) to track end-to-end request latencies."
                ],
                "rationale": "This architecture prioritizes consistency, data security, and auditability above all else. By isolating transaction ledger writes in a distributed SQL database and utilizing Kafka for asynchronous event propagation, the system achieves sub-100ms response times while enforcing strict zero-data-loss guarantees."
            }

        # E-Commerce Intent (Default / Primary)
        else:
            return {
                "architecture_style": "Event-Driven Microservices",
                "summary": "Scalable e-commerce platform architecture decoupled into specialized domain services connected via API Gateway and message queue streaming.",
                "components": [
                    {
                        "id": "gateway",
                        "name": "API Gateway",
                        "type": "api_gateway",
                        "description": "Central entry point for mobile and web clients with rate limiting and route proxying.",
                        "technology": "Kong / NGINX",
                        "connections": ["auth_svc", "product_svc", "order_svc"]
                    },
                    {
                        "id": "auth_svc",
                        "name": "Identity & Auth Service",
                        "type": "auth",
                        "description": "Handles user registration, login, JWT token issuance, and password hashing.",
                        "technology": "FastAPI + SQLAlchemy",
                        "connections": ["user_db"]
                    },
                    {
                        "id": "product_svc",
                        "name": "Product Catalog Service",
                        "type": "service",
                        "description": "Manages product inventory, categories, price lookups, and search indexing.",
                        "technology": "FastAPI + Elasticsearch",
                        "connections": ["product_db", "redis_cache"]
                    },
                    {
                        "id": "order_svc",
                        "name": "Order Management Service",
                        "type": "service",
                        "description": "Processes customer cart orders, payment authorizations, and fulfillment states.",
                        "technology": "FastAPI / Python",
                        "connections": ["order_db", "event_bus"]
                    },
                    {
                        "id": "user_db",
                        "name": "User Relational DB",
                        "type": "database",
                        "description": "Stores user credentials, profiles, and delivery addresses.",
                        "technology": "SQLite / PostgreSQL",
                        "connections": []
                    },
                    {
                        "id": "product_db",
                        "name": "Catalog Database",
                        "type": "database",
                        "description": "Stores structured product items, attributes, and inventory levels.",
                        "technology": "PostgreSQL",
                        "connections": []
                    },
                    {
                        "id": "order_db",
                        "name": "Order Transactional Store",
                        "type": "database",
                        "description": "Stores order state records, line items, and payment transaction IDs.",
                        "technology": "PostgreSQL",
                        "connections": []
                    },
                    {
                        "id": "redis_cache",
                        "name": "Product & Session Cache",
                        "type": "cache",
                        "description": "Caches product search results and hot category pages.",
                        "technology": "Redis",
                        "connections": []
                    },
                    {
                        "id": "event_bus",
                        "name": "Message Broker / Event Bus",
                        "type": "message_broker",
                        "description": "Asynchronous event stream for order placed and inventory update events.",
                        "technology": "RabbitMQ / Apache Kafka",
                        "connections": ["notification_svc"]
                    },
                    {
                        "id": "notification_svc",
                        "name": "Notification Worker",
                        "type": "service",
                        "description": "Consumes order events to dispatch customer emails and notifications.",
                        "technology": "Python Worker",
                        "connections": []
                    }
                ],
                "data_stores": [
                    {
                        "name": "Transactional Core Database",
                        "type": "Relational SQL",
                        "technology": "PostgreSQL",
                        "purpose": "Stores customer accounts, orders, and payment records with ACID compliance.",
                        "rationale": "PostgreSQL is recommended because the system contains transactional order and payment data where strong consistency and relational integrity are paramount."
                    },
                    {
                        "name": "Product Search Index",
                        "type": "Search Engine / Cache",
                        "technology": "Redis + Elasticsearch",
                        "purpose": "Accelerates product discovery and full-text catalog queries.",
                        "rationale": "Redis caches popular catalog items while Elasticsearch provides sub-50ms full-text fuzzy search across thousands of products."
                    }
                ],
                "communication": [
                    {
                        "pattern": "Synchronous REST API",
                        "technology": "HTTP/2 REST + JSON",
                        "use_case": "User authentication, cart actions, and immediate order placement.",
                        "rationale": "REST provides simple developer ergonomics and broad client compatibility."
                    },
                    {
                        "pattern": "Asynchronous Pub/Sub Messaging",
                        "technology": "RabbitMQ / Kafka",
                        "use_case": "Order fulfillment events, email notifications, and inventory adjustments.",
                        "rationale": "Decouples checkout latency from slow third-party notification services."
                    }
                ],
                "security": [
                    {
                        "category": "Authentication & Session Security",
                        "recommendation": "Use JWT access tokens with 1-hour expiration and secure HTTP-Only refresh cookies.",
                        "rationale": "Mitigates XSS attack vectors while allowing stateless validation at the API Gateway."
                    },
                    {
                        "category": "API Gateway Rate Limiting",
                        "recommendation": "Implement token bucket rate limiting (100 req/min per IP).",
                        "rationale": "Protects authentication and search endpoints from credential stuffing and scraping bots."
                    }
                ],
                "scalability": [
                    {
                        "dimension": "Read vs Write Scaling",
                        "approach": "Deploy Redis caching for catalog queries and PostgreSQL read replicas.",
                        "rationale": "E-commerce workloads are 90% reads and 10% writes; caching absorbs read traffic."
                    },
                    {
                        "dimension": "Microservice Autoscaling",
                        "approach": "Containerize services with Docker and scale pods via Kubernetes HPA.",
                        "rationale": "Handles flash sales and seasonal traffic spikes automatically."
                    }
                ],
                "reliability": [
                    {
                        "pattern": "Failure Isolation & Circuit Breaker",
                        "approach": "Wrap external payment API calls in circuit breakers.",
                        "rationale": "Ensures slow third-party payment gateways do not block API thread pools."
                    },
                    {
                        "pattern": "Database Connection Pooling",
                        "approach": "Use SQLAlchemy connection pools with MaxOverflow boundaries.",
                        "rationale": "Prevents socket exhaustion during traffic bursts."
                    }
                ],
                "bottlenecks": [
                    "Single primary database node write contention during high-volume flash sales.",
                    "Third-party payment gateway latency spikes during checkout."
                ],
                "recommendations": [
                    "Implement asynchronous payment webhook retries with exponential backoff.",
                    "Use CDN edge caching (Cloudflare) for static product images and assets."
                ],
                "rationale": "This architecture decouples heavy read workloads (catalog search) from critical write operations (checkout and payment). By deploying an API Gateway upfront and communicating via RabbitMQ event bus, the system maintains responsiveness under 100,000+ active user workloads."
            }

    async def generate_production_readiness_summary(
        self, score: int, status_str: str, categories: List[Dict[str, Any]], findings: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        critical_count = sum(1 for f in findings if f.get("severity") == "CRITICAL")
        high_count = sum(1 for f in findings if f.get("severity") == "HIGH")

        risk = "LOW"
        if critical_count > 0 or score < 50:
            risk = "CRITICAL"
        elif high_count > 0 or score < 75:
            risk = "HIGH"
        elif score < 90:
            risk = "MEDIUM"

        priorities = [f.get("title", "") for f in findings if f.get("severity") in ["CRITICAL", "HIGH"]][:4]
        if not priorities:
            priorities = [
                "Enforce multi-factor authentication for admin routes",
                "Set up continuous integration automated smoke tests",
                "Configure automated multi-region database backups",
                "Implement structured JSON logger with trace correlation"
            ]

        return {
            "executive_summary": f"System evaluation completed with score {score}/100 and status '{status_str}'. "
                                f"Identified {len(findings)} findings ({critical_count} Critical, {high_count} High) across {len(categories)} evaluation categories.",
            "risk_level": risk,
            "top_priorities": priorities,
            "verdict": "Production Launch Approved with Advisory Monitoring" if score >= 85 else "Remediation Required Prior to Production Launch"
        }

