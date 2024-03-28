import ExampleChatBotWithBackend from '../components/ExampleChatBotWithBackend';
import CustomSidebar from '../components/Sidebar';

function Chat() {
  return (
    <div>
      <div className='sidebar' style={{ position: 'absolute', width: "251px", height: "90vh", background: "#F0EDCF", overflow: "auto" }}>
        <CustomSidebar />
      </div>
      <div className='bot' style={{ float: "center", zIndex: "1", marginLeft: "250px", marginRight: "0%" }}>
        <ExampleChatBotWithBackend />
      </div>
    </div>
  );
}

export default Chat;
