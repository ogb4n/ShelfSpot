"use client";

import { useEffect, useState } from "react";
import DashboardCharts from "@/components/DashboardCharts";
import { Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";

const API = "/api/";

const fetcher = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// Types explicites pour les entités
interface Room { id: number; name: string; }
interface Place { id: number; name: string; roomId: number; }
interface Container { id: number; name: string; roomId: number; placeId: number; }
interface Tag { id: number; name: string; }


const ManagePage = () => {
  // States pour les formulaires
  const [roomName, setRoomName] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [containerName, setContainerName] = useState("");
  const [tagName, setTagName] = useState("");

  // Data states
  const [rooms, setRooms] = useState<Room[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedRoomForPlace, setSelectedRoomForPlace] = useState<number | null>(null);
  const [selectedRoomForContainer, setSelectedRoomForContainer] = useState<number | null>(null);
  const [selectedPlaceForContainer, setSelectedPlaceForContainer] = useState<number | null>(null);

  const [showCharts, setShowCharts] = useState(true);

  // Fetch all data
  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomsData, placesData, containersData, tagsData] = await Promise.all([
        fetcher(`${API}/room`),
        fetcher(`${API}/place`),
        fetcher(`${API}/container`),
        fetcher(`${API}/tags`),
      ]);
      setRooms(roomsData);
      setPlaces(placesData);
      setContainers(containersData);
      setTags(tagsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Handlers
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    setLoading(true);
    try {
      await fetcher(`${API}/rooms/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName }),
      });
      setRoomName("");
      fetchAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (id: number) => {
    setLoading(true);
    try {
      await fetcher(`${API}/room/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeName.trim() || !selectedRoomForPlace) return;
    setLoading(true);
    try {
      await fetcher(`${API}/places/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: placeName, roomId: selectedRoomForPlace }),
      });
      setPlaceName("");
      setSelectedRoomForPlace(null);
      fetchAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlace = async (id: number) => {
    setLoading(true);
    try {
      await fetcher(`${API}/place/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleAddContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!containerName.trim() || !selectedRoomForContainer || !selectedPlaceForContainer) return;
    setLoading(true);
    try {
      await fetcher(`${API}/container`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: containerName, roomId: selectedRoomForContainer, placeId: selectedPlaceForContainer }),
      });
      setContainerName("");
      setSelectedRoomForContainer(null);
      setSelectedPlaceForContainer(null);
      fetchAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContainer = async (id: number) => {
    setLoading(true);
    try {
      await fetcher(`${API}/container`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;
    setLoading(true);
    try {
      await fetcher(`${API}/tags/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tagName }),
      });
      setTagName("");
      fetchAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (id: number) => {
    setLoading(true);
    try {
      await fetcher(`${API}/tags/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">Manage rooms, places, containers and tags</h1>
      <section className="mb-8">
        <div className="flex justify-end mb-2">
          <div className="relative group">
            <button
              onClick={() => setShowCharts(v => !v)}
              className="p-2 rounded hover:bg-muted transition-colors text-muted-foreground"
              aria-label={showCharts ? "Hide charts" : "Show charts"}
            >
              {showCharts ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <div className="absolute right-0 top-full mt-1 z-10 hidden group-hover:block bg-neutral-800 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
              {showCharts ? "Hide charts" : "Show charts"}
            </div>
          </div>
        </div>
        {showCharts && (
          <div className="glass-card bg-white/10 dark:bg-black/20 backdrop-blur-md border-white/20 drop-shadow-xl rounded-lg p-2 mb-4"
            style={{ boxShadow: "0 4px 24px 0 rgba(31, 38, 135, 0.18)" }}
          >
            <DashboardCharts />
          </div>
        )}
      </section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {error && <div className="text-red-600">{error}</div>}
        {loading && <div className="text-gray-500">Loading…</div>}
        <Card className="glass-card bg-white/10 dark:bg-black/20 backdrop-blur-md border-white/20 drop-shadow-xl theme-card theme-border rounded-lg p-4 flex flex-col items-center min-w-0 w-full h-full min-h-[320px]"
          style={{ boxShadow: "0 4px 24px 0 rgba(31, 38, 135, 0.18)" }}
        >
          <h2 className="text-white text-lg font-bold mb-2">Create a new room</h2>
          <form onSubmit={handleAddRoom} className="flex gap-2 mb-2">
            <input
              type="text"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              placeholder="Room name"
              className="theme-input rounded px-2 py-1 flex-1"
              required
            />
            <button type="submit" className="theme-primary px-4 py-1 rounded">Create</button>
          </form>
          <ul className="flex flex-wrap gap-2">
            {rooms.map((room) => (
              <li key={room.id} className="glass-card bg-white/10 dark:bg-black/20 backdrop-blur-md border-white/20 drop-shadow rounded px-2 py-1 flex items-center gap-2"
                style={{ boxShadow: "0 2px 8px 0 rgba(31, 38, 135, 0.10)" }}
              >
                {room.name}
                <button onClick={() => handleDeleteRoom(room.id)} className="text-red-500 ml-2">✕</button>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="glass-card bg-white/10 dark:bg-black/20 backdrop-blur-md border-white/20 drop-shadow-xl theme-card theme-border rounded-lg p-4 flex flex-col items-center min-w-0 w-full h-full min-h-[320px]"
          style={{ boxShadow: "0 4px 24px 0 rgba(31, 38, 135, 0.18)" }}
        >
          <h2 className="text-white text-lg font-bold mb-2">Create a new place</h2>
          <form onSubmit={handleAddPlace} className="flex flex-col gap-2 mb-2">
            <select
              value={selectedRoomForPlace ?? ""}
              onChange={e => setSelectedRoomForPlace(Number(e.target.value) || null)}
              className="theme-input rounded px-2 py-1"
              required
            >
              <option value="">Select a room</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="text"
                value={placeName}
                onChange={e => setPlaceName(e.target.value)}
                placeholder="Place name"
                className="theme-input rounded px-2 py-1 flex-1"
                required
              />
              <button type="submit" className="theme-primary px-4 py-1 rounded" disabled={!selectedRoomForPlace}>Create</button>
            </div>
          </form>
          <ul className="flex flex-wrap gap-2">
            {places.map((place) => (
              <li key={place.id} className="glass-card bg-white/10 dark:bg-black/20 backdrop-blur-md border-white/20 drop-shadow rounded px-2 py-1 flex items-center gap-2"
                style={{ boxShadow: "0 2px 8px 0 rgba(31, 38, 135, 0.10)" }}
              >
                {place.name} <span className="text-xs text-gray-500">({rooms.find(r => r.id === place.roomId)?.name || "?"})</span>
                <button onClick={() => handleDeletePlace(place.id)} className="text-red-500 ml-2">✕</button>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="glass-card bg-white/10 dark:bg-black/20 backdrop-blur-md border-white/20 drop-shadow-xl theme-card theme-border rounded-lg p-4 flex flex-col items-center min-w-0 w-full h-full min-h-[320px]"
          style={{ boxShadow: "0 4px 24px 0 rgba(31, 38, 135, 0.18)" }}
        >
          <h2 className="text-white text-lg font-bold mb-2">Create a new container</h2>
          <form onSubmit={handleAddContainer} className="flex flex-col gap-2 mb-2">
            <select
              value={selectedRoomForContainer ?? ""}
              onChange={e => {
                const val = Number(e.target.value) || null;
                setSelectedRoomForContainer(val);
                setSelectedPlaceForContainer(null);
              }}
              className="theme-input rounded px-2 py-1"
              required
            >
              <option value="">Select a room</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
            <select
              value={selectedPlaceForContainer ?? ""}
              onChange={e => setSelectedPlaceForContainer(Number(e.target.value) || null)}
              className="theme-input rounded px-2 py-1"
              required
              disabled={!selectedRoomForContainer}
            >
              <option value="">Select a place</option>
              {places.filter(p => p.roomId === selectedRoomForContainer).map(place => (
                <option key={place.id} value={place.id}>{place.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="text"
                value={containerName}
                onChange={e => setContainerName(e.target.value)}
                placeholder="Container name"
                className="theme-input rounded px-2 py-1 flex-1"
                required
              />
              <button type="submit" className="theme-primary px-4 py-1 rounded" disabled={!selectedRoomForContainer || !selectedPlaceForContainer}>Create</button>
            </div>
          </form>
          <ul className="flex flex-wrap gap-2">
            {containers.map((container) => (
              <li key={container.id} className="glass-card bg-white/10 dark:bg-black/20 backdrop-blur-md border-white/20 drop-shadow rounded px-2 py-1 flex items-center gap-2"
                style={{ boxShadow: "0 2px 8px 0 rgba(31, 38, 135, 0.10)" }}
              >
                {container.name}
                <span className="text-xs text-gray-500">
                  ({rooms.find(r => r.id === container.roomId)?.name || "?"} / {places.find(p => p.id === container.placeId)?.name || "?"})
                </span>
                <button onClick={() => handleDeleteContainer(container.id)} className="text-red-500 ml-2">✕</button>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="glass-card bg-white/10 dark:bg-black/20 backdrop-blur-md border-white/20 drop-shadow-xl theme-card theme-border rounded-lg p-4 flex flex-col items-center min-w-0 w-full h-full min-h-[320px]"
          style={{ boxShadow: "0 4px 24px 0 rgba(31, 38, 135, 0.18)" }}
        >
          <h2 className="text-white text-lg font-bold mb-2">Manage tags</h2>
          <form onSubmit={handleAddTag} className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagName}
              onChange={e => setTagName(e.target.value)}
              placeholder="New tag"
              className="theme-input rounded px-2 py-1 flex-1"
              required
            />
            <button type="submit" className="theme-primary px-4 py-1 rounded">Add</button>
          </form>
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag.id} className="glass-card bg-white/10 dark:bg-black/20 backdrop-blur-md border-white/20 drop-shadow rounded px-2 py-1 flex items-center gap-2"
                style={{ boxShadow: "0 2px 8px 0 rgba(31, 38, 135, 0.10)" }}
              >
                {tag.name}
                <button onClick={() => handleDeleteTag(tag.id)} className="text-red-500 ml-2">✕</button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default ManagePage;
