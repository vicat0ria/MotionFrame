// temporary file for ml routes

import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default router;
