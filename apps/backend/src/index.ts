import express from "express";
import cors from "cors";
import someRoutes from "./routes/some.route"
import "dotenv/config"


const port = process.env.PORT || "3000";

const app = express();
app.use(cors()).use(express.json()).use('', someRoutes)


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

process.on("SIGINT", async () => {
    console.log('Shutting down server.');
    process.exit();
});
