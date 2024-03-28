import React from 'react';
import { useNavigate } from 'react-router-dom';
import './chat.css'
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex'
import ReactHtmlParser from 'react-html-parser';


function PaperList(props) {
  const { papers } = props;
  const navigate = useNavigate();

  // papers가 배열이 아니거나 null 또는 undefined인 경우 빈 배열로 초기화합니다.
  const paperArray = Array.isArray(papers) ? papers : [];

  return (
    <div style={{ position: "absolute", top: "180px", left: "5%", right: "50%" }}>
      <table style={{ background: "#F0EDCF", borderRadius: "5px", maxWidth: "600px" }}>
        <thead>
          <tr style={{ border: "1px solid", borderColor: "white", borderRadius: "5px", color: "#000000", background: "#40A2D8" }}>
            <th style={{ borderRadius: "5px", padding: "5px" }}>Title</th>
            <th style={{ borderRadius: "5px", padding: "5px" }}>Authors</th>
            <th style={{ borderRadius: "5px", padding: "5px" }}>Year</th>
            <th style={{ borderRadius: "5px", padding: "5px" , width: "100px"}}>Ask to Alex</th>
          </tr>
        </thead>
        <tbody>
          {paperArray.map(paper => (
            <tr key={paper.id}>
              <td onClick={() => navigate(`/chatbot?paper_id=${paper.id}`)} style={{ padding: "5px", cursor: "pointer" }}>
                <Latex>{ReactHtmlParser(paper.title)}</Latex>
              </td>
              <td style={{ padding: "5px" }}>{paper.author1}</td>
              <td style={{ padding: "5px" }}>{paper.published_year}</td>
              <td onClick={() => navigate(`/chatbot?paper_id=${paper.id}`)} style={{ padding: "5px", cursor: "pointer" }}>
                <img
                  className='PDF1'
                  src="../Alex.webp"
                  alt="PDF" />
              </td>
              {/* <td onClick={() => navigate(`/chatbot?paper_id=${paper.id}`)} style={{ padding: "5px", cursor: "pointer" }}>
                <img
                  className='PDF1'
                  src="../chatbot.png"
                  alt="PDF" />
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PaperList;
