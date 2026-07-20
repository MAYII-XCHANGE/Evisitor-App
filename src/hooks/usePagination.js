import { useState } from "react";

export const usePagination = (initialSize = 20) => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(initialSize);
  const changeSize = (nextSize) => {
    setSize(Number(nextSize));
    setPage(0);
  };
  return { page, size, setPage, setSize: changeSize, resetPage: () => setPage(0) };
};
