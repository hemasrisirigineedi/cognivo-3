import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Lightbulb, FileText } from "lucide-react";
import type { ChapterContent as ChapterContentType, ContentBlock } from "@shared/schema";

interface ChapterContentProps {
  content: ChapterContentType;
}

function ContentBlockCard({ block }: { block: ContentBlock }) {
  return (
    <div className="p-4 rounded-lg bg-muted/50 border border-border/50 space-y-2">
      <h4 className="font-semibold text-foreground">{block.title}</h4>
      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {block.content}
      </p>
    </div>
  );
}

export function ChapterContentView({ content }: ChapterContentProps) {
  return (
    <Card className="p-6" data-testid="card-chapter-content">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">NCERT Content</h2>
      </div>

      <Tabs defaultValue="concepts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="concepts" data-testid="tab-concepts">
            <Lightbulb className="h-4 w-4 mr-2" />
            Concepts
          </TabsTrigger>
          <TabsTrigger value="definitions" data-testid="tab-definitions">
            <FileText className="h-4 w-4 mr-2" />
            Definitions
          </TabsTrigger>
          <TabsTrigger value="formulas" data-testid="tab-formulas">
            <span className="font-mono mr-2">fx</span>
            Formulas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="concepts">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {content.concepts.length > 0 ? (
                content.concepts.map((block) => (
                  <ContentBlockCard key={block.id} block={block} />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No concepts available yet
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="definitions">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {content.definitions.length > 0 ? (
                content.definitions.map((block) => (
                  <ContentBlockCard key={block.id} block={block} />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No definitions available yet
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="formulas">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {content.formulas.length > 0 ? (
                content.formulas.map((block) => (
                  <div key={block.id} className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <h4 className="font-semibold text-foreground mb-2">{block.title}</h4>
                    <code className="text-sm bg-background px-3 py-2 rounded block font-mono">
                      {block.content}
                    </code>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No formulas available yet
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
