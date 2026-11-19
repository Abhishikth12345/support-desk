import "dotenv/config"

import app from "./app.js";
import connectDatabse from "./config/database.js";

const PORT = process.env.PORT || 5000;
const startServer = async (): Promise<void> => {
    try{
        await connectDatabse();

        app.listen(PORT,() => {
            console.log(`Support Desk server running on port ${PORT}`);
            console.log(`Health Check: http://localhost:${PORT}/api/health`);
        });
    }
    catch(error){
        console.log("Server startup failed: ", error);
        process.exit(1);
    }
};

startServer();