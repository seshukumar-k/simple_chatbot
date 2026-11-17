
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  {
    icon: "💻",
    title: "Learn programming",
    description: "Explain Python, JavaScript and coding concepts",
    prompt: "Explain Python programming for beginners",
  },
  {
    icon: "☁️",
    title: "Cloud computing",
    description: "Learn AWS, DevOps and cloud technologies",
    prompt: "What is AWS cloud computing?",
  },
  {
    icon: "🔌",
    title: "API development",
    description: "Understand REST APIs and HTTP methods",
    prompt: "Explain REST API with a simple example",
  },
  {
    icon: "🤖",
    title: "Artificial Intelligence",
    description: "Explore AI, LLMs and machine learning",
    prompt: "What is artificial intelligence?",
  },
];

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const userMessage = (text ?? message).trim();

    if (!userMessage || loading) return;

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];

    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            history: messages,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Server error");
      }

      const aiReply = result.data.reply;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiReply },
      ]);

    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please check your backend connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    if (loading) return;
    setMessages([]);
    setMessage("");
  };

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">✦</div>
          <h2>SimpleChat</h2>
        </div>

        <button className="new-chat-btn" onClick={newChat}>
          <span>＋</span> New Chat
        </button>

        <div className="sidebar-section">
          <p className="section-title">WORKSPACE</p>

          <div className="sidebar-item active">
            <span>💬</span> Chat Assistant
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">AI</div>
            <div>
              <h4>AI Assistant</h4>
              <p>Claude Powered</p>
            </div>
            <span className="online-dot"></span>
          </div>
        </div>

      </aside>

      {/* Main Content */}
      <main className="main-content">

        {/* Header */}
        <header className="top-header">
          <div>
            <h3>AI Assistant</h3>
            <p><span className="status-dot"></span> Online</p>
          </div>

          <button className="clear-btn" onClick={newChat}>
            ↻ New conversation
          </button>
        </header>

        {/* Chat Area */}
        <section className="chat-area">

          {messages.length === 0 ? (

            <div className="welcome-screen">

              <div className="welcome-icon">✦</div>

              <h1>How can I help you <span>today?</span></h1>

              <p className="welcome-description">
                Your intelligent AI assistant. Ask questions,
                explore ideas and learn something new.
              </p>

              <div className="suggestion-grid">

                {suggestions.map((item) => (
                  <button
                    className="suggestion-card"
                    key={item.title}
                    onClick={() => sendMessage(item.prompt)}
                  >
                    <span className="suggestion-icon">
                      {item.icon}
                    </span>

                    <h4>{item.title}</h4>

                    <p>{item.description}</p>
                  </button>
                ))}

              </div>

            </div>

          ) : (

            <div className="messages-container">

              {messages.map((msg, index) => (
                <div
                  className={`message-row ${msg.role}`}
                  key={index}
                >
                  {msg.role === "assistant" && (
                    <div className="message-avatar">✦</div>
                  )}

                  <div className="message-content">
                    <span className="message-label">
                      {msg.role === "user" ? "You" : "AI Assistant"}
                    </span>

                    <div className="message-bubble">
                        {msg.role === "assistant" ? (
                         <ReactMarkdown remarkPlugins={[remarkGfm]}>
                         {msg.content}
                         </ReactMarkdown>
                          ) : (
                           msg.content
                         )}

                    </div>
                  </div>

                  {msg.role === "user" && (
                    <div className="user-avatar">U</div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="message-row assistant">
                  <div className="message-avatar">✦</div>

                  <div className="message-content">
                    <span className="message-label">AI Assistant</span>

                    <div className="message-bubble typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />

            </div>

          )}

        </section>

        {/* Input Area */}
        <footer className="input-section">

          <div className="input-container">

            <textarea
              placeholder="Message SimpleChat..."
              value={message}
              rows={1}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={loading || !message.trim()}
              aria-label="Send message"
            >
              ➤
            </button>

          </div>

          <p className="input-note">
            Powered by Claude AI · AI responses may not always be accurate.
          </p>

        </footer>

      </main>

    </div>
  );
}

export default App;
