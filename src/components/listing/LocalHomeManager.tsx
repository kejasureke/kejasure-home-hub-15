import { useState } from "react";
import { Pencil } from "lucide-react";
import { localHomes, homeDetails, useHouseHunting } from "@/lib/houseHunting";
import { translate as t, useLanguage } from "@/lib/language";
import { Button } from "@/components/ui/button";
import ListingCRUD from "@/components/ListingCRUD";
import type { Property } from "@/data/mockData";

export default function LocalHomeManager() {
  useLanguage(); useHouseHunting();
  const [editing, setEditing] = useState<Property | null>(null);
  const listings = localHomes();
  if (!listings.length) return null;
  return <section className="px-4 py-4 space-y-3 border-y border-border">
    <h2 className="font-semibold">{t("Listings saved on this phone")}</h2>
    <p className="text-xs text-muted-foreground">{t("These details are not published to other users yet.")}</p>
    {listings.map(p => <div key={p.id} className="flex items-center justify-between gap-3"><p className="text-sm flex-1 min-w-0 break-words">{p.title}</p><Button variant="outline" size="sm" onClick={() => setEditing(p)}><Pencil />{t("Edit")}</Button></div>)}
    {editing && <ListingCRUD type={editing.corporate ? "corporate" : editing.type} onClose={() => setEditing(null)} editData={{ id: editing.id, title: editing.title, description: editing.description, county: editing.county, subcounty: editing.subcounty, estate: editing.estate, price: String(editing.price), priceUnit: editing.priceUnit, photos: editing.images, bedrooms: editing.bedrooms, bathrooms: editing.bathrooms, amenities: editing.amenities, deposit: homeDetails(editing).deposit === undefined ? "" : String(homeDetails(editing).deposit) }} />}
  </section>;
}