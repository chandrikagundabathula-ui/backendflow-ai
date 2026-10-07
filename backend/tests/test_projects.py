def get_auth_header(client, email="dev@backendflow.ai", password="SecretPassword123!"):
    client.post("/api/auth/register", json={"email": email, "password": password, "full_name": "Dev User"})
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_project_crud_lifecycle(client):
    headers = get_auth_header(client)

    # 1. Create project
    proj_payload = {
        "name": "E-Commerce Core API",
        "description": "High-throughput microservices architecture for cart and orders",
        "environment": "production",
        "framework": "FastAPI",
        "services_count": 14,
        "tables_count": 28
    }
    create_res = client.post("/api/projects", json=proj_payload, headers=headers)
    assert create_res.status_code == 201
    created_proj = create_res.json()
    assert created_proj["name"] == proj_payload["name"]
    assert created_proj["slug"] == "e-commerce-core-api"
    project_id = created_proj["id"]

    # 2. List projects
    list_res = client.get("/api/projects", headers=headers)
    assert list_res.status_code == 200
    projects_list = list_res.json()
    assert len(projects_list) == 1
    assert projects_list[0]["id"] == project_id

    # 3. Get project by ID
    get_res = client.get(f"/api/projects/{project_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["name"] == proj_payload["name"]

    # 4. Update project
    update_payload = {"name": "E-Commerce Updated Core", "services_count": 18}
    put_res = client.put(f"/api/projects/{project_id}", json=update_payload, headers=headers)
    assert put_res.status_code == 200
    updated_proj = put_res.json()
    assert updated_proj["name"] == "E-Commerce Updated Core"
    assert updated_proj["slug"] == "e-commerce-updated-core"
    assert updated_proj["services_count"] == 18

    # 5. Delete project
    del_res = client.delete(f"/api/projects/{project_id}", headers=headers)
    assert del_res.status_code == 200

    # 6. Verify deletion
    get_after_del = client.get(f"/api/projects/{project_id}", headers=headers)
    assert get_after_del.status_code == 404

def test_unauthorized_project_access(client):
    res = client.get("/api/projects")
    assert res.status_code == 401
