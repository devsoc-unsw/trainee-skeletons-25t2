import { createContext } from "react";

export type preferencesContextType = {
    location: string;
    price: string;
    cuisine: string;
    rating: string;
};

export const preferencesContext = createContext<preferencesContextType>({
    location: "unsw",
    price: "$",
    cuisine: "chinese",
    rating: "Any"
});
