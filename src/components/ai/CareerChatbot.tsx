import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  KeyRound,
  Loader2,
  RotateCcw,
  Send,
  Settings2,
  Sparkles,
  User,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { askCareerSetuAI, AIProvider } from "@/lib/ai-assistant-service";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  source?: string;
}

const PRESET_QUESTIONS = [
  "Top 10 colleges for BSc IT",
  "What is LPA in salary?",
  "CTC vs In-Hand Salary difference",
  "How to prepare for JEE Main & IIT?",
  "Top 10 colleges for BCA in India",
  "Top 10 colleges for B.Tech CSE",
  "How to crack UPSC CSE IAS exam?",
  "How to start a startup in India?",
];

// Rich Formatter Component to render tables, headings, bold, lists, and codeblocks cleanly
function FormattedChatMessage({ text }: { text: string }) {
  // Check if text has a markdown table
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let tableRows: string[] = [];
  let inTable = false;

  const flushTable = (key: string) => {
    if (tableRows.length > 0) {
      elements.push(<MarkdownTable key={key} lines={[...tableRows]} />);
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i] ?? "";
    const trimmed = rawLine.trim();

    // Check table line
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      inTable = true;
      tableRows.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable(`table-${i}`);
    }

    if (!trimmed) {
      elements.push(<div key={`space-${i}`} className="h-1.5" />);
      continue;
    }

    // Code block
    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i]?.trim().startsWith("```")) {
        codeLines.push(lines[i] ?? "");
        i++;
      }
      elements.push(
        <div key={`code-${i}`} className="my-2 rounded-xl bg-muted/80 p-3 font-mono text-[11px] sm:text-xs overflow-x-auto text-foreground border border-border/50">
          <pre>{codeLines.join("\n")}</pre>
        </div>
      );
      continue;
    }

    // Horizontal Rule
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      elements.push(<hr key={`hr-${i}`} className="my-2.5 border-border/50" />);
      continue;
    }

    // Headings (### or ## or #)
    if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
      const cleanHeading = trimmed.replace(/^#+\s*/, "").replace(/[💡🤖🌐⚖️🏛️🚀🛡️🩺🎓⏱️]/g, "").trim();
      elements.push(
        <div
          key={`h-${i}`}
          className="font-bold text-sm sm:text-base text-foreground pt-1.5 pb-0.5 border-b border-border/40 flex items-center gap-1.5"
        >
          <span className="size-2 rounded-full bg-primary inline-block" />
          <span>{cleanHeading}</span>
        </div>
      );
      continue;
    }

    // Bullet points (- or *)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const content = trimmed.substring(2);
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 pl-1 my-0.5">
          <span className="mt-1.5 size-1.5 rounded-full bg-primary/70 shrink-0" />
          <span className="text-foreground/90">{parseInlineFormatting(content)}</span>
        </div>
      );
      continue;
    }

    // Numbered lists (1. , 2. )
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      const num = numberedMatch[1] ?? "1";
      const content = numberedMatch[2] ?? "";
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2 pl-0.5 my-1">
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-bold text-[11px]">
            {num}
          </span>
          <div className="text-foreground font-normal flex-1 pt-0.5">
            {parseInlineFormatting(content)}
          </div>
        </div>
      );
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${i}`} className="text-foreground/90 my-0.5">
        {parseInlineFormatting(trimmed)}
      </p>
    );
  }

  flushTable("final-table");

  return <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">{elements}</div>;
}

// Markdown Table Renderer
function MarkdownTable({ lines }: { lines: string[] }) {
  if (lines.length < 2) return null;

  const headerLine = lines[0] ?? "";
  const headerCells = headerLine
    .split("|")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  const rowLines = lines.slice(2); // skip separator line (e.g. |---|---|)

  return (
    <div className="my-2.5 overflow-x-auto rounded-xl border border-border bg-card/60 shadow-xs">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-border bg-accent/40">
            {headerCells.map((h, idx) => (
              <th key={idx} className="px-3 py-2 font-semibold text-foreground">
                {parseInlineFormatting(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowLines.map((row, rIdx) => {
            const cells = row
              .split("|")
              .map((c) => c.trim())
              .filter((c) => c.length > 0);
            return (
              <tr key={rIdx} className="border-b border-border/30 hover:bg-accent/20">
                {cells.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-2 text-foreground/90">
                    {parseInlineFormatting(cell)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Parses **bold**, *italic*, and `code` inline spans cleanly
function parseInlineFormatting(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      return (
        <em key={i} className="italic text-foreground/90">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded-md bg-muted text-primary font-mono text-[11px] font-semibold">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function CareerChatbot({ onClose }: { onClose?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: `### Welcome to CareerSetu AI Assistant! ✨
