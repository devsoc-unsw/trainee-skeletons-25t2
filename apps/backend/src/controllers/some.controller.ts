import { Request, Response } from "express";
import * as someService from "../services/some.service";

export async function sendTestMessage(req: Request, res: Response) {
  try {
    const message = someService.sendTestMessage();
    res.json(message);
  } catch (err: unknown) {
    res.status(500).json({ message: "An error has occured" });
  }
}
