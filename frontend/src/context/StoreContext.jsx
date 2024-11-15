import React, { useState, useEffect, createContext } from "react";
import axios from "axios";

// Create the context
export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  // State to hold the food list
  const [food_list, setFoodList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch data from backend API
  const fetchFoodList = async () => {
    try {
      // Make the API call
      const response = await axios.get("https://www.tst.annapoornamithai.com/menus/menuItems");
      setFoodList(response.data.data); // Assuming the data is in response.data.data
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching food list:", err);
      setError("Failed to load food list");
      setIsLoading(false);
    }
  };

  // Fetch data initially and every 30 seconds
  useEffect(() => {
    // Fetch immediately on mount
    fetchFoodList();

    // Set interval to fetch data every 30 seconds (30000 milliseconds)
    const intervalId = setInterval(() => {
      fetchFoodList();
    }, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  // Log food_list changes (optional for debugging)
  useEffect(() => {
    console.log(food_list);
  }, [food_list]);

  // Context value that will be provided to children components
  const contextValue = {
    food_list,
    isLoading,
    error,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;