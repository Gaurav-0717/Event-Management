import { useEffect, useRef, useState } from "react";

import { Bot, Send, X, Loader2, Sparkles, AlertCircle } from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { sendAssistantMessage } from "../services/aiAssistantService";

const STARTER_PROMPTS = [
  {
    label: "Optimize my budget",
    message:
      "How can I optimize my event budget based on my current EventWise event details?",
  },
  {
    label: "Show my pending tasks",
    message:
      "What tasks do I currently have, and which tasks should I prioritize?",
  },
  {
    label: "Plan my timeline",
    message:
      "Help me organize my event timeline based on my current event details.",
  },
  {
    label: "Improve my event plan",
    message:
      "How can I improve my current event plan based on the information available in EventWise?",
  },
  {
    label: "Help with vendors",
    message:
      "Explain how the currently matched vendors relate to my event requirements.",
  },
  {
    label: "Give me recommendations",
    message:
      "Give me practical recommendations for planning my event based on my current EventWise data.",
  },
];

const AIAssistant = ({ eventId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // ============================================================
  // Scroll to latest message
  // ============================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // ============================================================
  // Send Message
  // ============================================================

  const handleSend = async (customMessage = null) => {
    const textToSend =
      typeof customMessage === "string" ? customMessage.trim() : message.trim();

    if (!textToSend || isLoading || !eventId) {
      return;
    }

    // Add user message immediately
    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: textToSend,
      },
    ]);

    setMessage("");
    setIsLoading(true);

    try {
      const response = await sendAssistantMessage(eventId, textToSend);

      const assistantMessage =
        typeof response?.message === "string"
          ? response.message
          : "I couldn't generate a response.";

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: assistantMessage,
          source: response?.source || "gemini",
          aiUnavailable: response?.aiUnavailable === true,
        },
      ]);
    } catch (error) {
      console.error("AI Assistant request failed:", error);

      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: "error",
          content: error?.message || "Unable to contact the AI Assistant.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // Starter Prompt
  // ============================================================

  const handleStarterPrompt = (prompt) => {
    handleSend(prompt.message);
  };

  // ============================================================
  // Keyboard Handler
  // ============================================================

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // ============================================================
  // Markdown Renderer
  // ============================================================

  const renderMarkdown = (content) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-2 mt-1 text-base font-bold text-white">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-2 mt-4 text-[15px] font-bold text-white">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-1.5 mt-3 text-sm font-semibold text-indigo-300">
              {children}
            </h3>
          ),

          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,

          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>
          ),

          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>
          ),

          li: ({ children }) => <li className="pl-1">{children}</li>,

          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),

          em: ({ children }) => <em className="text-slate-300">{children}</em>,

          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-indigo-500 pl-3 text-slate-400">
              {children}
            </blockquote>
          ),

          hr: () => <hr className="my-3 border-slate-700" />,

          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 underline hover:text-indigo-300"
            >
              {children}
            </a>
          ),

          code: ({ children, className }) => {
            const isBlockCode = className?.includes("language-");

            if (isBlockCode) {
              return (
                <pre className="my-3 overflow-x-auto rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-300">
                  <code>{children}</code>
                </pre>
              );
            }

            return (
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-indigo-300">
                {children}
              </code>
            );
          },

          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-slate-700">
              <table className="w-full border-collapse text-xs">
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="bg-slate-800">{children}</thead>
          ),

          tbody: ({ children }) => <tbody>{children}</tbody>,

          tr: ({ children }) => (
            <tr className="border-b border-slate-700 last:border-b-0">
              {children}
            </tr>
          ),

          th: ({ children }) => (
            <th className="border-r border-slate-700 px-3 py-2 text-left font-semibold text-white last:border-r-0">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="border-r border-slate-700 px-3 py-2 text-slate-300 last:border-r-0">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  // ============================================================
  // No Event ID
  // ============================================================

  if (!eventId) {
    return null;
  }

  return (
    <>
      {/* ====================================================== */}
      {/* Floating AI Button */}
      {/* ====================================================== */}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl transition-all duration-200 hover:scale-105 hover:bg-indigo-500"
          aria-label="Open EventWise AI Assistant"
          title="EventWise AI Assistant"
        >
          <Sparkles size={23} />
        </button>
      )}

      {/* ====================================================== */}
      {/* Chat Window */}
      {/* ====================================================== */}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[420px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl">
          {/* ================================================== */}
          {/* Header */}
          {/* ================================================== */}

          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Bot size={19} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-white">
                  EventWise AI
                </h2>

                <p className="text-xs text-slate-400">
                  Your event planning assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              aria-label="Close AI Assistant"
            >
              <X size={18} />
            </button>
          </div>

          {/* ================================================== */}
          {/* Messages */}
          {/* ================================================== */}

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {/* ================================================= */}
            {/* Initial Assistant Message */}
            {/* ================================================= */}

            {messages.length === 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="mb-2 flex items-center gap-2 text-indigo-400">
                  <Sparkles size={17} />

                  <span className="text-sm font-medium">EventWise AI</span>
                </div>

                <p className="text-sm leading-6 text-slate-300">
                  Hi! I'm your EventWise planning assistant. I can help you
                  understand your event, budget, tasks, timeline, AI plan, and
                  matched vendors.
                </p>

                <p className="mt-3 text-xs font-medium text-slate-400">
                  What would you like help with?
                </p>

                {/* ============================================= */}
                {/* Starter Prompts */}
                {/* ============================================= */}

                <div className="mt-3 grid grid-cols-1 gap-2">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.label}
                      type="button"
                      onClick={() => handleStarterPrompt(prompt)}
                      disabled={isLoading}
                      className="group flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-left text-xs text-slate-300 transition hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span>{prompt.label}</span>

                      <span className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-indigo-400">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* Conversation Messages */}
            {/* ================================================= */}

            {messages.map((item) => {
              const isUser = item.role === "user";

              const isError = item.role === "error";

              return (
                <div
                  key={item.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      isUser
                        ? "rounded-br-md bg-indigo-600 text-white"
                        : isError
                          ? "rounded-bl-md border border-red-500/30 bg-red-500/10 text-red-300"
                          : "rounded-bl-md border border-slate-800 bg-slate-900 text-slate-200"
                    }`}
                  >
                    {/* Error Header */}

                    {isError && (
                      <div className="mb-1 flex items-center gap-2 text-xs font-medium">
                        <AlertCircle size={14} />

                        <span>Assistant error</span>
                      </div>
                    )}

                    {/* User Message */}

                    {isUser ? (
                      <div className="whitespace-pre-wrap break-words">
                        {item.content}
                      </div>
                    ) : isError ? (
                      /* Error Message */
                      <div className="whitespace-pre-wrap break-words">
                        {item.content}
                      </div>
                    ) : (
                      /* AI Markdown Message */
                      <div className="break-words">
                        {renderMarkdown(item.content)}
                      </div>
                    )}

                    {/* Local Fallback Notice */}

                    {!isUser &&
                      !isError &&
                      item.source === "local-fallback" && (
                        <div className="mt-3 border-t border-slate-700 pt-2 text-xs leading-5 text-amber-400">
                          Gemini is temporarily unavailable. This response uses
                          the information currently available in EventWise.
                        </div>
                      )}
                  </div>
                </div>
              );
            })}

            {/* ================================================= */}
            {/* Loading Message */}
            {/* ================================================= */}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-400">
                  <Loader2 size={16} className="animate-spin" />

                  <span>EventWise AI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ================================================== */}
          {/* Input */}
          {/* ================================================== */}

          <div className="border-t border-slate-800 bg-slate-900 p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your event..."
                rows={2}
                maxLength={2000}
                disabled={isLoading}
                className="min-h-[46px] flex-1 resize-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!message.trim() || isLoading}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>

            <p className="mt-2 text-[11px] text-slate-500">
              Enter to send · Shift + Enter for a new line
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
