"use client";

import { useEffect, useState } from "react";

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

/**
 * Manage Page Component
 *
 * @returns {JSX.Element} Rendered page component
 */
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

  // Ajout pour la sélection de pièce lors de la création d'un emplacement
  const [selectedRoomForPlace, setSelectedRoomForPlace] = useState<number | null>(null);
  // Ajout pour la sélection de pièce et d'emplacement lors de la création d'un contenant
  const [selectedRoomForContainer, setSelectedRoomForContainer] = useState<number | null>(null);
  const [selectedPlaceForContainer, setSelectedPlaceForContainer] = useState<number | null>(null);

  // Fetch all data
  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomsData, placesData, containersData, tagsData] = await Promise.all([
        fetcher(`${API}/rooms`),
        fetcher(`${API}/places`),
        fetcher(`${API}/containers`),
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
      await fetcher(`${API}/rooms/delete`, {
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
      await fetcher(`${API}/places/delete`, {
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
      await fetcher(`${API}/containers`, {
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
      await fetcher(`${API}/containers`, {
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
    <main className="max-w-4xl mx-auto p-4 md:p-8 h-screen max-h-screen overflow-y-auto flex flex-col gap-8 theme-bg">
      {error && <div className="text-red-600">{error}</div>}
      {loading && <div className="text-gray-500">Chargement…</div>}
      <div className="flex flex-col md:grid md:grid-cols-2 gap-8">
        <section className="theme-card theme-border min-w-0 p-4">
          <h2 className="text-lg font-bold mb-2">Créer une nouvelle pièce</h2>
          <form onSubmit={handleAddRoom} className="flex gap-2 mb-2">
            <input
              type="text"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              placeholder="Nom de la pièce"
              className="theme-input rounded px-2 py-1 flex-1"
              required
            />
            <button type="submit" className="theme-primary px-4 py-1 rounded">Créer</button>
          </form>
          <ul className="flex flex-wrap gap-2">
            {rooms.map((room) => (
              <li key={room.id} className="theme-card px-2 py-1 rounded flex items-center gap-2">
                {room.name}
                <button onClick={() => handleDeleteRoom(room.id)} className="text-red-500 ml-2">✕</button>
              </li>
            ))}
          </ul>
        </section>
        <section className="theme-card theme-border min-w-0 p-4">
          <h2 className="text-lg font-bold mb-2">Créer un nouvel emplacement</h2>
          <form onSubmit={handleAddPlace} className="flex flex-col gap-2 mb-2">
            <select
              value={selectedRoomForPlace ?? ""}
              onChange={e => setSelectedRoomForPlace(Number(e.target.value) || null)}
              className="theme-input rounded px-2 py-1"
              required
            >
              <option value="">Sélectionner une pièce</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="text"
                value={placeName}
                onChange={e => setPlaceName(e.target.value)}
                placeholder="Nom de l'emplacement"
                className="theme-input rounded px-2 py-1 flex-1"
                required
              />
              <button type="submit" className="theme-primary px-4 py-1 rounded" disabled={!selectedRoomForPlace}>Créer</button>
            </div>
          </form>
          <ul className="flex flex-wrap gap-2">
            {places.map((place) => (
              <li key={place.id} className="theme-card px-2 py-1 rounded flex items-center gap-2">
                {place.name} <span className="text-xs text-gray-500">({rooms.find(r => r.id === place.roomId)?.name || "?"})</span>
                <button onClick={() => handleDeletePlace(place.id)} className="text-red-500 ml-2">✕</button>
              </li>
            ))}
          </ul>
        </section>
        <section className="theme-card theme-border min-w-0 p-4">
          <h2 className="text-lg font-bold mb-2">Créer un nouveau contenant</h2>
          <form onSubmit={handleAddContainer} className="flex flex-col gap-2 mb-2">
            <select
              value={selectedRoomForContainer ?? ""}
              onChange={e => {
                const val = Number(e.target.value) || null;
                setSelectedRoomForContainer(val);
                setSelectedPlaceForContainer(null); // reset place selection if room changes
              }}
              className="theme-input rounded px-2 py-1"
              required
            >
              <option value="">Sélectionner une pièce</option>
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
              <option value="">Sélectionner un emplacement</option>
              {places.filter(p => p.roomId === selectedRoomForContainer).map(place => (
                <option key={place.id} value={place.id}>{place.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="text"
                value={containerName}
                onChange={e => setContainerName(e.target.value)}
                placeholder="Nom du contenant"
                className="theme-input rounded px-2 py-1 flex-1"
                required
              />
              <button type="submit" className="theme-primary px-4 py-1 rounded" disabled={!selectedRoomForContainer || !selectedPlaceForContainer}>Créer</button>
            </div>
          </form>
          <ul className="flex flex-wrap gap-2">
            {containers.map((container) => (
              <li key={container.id} className="theme-card px-2 py-1 rounded flex items-center gap-2">
                {container.name}
                <span className="text-xs text-gray-500">
                  ({rooms.find(r => r.id === container.roomId)?.name || "?"} / {places.find(p => p.id === container.placeId)?.name || "?"})
                </span>
                <button onClick={() => handleDeleteContainer(container.id)} className="text-red-500 ml-2">✕</button>
              </li>
            ))}
          </ul>
        </section>
        <section className="theme-card theme-border min-w-0 p-4">
          <h2 className="text-lg font-bold mb-2">Gérer les tags</h2>
          <form onSubmit={handleAddTag} className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagName}
              onChange={e => setTagName(e.target.value)}
              placeholder="Nouveau tag"
              className="theme-input rounded px-2 py-1 flex-1"
              required
            />
            <button type="submit" className="theme-primary px-4 py-1 rounded">Ajouter</button>
          </form>
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag.id} className="theme-card px-2 py-1 rounded flex items-center gap-2">
                {tag.name}
                <button onClick={() => handleDeleteTag(tag.id)} className="text-red-500 ml-2">✕</button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
};

export default ManagePage;
