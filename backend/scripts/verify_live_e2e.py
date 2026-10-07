import sys
import httpx

BASE_URL = "http://127.0.0.1:8000/api"

def main():
    print("==================================================")
    print("BACKENDFLOW AI -- LIVE END-TO-END VERIFICATION")
    print("==================================================")
    
    # Enforce strict 3.0 second timeout for all live API verification calls
    client = httpx.Client(base_url=BASE_URL, timeout=3.0)

    # 1. Health Check
    health_res = client.get("/health")
    assert health_res.status_code == 200, f"Health check failed: {health_res.text}"
    print("[PASS] Step 1: Health Check -> 200 OK")

    # 2. Register User
    user_email = "live_architect@backendflow.ai"
    user_pass = "LiveSecurePass2026!"
    reg_res = client.post("/auth/register", json={"email": user_email, "password": user_pass, "full_name": "Live Architect"})
    assert reg_res.status_code in [200, 201, 400], f"Registration failed: {reg_res.text}"
    print("[PASS] Step 2: Register User")

    # 3. Login User
    login_res = client.post("/auth/login", json={"email": user_email, "password": user_pass})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] Step 3: Login User (JWT Token acquired)")

    # 4. Create Project Workspace
    proj_payload = {
        "name": "Live Production Payment System",
        "description": "Enterprise payment processing system with fraud detection",
        "environment": "production",
        "framework": "FastAPI",
        "services_count": 4,
        "tables_count": 8
    }
    proj_res = client.post("/projects", json=proj_payload, headers=headers)
    assert proj_res.status_code == 201, f"Project creation failed: {proj_res.text}"
    project_id = proj_res.json()["id"]
    print(f"[PASS] Step 4: Create Project (Project ID: {project_id})")

    # 5. AI Architecture Analysis
    arch_prompt = "Design a high-throughput payment processing architecture supporting 50,000 TPS, double-entry ledger, and Redis caching."
    arch_res = client.post("/ai/analyze-architecture", json={"project_id": project_id, "prompt": arch_prompt}, headers=headers)
    assert arch_res.status_code == 200, f"Architecture analysis failed: {arch_res.text}"
    arch_data = arch_res.json()
    assert "architecture_style" in arch_data
    assert len(arch_data["components"]) > 0
    print(f"[PASS] Step 5: AI Architecture Analysis (Style: {arch_data['architecture_style']}, {len(arch_data['components'])} components)")

    # 6. AI API Generation
    api_prompt = "Create an authenticated payment transaction API accepting amount, currency, and card token."
    api_gen_res = client.post("/ai/generate-api", json={"project_id": project_id, "prompt": api_prompt}, headers=headers)
    assert api_gen_res.status_code == 200, f"AI API generation failed: {api_gen_res.text}"
    api_gen_data = api_gen_res.json()
    assert api_gen_data["method"] in ["GET", "POST", "PUT", "PATCH", "DELETE"]
    print(f"[PASS] Step 6: AI API Generation (Generated Endpoint: {api_gen_data['method']} {api_gen_data['path']})")

    # 7. Persist API Endpoint in API Builder
    create_api_payload = {
        "name": api_gen_data["name"],
        "method": api_gen_data["method"],
        "path": api_gen_data["path"],
        "description": api_gen_data["description"],
        "auth_required": api_gen_data["authentication_required"],
        "request_schema": api_gen_data["request_schema"],
        "response_schema": api_gen_data["response_schema"],
    }
    create_api_res = client.post(f"/projects/{project_id}/apis", json=create_api_payload, headers=headers)
    assert create_api_res.status_code == 201, f"API Builder persistence failed: {create_api_res.text}"
    created_api_id = create_api_res.json()["id"]
    print(f"[PASS] Step 7: API Persistence (API Endpoint ID: {created_api_id})")

    # 8. API Simulation Test Execution
    test_res = client.post(f"/projects/{project_id}/apis/{created_api_id}/test", json={"payload": {"amount": 5000, "currency": "USD"}}, headers=headers)
    assert test_res.status_code == 200, f"API simulation failed: {test_res.text}"
    test_data = test_res.json()
    assert test_data["status_code"] in [200, 201]
    print(f"[PASS] Step 8: API Simulation Test (Response Code: {test_data['status_code']}, Execution Time: {test_data['execution_time_ms']}ms)")

    # 9. Production Readiness Audit
    audit_res = client.post(f"/projects/{project_id}/production-readiness/analyze", json={"include_ai_summary": True}, headers=headers)
    assert audit_res.status_code == 200, f"Readiness audit failed: {audit_res.text}"
    audit_data = audit_res.json()
    print(f"[PASS] Step 9: Production Readiness Audit (Overall Score: {audit_data['overall_score']}/100, Status: {audit_data['status']})")

    # 10. Audit History Retrieval & Persistence Verification
    ai_hist_res = client.get(f"/projects/{project_id}/ai-generations", headers=headers)
    assert ai_hist_res.status_code == 200 and len(ai_hist_res.json()) >= 1

    arch_hist_res = client.get(f"/projects/{project_id}/architecture-analyses", headers=headers)
    assert arch_hist_res.status_code == 200 and len(arch_hist_res.json()) >= 1

    readiness_hist_res = client.get(f"/projects/{project_id}/production-readiness/history", headers=headers)
    assert readiness_hist_res.status_code == 200 and len(readiness_hist_res.json()) >= 1
    print("[PASS] Step 10: History Retrieval & Persistence")

    # 11. Security Protection (Unauthenticated Request)
    unauth_res = client.get(f"/projects/{project_id}")
    assert unauth_res.status_code == 401, f"Security check failed: expected 401, got {unauth_res.status_code}"
    print("[PASS] Step 11: Security Verification (Unauthenticated Blocked -> 401 Unauthorized)")

    print("==================================================")
    print("ALL LIVE END-TO-END VERIFICATION STEPS PASSED 100%")
    print("==================================================")

if __name__ == "__main__":
    main()
