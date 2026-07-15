import pytest


@pytest.mark.asyncio
async def test_export_risks_xlsx(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.get(
        f"/api/v1/export/risks?format=xlsx&organization_id={test_org_id}",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert "spreadsheet" in response.headers.get("content-type", "")


@pytest.mark.asyncio
async def test_export_risks_pdf(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.get(
        f"/api/v1/export/risks?format=pdf&organization_id={test_org_id}",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert "pdf" in response.headers.get("content-type", "")


@pytest.mark.asyncio
async def test_export_invalid_module(client, auth_headers):
    response = await client.get(
        "/api/v1/export/nonexistent?format=xlsx",
        headers=auth_headers,
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_widget_layout(client, auth_headers):
    response = await client.get("/api/v1/widgets/layout", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "widgets" in data
    assert "columns" in data
    assert len(data["widgets"]) > 0


@pytest.mark.asyncio
async def test_update_widget_layout(client, auth_headers):
    response = await client.put(
        "/api/v1/widgets/layout",
        json={"columns": 3},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["columns"] == 3


@pytest.mark.asyncio
async def test_reset_widget_layout(client, auth_headers):
    response = await client.post("/api/v1/widgets/layout/reset", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()["widgets"]) > 0


@pytest.mark.asyncio
async def test_create_raci(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.post(
        "/api/v1/raci",
        json={
            "organization_id": test_org_id,
            "name": "RACI Test",
            "description": "Test RACI matrix",
            "process_ids": [],
            "role_names": ["Director", "Analista"],
        },
        headers=auth_headers,
    )
    assert response.status_code in (200, 201)
    data = response.json()
    assert data["name"] == "RACI Test"


@pytest.mark.asyncio
async def test_list_raci(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.get(
        f"/api/v1/raci?organization_id={test_org_id}",
        headers=auth_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_create_orgchart_position(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.post(
        f"/api/v1/orgchart/positions?organization_id={test_org_id}",
        json={
            "name": "Director General",
            "description": "Máxima autoridad",
            "holder_name": "Juan Pérez",
            "department": "Dirección",
        },
        headers=auth_headers,
    )
    assert response.status_code in (200, 201)
    data = response.json()
    assert data["name"] == "Director General"
    assert data["level"] == 0


@pytest.mark.asyncio
async def test_orgchart_tree(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.get(
        f"/api/v1/orgchart/tree?organization_id={test_org_id}",
        headers=auth_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_dashboard_stats(client, auth_headers):
    response = await client.get("/api/v1/dashboard/stats", headers=auth_headers)
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_dashboard_kpis(client, auth_headers):
    response = await client.get("/api/v1/dashboard/kpis", headers=auth_headers)
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_roles_list(client, auth_headers):
    response = await client.get("/api/v1/roles", headers=auth_headers)
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_processes_list(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.get(
        f"/api/v1/processes?organization_id={test_org_id}",
        headers=auth_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_assets_list(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.get(
        f"/api/v1/assets?organization_id={test_org_id}",
        headers=auth_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_documents_list(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.get(
        f"/api/v1/documents?organization_id={test_org_id}",
        headers=auth_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_audits_list(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.get(
        f"/api/v1/audits?organization_id={test_org_id}",
        headers=auth_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_training_list(client, auth_headers, test_org_id):
    if not test_org_id:
        pytest.skip("No org available")
    response = await client.get(
        f"/api/v1/training?organization_id={test_org_id}",
        headers=auth_headers,
    )
    assert response.status_code == 200
