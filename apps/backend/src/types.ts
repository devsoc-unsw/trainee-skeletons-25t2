export type User = {
  userId: string;
  name: string;
  userState: UserState;
};

export type UserState = "WAITING" | "VOTING" | "FINISHED";