I am your smart career, academics, salary, and exam mentor powered by real LLM intelligence.

Ask me **any question** — from what is LPA & salary breakdowns, to competitive exams (JEE, NEET, UPSC, GATE, CAT), software engineering roadmaps, startup guidelines, and colleges!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      source: "CareerSetu Neural AI",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings State
  const [aiProvider, setAiProvider] = useState<AIProvider>("auto");
  const [customGeminiKey, setCustomGeminiKey] = useState("");
  const [customGroqKey, setCustomGroqKey] = useState("");
  const [customOpenAIKey, setCustomOpenAIKey] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      const storedProvider = localStorage.getItem("careersetu_ai_provider") as AIProvider;
      if (storedProvider) setAiProvider(storedProvider);

      const gKey = localStorage.getItem("careersetu_gemini_api_key");
      if (gKey) setCustomGeminiKey(gKey);

      const groqK = localStorage.getItem("careersetu_groq_api_key");
      if (groqK) setCustomGroqKey(groqK);

      const openAIK = localStorage.getItem("careersetu_openai_api_key");
      if (openAIK) setCustomOpenAIKey(openAIK);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const saveSettings = () => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("careersetu_ai_provider", aiProvider);

      if (customGeminiKey.trim()) {
        localStorage.setItem("careersetu_gemini_api_key", customGeminiKey.trim());
      } else {
        localStorage.removeItem("careersetu_gemini_api_key");
      }

      if (customGroqKey.trim()) {
        localStorage.setItem("careersetu_groq_api_key", customGroqKey.trim());
      } else {
        localStorage.removeItem("careersetu_groq_api_key");
      }

      if (customOpenAIKey.trim()) {
        localStorage.setItem("careersetu_openai_api_key", customOpenAIKey.trim());
      } else {
        localStorage.removeItem("careersetu_openai_api_key");
      }
    }
    toast.success("AI Engine settings saved!");
    setIsSettingsOpen(false);
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: "bot",
        text: "### Chat cleared! 🧹\nHow can I help you today with salary calculations, career roadmaps, exam strategies, or college admissions?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: "CareerSetu Neural AI",
      },
    ]);
    toast.success("Chat history reset");
  };

  const sendMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await askCareerSetuAI(userText, {
        provider: aiProvider,
        geminiKey: customGeminiKey,
        groqKey: customGroqKey,
        openaiKey: customOpenAIKey,
      });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: response.source,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "I encountered an error processing your query. Please try asking again or configure an API key in settings.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass flex flex-col h-[600px] w-full max-w-lg rounded-3xl border-primary/20 shadow-2xl overflow-hidden bg-card/95 backdrop-blur-xl">
      {/* Header */}
      <div className="gradient-brand px-5 py-3.5 flex items-center justify-between text-primary-foreground">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-white/20 backdrop-blur shadow-xs">
            <Bot className="size-5" />
          </span>
          <div>
            <h3 className="font-bold text-sm leading-none flex items-center gap-1.5">
              CareerSetu AI Assistant
              <Sparkles className="size-3.5 fill-amber-300 text-amber-300 animate-pulse" />
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-block size-1.5 rounded-full bg-emerald-400 animate-ping" />
              <p className="text-[10px] opacity-90">
                {customGeminiKey
                  ? "Google Gemini AI Active"
                  : customGroqKey
                  ? "Groq Llama 3.3 Active"
                  : "Neural AI Engine (GPT/Gemini Ready)"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            title="Configure AI Engine"
            className="h-8 w-8 text-primary-foreground hover:bg-white/20 rounded-full cursor-pointer"
          >
            <Settings2 className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={resetChat}
            title="Reset Chat"
            className="h-8 w-8 text-primary-foreground hover:bg-white/20 rounded-full cursor-pointer"
          >
            <RotateCcw className="size-4" />
          </Button>

          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-primary-foreground hover:bg-white/20 rounded-full cursor-pointer"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold shadow-xs ${
                m.sender === "user" ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"
              }`}
            >
              {m.sender === "user" ? <User className="size-3.5" /> : <Bot className="size-3.5 text-primary" />}
            </div>
            <div
              className={`group relative max-w-[90%] rounded-2xl px-4 py-3 shadow-xs ${
                m.sender === "user"
                  ? "gradient-brand text-primary-foreground rounded-tr-none font-medium"
                  : "bg-background border border-border/80 text-foreground rounded-tl-none"
              }`}
            >
              {m.sender === "user" ? (
                <div className="text-xs sm:text-sm">{m.text}</div>
              ) : (
                <FormattedChatMessage text={m.text} />
              )}

              <div className="mt-2 flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] ${m.sender === "user" ? "opacity-75" : "text-muted-foreground"}`}>
                    {m.timestamp}
                  </span>
                  {m.source && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {m.source}
                    </span>
                  )}
                </div>

                {m.sender === "bot" && (
                  <button
                    onClick={() => copyMessage(m.id, m.text)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Copy to clipboard"
                  >
                    {copiedId === m.id ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground italic pl-9 py-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>CareerSetu AI is analyzing your question...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested quick prompts */}
      {messages.length <= 2 && (
        <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-none">
          {PRESET_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="shrink-0 rounded-xl bg-accent/70 hover:bg-accent px-3 py-1.5 text-[11px] font-medium text-foreground transition-all border border-border/50 hover:border-primary/40 cursor-pointer shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="p-3 bg-card border-t border-border flex items-center gap-2"
      >
        <Input
          placeholder="Ask anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-10 rounded-xl bg-background border-border text-xs sm:text-sm shadow-inner"
        />
        <Button
          type="submit"
          disabled={!input.trim() || loading}
          size="icon"
          className="gradient-brand size-10 shrink-0 rounded-xl text-primary-foreground shadow-glow cursor-pointer disabled:opacity-50"
        >
          <Send className="size-4" />
        </Button>
      </form>

      {/* AI Settings Modal */}
      {isSettingsOpen && (
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold font-display flex items-center gap-2">
                <Zap className="size-5 text-primary" />
                AI Assistant Engine Settings
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-xs text-muted-foreground mt-2">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Preferred AI Model Provider
                </label>
                <Select
                  value={aiProvider}
                  onValueChange={(val) => setAiProvider(val as AIProvider)}
                >
                  <SelectTrigger className="rounded-xl h-10">
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="auto">⚡ Auto (Best Available - Free GPT / Gemini / Expert)</SelectItem>
                    <SelectItem value="gemini">🌟 Google Gemini (Direct API)</SelectItem>
                    <SelectItem value="groq">🚀 Groq (Llama 3.3 70B Fast)</SelectItem>
                    <SelectItem value="openai">🤖 OpenAI / OpenRouter</SelectItem>
                    <SelectItem value="knowledge">📚 Offline Career Intelligence Engine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gemini Key Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">
                    Google Gemini API Key (Optional)
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline flex items-center gap-0.5"
                  >
                    Get Free Key <ExternalLink className="size-3" />
                  </a>
                </div>
                <Input
                  type="password"
                  placeholder="AIzaSy..."
                  value={customGeminiKey}
                  onChange={(e) => setCustomGeminiKey(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>

              {/* Groq Key Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">
                    Groq API Key (Optional)
                  </label>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline flex items-center gap-0.5"
                  >
                    Get Free Key <ExternalLink className="size-3" />
                  </a>
                </div>
                <Input
                  type="password"
                  placeholder="gsk_..."
                  value={customGroqKey}
                  onChange={(e) => setCustomGroqKey(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSettingsOpen(false)}
                  className="rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="gradient-brand text-primary-foreground rounded-xl cursor-pointer"
                  onClick={saveSettings}
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
