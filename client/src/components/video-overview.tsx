import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock, ExternalLink } from "lucide-react";
import type { VideoOverview as VideoOverviewType } from "@shared/schema";

interface VideoOverviewProps {
  video: VideoOverviewType | null;
}

export function VideoOverview({ video }: VideoOverviewProps) {
  return (
    <Card className="p-6" data-testid="card-video-overview">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-red-500/10">
          <Play className="h-5 w-5 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold">Video Overview</h2>
      </div>

      {video ? (
        <div className="space-y-4">
          <div 
            className="relative aspect-video rounded-lg bg-muted overflow-hidden group cursor-pointer"
            data-testid="video-thumbnail"
          >
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <Play className="h-16 w-16 text-primary/50" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="h-8 w-8 text-primary ml-1" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">{video.title}</h3>
            <p className="text-sm text-muted-foreground">{video.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {video.duration}
              </span>
            </div>
          </div>

          <Button className="w-full" data-testid="button-watch-video">
            <Play className="h-4 w-4 mr-2" />
            Watch Video
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      ) : (
        <div className="aspect-video rounded-lg bg-muted/50 flex flex-col items-center justify-center text-muted-foreground">
          <Play className="h-12 w-12 mb-2 opacity-50" />
          <p>Video coming soon</p>
        </div>
      )}
    </Card>
  );
}
