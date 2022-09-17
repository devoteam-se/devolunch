import { Request, Response } from "express";
import express from "express";
import slack from "../services/slack";

const router = express.Router();

router.post("/", async (_: Request, res: Response) => {
  try {
    await slack();
  } catch (err: unknown) {
    return res.sendStatus(500);
  }
  res.sendStatus(200);
});

export default router;
