import PropTypes from 'prop-types';
import ChatBot, { Loading } from 'react-simple-chatbot';
import axios from 'axios';
import React, { Component } from 'react';
import './ExampleChatbotWithBackend.css';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import './chat.css'
// import ReactHtmlParser from 'react-html-parser';

class PreviousSessionLogs extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      logs: [],
    };

    this.exampleQuestions = [
      { 'content': 'History not found: Lead to sample questions!' },
    ];
  }

  componentDidMount() {
    const accessToken = JSON.parse(localStorage.getItem('accessToken'));
    const params = new URLSearchParams(window.location.search);
    const paperId = params.get('paper_id');

    const axiosInstance = axios.create({
      headers: {
        Authorization: `Bearer ${accessToken.access_token}`
      }
    });

    axiosInstance.get(`http://223.130.141.170:8000/chat/?paper_id=${paperId}`)
      .then(response => {
        if (response.data === false) {
          axiosInstance.post(`http://223.130.141.170:8000/chat/`,
            {
              "paper_id": paperId
            }
          ).then(() => {
            window.location.reload();
          }).catch(error => {
            console.error('Error posting initial message:', error);
            this.setState({ loading: false });
          });
        }
        else {
          let logs = response.data;
          if (logs.length === 0) {
            logs = this.exampleQuestions; // 클래스 속성으로 정의된 exampleQuestions 사용
          }
          this.setState({ logs, loading: false });
        }
      })
      .catch(error => {
        alert("Error Fetching Data");
        const logs = this.exampleQuestions; // 클래스 속성으로 정의된 exampleQuestions 사용
        console.error('Error fetching previous logs:', error);
        this.setState({ logs, loading: false });
      });
  }

  render() {
    const { loading, logs } = this.state;
    const params = new URLSearchParams(window.location.search);
    const paperId = params.get('paper_id');
    console.log(logs);

    return (
      <div style={{ textAlign: 'left' }}>
        {loading ? <p>Loading...</p> :
          <ul style={{ listStyleType: 'none', paddingLeft: '0px' }}>
            {logs.map((log) => (
              <li key={log.message_id} >
                <li>
                  {log.user_com ? (
                    // user_com이 true인 경우
                    <div style={{ backgroundColor: "#40A2D8" }}>PRQAS</div>
                  ) : (
                    // user_com이 false인 경우
                    <div style={logs === this.exampleQuestions ? {} : { backgroundColor: "#F0EDCF" }}>User</div>
                  )}
                </li>
                <li>
                  <Latex>
                    {removeQuotes((log.content || '').replace(/undefined/g, '\\')).replace(/\\["n\\]/g, match => {
                      if (match === '\\n') return '\n'; // 대체 패턴이 \\n인 경우 줄 바꿈으로 대체
                      if (match === '\\"') return '"'; // 대체 패턴이 \\"인 경우 따옴표로 대체
                      if (match === '\\\\') return '\\';
                    })}
                  </Latex>
                </li>
                <br style={{ fontSize: "6px" }} />
              </li> // Render the content of each log
            ))}
          </ul>
        }
        <div>
          To see an original paper PDF, Click:
          <a href={`https://arxiv.org/pdf/${paperId}.pdf`} target="_blank">
            <img
              className='PDF2'
              src="../PDF_1.png"
              alt="PDF2"
            />
          </a>
        </div>
      </div>
    );
  }
}

