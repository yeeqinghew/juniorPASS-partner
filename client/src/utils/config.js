const getBaseURL = () => {
  const port = process.env.REACT_APP_API_PORT;
  const hostname = window.location.hostname;

  if (process.env.NODE_ENV === "development") {
    return `http://${hostname}:${port}`;
  }

  return `http://${hostname}`;
};

export default getBaseURL;
