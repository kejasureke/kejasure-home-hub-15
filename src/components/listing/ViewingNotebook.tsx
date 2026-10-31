import { useState } from "react";
import { ArrowLeft, Camera, Check, Trash2, GitCompare, Save } from "lucide-react";
import type { Property } from "@/data/mockData";
import { useHardwareBack } from "@/hooks/useHardwareBack";
import { viewingNotes, saveViewingNote, deleteViewingNote, useHouseHunting, type ViewingNote } from "@/lib/houseHunting";
import { translate as t, useLanguage } from "@/lib/language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const checks = ["Water", "Noise", "Mobile signal", "Damp", "Security", "Access"];
export default function ViewingNotebook({ property, onClose }: { property?: Property; onClose: () => void }) {
  useLanguage(); useHouseHunting(); useHardwareBack(true, onClose);
  const existing = viewingNotes().find(n => n.id === property?.id);
  const [draft, setDraft] = useState<ViewingNote | null>(() => existing || (property ? { id: property.id, title: property.title, estate: property.estate, price: property.price, date: new Date().toISOString().slice(0, 10), checks: {}, notes: "", photos: [] } : null));
  const [compare, setCompare] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);
  const all = viewingNotes();
  const update = (v: Partial<ViewingNote>) => { if (draft) { setDraft({ ...draft, ...v }); setDirty(true); } };
  const leave = () => { if (!dirty || window.confirm(t("Discard unsaved notes?"))) onClose(); };
  const addPhotos = async (files: FileList | null) => {
    if (!files || !draft) return;
    try {
      const images = await Promise.all(Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, 4 - draft.photos.length).map(file => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
          const img = new Image(); img.onerror = reject;
          img.onload = () => { const canvas = document.createElement("canvas"); const ratio = Math.min(1, 900 / Math.max(img.width, img.height)); canvas.width = img.width * ratio; canvas.height = img.height * ratio; canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL("image/jpeg", .65)); };
          img.src = String(reader.result);
        }; reader.readAsDataURL(file);
      })));
      update({ photos: [...draft.photos, ...images] });
    } catch { toast.error(t("Could not save photo")); }
  };
  const compared = all.filter(n => selected.includes(n.id));
  return <div className="fixed inset-0 z-[85] bg-background overflow-y-auto animate-slide-up">
    <header className="sticky top-0 bg-background border-b border-border px-4 pt-safe-compact pb-3 flex items-center gap-3 z-10"><Button variant="secondary" size="icon" aria-label={t("Back")} onClick={leave}><ArrowLeft /></Button><h1 className="font-bold flex-1">{t("Viewing notebook")}</h1>{draft && <Button variant="ghost" size="sm" onClick={() => { if (dirty && !window.confirm(t("Discard unsaved notes?"))) return; setDraft(null); setDirty(false); }}>{t("All notes")}</Button>}</header>
    <div className="px-4 py-5 pb-32 space-y-5">
      <p className="text-xs text-muted-foreground">{t("Private notes and photos. Saved only on this phone, not posted as reviews.")}</p>
      {draft ? <>
        <div><h2 className="font-semibold">{draft.title}</h2><p className="text-xs text-muted-foreground">{draft.estate} · KES {draft.price.toLocaleString("en-KE")}</p></div>
        <label className="block text-xs space-y-2"><span>{t("Viewing date")}</span><Input type="date" value={draft.date} onChange={e => update({ date: e.target.value })} /></label>
        <div className="space-y-3">{checks.map(key => <div key={key} className="flex items-center justify-between gap-2"><span className="text-sm">{t(key)}</span><div className="flex gap-1">{(["good", "concern", "unchecked"] as const).map(status => <Button size="sm" className="px-2 text-xs" variant={(draft.checks[key] || "unchecked") === status ? "default" : "outline"} key={status} onClick={() => update({ checks: { ...draft.checks, [key]: status } })}>{t(status === "good" ? "Good" : status === "concern" ? "Concern" : "Not checked")}</Button>)}</div></div>)}</div>
        <label className="block text-xs space-y-2"><span>{t("My notes")}</span><Textarea value={draft.notes} maxLength={2000} onChange={e => update({ notes: e.target.value })} /></label>
        <label className="block text-xs space-y-2"><span>{t("My destination")}</span><Input value={draft.destination || ""} onChange={e => update({ destination: e.target.value })} /></label>
        <label className="block text-xs space-y-2"><span>{t("My commute notes")}</span><Input value={draft.commute || ""} onChange={e => update({ commute: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-3">{draft.photos.map((src, i) => <div key={i} className="relative"><img src={src} alt={t("Private viewing photo")} className="w-full aspect-square object-cover rounded-lg" /><Button variant="destructive" size="icon" aria-label={t("Remove photo")} className="absolute right-2 top-2" onClick={() => update({ photos: draft.photos.filter((_, index) => index !== i) })}><Trash2 /></Button></div>)}</div>
        {draft.photos.length < 4 && <label className="flex items-center justify-center gap-2 border border-input rounded-md p-3 text-sm cursor-pointer"><Camera className="size-4" />{t("Add private photos")}<input className="sr-only" type="file" accept="image/*" multiple onChange={e => { void addPhotos(e.target.files); e.target.value = ""; }} /></label>}
        <Button className="w-full" onClick={() => { try { saveViewingNote(draft); setDirty(false); toast.success(t("Notes saved on this phone")); } catch { toast.error(t("Phone storage is full. Remove a photo and try again.")); } }}><Save />{t("Save notes")}</Button>
      </> : <>
        <div className="flex items-center justify-between"><h2 className="font-semibold">{t("Visited homes")}</h2><Button variant="outline" size="sm" disabled={selected.length < 2} onClick={() => setCompare(!compare)}><GitCompare />{t(compare ? "List" : "Compare")}</Button></div>
        {all.length === 0 && <p className="py-8 text-sm text-muted-foreground">{t("No viewing notes yet")}</p>}
        {compare ? <div className="overflow-x-auto"><table className="text-xs w-full border-collapse"><thead><tr><th className="p-2 text-left">{t("Details")}</th>{compared.map(n => <th key={n.id} className="p-2 text-left min-w-36">{n.title}</th>)}</tr></thead><tbody>{["Rent", "Viewing date", ...checks, "My commute notes", "My notes"].map(key => <tr key={key} className="border-t border-border"><th className="text-left p-2">{t(key)}</th>{compared.map(n => <td key={n.id} className="p-2 align-top break-words">{key === "Rent" ? `KES ${n.price.toLocaleString("en-KE")}` : key === "Viewing date" ? n.date : key === "My notes" ? n.notes || "—" : key === "My commute notes" ? n.commute || "—" : t(n.checks[key] === "good" ? "Good" : n.checks[key] === "concern" ? "Concern" : "Not checked")}</td>)}</tr>)}</tbody></table></div> : all.map(n => <div key={n.id} className="border-b border-border pb-4 space-y-2"><div className="flex gap-2 items-start"><Button variant={selected.includes(n.id) ? "default" : "outline"} size="icon" aria-label={`${t("Select for comparison")}: ${n.title}`} aria-pressed={selected.includes(n.id)} onClick={() => setSelected(s => s.includes(n.id) ? s.filter(id => id !== n.id) : [...s, n.id].slice(-3))}><Check /></Button><div className="min-w-0 flex-1"><p className="font-semibold text-sm">{n.title}</p><p className="text-xs text-muted-foreground">{n.estate} · {n.date}</p></div><Button variant="ghost" size="icon" aria-label={t("Delete note")} onClick={() => { if (window.confirm(t("Delete this private note?"))) { deleteViewingNote(n.id); setSelected(s => s.filter(id => id !== n.id)); } }}><Trash2 /></Button></div><Button variant="secondary" size="sm" onClick={() => { setDraft(n); setCompare(false); }}>{t("Open notes")}</Button></div>)}
      </>}
    </div>
  </div>;
}