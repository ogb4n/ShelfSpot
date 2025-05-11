"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import ItemsTable from "@/components/ItemsTable";
import useGetRooms from "@/app/hooks/useGetRooms";
import useGetPlaces from "@/app/hooks/useGetPlaces";
import useGetTags from "@/app/hooks/useGetTags";
import useGetContainers from "@/app/hooks/useGetContainers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useGetItems from "@/app/hooks/useGetItems";
import DashboardCharts from "@/components/DashboardCharts";
import { Eye, EyeOff } from "lucide-react";

// Types pour les entités
interface Room { id: number; name: string; }
interface Place { id: number; name: string; }
interface Container { id: number; name: string; }
interface Tag { id: number; name: string; icon?: string; }
interface Item { id: number; name: string; }

const Dashboard = () => {
  const { rooms, loading: loadingRooms } = useGetRooms() as { rooms: Room[]; loading: boolean };
  const { places, loading: loadingPlaces } = useGetPlaces() as { places: Place[]; loading: boolean };
  const { tags, loading: loadingTags } = useGetTags() as { tags: Tag[]; loading: boolean };
  const { containers, loading: loadingContainers } = useGetContainers() as { containers: Container[]; loading: boolean };
  const { items, loading: loadingItems } = useGetItems() as { items: Item[]; loading: boolean };
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    quantity: 1,
    roomId: "",
    placeId: "",
    containerId: "",
    tags: [] as string[],
    status: "",
    consumable: false, // Ajout du champ consumable
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCharts, setShowCharts] = useState(true);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  };

  const handleTagToggle = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/items/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          quantity: form.quantity,
          roomId: Number(form.roomId),
          placeId: form.placeId ? Number(form.placeId) : undefined,
          containerId: form.containerId ? Number(form.containerId) : undefined,
          tags: form.tags,
          status: form.status,
          consumable: form.consumable, // Ajout de consumable à la requête
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la création de l'objet");
      setSuccess(true);
      setForm({ name: "", quantity: 1, roomId: "", placeId: "", containerId: "", tags: [], status: "", consumable: false });
      setShowForm(false);
      setRefreshKey((k) => k + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-theme-bg">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header widgets row */}
        <div className="flex flex-row gap-6 mb-2 w-full">
          <Card className="flex flex-col justify-center items-center flex-1 min-w-[180px] max-w-xs py-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Objets dans la maison</div>
            <div className="text-3xl font-bold text-primary">{loadingItems ? <span className="text-base">...</span> : items.length}</div>
          </Card>
          <Card className="flex flex-col justify-center items-center flex-1 min-w-[180px] max-w-xs py-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Alertes récentes</div>
            <div className="text-lg font-semibold text-primary">Non implémenté</div>
            <div className="text-xs text-muted-foreground mt-1">(à venir)</div>
          </Card>
          <Card className="flex flex-col justify-center items-center flex-1 min-w-[180px] max-w-xs py-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Objets perdus</div>
            <div className="text-lg font-semibold text-primary">Non implémenté</div>
            <div className="text-xs text-muted-foreground mt-1">(à venir)</div>
          </Card>
          <Card className="flex flex-col justify-center items-center flex-1 min-w-[180px] max-w-xs py-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Valeur revente</div>
            <div className="text-lg font-semibold text-primary">Non implémenté</div>
            <div className="text-xs text-muted-foreground mt-1">(à venir)</div>
          </Card>
        </div>
        {/* Bouton icône discret afficher/masquer les graphs avec tooltip */}
        <div className="flex justify-end mb-2">
          <div className="relative group">
            <button
              onClick={() => setShowCharts(v => !v)}
              className="p-2 rounded hover:bg-muted transition-colors text-muted-foreground"
              aria-label={showCharts ? "Masquer les graphiques" : "Afficher les graphiques"}
            >
              {showCharts ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <div className="absolute right-0 top-full mt-1 z-10 hidden group-hover:block bg-neutral-800 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
              {showCharts ? "Masquer les graphiques" : "Afficher les graphiques"}
            </div>
          </div>
        </div>
        {/* Graphiques dashboard */}
        {showCharts && <DashboardCharts />}
        {/* Main table section */}
        <div className="w-full">
          <h1 className="text-2xl font-bold mb-4">Inventaire</h1>
          <ItemsTable
            key={refreshKey}
            onCreate={() => setShowForm(v => !v)}
            showCreateForm={showForm}
          >
            <form className="p-4 theme-card theme-border flex flex-col gap-2" onSubmit={handleSubmit}>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nom de l'objet"
                required
                className="theme-input rounded px-2 py-1"
              />
              <input
                name="quantity"
                type="number"
                min={1}
                value={form.quantity}
                onChange={handleChange}
                placeholder="Quantité"
                className="theme-input rounded px-2 py-1"
              />
              <select
                name="roomId"
                value={form.roomId}
                onChange={handleChange}
                required
                className="theme-input rounded px-2 py-1"
              >
                <option value="">Sélectionner une pièce</option>
                {loadingRooms ? <option>Chargement...</option> : rooms.map((room: Room) => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
              <select
                name="placeId"
                value={form.placeId}
                onChange={handleChange}
                className="theme-input rounded px-2 py-1"
              >
                <option value="">Sélectionner un emplacement (optionnel)</option>
                {loadingPlaces ? <option>Chargement...</option> : places.map((place: Place) => (
                  <option key={place.id} value={place.id}>{place.name}</option>
                ))}
              </select>
              <select
                name="containerId"
                value={form.containerId}
                onChange={handleChange}
                className="theme-input rounded px-2 py-1"
              >
                <option value="">Sélectionner un contenant (optionnel)</option>
                {loadingContainers ? <option>Chargement...</option> : containers.map((container: Container) => (
                  <option key={container.id} value={container.id}>{container.name}</option>
                ))}
              </select>
              <input
                name="status"
                value={form.status}
                onChange={handleChange}
                placeholder="Statut (optionnel)"
                className="theme-input rounded px-2 py-1"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="consumable"
                  checked={form.consumable}
                  onChange={handleChange}
                  className="theme-input"
                />
                <label htmlFor="consumable">Consommable</label>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {loadingTags ? (
                  <span>Chargement des tags…</span>
                ) : (
                  tags.map((tag: Tag) => (
                    <button
                      type="button"
                      key={tag.id}
                      className={`px-2 py-1 rounded text-xs border ${form.tags.includes(tag.name) ? "theme-primary border-primary" : "theme-muted border-muted"}`}
                      onClick={() => handleTagToggle(tag.name)}
                    >
                      {tag.icon ? <span className="mr-1">{tag.icon}</span> : null}{tag.name}
                    </button>
                  ))
                )}
              </div>
              <Button type="submit" disabled={loading} className="mt-2">
                {loading ? "Création..." : "Créer"}
              </Button>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">Objet créé !</div>}
            </form>
          </ItemsTable>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
