import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChapterContentView } from "@/components/chapter-content";
import { QuizModule } from "@/components/quiz-module";
import { Flashcards } from "@/components/flashcards";
import { AIChat } from "@/components/ai-chat";
import { VoiceOverview } from "@/components/voice-overview";
import { 
  ArrowLeft, BookOpen, Brain, Layers, 
  MessageCircle, Flame, TrendingUp, Minus, Mic 
} from "lucide-react";
import type { 
  Subject, Chapter, ChapterContent, 
  Quiz, Flashcard
} from "@shared/schema";

const weightageConfig = {
  high: { label: "High Weightage", icon: <Flame className="h-3 w-3" />, className: "bg-red-500/10 text-red-600 dark:text-red-400" },
  medium: { label: "Medium", icon: <TrendingUp className="h-3 w-3" />, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  low: { label: "Low", icon: <Minus className="h-3 w-3" />, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
};

const moduleIcons = {
  content: <BookOpen className="h-4 w-4" />,
  quiz: <Brain className="h-4 w-4" />,
  flashcards: <Layers className="h-4 w-4" />,
  voice: <Mic className="h-4 w-4" />,
  chat: <MessageCircle className="h-4 w-4" />,
};

export default function ChapterPage() {
  const params = useParams<{ subjectId: string; chapterId: string }>();
  const { subjectId, chapterId } = params;

  const { data: subject } = useQuery<Subject>({
    queryKey: ["/api/subjects", subjectId],
  });

  const { data: chapter, isLoading: chapterLoading } = useQuery<Chapter>({
    queryKey: ["/api/chapters", chapterId],
  });

  const { data: content } = useQuery<ChapterContent>({
    queryKey: ["/api/chapters", chapterId, "content"],
  });

  const { data: quiz } = useQuery<Quiz | null>({
    queryKey: ["/api/chapters", chapterId, "quiz"],
  });

  const { data: flashcards } = useQuery<Flashcard[]>({
    queryKey: ["/api/chapters", chapterId, "flashcards"],
  });

  if (chapterLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-24 w-full mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">Chapter not found</p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const weightage = weightageConfig[chapter.weightage];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/subject/${subjectId}`}>
            <Button 
              variant="ghost" 
              size="sm"
              className="mb-2"
              data-testid="button-back-subject"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {subject?.name || "Subject"}
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold">{chapter.name}</h1>
                <Badge variant="outline" className={weightage.className}>
                  {weightage.icon}
                  <span className="ml-1">{weightage.label}</span>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Class {chapter.classLevel} | {subject?.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="content" className="w-full">
          <ScrollArea className="w-full pb-2">
            <TabsList className="inline-flex w-auto mb-6">
              <TabsTrigger value="content" className="gap-2" data-testid="module-content">
                {moduleIcons.content}
                <span className="hidden sm:inline">Content</span>
              </TabsTrigger>
              <TabsTrigger value="quiz" className="gap-2" data-testid="module-quiz">
                {moduleIcons.quiz}
                <span className="hidden sm:inline">Quiz</span>
              </TabsTrigger>
              <TabsTrigger value="flashcards" className="gap-2" data-testid="module-flashcards">
                {moduleIcons.flashcards}
                <span className="hidden sm:inline">Flashcards</span>
              </TabsTrigger>
              <TabsTrigger value="voice" className="gap-2" data-testid="module-voice">
                {moduleIcons.voice}
                <span className="hidden sm:inline">Voice</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="gap-2" data-testid="module-chat">
                {moduleIcons.chat}
                <span className="hidden sm:inline">AI Chat</span>
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TabsContent value="content" className="mt-0">
                {content ? (
                  <ChapterContentView content={content} />
                ) : (
                  <Card className="p-6">
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Content loading...</p>
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="quiz" className="mt-0">
                <QuizModule quiz={quiz || null} chapterId={chapterId} />
              </TabsContent>

              <TabsContent value="flashcards" className="mt-0">
                <Flashcards flashcards={flashcards || []} />
              </TabsContent>

              <TabsContent value="voice" className="mt-0">
                <VoiceOverview 
                  content={content}
                  chapterName={chapter.name}
                  subjectName={subject?.name || ""}
                />
              </TabsContent>

              <TabsContent value="chat" className="mt-0">
                <AIChat 
                  chapterId={chapterId} 
                  chapterName={chapter.name}
                  subjectName={subject?.name || ""}
                />
              </TabsContent>
            </div>

            {/* Sidebar - Quick Navigation */}
            <div className="hidden lg:block">
              <Card className="p-4 sticky top-32">
                <h3 className="font-semibold mb-4">Learning Modules</h3>
                <div className="space-y-2">
                  {[
                    { id: "content", icon: moduleIcons.content, label: "NCERT Content", count: content?.concepts.length || 0 },
                    { id: "quiz", icon: moduleIcons.quiz, label: "Quiz", count: quiz?.questions.length || 0 },
                    { id: "flashcards", icon: moduleIcons.flashcards, label: "Flashcards", count: flashcards?.length || 0 },
                    { id: "voice", icon: moduleIcons.voice, label: "Voice Overview", count: null },
                    { id: "chat", icon: moduleIcons.chat, label: "AI Doubt Solver", count: null },
                  ].map((module) => (
                    <div
                      key={module.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{module.icon}</span>
                        <span className="text-sm">{module.label}</span>
                      </div>
                      {module.count !== null && (
                        <Badge variant="secondary" className="text-xs">
                          {module.count}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Chapter Progress</h4>
                  <div className="text-2xl font-bold text-primary">{chapter.progress}%</div>
                  <p className="text-xs text-muted-foreground">Complete all modules to finish</p>
                </div>
              </Card>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
