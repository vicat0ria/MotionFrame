// temporary file for ml routes

import { Router } from "express";
import { getBvh } from "../controllers/ml.controller.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.get("/:id/bvh", getBvh);

export default router;
