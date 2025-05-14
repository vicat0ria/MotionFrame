// temporary file  for ml api calls

import { Request, Response, NextFunction } from "express";
import VideoAnalysis from "../models/VideoAnalysis.js";
import { S3Service } from "../services/s3Service.service.js";
import { AppError } from "../middleware/error.middleware.js";

// Get BVH file for a given analysis
export const getBvh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const analysis = await VideoAnalysis.findById(id);
    if (!analysis || !analysis.s3LandmarksKey) {
      throw new AppError("BVH file not found", 404);
    }
    const s3Key = analysis.s3LandmarksKey;
    const s3Service = S3Service.getInstance();
    const { stream } = await s3Service.getFileStream(s3Key);
    res.setHeader("Content-Disposition", `attachment; filename="${id}.bvh"`);
    res.setHeader("Content-Type", "application/octet-stream");
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
};
