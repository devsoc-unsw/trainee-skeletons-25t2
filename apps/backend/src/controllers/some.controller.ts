import { Request, Response } from "express";
import * as someService from "../services/some.service";

export async function sendTestMessage(req: Request, res: Response) {
  try {
    const message = someService.sendTestMessage();
    res.json(message);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
