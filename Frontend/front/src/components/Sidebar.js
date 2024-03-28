import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './chat.css';

function CustomSidebar() {
    const [searchHistory, setSearchHistory] = useState([]);
    const [paperId, setPaperId] = useState();
    const navigate = useNavigate();
    const accessToken = JSON.parse(localStorage.getItem('accessToken'));

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const paperIdFromUrl = params.get('paper_id');
        const accessToken = JSON.parse(localStorage.getItem('accessToken'))

        if (paperIdFromUrl) {
            setPaperId(paperIdFromUrl);
            axios.get(`http://223.130.141.170:8000/chat/room`, {
                headers: {
                    Authorization: `Bearer ${accessToken.access_token}`
                }
            })
                .then(response => {
                    console.log(response.data);
                    setSearchHistory(response.data);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [paperId]);

    const handleMenuItemClick = (item) => {
        navigate(`/chatbot?paper_id=${item}`);
        window.location.reload();
    };

    const handleDelete = async (token_1, paperId) => {
        try {
            await axios.delete(`http://223.130.141.170:8000/chat/?paper_id=${paperId}`, {
                headers: {
                    Authorization: `Bearer ${token_1}`
                }
            });
            const currentIndex = searchHistory.findIndex(item => item.paper_id === paperId);
            let prevItem = searchHistory[currentIndex - 1];
            let length = searchHistory.length;
            if (currentIndex === 0){
                prevItem = searchHistory[currentIndex + 1];
                if (length === 1){
                    prevItem = searchHistory[currentIndex];
                }
            }
            // 다음 아이템 가져오기
            const updatedHistory = searchHistory.filter(item => item.paper_id !== paperId);
            
            // 새로운 배열로 상태 업데이트
            setSearchHistory(updatedHistory);
            console.log(length)
            if (length === 0){
                navigate('/');
            }
            else{
                navigate(`/chatbot?paper_id=${prevItem.paper_id}`);
                window.location.reload();
            }
        } catch (error) {
            console.error("Error deleting paper:", error);
        }
    };

    return (
        <Sidebar
            rootStyles={{
                overflowY: "visible",
            }}>
            <Menu menuItemStyles={{
                button: {
                    borderBottom: "1px solid white",
                    '&:hover': {
                        backgroundColor: '#007bff',
                        color: "white",
                        fontWeight: "bold"
                    },
                },
            }}>
                {/* 데이터를 매핑하여 MenuItem을 동적으로 생성 */}
                {searchHistory.map((item, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                            <MenuItem onClick={() => handleMenuItemClick(item.paper_id)}>
                            <img
                            className='delete'
                                src="../delete_1.png"
                                alt="Delete"
                                onClick={(e) => {
                                    e.stopPropagation(); // 이벤트 전파 방지
                                    handleDelete(accessToken.access_token, item.paper_id);
                                }}
                                style={{ position: 'absolute', top: '50%', right: '0', transform: 'translateY(-50%)', cursor: 'pointer' }} // 이미지 스타일
                            />
                                <span>{item.paper_title}</span>
                            </MenuItem>
                           
                        </div>
                    ))}
            </Menu>
        </Sidebar>
    );
};

export default CustomSidebar;
