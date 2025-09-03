export type Place = {
  name: string;
  icon: string;
  id: number;
  roomId: number;
};

export type Room = {
  name: string;
  id: number;
  icon?: string;
};

export type Container = {
  name: string;
  id: number;
  icon: string;
  placeId?: number;
  roomId?: number;
};

export interface Item {
  id: number;
  name: string;
  quantity: number;
  roomId: number;
  placeId?: number;
  containerId?: number;
  container?: {
    id: number;
    name: string;
    icon: string;
    placeId: number;
    roomId: number;
  } | null;
  room: { id: number; name: string; icon: string } | null;
  place: { id: number; name: string; icon: string; roomId: number } | null;
  status: string | null;
  tags: string[];
  consumable?: boolean;
  itemLink: string | null;
  price?: number;
  sellprice?: number;
}

export interface Consumable extends Item {
  consumable: true;
}

export type Tag = {
  id: number;
  name: string;
  icon: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
};

export type Alert = {
  id: number;
  itemId: number;
  threshold: number;
  name?: string;
  isActive: boolean;
  lastSent?: string;
  createdAt: string;
  updatedAt: string;
};
