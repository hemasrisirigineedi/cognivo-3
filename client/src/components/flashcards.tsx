import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Layers, ChevronLeft, ChevronRight, RotateCcw, 
  CheckCircle2, XCircle, Shuffle, Eye
} from "lucide-react";
import type { Flashcard } from "@shared/schema";

interface FlashcardsProps {
  flashcards: Flashcard[];
}

const typeColors: Record<string, string> = {
  definition: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  formula: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  reaction: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  concept: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
};

const typeLabels: Record<string, string> = {
  definition: "Definition",
  formula: "Formula",
  reaction: "Reaction",
  concept: "Concept",
};

export function Flashcards({ flashcards }: FlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastered, setMastered] = useState<Set<string>>(new Set());
  const [needsReview, setNeedsReview] = useState<Set<string>>(new Set());
  const [cards, setCards] = useState(flashcards);

  // Sync cards when flashcards prop changes
  useEffect(() => {
    setCards(flashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [flashcards]);

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? Math.round((mastered.size / cards.length) * 100) : 0;
  const remaining = cards.length - mastered.size;

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((i) => (i - 1 + cards.length) % cards.length);
    }, 150);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMastered = () => {
    if (currentCard) {
      setMastered((prev) => {
        const next = new Set(Array.from(prev));
        next.add(currentCard.id);
        return next;
      });
      setNeedsReview((prev) => {
        const next = new Set(Array.from(prev));
        next.delete(currentCard.id);
        return next;
      });
    }
    handleNext();
  };

  const handleNeedsReview = () => {
    if (currentCard) {
      setNeedsReview((prev) => {
        const next = new Set(Array.from(prev));
        next.add(currentCard.id);
        return next;
      });
      setMastered((prev) => {
        const next = new Set(Array.from(prev));
        next.delete(currentCard.id);
        return next;
      });
    }
    handleNext();
  };

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const resetProgress = () => {
    setMastered(new Set());
    setNeedsReview(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
    setCards(flashcards);
  };

  const getCardStatus = (cardId: string) => {
    if (mastered.has(cardId)) return "mastered";
    if (needsReview.has(cardId)) return "review";
    return "unseen";
  };

  if (flashcards.length === 0) {
    return (
      <Card className="p-6" data-testid="card-flashcards-empty">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <Layers className="h-5 w-5 text-cyan-500" />
          </div>
          <h2 className="text-xl font-semibold">Flashcards</h2>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No flashcards available for this chapter yet</p>
        </div>
      </Card>
    );
  }

  const cardStatus = currentCard ? getCardStatus(currentCard.id) : "unseen";

  return (
    <Card className="p-6" data-testid="card-flashcards">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <Layers className="h-5 w-5 text-cyan-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Flashcards</h2>
            <p className="text-sm text-muted-foreground">Click card to flip</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={shuffleCards} 
            title="Shuffle cards"
            data-testid="button-shuffle"
          >
            <Shuffle className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={resetProgress} 
            title="Reset progress"
            data-testid="button-reset"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="text-muted-foreground">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <div className="flex gap-3">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {mastered.size} mastered
            </span>
            <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
              <Eye className="h-3.5 w-3.5" />
              {remaining} remaining
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard with Navigation */}
      <div className="flex items-center gap-3 mb-6">
        {/* Previous Button */}
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handlePrev}
          className="shrink-0 h-12 w-12"
          data-testid="button-prev-card"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Flashcard */}
        <div 
          className="flashcard-container cursor-pointer select-none flex-1"
          onClick={handleFlip}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              handleFlip();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={isFlipped ? "Click to see question" : "Click to reveal answer"}
          data-testid="flashcard-flip"
        >
          <div 
            className={`flashcard-inner relative w-full min-h-[280px] ${isFlipped ? "flipped" : ""}`}
          >
            {/* Front - Question */}
            <div 
              className={`flashcard-front absolute inset-0 rounded-xl border-2 p-8 flex flex-col transition-colors ${
                cardStatus === "mastered" 
                  ? "border-emerald-500/50 bg-emerald-500/5" 
                  : cardStatus === "review"
                  ? "border-orange-500/50 bg-orange-500/5"
                  : "border-border bg-gradient-to-br from-card to-muted/30"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <Badge className={`${typeColors[currentCard?.type] || ""}`}>
                  {typeLabels[currentCard?.type] || currentCard?.type}
                </Badge>
                {cardStatus === "mastered" && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                    Mastered
                  </Badge>
                )}
                {cardStatus === "review" && (
                  <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
                    Needs Review
                  </Badge>
                )}
              </div>
              
              <div className="flex-1 flex items-center justify-center text-center">
                <p className="text-xl font-medium leading-relaxed">{currentCard?.front}</p>
              </div>
              
              <p className="text-sm text-muted-foreground text-center mt-4">
                Tap to reveal answer
              </p>
            </div>

            {/* Back - Answer */}
            <div 
              className="flashcard-back absolute inset-0 rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/5 to-primary/10 p-8 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  Answer
                </Badge>
              </div>
              
              <div className="flex-1 flex items-center justify-center text-center">
                <p className="text-lg leading-relaxed whitespace-pre-line">{currentCard?.back}</p>
              </div>
              
              <p className="text-sm text-muted-foreground text-center mt-4">
                Tap to see question
              </p>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleNext}
          className="shrink-0 h-12 w-12"
          data-testid="button-next-card"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50"
          onClick={handleNeedsReview}
          data-testid="button-needs-review"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Still Learning
        </Button>

        <Button
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={handleMastered}
          data-testid="button-mastered"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Got It!
        </Button>
      </div>

      {/* Card indicator dots */}
      <div className="flex justify-center gap-1 mt-4 flex-wrap">
        {cards.slice(0, 25).map((card, idx) => {
          const status = getCardStatus(card.id);
          return (
            <button
              key={card.id}
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex(idx);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex 
                  ? "w-4 bg-primary" 
                  : status === "mastered"
                  ? "bg-emerald-500"
                  : status === "review"
                  ? "bg-orange-500"
                  : "bg-muted-foreground/30"
              }`}
              aria-label={`Go to card ${idx + 1}`}
              data-testid={`button-card-dot-${idx}`}
            />
          );
        })}
        {cards.length > 25 && (
          <span className="text-xs text-muted-foreground ml-1">+{cards.length - 25}</span>
        )}
      </div>
    </Card>
  );
}
