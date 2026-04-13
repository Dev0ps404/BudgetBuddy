import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FiMessageSquare, FiX, FiSend, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";

const AIAssistant = () => {
  const createIntroMessage = () => ({
    type: "ai",
    text: "Hi! I'm BudgetBuddy AI. I can help with budgets, savings, and everyday questions too. Tell me what you're feeling or trying to solve.",
    timestamp: new Date(),
    isIntro: true,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [createIntroMessage()]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (messageOverride) => {
    const messageText =
      typeof messageOverride === "string"
        ? messageOverride.trim()
        : inputValue.trim();

    if (!messageText) return;

    // Add user message to chat
    const userMessage = {
      type: "user",
      text: messageText,
      timestamp: new Date(),
    };

    const conversationHistory = [...messages, userMessage]
      .filter(
        (msg) =>
          (msg.type === "user" || msg.type === "ai") &&
          !msg.error &&
          !msg.isIntro,
      )
      .slice(-12)
      .map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.text,
      }));

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await axios.post("/ai/query", {
        query: messageText,
        history: conversationHistory,
      });

      const aiMessage = {
        type: "ai",
        text: response?.data?.reply || "I could not generate a response.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const isUnauthorized = error.response?.status === 401;
      const errorMessage = {
        type: "ai",
        text: isUnauthorized
          ? "Please log in to get personalized AI answers from your expense data."
          : "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error(
        isUnauthorized
          ? "Login required for AI insights"
          : "Failed to get AI response",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([createIntroMessage()]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-6 z-40 w-14 h-14 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-full shadow-lg hover:shadow-2xl shadow-primary-600/40 flex items-center justify-center text-white transform hover:scale-110 transition-all duration-300 group"
        >
          <FiMessageSquare
            size={24}
            className="group-hover:rotate-12 transition-transform"
          />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white font-bold flex items-center justify-center text-[10px] animate-pulse">
            AI
          </span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-full sm:w-80 max-w-[calc(100vw-32px)] h-96 sm:h-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-indigo-700 p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <FiMessageSquare className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">ExpenseIQ</h3>
                <p className="text-white/70 text-xs">Smart Expense Analysis</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-all ${
                    msg.type === "user"
                      ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-br-none shadow-md hover:shadow-lg"
                      : msg.error
                        ? "bg-red-50 text-red-700 rounded-bl-none border border-red-200"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm hover:shadow-md"
                  }`}
                >
                  <p className="break-words">{msg.text}</p>
                  <p
                    className={`text-xs mt-1.5 font-medium ${
                      msg.type === "user"
                        ? "text-white/70"
                        : msg.error
                          ? "text-red-600"
                          : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl rounded-bl-none shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce delay-200"></div>
                    </div>
                    <span className="text-xs text-slate-500 ml-1">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 p-3 sm:p-4 bg-white space-y-3">
            {/* Quick Suggestions */}
            {!isLoading && messages.length <= 1 && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleSendMessage("Where did I spend the most?");
                  }}
                  className="text-xs px-2 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors font-medium border border-primary-200"
                >
                  💰 Top Spending
                </button>
                <button
                  onClick={() => {
                    handleSendMessage("Show my budget status");
                  }}
                  className="text-xs px-2 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium border border-indigo-200"
                >
                  📊 Budget Status
                </button>
              </div>
            )}

            {/* Input Field */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything..."
                className="flex-1 bg-slate-100 border border-slate-300 rounded-full px-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-colors shadow-md hover:shadow-lg"
              >
                <FiSend size={18} />
              </button>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center">
              <button
                onClick={clearChat}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 px-2 py-1 hover:bg-slate-100 rounded transition-colors"
              >
                <FiRefreshCw size={13} /> Clear
              </button>
              <p className="text-[10px] text-slate-400">
                ✨ ChatGPT-like AI for your finances
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
