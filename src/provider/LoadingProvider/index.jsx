import React, { createContext, useContext, useState, useCallback } from "react";

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingTasks, setPendingTasks] = useState(0);

  const startLoading = useCallback(() => {
    setPendingTasks((prev) => prev + 1); // Increment the pending task count
    setIsLoading(true); // Ensure loading is active
  }, []);

  const stopLoading = useCallback(() => {
    setPendingTasks((prev) => {
      const updatedTasks = Math.max(prev - 1, 0);
      if (updatedTasks === 0) {
        setIsLoading(false); // Only stop loading when all tasks are resolved
      }
      return updatedTasks;
    });
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
