import express from "express";
import routes from "./src/v1/routes/index.mjs";
import connect from './db/connect.mjs';
import midleware from "./midleware/index.mjs";
import errorHandler from "./midleware/errorHandler.mjs";

const app = express();

// Connect to Mongo DB
connect() 
// Connect middleware
midleware(app)
// Connect Routers
app.use('/api/v1/', routes);
// Error handling middleware
errorHandler(app)

export default app;
