import { useEffect, useState } from "react";
import { UserCheck, Plus, Trash2, Phone, X, ShieldCheck } from "lucide-react";
import { haptic } from "@/lib/despia";
import { toast } from "sonner";

interface Reference {
  id: string;
  name: string;
  role: string;
  phone: string;
  note: string;
  confirmed: boolean;
}

const KEY = "kejasure_provider_references_v1";

const load = (): Reference[] => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const ProviderReferences = () => {
  const [refs, setRefs] = useState<Reference[]>(load);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(refs));
    } catch {
      // ignore
    }
  }, [refs]);

  const reset = () => { setName(""); setRole(""); setPhone(""); setNote(""); setShowAdd(false); };

  const add = () => {
    if (!name.trim() || phone.trim().length < 9) return;
    setRefs((prev) => [
      { id: String(Date.now()), name: name.trim(), role: role.trim() || "Past client", phone: phone.trim(), note: note.trim(), confirmed: false },
      ...prev,
    ]);
    haptic("success");
    toast.success("Reference added", { description: "We'll send them a one-tap confirmation request." });
    reset();
  };

  const remove = (id: string) => {
    haptic("light");
    setRefs((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="p-4 rounded-2xl bg-card card-shadow">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-primary" /> Client references
          </p>
          <p className="text-[10px] text-muted-foreground">Past clients who can vouch for your work</p>
        </div>
        <button
          onClick={() => { haptic("light"); setShowAdd(true); }}
          className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4 text-primary" />
        </button>
      </div>

      {refs.length === 0 ? (
        <p className="text-[11px] text-muted-foreground py-3 text-center">
          No references yet. Two confirmed references unlock the Trusted Pro badge faster.
        </p>
      ) : (
        <div className="space-y-2">
          {refs.map((r) => (
            <div key={r.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-secondary/60">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {r.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold flex items-center gap-1 truncate">
                  {r.name}
                  {r.confirmed && <ShieldCheck className="w-3 h-3 text-trust shrink-0" />}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {r.role} · {r.confirmed ? "Confirmed" : "Awaiting confirmation"}
                </p>
                {r.note && <p className="text-[10px] text-muted-foreground truncate italic">"{r.note}"</p>}
              </div>
              <button onClick={() => remove(r.id)} className="p-1.5 text-muted-foreground">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-[80] flex items-end bg-foreground/40 backdrop-blur-sm animate-fade-in" onClick={reset}>
          <div className="w-full bg-card rounded-t-3xl p-5 safe-bottom animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold">Add a reference</p>
              <button onClick={reset} className="p-1 text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name"
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm outline-none focus:border-primary" />
              <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="How they know you (e.g. Kitchen plumbing, Kilimani)"
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm outline-none focus:border-primary" />
              <div className="relative">
                <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ""))} inputMode="tel" placeholder="07XX XXX XXX"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-sm outline-none focus:border-primary" />
              </div>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="What did you do for them? (optional)"
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm outline-none focus:border-primary resize-none" />
              <p className="text-[10px] text-muted-foreground">
                We only send them a short confirmation message. Their number is never shown on your profile.
              </p>
              <button
                onClick={add}
                disabled={!name.trim() || phone.trim().length < 9}
                className="w-full py-3.5 rounded-xl gradient-trust text-sm font-bold text-primary-foreground disabled:opacity-40 active:scale-[0.98] transition-transform"
              >
                Send confirmation request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderReferences;
