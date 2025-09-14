import { app } from "./app.js";
import { env } from "./config/env.config.js";
import { logger } from "./utils/logger.utils.js";
import { initializeSupabase } from "./config/supabase.config.js";

const PORT = env.PORT || 3000;

const startServer = async () => {
	try {
		await initializeSupabase();
		logger.info("Supabase initialized successfully");

		app.listen(PORT, () => {
			logger.info(`Server is running on port ${PORT}`);
		});
	} catch (error) {
		logger.error("Failed to start server:", error.message);
		process.exit(1);
	}
};

startServer();
