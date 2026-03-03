import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Headphones, Play, Pause, SkipBack, SkipForward, 
  Volume2, VolumeX 
} from "lucide-react";
import type { AudioOverview as AudioOverviewType } from "@shared/schema";

interface AudioOverviewProps {
  audio: AudioOverviewType | null;
}

export function AudioOverview({ audio }: AudioOverviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration));
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-6" data-testid="card-audio-overview">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-violet-500/10">
          <Headphones className="h-5 w-5 text-violet-500" />
        </div>
        <h2 className="text-xl font-semibold">Audio Overview</h2>
      </div>

      {audio ? (
        <div className="space-y-4">
          <audio
            ref={audioRef}
            src={audio.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          />

          <div className="p-4 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
            <h3 className="font-semibold mb-1">{audio.title}</h3>
            <p className="text-sm text-muted-foreground">{audio.description}</p>
            <p className="text-xs text-muted-foreground mt-2">Duration: {audio.duration}</p>
          </div>

          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="cursor-pointer"
              data-testid="slider-audio-progress"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                data-testid="button-mute"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={(v) => setVolume(v[0] / 100)}
                className="w-20"
                data-testid="slider-volume"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(-10)}
                data-testid="button-rewind"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={togglePlay}
                data-testid="button-play-audio"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(10)}
                data-testid="button-forward"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-[88px]" />
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Headphones className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Audio podcast coming soon</p>
          <p className="text-sm mt-2">AI-generated audio explanations will be available here</p>
        </div>
      )}
    </Card>
  );
}
