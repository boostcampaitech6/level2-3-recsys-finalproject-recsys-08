import "./App.css";
import "./styles.css";
import UploadForm from './pages/UploadForm';
import Chat from "./pages/chat";
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { AuthProvider } from './components/AuthContext';
import Navbar from "./Navbar";

import { Routes, Route, BrowserRouter } from "react-router-dom";

export default function App() {

  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<UploadForm />} />
            <Route path="/chatbot" element={<Chat />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}
// paperId, query -> query only