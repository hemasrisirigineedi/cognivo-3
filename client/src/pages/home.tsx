import { useQuery } from "@tanstack/react-query";
import { SubjectCard } from "@/components/subject-card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, Target, BookOpen, TrendingUp, Star, 
  Play, Brain, Layers, MessageCircle 
} from "lucide-react";
import type { Subject } from "@shared/schema";

export default function Home() {
  const { data: subjects, isLoading, error } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const totalProgress = subjects
    ? Math.round(
        (subjects.reduce((acc, s) => acc + s.completedChapters, 0) /
          subjects.reduce((acc, s) => acc + s.totalChapters, 0)) *
          100
      ) || 0
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 py-12 relative">
          <div className="max-w-3xl">
            <Badge className="mb-4" variant="secondary">
              <Target className="h-3 w-3 mr-1" />
              NCERT Based Learning
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Master JEE & NEET with{" "}
              <span className="text-gradient bg-gradient-to-r from-primary to-blue-400">
                AI-Powered
              </span>{" "}
              Learning
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Chapter-wise NCERT content, video explanations, quizzes, flashcards, 
              and AI doubt-solving — all structured for exam success.
            </p>

            <div className="flex flex-wrap gap-4">
              <Card className="p-4 flex items-center gap-3 bg-card/50 backdrop-blur">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {subjects?.reduce((acc, s) => acc + s.totalChapters, 0) || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Chapters</p>
                </div>
              </Card>

              <Card className="p-4 flex items-center gap-3 bg-card/50 backdrop-blur">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalProgress}%</p>
                  <p className="text-xs text-muted-foreground">Overall Progress</p>
                </div>
              </Card>

              <Card className="p-4 flex items-center gap-3 bg-card/50 backdrop-blur">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <GraduationCap className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">JEE & NEET</p>
                  <p className="text-xs text-muted-foreground">Exam Focused</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Your Subjects</h2>
            <p className="text-muted-foreground">
              Select a subject to continue learning
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-2 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-destructive">Failed to load subjects</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subjects?.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-8 text-center">
          Everything You Need to Succeed
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <BookOpen className="h-6 w-6 text-blue-500" />,
              title: "NCERT Content",
              description: "Complete textbook content structured for easy learning",
              color: "bg-blue-500/10",
            },
            {
              icon: <Star className="h-6 w-6 text-amber-500" />,
              title: "Key Highlights",
              description: "AI-curated important points for JEE & NEET",
              color: "bg-amber-500/10",
            },
            {
              icon: <Brain className="h-6 w-6 text-purple-500" />,
              title: "Smart Quizzes",
              description: "Practice with difficulty-graded questions",
              color: "bg-purple-500/10",
            },
            {
              icon: <Layers className="h-6 w-6 text-cyan-500" />,
              title: "Flashcards",
              description: "Spaced repetition for formulas and concepts",
              color: "bg-cyan-500/10",
            },
            {
              icon: <MessageCircle className="h-6 w-6 text-emerald-500" />,
              title: "AI Doubt Solver",
              description: "Get instant answers to your questions",
              color: "bg-emerald-500/10",
            },
          ].map((feature) => (
            <Card key={feature.title} className="p-6 hover-elevate" data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
