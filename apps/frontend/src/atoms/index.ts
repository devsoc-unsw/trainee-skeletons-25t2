import { atom } from "jotai";
import { type Room } from "../types";

// This is where the global application state is stored, we use Jotai pages/components
// are adjacent and share the same state (e.g. restaurant state). Alternatively we could've
// used a Provider and Context but there is a lot of boilerplate involved. Using jotai allows
// us to use our exported atoms like useState hooks, with the added benefit of state being updated
// across all components that share state.

// Primary state for rooms
export const roomAtom = atom<Room | null>(null);

// Derived state from rooms, think of these as like views/slices of parts of the original room state.
// Try to use these over the actual room atom when reading state.
export const playersAtom = atom((get) => get(roomAtom)?.users ?? []);
export const roomPropsAtom = atom((get) => {
  const room = get(roomAtom);
  if (!room) return null;
  return {
    id: room.id,
    owner: room.owner,
    isVotingFinished: room.isVotingFinished,
    endDate: room.endDate,
  };
});
