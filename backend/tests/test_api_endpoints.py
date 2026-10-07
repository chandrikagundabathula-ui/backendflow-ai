def get_auth_header(client, email="builder@backendflow.ai", password="SecretPassword123!"):
    client.post("/api/auth/register", json={"email": email, "password": password, "full_name": "API Builder Architect"})
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def create_test_project(client, headers, name="Payment Service"):
    res = client.post("/api/projects", json={"name": name, "description": "Payment microservice"}, headers=headers)
    return res.json()

def test_api_endpoint_crud_lifecycle(client):
    headers = get_auth_header(client)
    project = create_test_project(client, headers)
    project_id = project["id"]

    # 1. Create API Definition
    api_payload = {
        "name": "Process Payment Checkout",
        "description": "Atomic transaction endpoint for Stripe webhooks",
        "method": "POST",
        "path": "/api/v1/payments/checkout",
        "request_schema": {"amount": "number", "currency": "string", "customer_id": "string"},
        "response_schema": {"transaction_id": "uuid", "status": "string"},
        "auth_required": True,
        "status": "active"
    }
    create_res = client.post(f"/api/projects/{project_id}/apis", json=api_payload, headers=headers)
    assert create_res.status_code == 201
    api_data = create_res.json()
    assert api_data["name"] == api_payload["name"]
    assert api_data["method"] == "POST"
    assert api_data["path"] == "/api/v1/payments/checkout"
    api_id = api_data["id"]

    # 2. List APIs for project
    list_res = client.get(f"/api/projects/{project_id}/apis", headers=headers)
    assert list_res.status_code == 200
    apis_list = list_res.json()
    assert len(apis_list) == 1
    assert apis_list[0]["id"] == api_id

    # 3. Get API by ID
    get_res = client.get(f"/api/projects/{project_id}/apis/{api_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["name"] == api_payload["name"]

    # 4. Update API Definition
    update_payload = {"name": "Process Stripe Payment Checkout", "method": "PUT"}
    put_res = client.put(f"/api/projects/{project_id}/apis/{api_id}", json=update_payload, headers=headers)
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["name"] == "Process Stripe Payment Checkout"
    assert updated["method"] == "PUT"

    # 5. Test API simulation execution
    test_req_payload = {"payload": {"amount": 100, "currency": "USD"}}
    test_res = client.post(f"/api/projects/{project_id}/apis/{api_id}/test", json=test_req_payload, headers=headers)
    assert test_res.status_code == 200
    test_data = test_res.json()
    assert test_data["status_code"] in [200, 201]
    assert "response_body" in test_data
    assert test_data["validation_status"] == "valid"

    # 6. Delete API Definition
    del_res = client.delete(f"/api/projects/{project_id}/apis/{api_id}", headers=headers)
    assert del_res.status_code == 200

    # 7. Verify deletion
    get_after_del = client.get(f"/api/projects/{project_id}/apis/{api_id}", headers=headers)
    assert get_after_del.status_code == 404

def test_unauthorized_api_endpoint_access(client):
    res = client.get("/api/projects/proj_fake_123/apis")
    assert res.status_code == 401
