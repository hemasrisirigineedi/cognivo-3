import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { 
  Play, Pause, SkipBack, SkipForward, 
  Volume2, VolumeX, Mic, BookOpen,
  ChevronDown, ChevronUp, AlertCircle
} from "lucide-react";
import type { ChapterContent } from "@shared/schema";

interface VoiceOverviewProps {
  content: ChapterContent | undefined;
  chapterName: string;
  subjectName: string;
}

interface AudioSection {
  id: string;
  title: string;
  text: string;
  type: "intro" | "concept" | "definition" | "formula" | "summary";
}

export function VoiceOverview({ content, chapterName, subjectName }: VoiceOverviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [highlightedText, setHighlightedText] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sectionsRef = useRef<AudioSection[]>([]);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const generateSections = useCallback((): AudioSection[] => {
    if (!content) return [];

    const sections: AudioSection[] = [];

    sections.push({
      id: "intro",
      title: "Introduction",
      text: `Welcome to the audio overview of ${chapterName}, from ${subjectName}. This chapter contains ${content.concepts.length} key concepts, ${content.definitions?.length || 0} important definitions, and ${content.formulas?.length || 0} essential formulas. Let's begin with an overview of the main concepts.`,
      type: "intro"
    });

    content.concepts.slice(0, 8).forEach((concept, index) => {
      sections.push({
        id: `concept-${index}`,
        title: concept.title,
        text: `Concept ${index + 1}: ${concept.title}. ${concept.content}`,
        type: "concept"
      });
    });

    if (content.definitions && content.definitions.length > 0) {
      sections.push({
        id: "definitions-intro",
        title: "Key Definitions",
        text: "Now let's review the key definitions you need to know for this chapter.",
        type: "definition"
      });

      content.definitions.slice(0, 5).forEach((def, index) => {
        sections.push({
          id: `definition-${index}`,
          title: def.title,
          text: `Definition: ${def.title}. ${def.content}`,
          type: "definition"
        });
      });
    }

    if (content.formulas && content.formulas.length > 0) {
      sections.push({
        id: "formulas-intro",
        title: "Important Formulas",
        text: "Here are the important formulas from this chapter.",
        type: "formula"
      });

      content.formulas.slice(0, 5).forEach((formula, index) => {
        sections.push({
          id: `formula-${index}`,
          title: formula.title,
          text: `Formula: ${formula.title}. ${formula.content}`,
          type: "formula"
        });
      });
    }

    sections.push({
      id: "summary",
      title: "Summary",
      text: `That concludes the audio overview of ${chapterName}. Remember to practice with flashcards and quizzes to reinforce your understanding. Good luck with your JEE and NEET preparation!`,
      type: "summary"
    });

    return sections;
  }, [content, chapterName, subjectName]);

  useEffect(() => {
    sectionsRef.current = generateSections();
  }, [generateSections]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.volume = isMuted ? 0 : volume / 100;
      utterance.pitch = 1;
      
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Google')
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const word = text.substring(event.charIndex, event.charIndex + event.charLength);
          setHighlightedText(word);
        }
      };

      utterance.onend = () => {
        setHighlightedText("");
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [rate, volume, isMuted]);

  const playSection = useCallback((index: number) => {
    const sections = sectionsRef.current;
    if (index >= sections.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentSectionIndex(0);
      return;
    }

    setCurrentSectionIndex(index);
    const section = sections[index];
    
    speak(section.text, () => {
      playSection(index + 1);
    });
  }, [speak]);

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      setIsPlaying(true);
      setIsPaused(false);
      playSection(currentSectionIndex);
    }
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSectionIndex(0);
    setHighlightedText("");
  };

  const handlePrevious = () => {
    const newIndex = Math.max(0, currentSectionIndex - 1);
    window.speechSynthesis.cancel();
    setCurrentSectionIndex(newIndex);
    if (isPlaying) {
      playSection(newIndex);
    }
  };

  const handleNext = () => {
    const sections = sectionsRef.current;
    const newIndex = Math.min(sections.length - 1, currentSectionIndex + 1);
    window.speechSynthesis.cancel();
    setCurrentSectionIndex(newIndex);
    if (isPlaying) {
      playSection(newIndex);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      playSection(currentSectionIndex);
    }
  };

  const sections = sectionsRef.current.length > 0 ? sectionsRef.current : generateSections();
  const currentSection = sections[currentSectionIndex];
  const progress = sections.length > 0 ? ((currentSectionIndex + 1) / sections.length) * 100 : 0;

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "intro": return <Mic className="h-4 w-4" />;
      case "concept": return <BookOpen className="h-4 w-4" />;
      case "definition": return <BookOpen className="h-4 w-4" />;
      case "formula": return <BookOpen className="h-4 w-4" />;
      default: return <Mic className="h-4 w-4" />;
    }
  };

  const getSectionBadgeClass = (type: string) => {
    switch (type) {
      case "intro": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "concept": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "definition": return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "formula": return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "summary": return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (!content) {
    return (
      <Card className="p-6">
        <div className="text-center py-12 text-muted-foreground">
          <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Loading audio content...</p>
        </div>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card className="p-6">
        <div className="text-center py-12 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium mb-2">Voice Overview Unavailable</p>
          <p className="text-sm">Your browser does not support text-to-speech. Please try a different browser like Chrome or Edge.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-primary/10">
            <Mic className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Voice Overview</h2>
            <p className="text-sm text-muted-foreground">
              Listen to an audio summary of {chapterName}
            </p>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={getSectionBadgeClass(currentSection?.type || "intro")}>
              {getSectionIcon(currentSection?.type || "intro")}
              <span className="ml-1 capitalize">{currentSection?.type || "Loading"}</span>
            </Badge>
            <span className="text-sm text-muted-foreground">
              Section {currentSectionIndex + 1} of {sections.length}
            </span>
          </div>
          <h3 className="font-semibold text-lg mb-2">{currentSection?.title || "Loading..."}</h3>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
            data-testid="button-voice-previous"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            size="lg"
            className="rounded-full min-h-14 min-w-14"
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={!isSupported}
            aria-pressed={isPlaying}
            data-state={isPlaying ? "playing" : isPaused ? "paused" : "stopped"}
            data-testid="button-voice-play"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentSectionIndex === sections.length - 1}
            data-testid="button-voice-next"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            data-testid="button-voice-mute"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="w-24"
            data-testid="slider-voice-volume"
          />
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Speed:</span>
            {[0.75, 1, 1.25, 1.5].map((r) => (
              <Button
                key={r}
                variant={rate === r ? "default" : "outline"}
                size="sm"
                onClick={() => handleRateChange(r)}
                className="h-7 px-2 text-xs"
                data-testid={`button-voice-rate-${r}`}
              >
                {r}x
              </Button>
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-between"
          onClick={() => setShowTranscript(!showTranscript)}
          data-testid="button-voice-transcript"
        >
          <span>Show Transcript</span>
          {showTranscript ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {showTranscript && (
          <ScrollArea className="h-64 mt-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-4">
              {sections.map((section, index) => (
                <div 
                  key={section.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    index === currentSectionIndex 
                      ? "bg-primary/10 border-l-2 border-primary" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    setCurrentSectionIndex(index);
                    if (isPlaying) {
                      playSection(index);
                    }
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={getSectionBadgeClass(section.type)}>
                      {section.type}
                    </Badge>
                    <span className="text-sm font-medium">{section.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {section.text}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Audio Summary Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{content.concepts.length}</div>
            <div className="text-xs text-muted-foreground">Concepts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">{content.definitions?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Definitions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500">{content.formulas?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Formulas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-500">{sections.length}</div>
            <div className="text-xs text-muted-foreground">Audio Sections</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
