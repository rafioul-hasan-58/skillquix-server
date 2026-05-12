
const corsOptions = {
    origin: ["http://localhost:3000", "http://72.62.87.243:3001", "https://www.skillquix.tech", "https://dev.skillquix.tech"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};

export default corsOptions