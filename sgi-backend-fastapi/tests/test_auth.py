import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


@pytest.mark.asyncio
async def test_ping(client):
    response = await client.get("/api/v1/ping")
    assert response.status_code == 200
    assert response.json()["message"] == "pong"


@pytest.mark.asyncio
async def test_login_success(client):
    response = await client.post("/api/v1/auth/login", json={
        "email": "admin@sgi.local",
        "password": "Admin123!",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    response = await client.post("/api/v1/auth/login", json={
        "email": "admin@sgi.local",
        "password": "wrongpassword",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client):
    response = await client.post("/api/v1/auth/login", json={
        "email": "noexiste@test.com",
        "password": "test123",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_register_and_login(client):
    register_response = await client.post("/api/v1/auth/register", json={
        "email": "newuser@test.com",
        "password": "TestPass123!",
        "full_name": "Test User",
    })
    assert register_response.status_code in (200, 201)

    login_response = await client.post("/api/v1/auth/login", json={
        "email": "newuser@test.com",
        "password": "TestPass123!",
    })
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()


@pytest.mark.asyncio
async def test_me_endpoint(client, auth_headers):
    response = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@sgi.local"
    assert "admin" in data["roles"]


@pytest.mark.asyncio
async def test_me_no_token(client):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code in (401, 403)
