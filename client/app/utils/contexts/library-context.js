import { createContext } from "react";

export const LibraryContext = createContext({
    libraryActive: false,
    setLibraryActive: () => { }
});