import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch, MagicMock
from motor.motor_asyncio import AsyncIOMotorClient

from app.main import app


MONGO_TEST_URL = "mongodb://localhost:27017"
TEST_DB_NAME = "sgi_test_db"


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def test_db():
    client = AsyncIOMotorClient(MONGO_TEST_URL)
    db = client[TEST_DB_NAME]
    yield db
    await client.drop_database(TEST_DB_NAME)
    client.close()


@pytest_asyncio.fixture
async def mock_db(test_db):
    with patch("app.core.database.db", test_db), \
         patch("app.core.database.get_database", return_value=test_db):
        yield test_db


@pytest_asyncio.fixture
async def client(mock_db):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def admin_token(client):
    response = await client.post("/api/v1/auth/login", json={
        "email": "admin@sgi.local",
        "password": "Admin123!",
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    return None


@pytest_asyncio.fixture
async def auth_headers(admin_token):
    if admin_token:
        return {"Authorization": f"Bearer {admin_token}"}
    return {}


@pytest_asyncio.fixture
async def test_org_id(client, auth_headers):
    response = await client.post(
        "/api/v1/organizations",
        json={
            "name": "Test Org",
            "nit": "900123456-7",
            "description": "Organización de prueba",
            "address": "Calle Test 123",
            "phone": "+57 300 1234567",
        },
        headers=auth_headers,
    )
    if response.status_code in (200, 201):
        return response.json().get("id")
    return None
