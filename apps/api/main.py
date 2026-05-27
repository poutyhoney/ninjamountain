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
 			"href": "gallery",
 			"slug": "photo-dojo",
 			"status": "Coming Soon",
			"description": "A place to upload, organize, and connect photos from the phone archive."
 		},
 		{
 			"title": "Training Notes",
 			"href": "notes",
 			"slug": "dev-notes",
 			"status": "Started",
			"description": "Notes from rebuilding local web development muscle memory."
 		},
 		{
 			"title": "Connection Magic",
 			"href": "connect",
 			"slug": "connection-map",
 			"status": "Idea",
			"description": "A visual experiment for connecting projects, photos, places, and memories."
 		}
 	]