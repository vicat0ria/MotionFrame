import { app, server, io } from "./app.js";
import logger from "./utils/logger.js";

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`WebSocket server running on ws://localhost:${PORT}`);
});
