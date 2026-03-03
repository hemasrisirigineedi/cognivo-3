import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, Timer, CheckCircle2, XCircle, ArrowRight, 
  RotateCcw, Trophy, AlertCircle, Lock, Unlock, Star
} from "lucide-react";
import { Leaderboard } from "@/components/leaderboard";
import type { Quiz, QuizQuestion, LevelBasedQuiz, QuizLevel } from "@shared/schema";

interface QuizModuleProps {
  quiz: Quiz | null;
  chapterId?: string;
  onSubmit?: (answers: { questionId: string; selectedAnswer: number }[]) => void;
}

type QuizState = "idle" | "level-select" | "active" | "review";

const PASSING_PERCENTAGE = 70;

const levelConfig: Record<QuizLevel, { label: string; color: string; icon: React.ReactNode }> = {
  beginner: { label: "Beginner", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", icon: <Star className="h-4 w-4" /> },
  medium: { label: "Medium", color: "bg-amber-500/10 text-amber-600 border-amber-500/30", icon: <Star className="h-4 w-4" /> },
  tough: { label: "Tough (JEE Level)", color: "bg-red-500/10 text-red-600 border-red-500/30", icon: <Trophy className="h-4 w-4" /> },
};

// Get unlocked levels from localStorage
function getUnlockedLevels(chapterId: string): Record<QuizLevel, boolean> {
  const stored = localStorage.getItem(`quiz-progress-${chapterId}`);
  if (stored) {
    return JSON.parse(stored);
  }
  return { beginner: true, medium: false, tough: false };
}

// Save unlocked levels to localStorage
function saveUnlockedLevels(chapterId: string, levels: Record<QuizLevel, boolean>) {
  localStorage.setItem(`quiz-progress-${chapterId}`, JSON.stringify(levels));
}

export function QuizModule({ quiz, chapterId, onSubmit }: QuizModuleProps) {
  // Fetch level-based quiz if chapterId is provided
  const { data: levelQuiz, isLoading: isLoadingLevelQuiz } = useQuery<LevelBasedQuiz | null>({
    queryKey: ["/api/chapters", chapterId, "level-quiz"],
    enabled: !!chapterId,
  });

  const [state, setState] = useState<QuizState>("idle");
  const [currentLevel, setCurrentLevel] = useState<QuizLevel>("beginner");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [unlockedLevels, setUnlockedLevels] = useState<Record<QuizLevel, boolean>>({ beginner: true, medium: false, tough: false });
  const [lastScore, setLastScore] = useState<{ correct: number; total: number; percentage: number } | null>(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const startTimeRef = useRef<number>(0);

  // Load unlocked levels from localStorage on mount
  useEffect(() => {
    if (chapterId) {
      setUnlockedLevels(getUnlockedLevels(chapterId));
    }
  }, [chapterId]);

  // Timer logic
  useEffect(() => {
    if (state === "active" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state, timeLeft]);

  // Get current questions based on quiz type
  const getCurrentQuestions = (): QuizQuestion[] => {
    if (levelQuiz) {
      return levelQuiz.levels[currentLevel] || [];
    }
    return quiz?.questions || [];
  };

  const startLevelQuiz = (level: QuizLevel) => {
    if (!unlockedLevels[level]) return;
    setCurrentLevel(level);
    setState("active");
    setCurrentIndex(0);
    setAnswers({});
    const timeLimit = levelQuiz?.timeLimitPerLevel || quiz?.timeLimit || 15;
    setTimeLeft(timeLimit * 60);
    startTimeRef.current = Date.now();
  };

  const startQuiz = () => {
    if (levelQuiz) {
      setState("level-select");
    } else if (quiz) {
      setState("active");
      setCurrentIndex(0);
      setAnswers({});
      setTimeLeft(quiz.timeLimit * 60);
      startTimeRef.current = Date.now();
    }
  };

  const handleAnswer = (questionId: string, answer: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    const questions = getCurrentQuestions();
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    const percentage = Math.round((correct / questions.length) * 100);
    setLastScore({ correct, total: questions.length, percentage });
    
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    setTimeTaken(elapsed);

    // Check if level unlocks next
    if (levelQuiz && chapterId && percentage >= PASSING_PERCENTAGE) {
      const newUnlocked = { ...unlockedLevels };
      if (currentLevel === "beginner") {
        newUnlocked.medium = true;
      } else if (currentLevel === "medium") {
        newUnlocked.tough = true;
      }
      setUnlockedLevels(newUnlocked);
      saveUnlockedLevels(chapterId, newUnlocked);
    }

    setState("review");
    if (onSubmit) {
      const formattedAnswers = questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: answers[q.id] ?? -1,
      }));
      onSubmit(formattedAnswers);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const goBackToLevelSelect = () => {
    setState("level-select");
    setLastScore(null);
  };

  // Loading state
  if (isLoadingLevelQuiz) {
    return (
      <Card className="p-6" data-testid="card-quiz-loading">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Brain className="h-5 w-5 text-purple-500" />
          </div>
          <h2 className="text-xl font-semibold">Quiz</h2>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <Brain className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
          <p>Loading quiz...</p>
        </div>
      </Card>
    );
  }

  // No quiz available
  if (!quiz && !levelQuiz) {
    return (
      <Card className="p-6" data-testid="card-quiz-empty">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Brain className="h-5 w-5 text-purple-500" />
          </div>
          <h2 className="text-xl font-semibold">Quiz</h2>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No quiz available for this chapter yet</p>
        </div>
      </Card>
    );
  }

  // Idle state - show start button
  if (state === "idle") {
    const title = levelQuiz?.title || quiz?.title || "Quiz";
    const hasLevels = !!levelQuiz;
    const totalQuestions = hasLevels 
      ? (levelQuiz.levels.beginner.length + levelQuiz.levels.medium.length + levelQuiz.levels.tough.length)
      : (quiz?.questions.length || 0);

    return (
      <Card className="p-6" data-testid="card-quiz-idle">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Brain className="h-5 w-5 text-purple-500" />
          </div>
          <h2 className="text-xl font-semibold">Quiz</h2>
        </div>

        <div className="text-center py-8">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {totalQuestions} questions
            </span>
            {hasLevels && (
              <span className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                3 difficulty levels
              </span>
            )}
          </div>

          {hasLevels && (
            <p className="text-sm text-muted-foreground mb-6">
              Score 70% or higher to unlock the next level
            </p>
          )}

          <Button onClick={startQuiz} data-testid="button-start-quiz">
            {hasLevels ? "Choose Level" : "Start Quiz"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>
    );
  }

  // Level selection state
  if (state === "level-select" && levelQuiz) {
    return (
      <Card className="p-6" data-testid="card-quiz-level-select">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Brain className="h-5 w-5 text-purple-500" />
          </div>
          <h2 className="text-xl font-semibold">Choose Difficulty Level</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-6 text-center">
          Score 70% or higher to unlock the next level
        </p>

        <div className="space-y-4">
          {(["beginner", "medium", "tough"] as QuizLevel[]).map((level) => {
            const config = levelConfig[level];
            const isUnlocked = unlockedLevels[level];
            const questions = levelQuiz.levels[level];

            return (
              <div
                key={level}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isUnlocked 
                    ? `${config.color} hover-elevate cursor-pointer` 
                    : "bg-muted/50 border-muted text-muted-foreground opacity-60 cursor-not-allowed"
                }`}
                onClick={() => isUnlocked && startLevelQuiz(level)}
                data-testid={`level-${level}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isUnlocked ? (
                      <Unlock className="h-5 w-5" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                    <div>
                      <h3 className="font-semibold">{config.label}</h3>
                      <p className="text-sm opacity-80">{questions.length} questions</p>
                    </div>
                  </div>
                  {isUnlocked && (
                    <Button size="sm" variant="ghost">
                      Start
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Button 
          variant="outline" 
          className="w-full mt-6" 
          onClick={() => setState("idle")}
          data-testid="button-back"
        >
          Back
        </Button>
      </Card>
    );
  }

  // Review state
  if (state === "review") {
    const questions = getCurrentQuestions();
    const score = lastScore || { correct: 0, total: 0, percentage: 0 };
    const passed = score.percentage >= PASSING_PERCENTAGE;
    const hasLevels = !!levelQuiz;

    return (
      <Card className="p-6" data-testid="card-quiz-review">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Trophy className="h-5 w-5 text-purple-500" />
          </div>
          <h2 className="text-xl font-semibold">Quiz Results</h2>
          {hasLevels && (
            <Badge className={levelConfig[currentLevel].color}>
              {levelConfig[currentLevel].label}
            </Badge>
          )}
        </div>

        <div className="text-center py-6 mb-6">
          <div className={`text-5xl font-bold mb-2 ${passed ? "text-emerald-500" : "text-red-500"}`}>
            {score.percentage}%
          </div>
          <p className="text-muted-foreground">
            {score.correct} out of {score.total} correct
          </p>
          {hasLevels && (
            <div className="mt-4">
              {passed ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  {currentLevel === "tough" ? "All Levels Completed!" : "Next Level Unlocked!"}
                </Badge>
              ) : (
                <Badge className="bg-red-500/10 text-red-600 border-red-500/30">
                  <XCircle className="h-4 w-4 mr-1" />
                  Score 70% to unlock next level
                </Badge>
              )}
            </div>
          )}
        </div>

        <ScrollArea className="h-[300px] pr-4 mb-6">
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                <div 
                  key={q.id} 
                  className={`p-4 rounded-lg border ${
                    isCorrect 
                      ? "bg-emerald-500/5 border-emerald-500/20" 
                      : "bg-red-500/5 border-red-500/20"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="font-medium">Q{idx + 1}: {q.question}</p>
                  </div>
                  <div className="ml-7 space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      Your answer: {userAnswer !== undefined ? q.options[userAnswer] : "Not answered"}
                    </p>
                    {!isCorrect && (
                      <p className="text-emerald-600 dark:text-emerald-400">
                        Correct: {q.options[q.correctAnswer]}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-2 italic">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex gap-3 mb-6">
          {hasLevels && (
            <Button variant="outline" onClick={goBackToLevelSelect} className="flex-1" data-testid="button-back-levels">
              Back to Levels
            </Button>
          )}
          <Button onClick={() => startLevelQuiz(currentLevel)} className="flex-1" data-testid="button-retake-quiz">
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake
          </Button>
        </div>

        {chapterId && (
          <Leaderboard
            chapterId={chapterId}
            currentLevel={currentLevel}
            showSubmitForm={true}
            score={score.correct}
            totalQuestions={score.total}
            timeTaken={timeTaken}
          />
        )}
      </Card>
    );
  }

  // Active quiz state
  const questions = getCurrentQuestions();
  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return null;
  }

  return (
    <Card className="p-6" data-testid="card-quiz-active">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Brain className="h-5 w-5 text-purple-500" />
          </div>
          <h2 className="text-xl font-semibold">Quiz</h2>
          {levelQuiz && (
            <Badge className={levelConfig[currentLevel].color}>
              {levelConfig[currentLevel].label}
            </Badge>
          )}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
          timeLeft < 60 ? "bg-red-500/10 text-red-600" : "bg-muted"
        }`}>
          <Timer className="h-4 w-4" />
          <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <Badge variant="outline" className="capitalize">
            {currentQuestion.difficulty}
          </Badge>
        </div>
        <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />
      </div>

      <div className="space-y-6">
        <p className="text-lg font-medium">{currentQuestion.question}</p>

        <RadioGroup
          value={answers[currentQuestion.id]?.toString()}
          onValueChange={(v) => handleAnswer(currentQuestion.id, parseInt(v))}
        >
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 p-4 rounded-lg border hover-elevate cursor-pointer"
                onClick={() => handleAnswer(currentQuestion.id, idx)}
              >
                <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            data-testid="button-prev-question"
          >
            Previous
          </Button>
          {currentIndex < questions.length - 1 ? (
            <Button
              className="flex-1"
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={answers[currentQuestion.id] === undefined}
              data-testid="button-next-question"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              className="flex-1"
              onClick={handleSubmit}
              data-testid="button-submit-quiz"
            >
              Submit Quiz
              <CheckCircle2 className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
