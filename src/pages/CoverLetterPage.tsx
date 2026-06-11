import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, Copy, Check, Lock, Send, Sparkles, User, Bot, ArrowDown, Plus,
  Square, RefreshCw, Download, FileText, Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import jsPDF from "jspdf";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-cover-letter`;
const MAX_CHARS = 5000;
const PROFILE_KEY = "progene_cl_profile";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const ALL_SUGGESTIONS = [
  "Write a cover letter for a Senior React Developer position",
  "Generate a formal cover letter for a Product Manager role at a startup",
  "Create a cover letter emphasizing my 5 years of Python and AWS experience",
  "Draft a concise cover letter for a UX Designer position",
  "Write a cover letter for a Staff Engineer role at a fintech company",
  "Create a cover letter for a Marketing Lead position at a SaaS startup",
  "Draft a cover letter for a Data Scientist role focused on ML",
  "Generate a cover letter for a Customer Success Manager position",
  "Write a cover letter for a DevOps Engineer with Kubernetes experience",
  "Create a cover letter for a Junior Designer applying to an agency",
];

const REFINE_CHIPS = [
  "Make it shorter",
  "More formal tone",
  "Add leadership angle",
  "Tailor for a startup",
  "Emphasize impact & metrics",
];

interface SavedProfile {
  name: string;
  skills: string;
}

function pickSuggestions(): string[] {
  const shuffled = [...ALL_SUGGESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
}

export default function CoverLetterPage() {
  const { user, profile, loading } = useAuthContext();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [suggestions] = useState<string[]>(() => pickSuggestions());
  const [profileOpen, setProfileOpen] = useState(false);
  const [savedProfile, setSavedProfile] = useState<SavedProfile>(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* noop */ }
    return { name: "", skills: "" };
  });
  const [profileDraft, setProfileDraft] = useState<SavedProfile>(savedProfile);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastPromptRef = useRef<string>("");

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

  const streamResponse = async (
    body: Record<string, unknown>,
    onText: (full: string) => void,
  ) => {
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

  const handleSend = async (text?: string, opts?: { regenerate?: boolean }) => {
    const prompt = (text ?? input).trim();
    if (!prompt || isGenerating) return;
    if (prompt.length > MAX_CHARS) {
      toast.error(`Message too long. Max ${MAX_CHARS} characters.`);
      return;
    }

    lastPromptRef.current = prompt;

    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "", isStreaming: true };

    if (opts?.regenerate) {
      // Replace the last assistant message instead of appending a new user turn
      setMessages((prev) => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].role === "assistant") {
            next.splice(i, 1);
            break;
          }
        }
        return [...next, assistantMsg];
      });
    } else {
      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: prompt };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
    }
    setIsGenerating(true);

    // Auto-resize textarea back
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const existingLetter = opts?.regenerate ? null : getLastAssistantLetter();
    const isRefine = !!existingLetter;

    try {
      const baseBody: Record<string, unknown> = {};
      if (savedProfile.name.trim()) baseBody.userName = savedProfile.name.trim();
      if (savedProfile.skills.trim()) baseBody.userSkills = savedProfile.skills.trim();

      const body = isRefine
        ? { jobDescription: prompt, refinePrompt: prompt, existingLetter }
        : { ...baseBody, jobDescription: prompt };

      await streamResponse(body, (fullText) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: fullText } : m))
        );
      });

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m))
      );
    } catch (e: any) {
      if (e.name === "AbortError") {
        // Keep the partial text but stop the cursor and append a stopped marker
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: (m.content || "") + (m.content ? "\n\n_Stopped._" : "_Stopped._"),
                  isStreaming: false,
                }
              : m
          )
        );
      } else {
        toast.error(e.message || "Something went wrong.");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: "Sorry, something went wrong. Please try again.", isStreaming: false } : m
          )
        );
      }
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  const handleRegenerate = () => {
    const prompt = lastPromptRef.current;
    if (!prompt) return;
    handleSend(prompt, { regenerate: true });
  };

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadTxt = (content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPdf = (content: string) => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const margin = 56;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    // Strip markdown emphasis markers for PDF
    const clean = content
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/_(.+?)_/g, "$1");
    const lines = doc.splitTextToSize(clean, maxWidth) as string[];
    let y = margin;
    const lineHeight = 16;
    for (const line of lines) {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }
    doc.save(`cover-letter-${Date.now()}.pdf`);
  };

  const downloadDocx = (content: string) => {
    // Minimal HTML-as-.doc — Word opens this natively
    const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Cover Letter</title></head><body><pre style="font-family: Calibri, sans-serif; font-size: 11pt; white-space: pre-wrap;">${content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</pre></body></html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${Date.now()}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveProfile = () => {
    setSavedProfile(profileDraft);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profileDraft));
    } catch { /* noop */ }
    setProfileOpen(false);
    toast.success("Profile saved — it'll be used on your next letter.");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value.slice(0, MAX_CHARS);
    setInput(v);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  const isEmpty = messages.length === 0;
  const hasAssistantReply = messages.some((m) => m.role === "assistant" && m.content && !m.isStreaming);
  const remaining = MAX_CHARS - input.length;

  return (
    <div className="min-h-screen bg-background pt-14 flex flex-col">
      <Header />

      {/* Top toolbar */}
      {!isEmpty && (
        <div className="max-w-3xl mx-auto w-full px-4 pt-3 pb-1 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setProfileDraft(savedProfile); setProfileOpen(true); }}
            className="gap-1.5"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Profile</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setMessages([]); setInput(""); }}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        </div>
      )}

      {/* Messages area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative">
        {isEmpty ? (
          /* Empty state — centered like ChatGPT */
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4 py-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold mb-2 text-center">
              Cover Letter Generator
            </h1>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Paste a job description or tell me about the role, and I'll craft a tailored cover letter for you.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setProfileDraft(savedProfile); setProfileOpen(true); }}
              className="gap-1.5 mb-8"
            >
              <Settings2 className="h-3.5 w-3.5" />
              {savedProfile.name || savedProfile.skills ? "Edit your profile" : "Add your profile for better results"}
            </Button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="text-left p-4 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-sm text-foreground/80 leading-relaxed min-h-[64px] animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms` }}
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
              <div key={msg.id} className="flex gap-3 items-start group animate-fade-in">
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
                  <div className="text-sm leading-relaxed text-foreground prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:mt-3 prose-headings:mb-2 prose-ul:my-2 prose-ol:my-2">
                    {msg.role === "assistant" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content || (msg.isStreaming ? "_Thinking..._" : "")}
                      </ReactMarkdown>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                    {msg.isStreaming && (
                      <span className="inline-flex items-center gap-1 ml-1 align-middle">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "120ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "240ms" }} />
                      </span>
                    )}
                  </div>

                  {/* Actions for assistant messages */}
                  {msg.role === "assistant" && msg.content && !msg.isStreaming && (
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <><Check className="h-3.5 w-3.5" /> Copied</>
                        ) : (
                          <><Copy className="h-3.5 w-3.5" /> Copy</>
                        )}
                      </button>
                      <button
                        onClick={handleRegenerate}
                        disabled={isGenerating}
                        className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                            <Download className="h-3.5 w-3.5" /> Export
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-44">
                          <DropdownMenuItem onClick={() => downloadPdf(msg.content)}>
                            <FileText className="h-4 w-4 mr-2" /> Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadDocx(msg.content)}>
                            <FileText className="h-4 w-4 mr-2" /> Download DOCX
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadTxt(msg.content)}>
                            <FileText className="h-4 w-4 mr-2" /> Download TXT
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
      <div className="sticky bottom-0 bg-background border-t border-border" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="max-w-3xl mx-auto px-4 py-3 sm:py-4">
          {hasAssistantReply && !isGenerating && (
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {REFINE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-foreground/80"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2 bg-card border border-border rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-background transition-shadow">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={autoResize}
              onKeyDown={handleKeyDown}
              placeholder={isEmpty ? "Paste a job description or describe the role..." : "Ask to refine — e.g. make it shorter, more formal, add leadership skills..."}
              className="flex-1 border-0 bg-transparent shadow-none resize-none p-0 min-h-[24px] max-h-[200px] focus-visible:ring-0 text-sm placeholder:text-muted-foreground/60"
              rows={1}
              maxLength={MAX_CHARS}
            />
            {isGenerating ? (
              <Button
                size="icon"
                variant="destructive"
                onClick={handleStop}
                className="flex-shrink-0 h-8 w-8 rounded-lg"
                aria-label="Stop generating"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="flex-shrink-0 h-8 w-8 rounded-lg"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">ProGene AI may produce inaccurate information. Review before sending.</span>
            <span className="sm:hidden">Review AI output before sending.</span>
            <span className={remaining < 200 ? "text-destructive" : ""}>
              {input.length}/{MAX_CHARS}
            </span>
          </div>
        </div>
      </div>

      {/* Profile dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your profile</DialogTitle>
            <DialogDescription>
              Saved locally on this device. We'll auto-inject these into every new cover letter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cl-name">Your name</Label>
              <Input
                id="cl-name"
                value={profileDraft.name}
                onChange={(e) => setProfileDraft((p) => ({ ...p, name: e.target.value.slice(0, 100) }))}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cl-skills">Skills & experience</Label>
              <Textarea
                id="cl-skills"
                value={profileDraft.skills}
                onChange={(e) => setProfileDraft((p) => ({ ...p, skills: e.target.value.slice(0, 1000) }))}
                placeholder="e.g. 6 years of React/TypeScript, led a team of 4 engineers, shipped 3 SaaS products from 0 to 1..."
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">{profileDraft.skills.length}/1000</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileOpen(false)}>Cancel</Button>
            <Button onClick={saveProfile}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
