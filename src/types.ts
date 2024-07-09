export type User = {
  id: string;
  name: string;
  state: number;
  lastSeen: number;
};

export type Msg = {
  senderId: string;
  senderName: string;
  text: string;
  time: number;
  isAction: boolean;
  isSystem: boolean;
};
