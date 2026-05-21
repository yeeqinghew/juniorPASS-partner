import { createContext, useEffect, useState } from "react";
import { fetchWithAuth, API_ENDPOINTS } from "../utils/api";

const DataContext = createContext();

const DataProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [packageTypes, setPackageTypes] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [loading, setLoading] = useState(false);


  const getCategories = async () => {
    const response = await fetchWithAuth(API_ENDPOINTS.GET_ALL_CATEGORIES);
    const data = await response.json();
    setCategories(data);
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
