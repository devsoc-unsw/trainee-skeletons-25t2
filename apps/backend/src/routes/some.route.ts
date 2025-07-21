import express from "express"
import * as someController from "../controllers/some.controller"

const router = express.Router();

router.get('/some/message', someController.sendTestMessage)

export default router;
