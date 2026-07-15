import pytest


@pytest.mark.asyncio
async def test_create_risk(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.post(
        "/api/v1/risks",
        json={
            "organization_id": test_org_id,
            "name": "Risk Test",
            "description": "Test risk",
            "category": "tecnologico",
            "probability": 3,
            "impact": 4,
        },
        headers=auth_headers,
    )
    assert response.status_code in (200, 201)
    data = response.json()
    assert data["name"] == "Risk Test"
    assert data["risk_score"] == 12


@pytest.mark.asyncio
async def test_list_risks(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.get(
        f"/api/v1/risks?organization_id={test_org_id}",
        headers=auth_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_risk_matrix(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.get(
        f"/api/v1/risks/matrix?organization_id={test_org_id}",
        headers=auth_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_risk_stats(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.get(
        f"/api/v1/risks/stats?organization_id={test_org_id}",
        headers=auth_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_create_control(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.post(
        "/api/v1/controls",
        json={
            "organization_id": test_org_id,
            "control_id": "A.5.1.1",
            "name": "Control Test",
            "description": "Test control",
            "category": "organizativo",
        },
        headers=auth_headers,
    )
    assert response.status_code in (200, 201)
    data = response.json()
    assert data["name"] == "Control Test"


@pytest.mark.asyncio
async def test_list_controls(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.get(
        f"/api/v1/controls?organization_id={test_org_id}",
        headers=auth_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_control_stats(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.get(
        f"/api/v1/controls/stats?organization_id={test_org_id}",
        headers=auth_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_soa(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.get(
        f"/api/v1/controls/soa?organization_id={test_org_id}",
        headers=auth_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_create_incident(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.post(
        "/api/v1/incidents",
        json={
            "organization_id": test_org_id,
            "title": "Incident Test",
            "description": "Test incident",
            "incident_type": "seguridad",
            "severity": "alto",
            "priority": "P2",
        },
        headers=auth_headers,
    )
    assert response.status_code in (200, 201)
    data = response.json()
    assert data["title"] == "Incident Test"


@pytest.mark.asyncio
async def test_list_incidents(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.get(
        f"/api/v1/incidents?organization_id={test_org_id}",
        headers=auth_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_incident_stats(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.get(
        f"/api/v1/incidents/stats?organization_id={test_org_id}",
        headers=auth_headers,
    )
    assert response.status_code == 200
