const getBaseUrl = () => {
  if (import.meta.env.MODE === "development") {
    return "http://localhost:5000";
  }
  return "https://online-book-store-y7o9.onrender.com";
};

export default getBaseUrl;