class ChatBotWithBackend extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      result: '',
      trigger: false,
    };

    this.triggetNext = this.triggetNext.bind(this);
  }

  componentDidMount() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const paperId = urlParams.get('paper_id');
    const accessToken = JSON.parse(localStorage.getItem('accessToken'));

    axios.get(`http://223.130.128.44:8000/api/data/chatbot/${paperId}/${this.props.previousStep.message}`)
      .then(response => {
        const data = response.data;
        if (data) {
          this.setState({ loading: false, result: data });

          const userMessage = {
            "content": this.props.previousStep.message,
            "paper_id": paperId,
            "user_com": false
          };

          const botMessage = {
            "content": removeQuotes(JSON.stringify(data.answer)),
            "paper_id": paperId,
            "user_com": true
          };

          axios.post(`http://223.130.141.170:8000/chat/message`, userMessage, {
            headers: {
              Authorization: `Bearer ${accessToken.access_token}`
            }
          })
            .then(response => {
              console.log(response.data);
              axios.post(`http://223.130.141.170:8000/chat/message`, botMessage, {
                headers: {
                  Authorization: `Bearer ${accessToken.access_token}`
                }
              })
                .then(response => {
                  console.log('Data successfully sent:', response.data);
                })
                .catch(error => {
                  console.error('Error sending machine answer data:', error);
                });
            })
            .catch(error => {
              console.error('Error sending user question data:', error);
            });

        } else {
          this.setState({ loading: false, result: 'Not found.' });
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.setState({ loading: false, result: 'Error fetching data.' });
      });

    this.props.triggerNextStep();
  }

  triggetNext() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep();
    });
  }

  render() {
    const { trigger, loading, result } = this.state;

    return (
      <div>
        {loading ? <Loading /> : <div>
          <Latex>{removeQuotes(JSON.stringify(result.answer, null, 2)).replace(/\\["n\\]/g, match => {
            if (match === '\\n') return '\n'; // 대체 패턴이 \\n인 경우 줄 바꿈으로 대체
            if (match === '\\"') return '"'; // 대체 패턴이 \\"인 경우 따옴표로 대체
            if (match === '\\\\') return '\\'; // 대체 패턴이 \인 경우는 그대로 출력
          })
          }
          </Latex>
          <div style={{ marginTop: "15px" }}>
            {removeQuotes(JSON.stringify(result.Reference)).replace(/\\["n\\]/g, match => {
              if (match === '\\n') return '\n'; // 대체 패턴이 \\n인 경우 줄 바꿈으로 대체
              if (match === '\\"') return '"'; // 대체 패턴이 \\"인 경우 따옴표로 대체
              if (match === '\\\\') return '\\'; // 대체 패턴이 \인 경우는 그대로 출력
            })
            }
          </div>
        </div>}
      </div>
    );
  }
}

ChatBotWithBackend.propTypes = {
  triggerNextStep: PropTypes.func,
};

ChatBotWithBackend.defaultProps = {
  triggerNextStep: undefined,
};

function removeQuotes(str) {
  if (!str) { return "no response found" }
  if (str.charAt(0) === '"' && str.charAt(str.length - 1) === '"') {
    return str.slice(1, -1);
  }
  return str;
}

const ExampleChatBotWithBackend = () => {
  const params = new URLSearchParams(window.location.search);
  const paperId = params.get('paper_id');
  const accessToken = JSON.parse(localStorage.getItem('accessToken'));
  let showOption = true;
  axios.get(`http://223.130.141.170:8000/chat/?paper_id=${paperId}`, {
    headers: {
      Authorization: `Bearer ${accessToken.access_token}`
    }
  })
    .then(response => {
      if (response.data === false || response.data.length === 0) {
        showOption = true;
      }
      else {
        showOption = false;
      }
    }).catch(error => {
      showOption = true;
      console.log(error);
      alert('Fail to connect with Server!');
    })

  return (
    <ChatBot
      headerTitle="Paper Explainer"
      hideUserAvatar={true}
      customStyle={{ textAlign: "left", justifyContent: 'left', width: "95%", maxWidth: "100vw", fontFamily: 'NanumSquareRound', fontSize: "15px", fontWeight: "700", paddingLeft: '25px' }}
      bubbleStyle={{ marginLeft: "5px", maxWidth: "100%", width: "100%", borderRadius: "5px", textAlign: "left", fontSize: "15px", fontFamily: 'NanumSquareRound', fontWeight: "700", paddingLeft: '25px' }}
      bubbleOptionStyle={{ width: "300px", background: "white", color: "#000000" }}
      hidInput={false}
      hideHeader={true}
      width="100%"
      style={{ height: "90vh", boxShadow: "none" }}
      contentStyle={{ height: "82vh", width: "100%", paddingRight: "0px", overflow: "auto" }}
      steps={[
        {
          id: '1',
          component: <PreviousSessionLogs />,
          trigger: () => showOption ? 'option' : 'query' // 로그가 로드되었는지 여부에 따라 다음 단계를 결정
        },
        {
          id: 'option',
          options: [
            { value: 1, label: 'Who is the author of this paper?', trigger: '3' },
            { value: 2, label: 'Can you brief on this paper?', trigger: '3' },
            { value: 3, label: 'What is the proposal of this paper?', trigger: '3' },
          ],
        },
        {
          id: 'query',
          user: true,
          trigger: '3',
        },
        {
          id: '3',
          component: <ChatBotWithBackend />,
          waitAction: true,
          trigger: 'query',
        },
      ]}
    />
  );
}
export default ExampleChatBotWithBackend;