import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ChapterList } from "@/components/chapter-list";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, FlaskConical, Calculator, Dna, GraduationCap } from "lucide-react";
import type { Subject, Chapter } from "@shared/schema";

const subjectIcons: Record<string, React.ReactNode> = {
  physics: <BookOpen className="h-8 w-8" />,
  chemistry: <FlaskConical className="h-8 w-8" />,
  mathematics: <Calculator className="h-8 w-8" />,
  biology: <Dna className="h-8 w-8" />,
};

const subjectGradients: Record<string, string> = {
  physics: "from-blue-500 to-blue-600",
  chemistry: "from-emerald-500 to-emerald-600",
  mathematics: "from-amber-500 to-amber-600",
  biology: "from-purple-500 to-purple-600",
};

export default function SubjectPage() {
  const params = useParams<{ subjectId: string }>();
  const subjectId = params.subjectId;

  const { data: subject, isLoading: subjectLoading } = useQuery<Subject>({
    queryKey: ["/api/subjects", subjectId],
  });

  const { data: chapters, isLoading: chaptersLoading } = useQuery<Chapter[]>({
    queryKey: ["/api/subjects", subjectId, "chapters"],
  });

  const isLoading = subjectLoading || chaptersLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-48 w-full mb-8" />
          <Skeleton className="h-12 w-64 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">Subject not found</p>
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

  const iconKey = subject.name.toLowerCase();
  const icon = subjectIcons[iconKey] || <BookOpen className="h-8 w-8" />;
  const gradient = subjectGradients[iconKey] || "from-primary to-primary";
  const progress = subject.totalChapters > 0 
    ? Math.round((subject.completedChapters / subject.totalChapters) * 100) 
    : 0;

  const class11Chapters = chapters?.filter((c) => c.classLevel === "11") || [];
  const class12Chapters = chapters?.filter((c) => c.classLevel === "12") || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className={`bg-gradient-to-br ${gradient} text-white`}>
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="mb-4 text-white/80 hover:text-white hover:bg-white/10"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="flex items-start gap-6">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur">
              {icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{subject.name}</h1>
                {subject.exams.map((exam) => (
                  <Badge key={exam} variant="secondary" className="bg-white/20 text-white border-0">
                    {exam}
                  </Badge>
                ))}
              </div>
              <p className="text-white/80 mb-4">
                {subject.totalChapters} chapters | {subject.completedChapters} completed
              </p>

              <div className="max-w-md">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/80">Overall Progress</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="11" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="11" data-testid="tab-class-11">
              <GraduationCap className="h-4 w-4 mr-2" />
              Class 11 ({class11Chapters.length})
            </TabsTrigger>
            <TabsTrigger value="12" data-testid="tab-class-12">
              <GraduationCap className="h-4 w-4 mr-2" />
              Class 12 ({class12Chapters.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="11">
            <ChapterList 
              chapters={chapters || []} 
              classLevel="11" 
              subjectId={subjectId}
            />
          </TabsContent>

          <TabsContent value="12">
            <ChapterList 
              chapters={chapters || []} 
              classLevel="12" 
              subjectId={subjectId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
