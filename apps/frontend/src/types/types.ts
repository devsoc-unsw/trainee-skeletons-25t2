export type User = {
  userId: string;
  name: string;
  state: "WAITING" | "VOTING" | "FINISHED";
};

export type Room = {
  id: string;
  owner: string;
  isVotingFinished: boolean;
  endDate: Date;
  users: User[];
  // TODO: Add restaraunt
};

// TODO: define type for restaraunt
