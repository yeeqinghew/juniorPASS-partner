import React, { createContext, useEffect, useState } from "react";
import getBaseURL from "../utils/config";

const DataContext = createContext();

const DataProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [packageTypes, setPackageTypes] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const baseURL = getBaseURL();

  const getCategories = async () => {
    const response = await fetch(`${baseURL}/misc/getAllCategories`);
    const data = await response.json();
    setCategories(data);
  };

  const getPackageTypes = async () => {
    const response = await fetch(`${baseURL}/misc/getAllPackages`);
    const data = await response.json();
    setPackageTypes(data);
  };

  const getAgeGroups = async () => {
    const response = await fetch(`${baseURL}/misc/getAllAgeGroups`);
    const data = await response.json();
    setAgeGroups(data);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([getCategories(), getPackageTypes(), getAgeGroups()]).finally(
      () => setLoading(false)
    );
  }, [baseURL]);

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
