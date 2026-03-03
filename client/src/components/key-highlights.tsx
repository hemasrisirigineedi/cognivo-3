import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, AlertTriangle, Lightbulb, Calculator } from "lucide-react";
import type { KeyHighlight } from "@shared/schema";

const typeConfig: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
  important: {
    icon: <Star className="h-4 w-4" />,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    label: "Important",
  },
  formula: {
    icon: <Calculator className="h-4 w-4" />,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    label: "Formula",
  },
  trap: {
    icon: <AlertTriangle className="h-4 w-4" />,
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    label: "Common Trap",
  },
  tip: {
    icon: <Lightbulb className="h-4 w-4" />,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    label: "Tip",
  },
};

interface KeyHighlightsProps {
  highlights: KeyHighlight[];
}

export function KeyHighlights({ highlights }: KeyHighlightsProps) {
  return (
    <Card className="p-6" data-testid="card-key-highlights">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <Star className="h-5 w-5 text-amber-500" />
        </div>
        <h2 className="text-xl font-semibold">Key Exam Highlights</h2>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        {highlights.length > 0 ? (
          <div className="space-y-4">
            {highlights.map((highlight) => {
              const config = typeConfig[highlight.type] || typeConfig.important;

              return (
                <div
                  key={highlight.id}
                  className={`p-4 rounded-lg border ${config.className}`}
                  data-testid={`highlight-${highlight.id}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {config.icon}
                    <Badge variant="outline" className="text-xs">
                      {config.label}
                    </Badge>
                    <div className="flex gap-1 ml-auto">
                      {highlight.examRelevance.map((exam) => (
                        <Badge key={exam} variant="secondary" className="text-xs">
                          {exam}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{highlight.content}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No highlights available yet
          </p>
        )}
      </ScrollArea>
    </Card>
  );
}
