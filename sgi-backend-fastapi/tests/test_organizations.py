import pytest


@pytest.mark.asyncio
async def test_create_organization(client, auth_headers):
    response = await client.post(
        "/api/v1/organizations",
        json={
            "name": "Org Test",
            "nit": "900987654-3",
            "description": "Test org",
            "address": "Calle 123",
            "phone": "+57 300 9876543",
        },
        headers=auth_headers,
    )
    assert response.status_code in (200, 201)
    data = response.json()
    assert data["name"] == "Org Test"
    assert "id" in data


@pytest.mark.asyncio
async def test_list_organizations(client, auth_headers):
    response = await client.get("/api/v1/organizations", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, (list, dict))


@pytest.mark.asyncio
async def test_create_and_get_organization(client, auth_headers):
    create_resp = await client.post(
        "/api/v1/organizations",
        json={
            "name": "Get Org",
            "nit": "900111222-3",
            "description": "To be retrieved",
            "address": "Address",
            "phone": "+57 300 1112223",
        },
        headers=auth_headers,
    )
    assert create_resp.status_code in (200, 201)
    org_id = create_resp.json().get("id")

    get_resp = await client.get(f"/api/v1/organizations/{org_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "Get Org"


@pytest.mark.asyncio
async def test_update_organization(client, auth_headers):
    create_resp = await client.post(
        "/api/v1/organizations",
        json={
            "name": "Update Org",
            "nit": "900333444-5",
            "description": "To be updated",
            "address": "Old",
            "phone": "+57 300 3334445",
        },
        headers=auth_headers,
    )
    if create_resp.status_code in (200, 201):
        org_id = create_resp.json().get("id")
        update_resp = await client.put(
            f"/api/v1/organizations/{org_id}",
            json={"name": "Updated Org"},
            headers=auth_headers,
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["name"] == "Updated Org"


@pytest.mark.asyncio
async def test_delete_organization(client, auth_headers):
    create_resp = await client.post(
        "/api/v1/organizations",
        json={
            "name": "Delete Org",
            "nit": "900555666-7",
            "description": "To be deleted",
            "address": "Addr",
            "phone": "+57 300 5556667",
        },
        headers=auth_headers,
    )
    if create_resp.status_code in (200, 201):
        org_id = create_resp.json().get("id")
        del_resp = await client.delete(f"/api/v1/organizations/{org_id}", headers=auth_headers)
        assert del_resp.status_code in (200, 204)


@pytest.mark.asyncio
async def test_organization_unauthorized(client):
    response = await client.get("/api/v1/organizations")
    assert response.status_code in (401, 403)
