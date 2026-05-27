from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Ninja Mountain API")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:3000"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.get("/")
def read_root():
	return {
		"message": "Ninja Mountain API is awake!"
	}


@app.get("/health")
def health_check():
	return {
		"status": "ok"
	}

	
@app.get("/projects")
def list_projects():
	return [
 		{
 			"title": "Photo Dojo",
 			"slug": "photo-dojo",
 			"status": "coming-soon"
 		},
 		{
 			"title": "Dev Notes",
 			"slug": "dev-notes",
 			"status": "planned"
 		},
 		{
 			"title": "Connection Map",
 			"slug": "connection-map",
 			"status": "idea"
 		}
 	]