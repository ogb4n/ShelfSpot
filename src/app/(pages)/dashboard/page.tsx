"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import ItemsTable from "@/components/ItemsTable";
import useGetRooms from "@/app/hooks/useGetRooms";
import useGetPlaces from "@/app/hooks/useGetPlaces";
import useGetTags from "@/app/hooks/useGetTags";
import useGetContainers from "@/app/hooks/useGetContainers";
import { Card } from "@/components/ui/card";
import useGetItems from "@/app/hooks/useGetItems";

// Types pour les entités
interface Room { id: number; name: string; }
interface Place { id: number; name: string; }
interface Container { id: number; name: string; }
interface Tag {
  icon: any; id: number; name: string;
}
interface Item { id: number; name: string; }

const Dashboard = () => {
  const { rooms, loading: loadingRooms } = useGetRooms() as { rooms: Room[]; loading: boolean };
  const { places, loading: loadingPlaces } = useGetPlaces() as { places: Place[]; loading: boolean };
  const { tags, loading: loadingTags } = useGetTags() as { tags: Tag[]; loading: boolean };
  const { containers, loading: loadingContainers } = useGetContainers() as { containers: Container[]; loading: boolean };
  const { data: items, loading: loadingItems } = useGetItems();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    quantity: 1,
    roomId: "",
    placeId: "",
    containerId: "",
    tags: [] as string[],
    status: "",
    consumable: false,
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
    <main className="w-full bg-theme-bg p-6">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex flex-row gap-6 mb-2 w-full justify-center">
          <Card
            className="glass-card bg-white/10 dark:bg-black/20 backdrop-blur-md border-white/20 drop-shadow-xl"
            style={{ boxShadow: "0 4px 24px 0 rgba(31, 38, 135, 0.18)" }}
          >
            <div className="text-sm font-medium text-muted-foreground mb-1">Items Total</div>
            <div className="text-3xl font-bold text-primary">{loadingItems ? <span className="text-base">...</span> : Array.isArray(items) ? items.length : 0}</div>
          </Card>
          <Card
            className="glass-card bg-white/10 dark:bg-black/20 backdrop-blur-md border-white/20 drop-shadow-xl"
            style={{ boxShadow: "0 4px 24px 0 rgba(31, 38, 135, 0.18)" }}
          >
            <div className="text-sm font-medium text-muted-foreground mb-1">Recent Alerts</div>
            <div className="text-lg font-semibold text-primary">Not Implemented</div>
            <div className="text-xs text-muted-foreground mt-1">(Coming Soon)</div>
          </Card>
          <Card
            className="glass-card bg-white/10 dark:bg-black/20 backdrop-blur-md border-white/20 drop-shadow-xl"
            style={{ boxShadow: "0 4px 24px 0 rgba(31, 38, 135, 0.18)" }}
          >
            <div className="text-sm font-medium text-muted-foreground mb-1">Lost Items</div>
            <div className="text-lg font-semibold text-primary">Not Implemented</div>
            <div className="text-xs text-muted-foreground mt-1">(Coming Soon)</div>
          </Card>
          <Card
            className="glass-card bg-white/10 dark:bg-black/20 backdrop-blur-md border-white/20 drop-shadow-xl"
            style={{ boxShadow: "0 4px 24px 0 rgba(31, 38, 135, 0.18)" }}
          >
            <div className="text-sm font-medium text-muted-foreground mb-1">Resale Value</div>
            <div className="text-lg font-semibold text-primary">Not Implemented</div>
            <div className="text-xs text-muted-foreground mt-1">(Coming Soon)</div>
          </Card>
        </div>
        <div className="w-full">
          <h1 className="text-2xl font-bold mb-4">Items listed in the house</h1>
          <ItemsTable
            key={refreshKey}
            onCreate={() => setShowForm(v => !v)}
            showCreateForm={showForm}
          >
          </ItemsTable>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
