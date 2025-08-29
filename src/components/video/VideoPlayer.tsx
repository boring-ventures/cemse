"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  RotateCcw,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getVideoUrl, isYouTubeUrl } from "@/lib/video-utils";
import { getAuthHeaders, API_BASE } from "@/lib/api";

// Extract YouTube ID function (moved inline since it's not exported from main video-utils)
const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Auto-fix function for problematic videos
const attemptVideoAutoFix = async (
  videoSrc: string
): Promise<{
  success: boolean;
  fixedUrl?: string;
  error?: string;
}> => {
  try {
    console.log("🔧 Attempting to auto-fix video:", videoSrc);

    // Extract the original MinIO URL from proxy URL
    const urlParams = new URLSearchParams(videoSrc.split("?")[1]);
    const originalUrl = urlParams.get("url");

    if (!originalUrl) {
      throw new Error("Could not extract original video URL");
    }

    console.log("🔧 Original video URL:", originalUrl);

    // Call the video validation and fix API
    const response = await fetch(`${API_BASE}/video-validate-and-fix`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ videoUrl: originalUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Video fix API failed");
    }

    const result = await response.json();
    console.log("🔧 Video fix result:", result);

    if (result.status === "fixed" && result.fixedUrl) {
      // Return the proxy URL for the fixed video
      const fixedProxyUrl = `/api/video-proxy?url=${encodeURIComponent(result.fixedUrl)}`;
      return {
        success: true,
        fixedUrl: fixedProxyUrl,
      };
    } else if (result.status === "valid") {
      // Video was already valid, the issue might be elsewhere
      return {
        success: false,
        error: "Video appears to be valid but still has playback issues",
      };
    } else {
      return {
        success: false,
        error: result.message || "Unknown fix result",
      };
    }
  } catch (error) {
    console.error("🔧 Video auto-fix error:", error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

interface VideoPlayerProps {
  src: string;
  title?: string;
  onProgress?: (progress: number) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  onProgress,
  onTimeUpdate,
  onEnded,
  className,
}) => {
  const isYouTube = isYouTubeUrl(src);
  const videoSrc = isYouTube ? src : getVideoUrl(src);
  const youTubeId = isYouTube ? extractYouTubeId(src) : null;

  console.log("🎥 VideoPlayer - Original src:", src);
  console.log("🎥 VideoPlayer - Is YouTube:", isYouTube);
  console.log("🎥 VideoPlayer - YouTube ID:", youTubeId);
  console.log("🎥 VideoPlayer - Processed videoSrc:", videoSrc);
  console.log("🎥 VideoPlayer - Will render iframe:", isYouTube && youTubeId);

  // Validate video source
  if (!src || (!isYouTube && !videoSrc)) {
    console.warn("🎥 VideoPlayer - Invalid video source:", {
      src,
      videoSrc,
      isYouTube,
    });
  }

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Estados del reproductor
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de UI
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Control de visibilidad de controles
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;

      // Debug: Log if video is jumping unexpectedly
      if (current > 0 && Math.abs(current - (currentTime || 0)) > 5) {
        console.warn("🎥 VideoPlayer - Large time jump detected:", {
          previousTime: currentTime,
          newTime: current,
          jump: current - (currentTime || 0),
          duration: total,
          readyState: videoRef.current.readyState,
          networkState: videoRef.current.networkState,
        });
      }

      setCurrentTime(current);

      if (total > 0) {
        const progress = (current / total) * 100;
        onProgress?.(progress);
        onTimeUpdate?.(current);
      }
    }
  }, [onProgress, onTimeUpdate, videoSrc, currentTime]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      console.log("🎥 VideoPlayer - Metadata loaded successfully");
      console.log("🎥 VideoPlayer - Duration:", videoRef.current.duration);
      console.log(
        "🎥 VideoPlayer - Initial currentTime:",
        videoRef.current.currentTime
      );
      console.log(
        "🎥 VideoPlayer - Video dimensions:",
        videoRef.current.videoWidth,
        "x",
        videoRef.current.videoHeight
      );

      // Ensure video starts at the beginning
      if (videoRef.current.currentTime !== 0) {
        console.warn(
          "🎥 VideoPlayer - Video not starting at 0, resetting to start"
        );
        videoRef.current.currentTime = 0;
      }

      setDuration(videoRef.current.duration);
      setCurrentTime(videoRef.current.currentTime);
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, [videoSrc]); // Dependencia en videoSrc para que se ejecute cuando cambia

  const handleProgress = useCallback(() => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(
        videoRef.current.buffered.length - 1
      );
      const duration = videoRef.current.duration;
      setBuffered((bufferedEnd / duration) * 100);
    }
  }, [videoSrc]);

  const handleSeek = useCallback(
    (value: number[]) => {
      if (videoRef.current) {
        const newTime = (value[0] / 100) * duration;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    },
    [duration]
  );

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const skipTime = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  }, []);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  }, []);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  // Resetear estados cuando cambia la fuente del video
  useEffect(() => {
    setIsLoading(true);
    setIsInitialLoading(true);
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);
    setIsPlaying(false);
    setShowControls(true);

    // Para videos de YouTube, simular la carga completada después de un breve retraso
    if (isYouTube && youTubeId) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsInitialLoading(false);
        console.log("🎥 VideoPlayer - YouTube video loaded");
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Para videos normales, hacer un pre-check de compatibilidad
    if (videoRef.current && !isYouTube && videoSrc) {
      const video = videoRef.current;

      // Verificar soporte del formato antes de cargar
      const fileExtension = videoSrc.toLowerCase().includes(".webm")
        ? "webm"
        : "mp4";
      const canPlay =
        fileExtension === "webm"
          ? video.canPlayType('video/webm; codecs="vp9,opus"')
          : video.canPlayType('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');

      console.log(
        `🎥 VideoPlayer - Format check for ${fileExtension}:`,
        canPlay
      );

      if (canPlay === "") {
        console.warn(
          `🎥 VideoPlayer - Browser may not support ${fileExtension} format properly`
        );
        // Still try to load, but user will see a helpful error if it fails
      }

      video.load();
    }
  }, [src, isYouTube, youTubeId, videoSrc]);

  // Event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    const handleSeeked = () => {
      if (videoRef.current) {
        console.log(
          "🎥 VideoPlayer - Video seeked to:",
          videoRef.current.currentTime
        );
        console.log(
          "🎥 VideoPlayer - Seek was triggered by:",
          new Error().stack?.split("\n")[1]
        );
      }
    };
    const handleError = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      const error = video.error;

      console.error("🎥 VideoPlayer - Error event triggered:", error);
      console.error("🎥 VideoPlayer - Video src:", video.src);
      console.error("🎥 VideoPlayer - Video networkState:", video.networkState);
      console.error("🎥 VideoPlayer - Video readyState:", video.readyState);

      // Try to get more details about the video file
      console.error("🎥 VideoPlayer - Video duration:", video.duration);
      console.error("🎥 VideoPlayer - Video currentTime:", video.currentTime);
      console.error(
        "🎥 VideoPlayer - Video buffered ranges:",
        video.buffered.length
      );

      // Test if the URL is accessible and get more info
      fetch(video.src, { method: "HEAD" })
        .then((response) => {
          console.log("🎥 VideoPlayer - Video URL HEAD response:", {
            status: response.status,
            contentType: response.headers.get("content-type"),
            contentLength: response.headers.get("content-length"),
            acceptRanges: response.headers.get("accept-ranges"),
            cacheControl: response.headers.get("cache-control"),
            url: video.src,
          });

          // Check if content-type is valid for video
          const contentType = response.headers.get("content-type");
          if (contentType && !contentType.startsWith("video/")) {
            console.warn(
              "🎥 VideoPlayer - Invalid content-type for video:",
              contentType,
              "Expected video/* format"
            );
          }

          // Check if file size is reasonable
          const contentLength = response.headers.get("content-length");
          if (contentLength) {
            const sizeInMB = parseInt(contentLength) / (1024 * 1024);
            console.log(
              "🎥 VideoPlayer - Video file size:",
              sizeInMB.toFixed(2),
              "MB"
            );

            if (sizeInMB < 0.1) {
              console.warn(
                "🎥 VideoPlayer - Video file seems too small, might be corrupted"
              );
            }
          }
        })
        .catch((fetchError) => {
          console.error(
            "🎥 VideoPlayer - Video URL not accessible:",
            fetchError,
            "URL:",
            video.src
          );
        });

      let errorMessage = "Error al cargar el video";
      let detailedMessage = "";

      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "La reproducción del video fue cancelada";
            detailedMessage =
              "El usuario canceló la reproducción o cambió de página";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Error de red al cargar el video";
            detailedMessage =
              "Verifica tu conexión a internet e intenta nuevamente";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = "Error al decodificar el video";
            detailedMessage =
              "El video tiene problemas de codificación o formato incompatible. Posibles causas: (1) Archivo de video corrupto, (2) Codec no soportado por el navegador, (3) Error durante la conversión, (4) Problema con el audio del video. Recomendación: Resubir el video o usar un navegador compatible con WebM.";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Formato de video no compatible";
            detailedMessage =
              "Este navegador no puede reproducir este formato de video. Intenta con Chrome o Firefox.";
            break;
          default:
            if (error.code === 4) {
              errorMessage = "Error de formato de video";
              detailedMessage =
                "El archivo puede estar corrupto o no ser un video válido.";
            } else {
              errorMessage = `Error de video (código: ${error.code})`;
              detailedMessage = "Error desconocido al reproducir el video";
            }
        }
      }

      // Handle different error scenarios
      if (
        video.src.includes("localhost:9000") ||
        video.src.includes("127.0.0.1:9000")
      ) {
        // Direct MinIO URL failed - likely 403 Forbidden
        console.error(
          "🎥 VideoPlayer - Direct MinIO access forbidden (403). This is normal - MinIO requires authentication."
        );
        console.log(
          "🎥 VideoPlayer - Attempting to use video proxy instead..."
        );

        // Convert back to proxy URL
        const proxyUrl = `/api/video-proxy?url=${encodeURIComponent(video.src)}`;
        console.log("🎥 VideoPlayer - Switching to proxy URL:", proxyUrl);
        video.src = proxyUrl;
        video.load();
        return; // Don't show error yet, give proxy URL a chance
      } else if (video.src.includes("/api/video-proxy")) {
        // Proxy URL also failed - this is a real problem
        console.error(
          "🎥 VideoPlayer - Video proxy also failed. Check server logs."
        );

        // For decode errors specifically, try browser compatibility checks and fixes
        if (error && error.code === MediaError.MEDIA_ERR_DECODE) {
          console.log(
            "❌ VideoPlayer - Decode error detected, running comprehensive diagnostics..."
          );

          // Enhanced browser capabilities check
          const browserSupport = {
            webm: {
              basic: video.canPlayType("video/webm"),
              vp8: video.canPlayType('video/webm; codecs="vp8"'),
              vp9: video.canPlayType('video/webm; codecs="vp9"'),
              vp9Opus: video.canPlayType('video/webm; codecs="vp9,opus"'),
            },
            mp4: {
              basic: video.canPlayType("video/mp4"),
              h264: video.canPlayType('video/mp4; codecs="avc1.42E01E"'),
              h264Aac: video.canPlayType(
                'video/mp4; codecs="avc1.42E01E,mp4a.40.2"'
              ),
              h264Advanced: video.canPlayType(
                'video/mp4; codecs="avc1.640028"'
              ),
            },
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            isWebKit: /webkit/i.test(navigator.userAgent),
            isChrome: /chrome/i.test(navigator.userAgent),
            isFirefox: /firefox/i.test(navigator.userAgent),
            isSafari:
              /safari/i.test(navigator.userAgent) &&
              !/chrome/i.test(navigator.userAgent),
          };

          console.log("🔍 Browser video support analysis:", browserSupport);

          // Enhanced format compatibility analysis
          const isWebM = video.src.includes(".webm");
          const isMP4 = video.src.includes(".mp4");

          if (isWebM) {
            const webmSupport = browserSupport.webm.vp9Opus;
            if (webmSupport === "") {
              console.warn(
                "⚠️ Browser doesn't support WebM/VP9/Opus format well"
              );
              errorMessage = "Formato WebM no soportado completamente";
              detailedMessage = `Tu navegador tiene soporte limitado para WebM con VP9/Opus. Soporte detectado: ${webmSupport}. Recomendación: Usar Chrome 29+, Firefox 28+, o Edge 79+.`;
            } else if (webmSupport === "maybe") {
              console.warn("⚠️ Browser has partial WebM support");
              errorMessage = "Soporte parcial para WebM";
              detailedMessage =
                "Tu navegador indica soporte parcial para WebM. El video podría tener problemas de reproducción debido a codecs específicos.";
            }
          } else if (isMP4) {
            const mp4Support = browserSupport.mp4.h264Aac;
            console.warn(
              "⚠️ MP4 decode error - likely conversion or corruption issue"
            );

            // Check if this might be a conversion issue
            const isConvertedFile = video.src.includes("lesson-");

            if (isConvertedFile) {
              errorMessage = "Error en video convertido";
              detailedMessage = `El video convertido tiene problemas de decodificación. Esto puede deberse a: (1) Problemas en la conversión FFmpeg, (2) Archivo original corrupto, (3) Codec incompatible. Recomendación: Intenta subir el video nuevamente en formato MP4 original.`;
            } else {
              errorMessage = "Error de decodificación MP4";
              detailedMessage = `Error al decodificar video MP4. Soporte H.264/AAC: ${mp4Support}. Posibles causas: codec incompatible, archivo corrupto, o codificación defectuosa.`;
            }
          } else {
            // For unknown format or other decode issues
            errorMessage = "Error de decodificación de video";
            detailedMessage = `El video tiene problemas de decodificación. Navegador: ${browserSupport.isChrome ? "Chrome" : browserSupport.isFirefox ? "Firefox" : browserSupport.isSafari ? "Safari" : "Desconocido"}. Intenta resubir el video o usar un navegador diferente.`;

            // Try to fix the video automatically as fallback
            attemptVideoAutoFix(video.src)
              .then((fixResult) => {
                if (fixResult.success && fixResult.fixedUrl) {
                  console.log(
                    "✅ VideoPlayer - Video auto-fix successful, reloading with fixed URL"
                  );
                  video.src = fixResult.fixedUrl;
                  video.load();
                  setError(null); // Clear error state
                  return; // Exit early, don't set error
                } else {
                  console.warn(
                    "⚠️ VideoPlayer - Video auto-fix failed:",
                    fixResult.error
                  );
                  // Error message already set above
                }
              })
              .catch((fixError) => {
                console.error(
                  "❌ VideoPlayer - Video auto-fix error:",
                  fixError
                );
                // Error message already set above
              });
          }
        } else {
          errorMessage = "Error del servidor de video";
          detailedMessage =
            "No se pudo cargar el video desde el servidor. Verifica la configuración del servidor.";
        }
      } else {
        // Other URL types failed
        console.error("🎥 VideoPlayer - Video failed to load from:", video.src);

        // Try to determine if it's a network or format issue
        if (error && error.code === MediaError.MEDIA_ERR_NETWORK) {
          errorMessage = "Error de red al cargar el video";
          detailedMessage =
            "Verifica tu conexión a internet e intenta nuevamente";
        } else if (error && error.code === MediaError.MEDIA_ERR_DECODE) {
          errorMessage = "Error al decodificar el video";
          detailedMessage =
            "El video puede tener problemas de codificación. Intenta con un navegador diferente (Chrome recomendado) o reporta este problema.";
        }
      }

      // Store both error messages for the UI
      setError(`${errorMessage}|${detailedMessage}`);
      setIsLoading(false);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("error", handleError);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("progress", handleProgress);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("error", handleError);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("progress", handleProgress);
    };
  }, [
    handleTimeUpdate,
    handleLoadedMetadata,
    handleProgress,
    onEnded,
    videoSrc,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skipTime(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skipTime(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          handleVolumeChange([Math.min(100, volume * 100 + 10)]);
          break;
        case "ArrowDown":
          e.preventDefault();
          handleVolumeChange([Math.max(0, volume * 100 - 10)]);
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    togglePlay,
    skipTime,
    handleVolumeChange,
    volume,
    toggleFullscreen,
    toggleMute,
  ]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [src]); // Limpiar timeout cuando cambia la fuente

  // Early returns after all hooks
  if (!src || !videoSrc) {
    return (
      <div
        className={cn(
          "bg-gradient-to-br from-gray-900 to-black flex items-center justify-center",
          className
        )}
      >
        <div className="text-white text-center p-8">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-gray-600 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Video No Disponible</h3>
          <p className="text-gray-300 mb-4">
            No se pudo cargar el contenido de video
          </p>
        </div>
      </div>
    );
  }

  // Early returns after all hooks
  if (error) {
    const [errorMessage, detailedMessage] = error.split("|");

    return (
      <div
        className={cn(
          "bg-gradient-to-br from-gray-900 to-black flex items-center justify-center",
          className
        )}
      >
        <div className="text-white text-center p-8 max-w-md">
          <div className="mb-6">
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-orange-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="absolute inset-0 animate-ping bg-orange-400 rounded-full opacity-20"></div>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-3">
            {errorMessage || "Error al Cargar Video"}
          </h3>

          {detailedMessage && (
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              {detailedMessage}
            </p>
          )}

          <div className="flex flex-col gap-3">
            {/* Botón de reintento */}
            <Button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                setIsInitialLoading(true);
                // Forzar recarga del video
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
              className="bg-white text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>

            {/* Botón para reparar video */}
            {errorMessage?.includes("decodificar") && (
              <Button
                variant="outline"
                onClick={async () => {
                  setError(null);
                  setIsLoading(true);
                  setIsInitialLoading(true);

                  try {
                    console.log("🔧 Manual video fix triggered");
                    const fixResult = await attemptVideoAutoFix(videoSrc);

                    if (fixResult.success && fixResult.fixedUrl) {
                      console.log("🔧 Manual video fix successful");
                      if (videoRef.current) {
                        videoRef.current.src = fixResult.fixedUrl;
                        videoRef.current.load();
                      }
                    } else {
                      console.error(
                        "🔧 Manual video fix failed:",
                        fixResult.error
                      );
                      setError(
                        `Error al reparar video|${fixResult.error || "No se pudo reparar el video automáticamente"}`
                      );
                      setIsLoading(false);
                      setIsInitialLoading(false);
                    }
                  } catch (fixError) {
                    console.error("🔧 Manual video fix error:", fixError);
                    setError(
                      `Error al reparar video|${(fixError as Error).message}`
                    );
                    setIsLoading(false);
                    setIsInitialLoading(false);
                  }
                }}
                className="border-orange-500 text-orange-300 hover:bg-orange-800 hover:text-white"
              >
                Intentar Reparar
              </Button>
            )}

            {/* Botón para resubir video (para videos convertidos problemáticos) */}
            {errorMessage?.includes("convertido") && (
              <Button
                variant="outline"
                onClick={() => {
                  alert(
                    "Para solucionar este problema:\n\n" +
                      "1. Ve a la página de administración\n" +
                      "2. Reemplaza este video con el archivo original\n" +
                      "3. Si el archivo original es MP4, suébelo directamente\n" +
                      "4. Si tienes problemas, prueba con un video MP4 diferente"
                  );
                }}
                className="border-blue-500 text-blue-300 hover:bg-blue-800 hover:text-white"
              >
                Guía para Resubir
              </Button>
            )}

            {/* Guía de solución de problemas */}
            {errorMessage?.includes("decodificar") && (
              <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
                <h4 className="text-sm font-medium text-white mb-2">
                  🔍 Solución de problemas:
                </h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Usa Chrome o Firefox (mejor soporte MP4)</li>
                  <li>
                    • Si el video se convierte, prueba resubir el original
                  </li>
                  <li>• Videos cortos en MP4 funcionan mejor sin conversión</li>
                  <li>• Verifica que el archivo original no esté corrupto</li>
                  <li>• Intenta con un formato diferente (AVI → MP4)</li>
                </ul>
              </div>
            )}

            {/* Botón para reportar problema con diagnóstico mejorado */}
            <Button
              variant="outline"
              onClick={() => {
                // Enhanced diagnostic info
                const diagnosticInfo = {
                  // Video source info
                  src: videoSrc,
                  originalSrc: src,
                  isWebM: videoSrc.includes(".webm"),
                  isMP4: videoSrc.includes(".mp4"),

                  // Browser info
                  userAgent: navigator.userAgent,
                  timestamp: new Date().toISOString(),

                  // Browser video support
                  webmSupport: {
                    basic:
                      videoRef.current?.canPlayType("video/webm") || "unknown",
                    vp9:
                      videoRef.current?.canPlayType(
                        'video/webm; codecs="vp9"'
                      ) || "unknown",
                    vp9Opus:
                      videoRef.current?.canPlayType(
                        'video/webm; codecs="vp9,opus"'
                      ) || "unknown",
                  },
                  mp4Support: {
                    basic:
                      videoRef.current?.canPlayType("video/mp4") || "unknown",
                    h264:
                      videoRef.current?.canPlayType(
                        'video/mp4; codecs="avc1.42E01E"'
                      ) || "unknown",
                    h264Aac:
                      videoRef.current?.canPlayType(
                        'video/mp4; codecs="avc1.42E01E,mp4a.40.2"'
                      ) || "unknown",
                  },

                  // Error details
                  errorMessage,
                  detailedMessage,

                  // Video element state
                  videoState: videoRef.current
                    ? {
                        readyState: videoRef.current.readyState,
                        networkState: videoRef.current.networkState,
                        error: videoRef.current.error
                          ? {
                              code: videoRef.current.error.code,
                              message: videoRef.current.error.message,
                            }
                          : null,
                      }
                    : null,
                };

                console.group("🎥 DIAGNOSTIC REPORT");
                console.log("Complete diagnostic information:", diagnosticInfo);
                console.groupEnd();

                // Copy to clipboard if available
                if (navigator.clipboard) {
                  navigator.clipboard
                    .writeText(JSON.stringify(diagnosticInfo, null, 2))
                    .then(() =>
                      alert(
                        "Información de diagnóstico copiada al portapapeles y guardada en consola."
                      )
                    )
                    .catch(() =>
                      alert(
                        "Información de diagnóstico guardada en consola. Por favor comparte esta información con soporte técnico."
                      )
                    );
                } else {
                  alert(
                    "Información de diagnóstico guardada en consola. Por favor comparte esta información con soporte técnico."
                  );
                }
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Generar Diagnóstico
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative bg-black group h-full min-h-[400px]", className)}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }}
    >
      {/* Video Element */}
      {isYouTube && youTubeId ? (
        <iframe
          src={`https://www.youtube.com/embed/${youTubeId}?enablejsapi=1&origin=${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}`}
          className={cn(
            "w-full h-full transition-opacity duration-500",
            isInitialLoading ? "opacity-0" : "opacity-100"
          )}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title || "Video"}
          onLoad={() => {
            console.log("🎥 VideoPlayer - YouTube iframe loaded");
            setIsLoading(false);
            setIsInitialLoading(false);
          }}
          onError={(e) => {
            console.error("🎥 VideoPlayer - YouTube iframe error:", e);
            setError("Error al cargar el video de YouTube");
            setIsLoading(false);
            setIsInitialLoading(false);
          }}
        />
      ) : (
        <video
          ref={videoRef}
          src={videoSrc}
          key={videoSrc} // Forzar re-render cuando cambia la fuente
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isInitialLoading ? "opacity-0" : "opacity-100"
          )}
          preload="metadata"
          playsInline
          onDoubleClick={toggleFullscreen}
        />
      )}

      {/* Initial Loading Overlay - Hidden for YouTube videos */}
      {!isYouTube && isInitialLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-600 border-t-purple-400"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-300 opacity-30"></div>
            </div>
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-lg">
                Preparando Video
              </h3>
              <p className="text-purple-200 text-sm">
                Cargando contenido multimedia...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Buffering Overlay - Hidden for YouTube videos */}
      {!isYouTube && isLoading && !isInitialLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-gray-600 border-t-purple-500 mb-3"></div>
            <p className="text-white text-sm font-medium">Cargando...</p>
          </div>
        </div>
      )}

      {/* Play Button Overlay - Hidden for YouTube videos */}
      {!isYouTube && !isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Button
            onClick={togglePlay}
            size="lg"
            className="bg-white/30 backdrop-blur-md hover:bg-white/40 text-white border border-white/40 transition-all duration-200 shadow-xl"
          >
            <Play className="h-8 w-8 ml-1" />
          </Button>
        </div>
      )}

      {/* Controls Overlay - Hidden for YouTube videos */}
      {!isYouTube && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 transition-opacity duration-300 backdrop-blur-md z-10",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Progress Bar */}
          <div className="relative mb-4">
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
            {/* Buffered Progress */}
            <div
              className="absolute top-1/2 left-0 h-1 bg-white/30 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(0, buffered || 0))}%`,
                transform: "translateY(-50%)",
              }}
            />
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              {/* Skip Back/Forward */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => skipTime(-10)}
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => skipTime(10)}
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              {/* Volume Control */}
              <div className="relative flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>

                {showVolumeSlider && (
                  <div
                    className="absolute bottom-full left-0 mb-2 p-2 bg-black/80 rounded"
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <Slider
                      value={[isMuted ? 0 : volume * 100]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      orientation="vertical"
                      className="h-20"
                    />
                  </div>
                )}
              </div>

              {/* Time Display */}
              <div className="text-white text-sm ml-4">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Playback Rate */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4" />
                </Button>

                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 p-2 bg-black/80 rounded min-w-[120px]">
                    <div className="text-white text-xs mb-2">Velocidad</div>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          handlePlaybackRateChange(rate);
                          setShowSettings(false);
                        }}
                        className={cn(
                          "block w-full text-left px-2 py-1 text-sm text-white hover:bg-white/20 rounded",
                          playbackRate === rate && "bg-white/20"
                        )}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Title Overlay */}
      {title && (
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 inline-block">
            <h2 className="text-white text-lg font-semibold drop-shadow-lg">
              {title}
            </h2>
          </div>
        </div>
      )}
    </div>
  );
};
