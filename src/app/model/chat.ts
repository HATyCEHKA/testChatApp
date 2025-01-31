
export interface Channel{
  id: number,
  name: string,
}

export interface Message{
  id: number,
  userId: number,
  channelId: number,
  content: string
  date: string;
}


