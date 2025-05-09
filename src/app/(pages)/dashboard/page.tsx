"use client";
import { useState } from "react";
import ItemsTable from "@/components/ItemsTable";
import useGetRooms from "@/app/hooks/useGetRooms";
import useGetPlaces from "@/app/hooks/useGetPlaces";
import useGetTags from "@/app/hooks/useGetTags";
import useGetContainers from "@/app/hooks/useGetContainers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useGetItems from "@/app/hooks/useGetItems";

const Dashboard = () => {
  const { rooms, loading: loadingRooms } = useGetRooms();
  const { places, loading: loadingPlaces } = useGetPlaces();
  const { tags, loading: loadingTags } = useGetTags();
  const { containers, loading: loadingContainers } = useGetContainers();
  const { items, loading: loadingItems } = useGetItems();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    quantity: 1,
    roomId: "",
    placeId: "",
    containerId: "",
    tags: [] as string[],
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleTagToggle = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = async (e: any) => {
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
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la création de l'objet");
      setSuccess(true);
      setForm({ name: "", quantity: 1, roomId: "", placeId: "", containerId: "", tags: [], status: "" });
      setShowForm(false);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24">
      <div className="w-full max-w-2xl mb-8">
        <Card className="flex flex-col gap-4 items-center">
          <div className="flex items-center gap-4 w-full justify-between">
            <div className="text-lg font-semibold">Objets dans la maison</div>
            <div className="text-3xl font-bold text-blue-600">
              {loadingItems ? <span className="text-base">...</span> : items.length}
            </div>
          </div>
          <Button onClick={() => setShowForm((v) => !v)} className="w-full">
            {showForm ? "Annuler" : "Créer un objet"}
          </Button>
        </Card>
        {showForm && (
          <form className="mt-4 p-4 border rounded bg-white dark:bg-black flex flex-col gap-2" onSubmit={handleSubmit}>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nom de l'objet"
              required
              className="border rounded px-2 py-1"
            />
            <input
              name="quantity"
              type="number"
              min={1}
              value={form.quantity}
              onChange={handleChange}
              placeholder="Quantité"
              className="border rounded px-2 py-1"
            />
            <select
              name="roomId"
              value={form.roomId}
              onChange={handleChange}
              required
              className="border rounded px-2 py-1"
            >
              <option value="">Sélectionner une pièce</option>
              {loadingRooms ? <option>Chargement...</option> : rooms.map((room: any) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
            <select
              name="placeId"
              value={form.placeId}
              onChange={handleChange}
              className="border rounded px-2 py-1"
            >
              <option value="">Sélectionner un emplacement (optionnel)</option>
              {loadingPlaces ? <option>Chargement...</option> : places.map((place: any) => (
                <option key={place.id} value={place.id}>{place.name}</option>
              ))}
            </select>
            <select
              name="containerId"
              value={form.containerId}
              onChange={handleChange}
              className="border rounded px-2 py-1"
            >
              <option value="">Sélectionner un contenant (optionnel)</option>
              {loadingContainers ? <option>Chargement...</option> : containers.map((container: any) => (
                <option key={container.id} value={container.id}>{container.name}</option>
              ))}
            </select>
            <input
              name="status"
              value={form.status}
              onChange={handleChange}
              placeholder="Statut (optionnel)"
              className="border rounded px-2 py-1"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {loadingTags ? (
                <span>Chargement des tags…</span>
              ) : (
                tags.map((tag: any) => (
                  <button
                    type="button"
                    key={tag.id}
                    className={`px-2 py-1 rounded text-xs border ${form.tags.includes(tag.name) ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 border-gray-300 text-gray-800"}`}
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
        )}
      </div>
      <div className="w-full max-w-5xl">
        <ItemsTable key={refreshKey} />
      </div>
    </main>
  );
};

export default Dashboard;
