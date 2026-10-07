def test_register_and_login(client):
    # Register user
    reg_payload = {
        "email": "architect@backendflow.ai",
        "password": "SecurePassword123!",
        "full_name": "Backend Architect",
        "role": "Lead Engineer"
    }
    response = client.post("/api/auth/register", json=reg_payload)
    assert response.status_code == 201
    user_data = response.json()
    assert user_data["email"] == reg_payload["email"]
    assert user_data["full_name"] == reg_payload["full_name"]
    assert "password" not in user_data

    # Duplicate registration should fail
    dup_res = client.post("/api/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # Login
    login_payload = {
        "email": "architect@backendflow.ai",
        "password": "SecurePassword123!"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    # Get /me
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == reg_payload["email"]

def test_unauthorized_access(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401
