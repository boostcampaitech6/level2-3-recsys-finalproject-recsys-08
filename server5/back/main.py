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

# @app.post("/upload")
# async def upload(
#     text: str = Form(None), 
#     file: UploadFile = File(None), 
#     return_img_name: str = '1163.jpg',
#     return_txt: str = "This came from the FastAPI Server ;)"
#     ):
#     try:
#         # 파일 업로드 필드가 없는 경우에는 텍스트만 처리
#         if not file:
#             if text:
#                 # 텍스트를 텍스트 파일에 저장
#                 text_path = os.path.join(UPLOAD_DIRECTORY, 'text.txt')
#                 with open(text_path, "a") as text_file:
#                     text_file.write(text + '\n')
        
#         # 파일 업로드 필드가 있는 경우에는 이미지를 이미지 파일에 저장
#         else:
#             image_path = os.path.join(UPLOAD_DIRECTORY, file.filename)
#             print(file.filename)
#             with open(image_path, "wb") as image_file:
#                 shutil.copyfileobj(file.file, image_file)
                
#             # 이미지 파일과 텍스트 모두가 존재하는 경우에는 둘 다 처리
#             if text:
#                 # 텍스트를 텍스트 파일에 저장
#                 text_path = os.path.join(UPLOAD_DIRECTORY, 'text.txt')
#                 with open(text_path, "a") as text_file:
#                     text_file.write(text + '\n')
        
#         return JSONResponse(content={"txt": return_txt})
#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": str(e)})


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
        

# @app.get('/papers')
# async def get_papers():
#     data = [{"id": 0, "title": "Attention is All You Need", "author1": "ME", "year": 2017, "categories": "a, b, c"},
#             {"id": 1, "title": "VQA", "author1": "Electronic Magic Super-Sonic Bionic Engergy", "year": 2018, "categories": "a, b, c"},
#             {"id": 2, "title": "Random String", "author1": "Andrew Ng", "year": 2024, "categories": "a, b, c"},
#             {"id": 3, "title": "I really need auto generator", "author1": "Hamilton", "year": 2019, "categories": "a, b, c"},
#             {"id": 4, "title": "Done with this", "author1": "Lee", "year": 2022, "categories": "a, b, c"}
#             ]
#     return data

@app.get('/api/data/chatbot/{paper_id}/{query}')
async def get_chatbot(paper_id: str, query: str):
    # query = """
    # "where \\( Q \\), \\( K \\), and \\( V \\) are the matrices of queries, keys, and values, respectively, and \\( d_k \\) is the dimensionality of the keys. The softmax function is applied to the scaled dot products of queries and keys to obtain the weights on the values (Vaswani1706 pages 3-5).",
    #     "Multi-Head Attention, on the other hand, projects the queries, keys, and values \\( h \\) times with different, learned linear projections to \\( d_k \\), \\( d_k \\), and \\( d_v \\) dimensions, respectively. Then the attention function is applied in parallel, yielding \\( d_v \\)-dimensional output values. These are concatenated and once again projected, resulting in the final values as follows:",
    #     "\\[ \\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, ..., \\text{head}_h)W^O \\]",
    #     "where each head \\( \\text{head}_i \\) is computed as:",
    #     "\\[ \\text{head}_i = \\text{Attention}(QW_i^Q, KW_i^K, VW_i^V) \\]",
    #     "Here, \\( W_i^Q \\), \\( W_i^K \\), \\( W_i^V \\), and \\( W^O \\) are parameter matrices (Vaswani1706 pages 3-5)."
    # """
    # print(paper_id, query)
    # return {'answer': f"answer for question '{query}'", 'refernece': query}
    
    # service logic
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