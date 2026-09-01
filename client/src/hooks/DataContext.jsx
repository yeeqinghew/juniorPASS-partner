import { createContext, useEffect, useState } from "react";
import { fetchWithAuth, API_ENDPOINTS } from "../utils/api";

const DataContext = createContext();

const DataProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [packageTypes, setPackageTypes] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");


  const getCategories = async () => {
    try {
      setCategoriesError("");
      const response = await fetchWithAuth(API_ENDPOINTS.GET_ALL_CATEGORIES);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to load categories");
      }
      if (!Array.isArray(data)) {
        throw new Error("Invalid category response");
      }
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
      setCategoriesError(
        "Categories could not be loaded. Refresh the page or contact support.",
      );
    }
  };

  const getPackageTypes = async () => {
    const response = await fetchWithAuth(API_ENDPOINTS.GET_ALL_PACKAGES);
    const data = await response.json();
    setPackageTypes(data);
  };

  const getAgeGroups = async () => {
    const response = await fetchWithAuth(API_ENDPOINTS.GET_ALL_AGE_GROUPS);
    const data = await response.json();
    setAgeGroups(data);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([getCategories(), getPackageTypes(), getAgeGroups()]).finally(
      () => setLoading(false)
    );
  }, []);

  return (
    <DataContext.Provider
      value={{
        categories,
        categoriesError,
        packageTypes,
        ageGroups,
        loading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export { DataContext, DataProvider };
