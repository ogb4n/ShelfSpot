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

export type Item = {
  id?: number;
  name: string;
  stock: number;
  price?: number;
  status: string;
  tags?: string;
  roomId: number;
  placeId?: number;
};

export type Tag = {
  id: number;
  name: string;
  icon: string;
};
