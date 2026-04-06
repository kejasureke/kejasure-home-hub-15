import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack } from "lucide-react";
import { useState, useRef } from "react";

interface VideoTourPlayerProps {
  videoUrl: string;
  title: string;
  onBack: () => void;
  rooms?: { label: string; timestamp: number }[];
}

const VideoTourPlayer = ({ videoUrl, title, onBack, rooms }: VideoTourPlayerProps) => {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentRoom, setCurrentRoom] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) videoRef.current.pause();
      else videoRef.current.play();
      setPlaying(!playing);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(isNaN(pct) ? 0 : pct);

      if (rooms) {
        const cur = videoRef.current.currentTime;
        for (let i = rooms.length - 1; i >= 0; i--) {
          if (cur >= rooms[i].timestamp) { setCurrentRoom(i); break; }
        }
      }
    }
  };

  const seekTo = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      if (!playing) { videoRef.current.play(); setPlaying(true); }
    }
  };

  const seekRelative = (sec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + sec));
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pct * videoRef.current.duration;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground flex flex-col">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 p-4 bg-gradient-to-b from-foreground/80 to-transparent">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-card/20 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-background" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-background truncate">{title}</p>
          <p className="text-[10px] text-background/60">Video Tour</p>
        </div>
      </div>

      {/* Video */}
      <div className="flex-1 flex items-center justify-center bg-foreground" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          muted={muted}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setPlaying(false)}
          playsInline
        />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="w-7 h-7 text-primary-foreground ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-foreground/95 px-4 pt-3 pb-6">
        {/* Progress bar */}
        <div className="mb-3 cursor-pointer" onClick={handleProgressClick}>
          <div className="h-1.5 rounded-full bg-background/20 overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setMuted(!muted)} className="p-2">
            {muted ? <VolumeX className="w-5 h-5 text-background/60" /> : <Volume2 className="w-5 h-5 text-background/60" />}
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => seekRelative(-10)} className="p-2">
              <SkipBack className="w-5 h-5 text-background/60" />
            </button>
            <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              {playing ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-primary-foreground ml-0.5" />}
            </button>
            <button onClick={() => seekRelative(10)} className="p-2">
              <SkipForward className="w-5 h-5 text-background/60" />
            </button>
          </div>
          <div className="p-2"><Maximize className="w-5 h-5 text-background/60" /></div>
        </div>

        {/* Room-by-room chapters */}
        {rooms && rooms.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {rooms.map((room, i) => (
              <button
                key={i}
                onClick={() => seekTo(room.timestamp)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  currentRoom === i ? "bg-primary text-primary-foreground" : "bg-background/10 text-background/60"
                }`}
              >
                {room.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoTourPlayer;
