import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ChevronRight, Flame, TrendingUp, Minus } from "lucide-react";
import type { Chapter, WeightageLevel } from "@shared/schema";
import { Link } from "wouter";

const weightageConfig: Record<WeightageLevel, { label: string; icon: React.ReactNode; className: string }> = {
  high: {
    label: "High Weightage",
    icon: <Flame className="h-3 w-3" />,
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50",
  },
  medium: {
    label: "Medium",
    icon: <TrendingUp className="h-3 w-3" />,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
  },
  low: {
    label: "Low",
    icon: <Minus className="h-3 w-3" />,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
  },
};

interface ChapterListProps {
  chapters: Chapter[];
  classLevel: "11" | "12";
  subjectId: string;
}

export function ChapterList({ chapters, classLevel, subjectId }: ChapterListProps) {
  const filteredChapters = chapters
    .filter((ch) => ch.classLevel === classLevel)
    .sort((a, b) => a.order - b.order);

  if (filteredChapters.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No chapters available for Class {classLevel}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredChapters.map((chapter, index) => {
        const weightage = weightageConfig[chapter.weightage];
        
        return (
          <Link key={chapter.id} href={`/subject/${subjectId}/chapter/${chapter.id}`}>
            <Card 
              className="group cursor-pointer hover-elevate active-elevate-2 transition-all duration-200 p-4"
              data-testid={`card-chapter-${chapter.id}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                      {chapter.name}
                    </h3>
                    {chapter.isCompleted && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className={`text-xs border ${weightage.className}`}
                    >
                      <span className="flex items-center gap-1">
                        {weightage.icon}
                        {weightage.label}
                      </span>
                    </Badge>

                    {chapter.progress > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Progress value={chapter.progress} className="w-16 h-1.5" />
                        <span>{chapter.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
