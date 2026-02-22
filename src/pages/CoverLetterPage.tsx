import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, Check, Lock, Send, Sparkles, User, Bot, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-cover-letter`;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const SUGGESTIONS = [
  "Write a cover letter for a Senior React Developer position",
  "Generate a formal cover letter for a Product Manager role at a startup",
  "Create a cover letter emphasizing my 5 years of Python and AWS experience",
  "Draft a concise cover letter for a UX Designer position",
];

export default function CoverLetterPage() {
  const { user, profile, loading } = useAuthContext();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isPremium = profile?.is_premium === true;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-14">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user || !isPremium) {
    return (
      <div className="min-h-screen bg-background pt-14">
        <Header />
        <div className="container mx-auto px-4 py-20 max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Pro Feature</h1>
          <p className="text-muted-foreground mb-6">
            The AI Cover Letter Generator is available exclusively for Pro and Agency subscribers. Upgrade your plan to unlock this feature.
          </p>
          <div className="flex gap-3 justify-center">
            {!user ? (
              <Button onClick={() => navigate("/auth")}>Sign in</Button>
            ) : (
              <Button onClick={() => navigate("/settings")}>Upgrade to Pro</Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const streamResponse = async (body: Record<string, unknown>, onText: (full: string) => void) => {
    abortRef.current = new AbortController();
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify(body),
      signal: abortRef.current.signal,
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Failed to generate" }));
      throw new Error(err.error || "Failed to generate cover letter");
    }
    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let fullText = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });
      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") { streamDone = true; break; }
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) { fullText += content; onText(fullText); }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  const getLastAssistantLetter = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i].content;
    }
    return null;
  };

  const handleSend = async (text?: string) => {
    const prompt = (text || input).trim();
    if (!prompt || isGenerating) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: prompt };
    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "", isStreaming: true };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsGenerating(true);

    // Auto-resize textarea back
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const existingLetter = getLastAssistantLetter();
    const isRefine = !!existingLetter;

    try {
      const body = isRefine
        ? { jobDescription: prompt, refinePrompt: prompt, existingLetter }
        : { jobDescription: prompt };

      await streamResponse(body, (fullText) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: fullText } : m))
        );
      });

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m))
      );
    } catch (e: any) {
      if (e.name !== "AbortError") {
        toast.error(e.message || "Something went wrong.");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: "Sorry, something went wrong. Please try again.", isStreaming: false } : m
          )
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="min-h-screen bg-background pt-14 flex flex-col">
      <Header />

      {/* Messages area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative">
        {isEmpty ? (
          /* Empty state — centered like ChatGPT */
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold mb-2 text-center">
              Cover Letter Generator
            </h1>
            <p className="text-muted-foreground text-center max-w-md mb-10">
              Paste a job description or tell me about the role, and I'll craft a tailored cover letter for you.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="text-left p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors text-sm text-foreground/80 leading-relaxed"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Conversation thread */
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-3 items-start group">
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    {msg.role === "user" ? "You" : "ProGene"}
                  </p>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                    {msg.content}
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
                    )}
                  </div>

                  {/* Copy button for assistant messages */}
                  {msg.role === "assistant" && msg.content && !msg.isStreaming && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {copiedId === msg.id ? (
                        <><Check className="h-3.5 w-3.5" /> Copied</>
                      ) : (
                        <><Copy className="h-3.5 w-3.5" /> Copy</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-20 bg-card border border-border shadow-lg rounded-full p-2 hover:bg-accent transition-colors"
          >
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Input bar — fixed at bottom */}
      <div className="sticky bottom-0 bg-background border-t border-border">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-end gap-2 bg-card border border-border rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-background transition-shadow">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={autoResize}
              onKeyDown={handleKeyDown}
              placeholder={isEmpty ? "Paste a job description or describe the role..." : "Ask to refine — e.g. make it shorter, more formal, add leadership skills..."}
              className="flex-1 border-0 bg-transparent shadow-none resize-none p-0 min-h-[24px] max-h-[200px] focus-visible:ring-0 text-sm placeholder:text-muted-foreground/60"
              rows={1}
              disabled={isGenerating}
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || isGenerating}
              className="flex-shrink-0 h-8 w-8 rounded-lg"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            ProGene AI may produce inaccurate information. Review before sending.
          </p>
        </div>
      </div>
    </div>
  );
}
