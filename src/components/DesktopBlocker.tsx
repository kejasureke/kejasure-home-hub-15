const DesktopBlocker = () => {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background px-8 text-center">
      <div className="w-20 h-20 rounded-3xl gradient-trust flex items-center justify-center mb-6">
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <circle cx="60" cy="52" r="38" stroke="white" strokeWidth="5" fill="none" />
          <path d="M60 25 L40 42 L80 42 Z" fill="white" />
          <rect x="44" y="42" width="32" height="24" fill="white" />
          <rect x="55" y="50" width="10" height="16" fill="hsl(150, 60%, 20%)" rx="1" />
          <path d="M30 75 Q35 65, 50 68 Q55 69, 60 68 Q65 67, 70 68 Q85 65, 90 75 Q75 78, 60 78 Q45 78, 30 75 Z" fill="white" opacity="0.9" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">KejaSure</h1>
      <p className="text-base text-muted-foreground mb-6">
        KejaSure is a mobile app.<br />
        Please open on your phone for the best experience.
      </p>
      <div className="flex items-center gap-3">
        <div className="px-4 py-2.5 rounded-xl bg-secondary text-sm font-medium text-secondary-foreground">
          📱 Android
        </div>
        <div className="px-4 py-2.5 rounded-xl bg-secondary text-sm font-medium text-secondary-foreground">
          🍎 iOS
        </div>
      </div>
      <p className="text-xs text-muted-foreground/60 mt-8">
        Pata Keja, Be Sure.
      </p>
    </div>
  );
};

export default DesktopBlocker;
