
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Bot, CaseSensitive, FileText, Paperclip, Scale, SendHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { Message, CaseLaw, FullAnalysis } from "@/types";
import { getAnalysis } from "@/app/actions";
import { ChatMessage } from "@/components/chat-message";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { TermsDialog } from "@/components/terms-dialog";

const formSchema = z.object({
  prompt: z.string(),
});

export default function JunoArbPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [citedCases, setCitedCases] = useState<CaseLaw[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  useEffect(() => {
    const accepted = localStorage.getItem('termsAccepted') === 'true';
    setTermsAccepted(accepted);
    if (!accepted) {
      setIsTermsDialogOpen(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAgreeToTerms = () => {
    localStorage.setItem('termsAccepted', 'true');
    setTermsAccepted(true);
    setIsTermsDialogOpen(false);
  };

  const handleShowCases = () => {
    setIsRightPanelVisible(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!termsAccepted) {
      toast({
        variant: "destructive",
        title: "Terms Not Accepted",
        description: "You must accept the terms and conditions to use the app.",
      });
      return;
    }

    if (!values.prompt.trim() && !attachment) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please provide a legal strategy or attach a document.",
      });
      return;
    }

    setIsLoading(true);

    let promptContent = values.prompt;
    if (attachment) {
      try {
        let fileText = '';
        const fileName = attachment.name.toLowerCase();

        if (fileName.endsWith('.pdf')) {
          const pdfjs = await import('pdfjs-dist/build/pdf.js');
          pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
          
          const data = await attachment.arrayBuffer();
          const typedArray = new Uint8Array(data);
          const pdf = await pdfjs.getDocument(typedArray).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
          }
          fileText = fullText;

        } else if (fileName.endsWith('.docx')) {
           const mammoth = (await import('mammoth')).default;
           const arrayBuffer = await attachment.arrayBuffer();
           const result = await mammoth.extractRawText({ arrayBuffer });
           fileText = result.value;

        } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
          fileText = await attachment.text();
        } else {
            throw new Error(`Unsupported file type: ${attachment.name}.`);
        }
        
        promptContent = `${fileText}\n\n${values.prompt}`;
      } catch (error) {
        console.error("Error reading file:", error);
        toast({
          variant: "destructive",
          title: "File Error",
          description: "Could not process the attached file. Supported formats: .txt, .md, .pdf, .docx.",
        });
        setIsLoading(false);
        return;
      }
    }

    const userMessageContent = values.prompt || `File attached: ${attachment?.name}`;

    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessageContent,
    };
    
    const loadingMessage: Message = {
        id: `loading-${Date.now()}`,
        role: 'loading',
        content: ''
    }

    setMessages((prev) => [...prev, newUserMessage, loadingMessage]);
    form.reset();
    handleRemoveAttachment();

    const result = await getAnalysis(promptContent);
    
    if ("error" in result) {
      toast({ variant: "destructive", title: "Error", description: result.error });
      setMessages(prev => prev.filter(m => m.role !== 'loading'));
      setIsLoading(false);
      return;
    }
    
    const newAssistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: result,
      relevantCaseLaws: result.legalAnalysis.relevantCaseLaws || [],
    };
    
    setMessages(prev => [...prev.filter(m => m.role !== 'loading'), newAssistantMessage]);
    setCitedCases(result.legalAnalysis.relevantCaseLaws || []);
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full flex-col">
      <TermsDialog isOpen={isTermsDialogOpen} onAgree={handleAgreeToTerms} />
      <div className={cn(
        "grid flex-1 grid-cols-1",
        isRightPanelVisible && "md:grid-cols-3"
      )}>
        {/* Left Panel: Chat Interface */}
        <div className={cn(
          "col-span-1 flex h-full flex-col bg-secondary/50",
          isRightPanelVisible && "border-r md:col-span-2"
        )}>
          <header className="flex h-16 shrink-0 items-center justify-start gap-3 border-b bg-background px-6">
            <Scale className="h-7 w-7 text-primary" />
            <h1 className="font-headline text-2xl font-semibold">JunoArb</h1>
          </header>
          <ScrollArea className="flex-1">
            <main className="p-6">
              <div className="space-y-6">
                {messages.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-20">
                      <Scale className="h-16 w-16 mb-4 text-primary" />
                      <h2 className="font-headline text-2xl mb-2">Welcome to JunoArb</h2>
                      <p>Provide your legal strategy to begin the analysis.</p>
                  </div>
                )}
                {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} onShowCases={handleShowCases} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </main>
          </ScrollArea>
        </div>

        {/* Right Panel: Linked Case Data */}
        {isRightPanelVisible && (
          <div className="hidden h-full flex-col bg-background md:flex">
            <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b px-6">
                <div className="flex items-center gap-3">
                  <CaseSensitive className="h-6 w-6 text-accent" />
                  <h2 className="font-headline text-xl font-semibold">Linked Case Data</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsRightPanelVisible(false)} aria-label="Close panel">
                    <X className="h-5 w-5" />
                </Button>
            </header>
            <ScrollArea className="flex-1">
                <div className={cn("p-6", citedCases.length === 0 && !isLoading && "h-full")}>
                    {isLoading && !citedCases.length ? (
                         <div className="space-y-4">
                            <Skeleton className="h-28 w-full" />
                            <Skeleton className="h-28 w-full" />
                            <Skeleton className="h-28 w-full" />
                        </div>
                    ) : citedCases.length > 0 ? (
                        <div className="space-y-4">
                            {citedCases.map((caseItem, index) => (
                                <Card key={index} className="transition-all hover:shadow-md">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-start gap-3 text-base">
                                            <FileText className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                                            <span>{caseItem.caseName}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <CardDescription>{caseItem.relevance}</CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                            <FileText className="h-16 w-16" />
                            <p className="mt-4">No cases cited for the latest analysis.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
          </div>
        )}
      </div>
      <footer className="shrink-0 border-t bg-background px-6 py-4">
         <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.md,.pdf,.docx"
            disabled={!termsAccepted}
          />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={termsAccepted ? "Describe the legal strategy, ask a question, or attach a document..." : "Please accept the terms and conditions to continue."}
                      className="min-h-12 resize-none pr-28"
                      onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if ((field.value.trim() || attachment) && termsAccepted) {
                                  form.handleSubmit(onSubmit)();
                              }
                          }
                      }}
                      disabled={!termsAccepted}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach file"
                disabled={!termsAccepted}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || (!form.getValues('prompt').trim() && !attachment) || !termsAccepted}
                aria-label="Send"
              >
                <SendHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </Form>
        {attachment && (
            <div className="mt-2 flex items-center justify-between rounded-md border bg-muted p-2 pl-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">{attachment.name}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleRemoveAttachment} aria-label="Remove attachment">
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )}
      </footer>
    </div>
  );
}

    