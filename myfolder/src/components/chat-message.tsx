"use client";

import type { FullAnalysis, Message } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertTriangle,
  BookText,
  Bot,
  CaseSensitive,
  CircleDollarSign,
  FilePenLine,
  Gavel,
  MapPin,
  MessagesSquare,
  ScrollText,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  Swords,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const InfoCard = ({
  icon: Icon,
  title,
  content,
}: {
  icon: React.ElementType;
  title: string;
  content: string | number;
}) => (
  <div className="flex items-start gap-4 rounded-lg border bg-background/50 p-3 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
    <Icon className="h-6 w-6 flex-shrink-0 text-accent" />
    <div>
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-muted-foreground text-sm">{content}</p>
    </div>
  </div>
);

const InfoList = ({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ElementType;
  title: string;
  items: string[];
}) => (
  <div>
    <div className="flex items-center gap-3 mb-2">
      <Icon className="h-5 w-5 text-primary" />
      <h4 className="font-semibold">{title}</h4>
    </div>
    <ul className="list-disc space-y-1 pl-10 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);

const DetailAccordionItem = ({
  icon: Icon,
  value,
  title,
  children,
  variant = 'default',
}: {
  icon: React.ElementType;
  value: string;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'strength' | 'weakness' | 'caution' | 'opponent';
}) => {
    const colorClasses = {
        default: 'text-primary',
        strength: 'text-green-600',
        weakness: 'text-amber-600',
        caution: 'text-red-600',
        opponent: 'text-purple-600'
    };

    return (
        <AccordionItem value={value}>
            <AccordionTrigger className="text-base hover:no-underline">
                <div className="flex items-center gap-3">
                    <Icon className={cn("h-5 w-5", colorClasses[variant])} />
                    <span>{title}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none text-muted-foreground pl-12">
                {children}
            </AccordionContent>
        </AccordionItem>
    );
};

const AnalysisSkeleton = () => (
    <div className="flex items-start gap-4">
      <Avatar className="h-9 w-9 border bg-background">
        <AvatarFallback>
          <Bot className="h-5 w-5 text-primary" />
        </AvatarFallback>
      </Avatar>
  
      <div className="max-w-2xl flex-1 rounded-lg border bg-card p-4 shadow-sm">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
  
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 rounded-lg border bg-background/50 p-3">
                 <Skeleton className="h-6 w-6 rounded" />
                 <div className="w-full space-y-2">
                   <Skeleton className="h-4 w-1/3" />
                   <Skeleton className="h-4 w-2/3" />
                 </div>
              </div>
            ))}
          </div>
    
          <div className="space-y-4 rounded-lg border bg-background/30 p-4">
            <div className="space-y-3">
              <Skeleton className="h-5 w-1/4 mb-2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
             <div className="space-y-3 pt-2">
              <Skeleton className="h-5 w-1/4 mb-2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
  
          <div className="w-full space-y-2">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
  
export function ChatMessage({
  message,
  onShowCases,
}: {
  message: Message;
  onShowCases?: () => void;
}) {
  if (message.role === "loading") {
    return <AnalysisSkeleton />;
  }

  const isUser = message.role === "user";
  const isAnalysis = typeof message.content === "object";
  
  if (isAnalysis) {
    const analysis = message.content as FullAnalysis;
    const { legalAnalysis, opponentPrediction } = analysis;
    const hasCases = legalAnalysis.relevantCaseLaws && legalAnalysis.relevantCaseLaws.length > 0;

    return (
      <div className="flex items-start gap-4">
        <Avatar className="h-9 w-9 border bg-background">
          <AvatarFallback>
            <Bot className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
  
        <div className="max-w-2xl flex-1 rounded-lg border bg-card p-4 shadow-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-accent" />
              <h3 className="font-headline text-lg font-semibold">
                Legal Strategy Analysis
              </h3>
            </div>
  
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoCard
                icon={Gavel}
                title="Type of Arbitration"
                content={legalAnalysis.typeOfArbitration}
              />
              <InfoCard
                icon={CircleDollarSign}
                title="Damages Claimed"
                content={legalAnalysis.damagesClaimed}
              />
              <InfoCard
                icon={MapPin}
                title="Seat of Arbitration"
                content={legalAnalysis.seatOfArbitration}
              />
              <InfoCard
                icon={UserCheck}
                title="Expert Witnesses"
                content={legalAnalysis.numberOfExpertWitnesses}
              />
            </div>
  
            <div className="space-y-4 rounded-lg border bg-background/30 p-4">
               <InfoList title="Parties" icon={Users} items={legalAnalysis.parties} />
               <InfoList title="Applicable Laws" icon={ScrollText} items={legalAnalysis.applicableLaws} />
            </div>
  
            <Accordion type="multiple" collapsible className="w-full" defaultValue={["statementOfFacts"]}>
               <DetailAccordionItem icon={BookText} value="statementOfFacts" title="Statement of Facts">
                  {legalAnalysis.statementOfFacts}
                </DetailAccordionItem>
               <DetailAccordionItem icon={MessagesSquare} value="contentions" title="Contentions">
                  {legalAnalysis.contentions}
                </DetailAccordionItem>
               <DetailAccordionItem icon={ShieldCheck} value="strengths" title="Strengths" variant="strength">
                  {legalAnalysis.strengths}
                </DetailAccordionItem>
               <DetailAccordionItem icon={ShieldOff} value="weaknesses" title="Weaknesses" variant="weakness">
                  {legalAnalysis.weaknesses}
                </DetailAccordionItem>
               
               <DetailAccordionItem icon={Swords} value="opponentStrategy" title="Opponent Strategy Prediction" variant="opponent">
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold mb-1">Overall Strategy</h5>
                    <p>{opponentPrediction.overallOpponentStrategy}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-1">Predicted Counter-Arguments</h5>
                    <p>{opponentPrediction.predictedCounterArguments}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-1">Potential Tactics</h5>
                    <p>{opponentPrediction.potentialTactics}</p>
                  </div>
                  {opponentPrediction.keyCaseLawForOpponent.length > 0 && (
                    <div>
                      <h5 className="font-semibold mb-2">Potential Opponent Case Law</h5>
                      <div className="space-y-3">
                        {opponentPrediction.keyCaseLawForOpponent.map((caseItem, index) => (
                            <Card key={index} className="bg-background/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-start gap-3 text-sm">
                                        <FilePenLine className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <span>{caseItem.caseName}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <CardDescription>{caseItem.relevance}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
               </DetailAccordionItem>

               <DetailAccordionItem icon={FilePenLine} value="summaryOfArguments" title="Summary of Arguments">
                {legalAnalysis.summaryOfArguments}
               </DetailAccordionItem>
               <DetailAccordionItem icon={AlertTriangle} value="finalCautions" title="Final Cautions" variant="caution">
                {legalAnalysis.finalCautions}
               </DetailAccordionItem>
            </Accordion>
            
            {hasCases && onShowCases && (
              <Button
                onClick={onShowCases}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <CaseSensitive className="mr-2 h-4 w-4" />
                Show Linked Cases ({legalAnalysis.relevantCaseLaws?.length})
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-start gap-4", isUser && "justify-end")}
    >
      {!isUser && (
        <Avatar className="h-9 w-9 border bg-background">
          <AvatarFallback>
            <Bot className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-2xl flex-1 rounded-lg border bg-card p-4 shadow-sm",
          isUser && "bg-primary text-primary-foreground"
        )}
      >
        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
      </div>

      {isUser && (
        <Avatar className="h-9 w-9 border bg-background">
          <AvatarFallback>
            <User className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
