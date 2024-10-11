export interface Place {
  name: string;
  icon: string;
  id: number;
  roomId: number;
}

export interface Room {
  name: string;
  id: number;
  icon?: string;
}
