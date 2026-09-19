import { useState } from "react";
import {
  Send,
  BarChart3,
  Loader2,
  Home,
  Trash2,
} from "lucide-react";
import "./index.css";

const API_URL = "https://monday-bi-agent-co7t.onrender.com";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function askQuestion(e) {
    e.preventDefault();

    if (!question.trim() || loading) return;

    const userQuestion = question.trim();

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: userQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/agent/execute?question=${encodeURIComponent(
          userQuestion
        )}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to process question"
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          text: data.answer,
          plan: data.plan,
          result: data.result,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          text: error.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Clear entire conversation
  function clearChat() {
    if (loading) return;

    setMessages([]);
    setQuestion("");
  }

  // Go back to home
  function goHome() {
    if (loading) return;

    setMessages([]);
    setQuestion("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="app">

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="header">

        <div className="logo">

          <div className="logoIcon">
            <BarChart3 size={22} />
          </div>

          <div>
            <h1>Monday BI Agent</h1>
            <p>AI-powered business intelligence</p>
          </div>

        </div>


        {/* HEADER ACTIONS */}

        <div className="headerActions">

          <button
            className="headerButton"
            onClick={goHome}
            disabled={loading}
            title="Go to Home"
            type="button"
          >
            <Home size={18} />
            <span>Home</span>
          </button>


          <button
            className="headerButton"
            onClick={clearChat}
            disabled={
              loading || messages.length === 0
            }
            title="Clear conversation"
            type="button"
          >
            <Trash2 size={18} />
            <span>Clear</span>
          </button>

        </div>

      </header>


      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="container">

        <section className="hero">

          <h2>Ask your business data</h2>

          <p>
            Ask questions about your Monday.com deals
            and work orders using natural language.
          </p>

        </section>


        {/* =========================================
            CHAT
        ========================================= */}

        <section className="chat">

          {messages.length === 0 && (

            <div className="welcome">

              <h3>
                What would you like to know?
              </h3>


              <div className="examples">

                <button
                  type="button"
                  onClick={() =>
                    setQuestion(
                      "What is the total deal value?"
                    )
                  }
                >
                  Total deal value
                </button>


                <button
                  type="button"
                  onClick={() =>
                    setQuestion(
                      "Show me the top 5 deals by value"
                    )
                  }
                >
                  Top 5 deals
                </button>


                <button
                  type="button"
                  onClick={() =>
                    setQuestion(
                      "Show me the breakdown of deals by status"
                    )
                  }
                >
                  Deals by status
                </button>


                <button
                  type="button"
                  onClick={() =>
                    setQuestion(
                      "How many deals do we have?"
                    )
                  }
                >
                  Total deals
                </button>

              </div>

            </div>

          )}


          {/* =========================================
              MESSAGES
          ========================================= */}

          {messages.map((message, index) => (

            <div
              key={index}
              className={`message ${message.type}`}
            >

              <div className="messageLabel">

                {message.type === "user"
                  ? "You"
                  : message.type === "error"
                  ? "Error"
                  : "BI Agent"}

              </div>


              <div className="messageText">
                {message.text}
              </div>


              {message.plan && (

                <div className="plan">

                  <span>
                    Tool: {message.plan.tool}
                  </span>


                  {message.plan.dataset && (

                    <span>
                      Dataset: {message.plan.dataset}
                    </span>

                  )}

                </div>

              )}

            </div>

          ))}


          {/* =========================================
              LOADING
          ========================================= */}

          {loading && (

            <div className="message assistant">

              <div className="messageLabel">
                BI Agent
              </div>


              <div className="loading">

                <Loader2
                  size={18}
                  className="spinner"
                />

                Analyzing your data...

              </div>

            </div>

          )}

        </section>


        {/* =========================================
            INPUT
        ========================================= */}

        <form
          className="inputArea"
          onSubmit={askQuestion}
        >

          <input
            type="text"
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
            }
            placeholder="Ask something about your business data..."
            disabled={loading}
          />


          <button
            type="submit"
            disabled={
              loading || !question.trim()
            }
            title="Send question"
          >

            {loading ? (

              <Loader2
                size={20}
                className="spinner"
              />

            ) : (

              <Send size={20} />

            )}

          </button>

        </form>


        {/* =========================================
            BOTTOM CLEAR BUTTON
        ========================================= */}

        {messages.length > 0 && !loading && (

          <div className="bottomActions">

            <button
              type="button"
              onClick={clearChat}
              className="clearChatButton"
            >

              <Trash2 size={16} />

              Clear conversation

            </button>

          </div>

        )}

      </main>

    </div>
  );
}

export default App;