const getBaseUrl = () => {
    if (process.env.NODE_ENV === "production") {
        return "https://online-book-store-y7o9.onrender.com"; 
    } else {
        return "http://localhost:5000"; 
    }
}

export default getBaseUrl;