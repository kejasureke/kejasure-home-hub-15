import { ArrowLeft, Bell, BellOff, TrendingDown, Trash2 } from "lucide-react";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";

interface PriceDropAlertsScreenProps {
  onBack: () => void;
  onViewProperty?: (id: string) => void;
}

const PriceDropAlertsScreen = ({ onBack, onViewProperty }: PriceDropAlertsScreenProps) => {
  const { alerts, markSeen, markAllSeen, clearAlerts } = usePriceAlerts();

  return (
    <div className="fixed inset-0 z-40 bg-background overflow-y-auto animate-slide-up">
      <div className="gradient-trust px-4 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-primary-foreground">Price Drop Alerts</h1>
            <p className="text-xs text-primary-foreground/70">{alerts.length} alerts</p>
          </div>
          {alerts.length > 0 && (
            <div className="flex gap-2">
              <button onClick={markAllSeen} className="px-3 py-1.5 rounded-lg bg-card/20 text-[10px] font-medium text-primary-foreground">
                Mark all read
              </button>
              <button onClick={clearAlerts} className="p-2 rounded-lg bg-card/20">
                <Trash2 className="w-3.5 h-3.5 text-primary-foreground" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 pb-32">
        {alerts.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm font-semibold text-muted-foreground">No price alerts yet</p>
            <p className="text-xs text-muted-foreground mt-1">Track properties to get notified when prices drop</p>
          </div>
        ) : (
          alerts.map(alert => (
            <button
              key={alert.id}
              onClick={() => {
                markSeen(alert.id);
                onViewProperty?.(alert.propertyId);
              }}
              className={`w-full text-left p-4 rounded-2xl card-shadow transition-all active:scale-[0.98] ${
                alert.seen ? "bg-card" : "bg-trust/5 border border-trust/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  alert.seen ? "bg-secondary" : "bg-trust/15"
                }`}>
                  <TrendingDown className={`w-5 h-5 ${alert.seen ? "text-muted-foreground" : "text-trust"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-1">{alert.propertyTitle}</p>
                  <p className="text-[10px] text-muted-foreground">{alert.estate}, {alert.county}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-muted-foreground line-through">
                      KES {alert.oldPrice.toLocaleString("en-KE")}
                    </span>
                    <span className="text-xs font-bold text-trust">
                      KES {alert.newPrice.toLocaleString("en-KE")}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-trust/15 text-[9px] font-bold text-trust">
                      -{alert.dropPercent}%
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(alert.timestamp).toLocaleDateString("en-KE", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
                {!alert.seen && <div className="w-2.5 h-2.5 rounded-full bg-trust shrink-0 mt-1" />}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default PriceDropAlertsScreen;
