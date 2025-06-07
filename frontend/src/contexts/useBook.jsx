import { useContext } from "react";
import BookContext from "./BookContext";

const useBook = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useBook must be used within a BookProvider");
  }
  return context;
};

export default useBook;