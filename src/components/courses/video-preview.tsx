"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";
import { isYouTubeVideo } from "@/lib/utils/image-utils";

interface VideoPreviewProps {
  videoUrl: string | null;
  title: string;
  className?: string;
}

export const VideoPreview = ({
  videoUrl,
  title,
  className = "",
}: VideoPreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  console.log("VideoPreview render:", {
    videoUrl,
    isYouTube: isYouTubeVideo(videoUrl),
    className,
  });

  if (!videoUrl || !isYouTubeVideo(videoUrl)) {
    console.log("VideoPreview: No se renderiza porque:", {
      videoUrl,
      isYouTube: isYouTubeVideo(videoUrl),
    });
    return null;
  }

  const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    )?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : "";
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <>
      {!isPlaying ? (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-60 transition-all duration-200 cursor-pointer ${className}`}
          onClick={() => setIsPlaying(true)}
          style={{ zIndex: 10 }}
        >
          <div className="bg-white bg-opacity-30 rounded-full p-4 backdrop-blur-sm border-2 border-white border-opacity-50 shadow-lg">
            <Play className="h-12 w-12 text-white fill-current" />
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-black" style={{ zIndex: 10 }}>
          <div className="flex items-center justify-between p-2 bg-black bg-opacity-80 text-white">
            <h3 className="text-sm font-medium truncate">{title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(false)}
              className="h-8 w-8 p-0 text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-[calc(100%-40px)]">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                No se pudo cargar el video
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
