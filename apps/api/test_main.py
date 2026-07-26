from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_read_root():
	response = client.get("/")
	assert response.status_code == 200
	assert response.json() == {"message": "Ninja Mountain API is awake!"}


def test_health_check():
	response = client.get("/health")
	assert response.status_code == 200
	assert response.json() == {"status": "ok"}


def test_list_projects():
	response = client.get("/projects")
	assert response.status_code == 200
	projects = response.json()
	assert isinstance(projects, list)
	assert len(projects) == 6
	assert all("title" in p and "slug" in p for p in projects)