import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, Send, Bot, User, Loader2, 
  Sparkles, CheckCircle, XCircle, AlertTriangle 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";

interface AIChatProps {
  chapterId: string;
  chapterName: string;
  subjectName: string;
}

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizState {
  questions: GeneratedQuestion[];
  currentIndex: number;
  selectedAnswer: number | null;
  showResult: boolean;
  score: number;
  isActive: boolean;
}

export function AIChat({ chapterId, chapterName, subjectName }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi! I'm your AI study assistant for **${chapterName}** in ${subjectName}. I can help you understand concepts, solve doubts, and explain NCERT topics from this chapter.\n\nYou can also click "Give me a quiz" for instant practice questions!\n\nWhat would you like to learn about?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentIndex: 0,
    selectedAnswer: null,
    showResult: false,
    score: 0,
    isActive: false,
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: aiStatus } = useQuery<{ configured: boolean }>({
    queryKey: ["/api/ai/status"],
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const conversationHistory = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({ role: m.role, content: m.content }));
      
      const response = await apiRequest("POST", "/api/ai/chat", {
        message,
        chapterId,
        chapterName,
        subjectName,
        conversationHistory,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const aiResponse: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    },
    onError: (error: Error) => {
      const errorResponse: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again or check if the AI service is configured properly.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    },
  });

  const quizMutation = useMutation({
    mutationFn: async (topic?: string) => {
      const response = await apiRequest("POST", "/api/ai/quiz", {
        chapterId,
        chapterName,
        subjectName,
        topic,
        count: 10,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setQuizState({
        questions: data.questions,
        currentIndex: 0,
        selectedAnswer: null,
        showResult: false,
        score: 0,
        isActive: true,
      });
    },
    onError: () => {
      const errorResponse: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I couldn't generate the quiz. Please try again or check if the AI service is configured properly.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, quizState]);

  const handleSend = async () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = input.trim();
    setInput("");
    
    chatMutation.mutate(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGenerateQuiz = () => {
    quizMutation.mutate(undefined);
  };

  const handleSelectAnswer = (index: number) => {
    if (quizState.showResult) return;
    setQuizState(prev => ({ ...prev, selectedAnswer: index }));
  };

  const handleSubmitAnswer = () => {
    if (quizState.selectedAnswer === null) return;
    
    const isCorrect = quizState.selectedAnswer === quizState.questions[quizState.currentIndex].correctAnswer;
    setQuizState(prev => ({
      ...prev,
      showResult: true,
      score: isCorrect ? prev.score + 1 : prev.score,
    }));
  };

  const handleNextQuestion = () => {
    if (quizState.currentIndex < quizState.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        selectedAnswer: null,
        showResult: false,
      }));
    } else {
      const finalScore = quizState.score;
      const total = quizState.questions.length;
      const percentage = Math.round((finalScore / total) * 100);
      
      const resultMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Quiz completed!\n\n**Your Score: ${finalScore}/${total} (${percentage}%)**\n\n${
          percentage >= 70 
            ? "Excellent work! You have a good understanding of this chapter." 
            : percentage >= 50 
              ? "Good effort! Review the concepts you missed and try again."
              : "Keep practicing! Review the NCERT chapter thoroughly and attempt again."
        }\n\nWould you like another quiz or have any doubts about the questions?`,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, resultMessage]);
      setQuizState({
        questions: [],
        currentIndex: 0,
        selectedAnswer: null,
        showResult: false,
        score: 0,
        isActive: false,
      });
    }
  };

  const handleExitQuiz = () => {
    setQuizState({
      questions: [],
      currentIndex: 0,
      selectedAnswer: null,
      showResult: false,
      score: 0,
      isActive: false,
    });
  };

  const currentQuestion = quizState.questions[quizState.currentIndex];
  const isAIConfigured = aiStatus?.configured ?? false;

  return (
    <Card className="p-6 flex flex-col h-[600px]" data-testid="card-ai-chat">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI Doubt Solver</h2>
            <p className="text-xs text-muted-foreground">
              Ask questions about {chapterName}
            </p>
          </div>
        </div>
        {!isAIConfigured && (
          <Badge variant="outline" className="text-amber-600 border-amber-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            AI not configured
          </Badge>
        )}
      </div>

      {quizState.isActive && currentQuestion ? (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary">
              Question {quizState.currentIndex + 1} of {quizState.questions.length}
            </Badge>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Score: {quizState.score}</Badge>
              <Button variant="ghost" size="sm" onClick={handleExitQuiz} data-testid="button-exit-quiz">
                Exit Quiz
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="space-y-4">
              <p className="font-medium text-base">{currentQuestion.question}</p>
              
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = quizState.selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctAnswer;
                  const showCorrectness = quizState.showResult;
                  
                  let optionClass = "p-3 rounded-lg border cursor-pointer transition-colors";
                  
                  if (showCorrectness) {
                    if (isCorrect) {
                      optionClass += " bg-green-500/10 border-green-500 text-green-700 dark:text-green-400";
                    } else if (isSelected && !isCorrect) {
                      optionClass += " bg-red-500/10 border-red-500 text-red-700 dark:text-red-400";
                    } else {
                      optionClass += " opacity-50";
                    }
                  } else {
                    optionClass += isSelected 
                      ? " bg-primary/10 border-primary" 
                      : " hover-elevate";
                  }

                  return (
                    <div
                      key={index}
                      className={optionClass}
                      onClick={() => handleSelectAnswer(index)}
                      data-testid={`option-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium w-6">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className="flex-1">{option}</span>
                        {showCorrectness && isCorrect && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {showCorrectness && isSelected && !isCorrect && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {quizState.showResult && (
                <div className="p-4 rounded-lg bg-muted mt-4">
                  <p className="font-medium mb-2">Explanation:</p>
                  <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            {!quizState.showResult ? (
              <Button 
                className="flex-1" 
                onClick={handleSubmitAnswer}
                disabled={quizState.selectedAnswer === null}
                data-testid="button-submit-answer"
              >
                Submit Answer
              </Button>
            ) : (
              <Button 
                className="flex-1" 
                onClick={handleNextQuestion}
                data-testid="button-next-question"
              >
                {quizState.currentIndex < quizState.questions.length - 1 ? "Next Question" : "See Results"}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 pr-4 mb-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className={message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"}>
                      {message.role === "assistant" ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg p-3 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {chatMutation.isPending && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3 bg-muted">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGenerateQuiz}
              disabled={quizMutation.isPending || !isAIConfigured}
              data-testid="button-generate-quiz"
            >
              {quizMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Give me a quiz (10 questions)
                </>
              )}
            </Button>
            
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isAIConfigured ? "Ask a question about this chapter..." : "AI service not configured..."}
                className="min-h-[44px] max-h-[120px] resize-none"
                disabled={!isAIConfigured}
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || chatMutation.isPending || !isAIConfigured}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
