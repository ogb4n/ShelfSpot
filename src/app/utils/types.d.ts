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

interface Item {
  id?: number;
  name: string;
  quantity: number;
  status: string;
  roomId: number;
  placeId?: number;
  tags: string[];
  room: { id: number; name: string; icon: string } | null;
  place: { id: number; name: string; icon: string; roomId: number } | null;
  status: string | null;
  tags: string[];
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
export type Wallet = {
  id: string;
  name: string;
  balance: number;
};
