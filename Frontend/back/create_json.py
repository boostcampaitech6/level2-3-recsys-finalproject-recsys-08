import json
import os

r"""
nodes: [
    {                   # paper에 대한 정보
        id: str -> xxxx.xxxx           # 챗봇 연결링크 생성시 필요
        title: str -> Attention is ~   # 유저한테 보여줄 논문 제목
        size: int                      # 인용수
        hieght: int                    # 부모 노드에 연결될 Edge 굵기: 1hop 2hop 구분으로 사용?
        color: int                     # 노드 특성 반영한 한가지 값으로 주면 투명도로 조절해서 표시할 수 있음.
    }, ...
],
edges: [
    {
        source: str -> title        # 자식 노드 제목
        to: str -> title            # 부모 노드 제목
        distance -> int [0 ~ 1]     # 모델 output 유사도
    }, ...
]
"""

# Example Output
data = {
    "nodes": [
        {
            "id": "검색 논문", # 논문 제목이나 고유 ItemID나 상관 없는데 제목이면 보이는건 좀 더 나을 수 있음
            "height": 2,    # 연결된 Edge들의 두께 -> Edge 하나하나 Custom 안되는 것 같으니 당장은 꾸미는 용으로만 
            "size": 32,     # 노드의 크기 -> 중요도 순? 인용수? 사용 가능할듯
            "color": "rgb(244, 117, 96)" # default로 설정하면 간선이 안보이니까 너무 이상한 값만 아니면 상관 X
        },
        {
            "id": "추천 1",
            "height": 1,
            "size": 24,
            "color": "rgb(97, 205, 187)"
        },
        {
            "id": "추천 1.1",
            "height": 0,
            "size": 12,
            "color": "rgb(232, 193, 160)"
        }
    ],
    "links": [
        {
            "source": "검색 논문",  # from
            "target": "추천 1", # to
            "distance": 80  # 노드 사이의 거리 -> 유사도 순으로 사용 가능할 듯. 모델 디벨롭 한 뒤에 결정하면 될 듯
        },
        {
            "source": "추천 1",
            "target": "추천 1.1",
            "distance": 50
        }
    ]
}

with open(os.path.join('data', 'test.json'), 'w') as json_file:
    json.dump(data, json_file, ensure_ascii=False) # ensure_ascii True 하면 한글이 안보임 ㅋㅋ