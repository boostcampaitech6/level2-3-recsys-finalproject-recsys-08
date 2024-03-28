import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import './UploadForm.css';
import '../App.css';
import PaperList from '../components/PaperList';
import { useAuth } from '../components/AuthContext';
import { MyResponsiveNetwork } from '../components/MyResponsiveNetwork';

const DefaultStyle = () => {
  // const accessToken = JSON.parse(localStorage.getItem('accessToken'));
  // const [roomData, setRoomData] = useState(null); // 데이터를 담는 상태

  // useEffect(() => {
  //   const fetchRoomData = async () => {
  //     try {
  //       const response = await axios.get(`http://223.130.141.170:8000/chat/room`, {
  //         headers: {
  //           Authorization: `Bearer ${accessToken.access_token}`
  //         }
  //       });
  //       setRoomData(response.data); // 데이터 설정
  //     } catch (error) {
  //       console.error('Error fetching room data:', error);
  //     }
  //   };

  //   fetchRoomData(); // 데이터 가져오기
  // }, []); // 컴포넌트가 마운트될 때만 실행

  return (
    <div
      style={{
        position: "absolute",
        marginTop: "60px",
        justifyContent: "center",
        left: "50%",
        transform: "translateX(-50%)",
      }}>
      <img src='../notice.png' style={{ width: "400px" }} />
    </div>
  );
};

const UploadForm = () => {
  const [user_question, setUserQuestion] = useState('');
  const [showPaperList, setShowPaperList] = useState(false);
  const [data, setData] = useState(''); // 전체 데이터를 담는 상태
  const [graph, setGraph] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const { token } = useAuth();

  const handleSubmit = useCallback(async () => {
    try {
      const response = await axios.get(`http://223.130.141.170:8000/api/data/get_data/${user_question}`, {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        }
      });

      // 데이터 중에서 처음 다섯 개의 노드만 사용합니다.
      const firstFiveNodes = response.data.slice(0, 5);

      setData(response.data);

      const maxCitationCount = Math.max(...firstFiveNodes.map(item => item.citation_count));

      const nodes = firstFiveNodes.map(item => ({
        id: item.id,
        title: item.title,
        author: item.author1,
        year: item.published_year,
        height: 2,
        size: Math.max(0.3, (item.citation_count / maxCitationCount)) * 80, // 비율로 설정
        color: `rgb(1, 96, 176, ${Math.max(0, (item.published_year - 1920) / (2024 - 1920)) * 0.7})`
      }));
      const links = [];// [{source: nodes[0].id, target: nodes[1].id, distance: 100}];
      const newAnnotations = [];
      for (let i = 0; i < nodes.length; i++) {
        newAnnotations[i] = {
          type: 'circle',
          match: {
            id: nodes[i].id
          },
          note: `${nodes[i].author}, ${nodes[i].year}`,
          noteX: 75,
          noteY: 36,
          offset: 6,
          noteTextOffset: 5
        };
      }
      setGraph({ nodes, links });
      setAnnotations(newAnnotations);
      setShowPaperList(true);
    } catch (error) {
      console.error('Error Rised During Search', error);
      alert('Failed to connect with server.');
    }
  }, [user_question, token]);

  const handleButtonClick = async () => {
    if (user_question && token) {
      setShowPaperList(false);
      await handleSubmit();
    }
  };

  const handleTextChange = (event) => {
    setUserQuestion(event.target.value);
  };

  return (
    <div style={{width: "100%", height:"100%", background: "red"}}>
      {!showPaperList && <DefaultStyle />}
      <div className="inputField" style={{ padding: "5px", position: "absolute", left: "50%", transform: "translateX(-50%)", width: "600px", height: "30px", marginTop: "30px", background:"white" }}>
        <input id="text" placeholder='Search papers by typing a keyword you are interested in' value={user_question} onChange={handleTextChange} style={{ border: 0, right: "95%", width: "550px", height: "28px", float: "left", outline: "none", verticalAlign: "middle" }} />
        <button type="button" className='btn btn-primary' onClick={handleButtonClick} disabled={!user_question} style={{ float: "right", position: "absolute", bottom: "8px", right: "5px", borderRadius: "12px", height: "60%", outline: "none", verticalAlign: "middle" }}>Search</button>
      </div>
      <div className='response-container'>
        {showPaperList && <PaperList papers={data} />}
        <div className="responsive-network" style={{ position: "absolute", left: "50%", right: "3%", top: "180px", height: "70vh" }}>
          {showPaperList && <MyResponsiveNetwork data={graph} annotations={annotations} />}
        </div>
      </div>
    </div>
  );
};

export default UploadForm;
