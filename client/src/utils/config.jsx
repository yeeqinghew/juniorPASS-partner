const getBaseURL = () => {
  // Use explicit API URL if provided
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const port = import.meta.env.VITE_API_PORT || "5000";
  const hostname = window.location.hostname;

  return `http://${hostname}:${port}`;
};

export default getBaseURL;