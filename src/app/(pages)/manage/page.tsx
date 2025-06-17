"use client";

import { useEffect, useState } from "react";

const API = "/api/";

const fetcher = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// Types
interface Room { id: number; name: string; }
interface Place { id: number; name: string; roomId: number; }
interface Container { id: number; name: string; roomId: number; placeId: number; }
interface Tag { id: number; name: string; }

const ManagePage = () => {
  // Form states (only for tags)
  const [tagName, setTagName] = useState("");

  // Data states
  const [rooms, setRooms] = useState<Room[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // Edit states
  const [editingRoom, setEditingRoom] = useState<number | null>(null);
  const [editingPlace, setEditingPlace] = useState<number | null>(null);
  const [editingContainer, setEditingContainer] = useState<number | null>(null);
  const [editingTag, setEditingTag] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string | number | null>>({});

  // Fetch all data
  const fetchAll = async () => {
    try {
      const [roomsData, placesData, containersData, tagsData] = await Promise.all([
        fetcher(`${API}room`),
        fetcher(`${API}place`),
        fetcher(`${API}container`),
        fetcher(`${API}tag`),
      ]);
      setRooms(roomsData);
      setPlaces(placesData);
      setContainers(containersData);
      setTags(tagsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Delete handlers
  const handleDeleteRoom = async (id: number) => {
    try {
      await fetcher(`${API}room/${id}`, { method: 'DELETE' });
      fetchAll();
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  const handleDeletePlace = async (id: number) => {
    try {
      await fetcher(`${API}place/${id}`, { method: 'DELETE' });
      fetchAll();
    } catch (error) {
      console.error('Error deleting place:', error);
    }
  };

  const handleDeleteContainer = async (id: number) => {
    try {
      await fetcher(`${API}container/${id}`, { method: 'DELETE' });
      fetchAll();
    } catch (error) {
      console.error('Error deleting container:', error);
    }
  };

  // Tag handlers
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetcher(`${API}tag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagName }),
      });
      setTagName("");
      fetchAll();
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleDeleteTag = async (id: number) => {
    // Trouve le nom du tag pour la confirmation
    const tagToDelete = tags.find(tag => tag.id === id);
    const tagName = tagToDelete ? tagToDelete.name : 'ce tag';

    // Affiche une confirmation avant la suppression
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le tag "${tagName}" ? Cette action est irréversible.`)) {
      try {
        await fetcher(`${API}tag/${id}`, { method: 'DELETE' });
        fetchAll();
      } catch (error) {
        console.error('Error deleting tag:', error);
      }
    }
  };

  // Edit handlers
  const handleEditRoom = (room: Room) => {
    setEditingRoom(room.id);
    setEditValues({ name: room.name });
  };

  const handleEditPlace = (place: Place) => {
    setEditingPlace(place.id);
    setEditValues({ name: place.name });
  };

  const handleEditContainer = (container: Container) => {
    setEditingContainer(container.id);
    setEditValues({
      name: container.name,
      roomId: container.roomId,
      placeId: container.placeId
    });
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag.id);
    setEditValues({ name: tag.name });
  };

  const handleSaveRoom = async (id: number) => {
    try {
      await fetcher(`${API}room/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editValues.name }),
      });
      setEditingRoom(null);
      setEditValues({});
      fetchAll();
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  const handleSavePlace = async (id: number) => {
    try {
      await fetcher(`${API}place/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editValues.name }),
      });
      setEditingPlace(null);
      setEditValues({});
      fetchAll();
    } catch (error) {
      console.error('Error updating place:', error);
    }
  };

  const handleSaveContainer = async (id: number) => {
    try {
      await fetcher(`${API}container/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editValues.name,
          roomId: editValues.roomId,
          placeId: editValues.placeId
        }),
      });
      setEditingContainer(null);
      setEditValues({});
      fetchAll();
    } catch (error) {
      console.error('Error updating container:', error);
    }
  };

  const handleSaveTag = async (id: number) => {
    try {
      await fetcher(`${API}tag/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editValues.name }),
      });
      setEditingTag(null);
      setEditValues({});
      fetchAll();
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingRoom(null);
    setEditingPlace(null);
    setEditingContainer(null);
    setEditingTag(null);
    setEditValues({});
  };

  const handleEditValueChange = (value: string) => {
    setEditValues({ ...editValues, name: value });
  };

  const handleContainerRoomChange = (roomId: number) => {
    setEditValues({
      ...editValues,
      roomId: roomId,
      placeId: null // Reset place when room changes
    });
  };

  const handleContainerPlaceChange = (placeId: number) => {
    setEditValues({ ...editValues, placeId: placeId });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your existing items and create tags. Use the &quot;Create&quot; button in the navigation to add new rooms, places, and containers.</p>
        </div>
      </div>

      {/* Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rooms Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Rooms</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage existing rooms</p>
          </div>
          <div className="p-6">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <div key={room.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700">
                    {editingRoom === room.id ? (
                      <>
                        <input
                          type="text"
                          value={editValues.name || ''}
                          onChange={(e) => handleEditValueChange(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white mr-2"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveRoom(room.id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-gray-900 dark:text-white">{room.name}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditRoom(room)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No rooms found. Create one using the &quot;Create&quot; button in the navigation.</p>
              )}
            </div>
          </div>
        </div>

        {/* Places Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Places</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage existing places within rooms</p>
          </div>
          <div className="p-6">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {places.length > 0 ? (
                places.map((place) => (
                  <div key={place.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700">
                    {editingPlace === place.id ? (
                      <>
                        <div className="flex-1 mr-2">
                          <input
                            type="text"
                            value={editValues.name || ''}
                            onChange={(e) => handleEditValueChange(e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-1"
                            autoFocus
                          />
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {rooms.find(r => r.id === place.roomId)?.name || "Unknown room"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSavePlace(place.id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{place.name}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {rooms.find(r => r.id === place.roomId)?.name || "Unknown room"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPlace(place)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePlace(place.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No places found. Create one using the &quot;Create&quot; button in the navigation.</p>
              )}
            </div>
          </div>
        </div>

        {/* Containers Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Containers</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage existing containers within places</p>
          </div>
          <div className="p-6">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {containers.length > 0 ? (
                containers.map((container) => (
                  <div key={container.id} className="flex items-start justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700">
                    {editingContainer === container.id ? (
                      <>
                        <div className="flex-1 mr-2 space-y-2">
                          <input
                            type="text"
                            value={editValues.name || ''}
                            onChange={(e) => handleEditValueChange(e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Container name"
                            autoFocus
                          />
                          <select
                            value={editValues.roomId || ''}
                            onChange={(e) => handleContainerRoomChange(Number(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="">Select a room</option>
                            {rooms.map(room => (
                              <option key={room.id} value={room.id}>{room.name}</option>
                            ))}
                          </select>
                          <select
                            value={editValues.placeId || ''}
                            onChange={(e) => handleContainerPlaceChange(Number(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            disabled={!editValues.roomId}
                          >
                            <option value="">Select a place</option>
                            {places
                              .filter(p => p.roomId === editValues.roomId)
                              .map(place => (
                                <option key={place.id} value={place.id}>{place.name}</option>
                              ))}
                          </select>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => handleSaveContainer(container.id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{container.name}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {places.find(p => p.id === container.placeId)?.name} • {rooms.find(r => r.id === container.roomId)?.name}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditContainer(container)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteContainer(container.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No containers found. Create one using the &quot;Create&quot; button in the navigation.</p>
              )}
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tags</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create and manage tags for items</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleAddTag} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagName}
                  onChange={e => setTagName(e.target.value)}
                  placeholder="Tag name"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {tags.map((tag) => (
                <div key={tag.id} className="inline-flex items-center gap-2 px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-700">
                  {editingTag === tag.id ? (
                    <>
                      <input
                        type="text"
                        value={editValues.name || ''}
                        onChange={(e) => handleEditValueChange(e.target.value)}
                        className="text-sm border-none bg-transparent text-gray-900 dark:text-white outline-none w-20"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveTag(tag.id)}
                        className="text-green-600 hover:text-green-700 text-xs"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-400 hover:text-red-700 text-xs"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-red-900 dark:text-white">{tag.name}</span>
                      <button
                        onClick={() => handleEditTag(tag)}
                        className="text-blue-600 hover:text-blue-700 text-xs"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        className="text-gray-400 hover:text-red-700 text-xs"
                      >
                        ×
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePage;
