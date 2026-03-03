import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, Medal, Timer, Crown, User, Star, TrendingUp
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { LeaderboardEntry, QuizLevel } from "@shared/schema";

interface LeaderboardProps {
  chapterId: string;
  currentLevel?: QuizLevel;
  showSubmitForm?: boolean;
  onScoreSubmitted?: () => void;
  score?: number;
  totalQuestions?: number;
  timeTaken?: number;
}

const levelLabels: Record<QuizLevel, string> = {
  beginner: "Beginner",
  medium: "Medium",
  tough: "Tough",
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-medium text-muted-foreground w-5 text-center">{rank}</span>;
}

function getRankBg(rank: number): string {
  if (rank === 1) return "bg-yellow-500/10 border-yellow-500/30";
  if (rank === 2) return "bg-gray-400/10 border-gray-400/30";
  if (rank === 3) return "bg-amber-600/10 border-amber-600/30";
  return "";
}

export function Leaderboard({ 
  chapterId, 
  currentLevel = "beginner",
  showSubmitForm = false,
  onScoreSubmitted,
  score,
  totalQuestions,
  timeTaken
}: LeaderboardProps) {
  const [selectedLevel, setSelectedLevel] = useState<QuizLevel>(currentLevel);
  const [username, setUsername] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { data: entries = [], isLoading, refetch } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard", chapterId, selectedLevel],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard/${chapterId}?level=${selectedLevel}`);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      return response.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: {
      username: string;
      chapterId: string;
      level: QuizLevel;
      score: number;
      totalQuestions: number;
      timeTaken: number;
    }) => {
      const response = await apiRequest("POST", "/api/leaderboard", data);
      return response.json();
    },
    onSuccess: () => {
      setHasSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      refetch();
      onScoreSubmitted?.();
    },
  });

  const handleSubmitScore = () => {
    if (!username.trim() || !score || !totalQuestions || timeTaken === undefined) return;
    submitMutation.mutate({
      username: username.trim(),
      chapterId,
      level: currentLevel,
      score,
      totalQuestions,
      timeTaken,
    });
  };

  return (
    <Card className="p-6" data-testid="card-leaderboard">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold">Leaderboard</h2>
        </div>
        <Badge variant="outline" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          Top Performers
        </Badge>
      </div>

      {showSubmitForm && !hasSubmitted && score !== undefined && (
        <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-5 w-5 text-amber-500" />
            <h3 className="font-medium">Submit Your Score</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Score: {score}/{totalQuestions} ({Math.round((score / (totalQuestions || 1)) * 100)}%) in {formatTime(timeTaken || 0)}
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              className="flex-1"
              data-testid="input-leaderboard-name"
            />
            <Button 
              onClick={handleSubmitScore}
              disabled={!username.trim() || submitMutation.isPending}
              data-testid="button-submit-score"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      )}

      {hasSubmitted && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
          <Trophy className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <p className="font-medium text-emerald-600">Score submitted successfully!</p>
        </div>
      )}

      <Tabs value={selectedLevel} onValueChange={(v) => { setSelectedLevel(v as QuizLevel); setHasSubmitted(false); }}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="beginner" data-testid="tab-leaderboard-beginner">Beginner</TabsTrigger>
          <TabsTrigger value="medium" data-testid="tab-leaderboard-medium">Medium</TabsTrigger>
          <TabsTrigger value="tough" data-testid="tab-leaderboard-tough">Tough</TabsTrigger>
        </TabsList>

        {["beginner", "medium", "tough"].map((level) => (
          <TabsContent key={level} value={level}>
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
                  <p>Loading leaderboard...</p>
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No scores yet for {levelLabels[level as QuizLevel]}</p>
                  <p className="text-sm">Be the first to make it to the leaderboard!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {entries.map((entry, index) => (
                    <div 
                      key={entry.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${getRankBg(index + 1)} transition-all hover:scale-[1.01]`}
                      data-testid={`leaderboard-entry-${index}`}
                    >
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(index + 1)}
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="p-1.5 rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium truncate">{entry.username}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-emerald-600">
                          <span className="font-semibold">{entry.percentage}%</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Timer className="h-3 w-3" />
                          <span>{formatTime(entry.timeTaken)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}
