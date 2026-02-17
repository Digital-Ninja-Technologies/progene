import { useState, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, Check, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-cover-letter`;

export default function CoverLetterPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [userName, setUserName] = useState("");
  const [userSkills, setUserSkills] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    setIsGenerating(true);
    setCoverLetter("");
    abortRef.current = new AbortController();

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          userName: userName.trim() || undefined,
          userSkills: userSkills.trim() || undefined,
        }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Failed to generate" }));
        toast.error(err.error || "Failed to generate cover letter");
        setIsGenerating(false);
        return;
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
            if (content) {
              fullText += content;
              setCoverLetter(fullText);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error(e);
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    toast.success("Cover letter copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background pt-14">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            AI-Powered
          </div>
          <h1 className="text-3xl font-bold mb-2">Cover Letter Generator</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Paste a job description and let Progene craft a professional cover letter tailored to the role.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Side */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Job Details
              </CardTitle>
              <CardDescription>Enter the job description and optionally your info</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description *</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the full job description here..."
                  className="min-h-[200px]"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userName">Your Name (optional)</Label>
                <Input
                  id="userName"
                  placeholder="e.g. John Doe"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userSkills">Key Skills / Experience (optional)</Label>
                <Textarea
                  id="userSkills"
                  placeholder="e.g. 5 years React experience, team leadership, AWS certified..."
                  className="min-h-[80px]"
                  value={userSkills}
                  onChange={(e) => setUserSkills(e.target.value)}
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !jobDescription.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Cover Letter
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Side */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Your Cover Letter</CardTitle>
                {coverLetter && (
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {coverLetter ? (
                <div className="whitespace-pre-wrap text-sm leading-relaxed border rounded-lg p-4 bg-muted/30 min-h-[300px]">
                  {coverLetter}
                  {isGenerating && <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5" />}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground min-h-[300px] border rounded-lg border-dashed">
                  <FileText className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm">Your generated cover letter will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
