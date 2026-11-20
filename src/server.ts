import "dotenv/config";

import app from "./app.js";
import connectDatabase from "./config/database.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
    try {
        await connectDatabase();

        const server = app.listen(PORT, () => {
            console.log(`Support Desk server running on port ${PORT}`);
            console.log(`Health Check: http://localhost:${PORT}/api/health`);
        });

        server.on("error", (error) => {
            console.error("HTTP server error:", error);
            process.exit(1);
        });

    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();