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
  id: number;
  name: string;
  quantity: number;
  room: { id: number; name: string; icon: string } | null;
  place: { id: number; name: string; icon: string; roomId: number } | null;
  status: string | null;
}

export type Tag = {
  id: number;
  name: string;
  icon: string;
};
