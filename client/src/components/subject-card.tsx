import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, FlaskConical, Calculator, Dna } from "lucide-react";
import type { Subject } from "@shared/schema";
import { Link } from "wouter";

const subjectIcons: Record<string, React.ReactNode> = {
  physics: <BookOpen className="h-6 w-6" />,
  chemistry: <FlaskConical className="h-6 w-6" />,
  mathematics: <Calculator className="h-6 w-6" />,
  biology: <Dna className="h-6 w-6" />,
};

const subjectColors: Record<string, string> = {
  physics: "from-blue-500 to-blue-600",
  chemistry: "from-emerald-500 to-emerald-600",
  mathematics: "from-amber-500 to-amber-600",
  biology: "from-purple-500 to-purple-600",
};

const subjectBgColors: Record<string, string> = {
  physics: "bg-blue-500/10 dark:bg-blue-500/20",
  chemistry: "bg-emerald-500/10 dark:bg-emerald-500/20",
  mathematics: "bg-amber-500/10 dark:bg-amber-500/20",
  biology: "bg-purple-500/10 dark:bg-purple-500/20",
};

interface SubjectCardProps {
  subject: Subject;
}

export function SubjectCard({ subject }: SubjectCardProps) {
  const progress = subject.totalChapters > 0 
    ? Math.round((subject.completedChapters / subject.totalChapters) * 100) 
    : 0;

  const iconKey = subject.name.toLowerCase();
  const icon = subjectIcons[iconKey] || <BookOpen className="h-6 w-6" />;
  const gradientColor = subjectColors[iconKey] || "from-primary to-primary";
  const bgColor = subjectBgColors[iconKey] || "bg-primary/10";

  return (
    <Link href={`/subject/${subject.id}`}>
      <Card 
        className="group cursor-pointer hover-elevate active-elevate-2 transition-all duration-300 p-6"
        data-testid={`card-subject-${subject.id}`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className={`p-3 rounded-lg ${bgColor}`}>
            <div className={`bg-gradient-to-br ${gradientColor} bg-clip-text text-transparent`}>
              {icon}
            </div>
          </div>
          <div className="flex gap-1">
            {subject.exams.map((exam) => (
              <Badge key={exam} variant="secondary" className="text-xs">
                {exam}
              </Badge>
            ))}
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
          {subject.name}
        </h3>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span>{subject.completedChapters} of {subject.totalChapters} chapters</span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Button 
          variant="ghost" 
          className="w-full justify-between group-hover:bg-primary/10"
          data-testid={`button-open-${subject.id}`}
        >
          Continue Learning
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </Card>
    </Link>
  );
}
