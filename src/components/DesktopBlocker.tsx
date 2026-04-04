import logoFull from "@/assets/logo-green-transparent.png";

const DesktopBlocker = () => {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background px-8 text-center">
      <img src={logoFull} alt="KejaSure" className="w-40 h-40 object-contain mb-6" />
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
