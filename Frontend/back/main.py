from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, Response
from fastapi.encoders import jsonable_encoder
import json
from pydantic import BaseModel
import requests
import os
import shutil
import base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

UPLOAD_DIRECTORY = './'
img_directory = "./"

DATA_PATH = '/dev/shm/back/data'
@app.get("/graph/{file}")
async def get_graph(file: str = 'data'):
    # retrival 위해 저장한 값 불러오는 식으로 구성했지만 실제 서빙때는 걍 실시간으로 만들어서 보내주기만 하면 됨.
    try:
        with open(os.path.join(DATA_PATH, f"{file}.json"), "r") as f:
            data = json.load(f)
            # print(data)
        return JSONResponse(status_code=200, content=data)
    except Exception as e:
        print(e)
        

@app.get('/api/data/chatbot/{paper_id}/{query}')
async def get_chatbot(paper_id: str, query: str):
    data ={'paper_id': paper_id, 'query': query}
    data = requests.post("http://223.130.162.53:8000/predict", json=data)
    
    data = data.json()
    print(data)
    
    q_and_a = data['prediction'].split('\n\nReferences\n\n')[0]
    
    _answer = "\n".join(q_and_a.split("\n\n")[1:])
    try:
        _Reference = "".join(data['prediction'].split('\n\nReferences\n\n')[1])
    except:
        _Reference = str(data['prediction'].split('\n\nReferences\n\n')[1])

    
    chatbot = {'answer' : _answer, 'Reference' : _Reference}
    print(_Reference)
    
    return chatbot


papers = []
@app.get("/api/data/sidebar/{paper_id}")
async def get_sidebar(paper_id: str):
    print(papers, paper_id)
    if paper_id in papers: return papers
    papers.append(paper_id)
    
    return papers