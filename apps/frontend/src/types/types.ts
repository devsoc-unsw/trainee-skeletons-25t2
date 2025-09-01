export type User = {
  userId: string;
  name: string;
  state: "WAITING" | "VOTING" | "FINISHED";
};
