import { Request, Response, NextFunction } from "express";
import { templateSchemaMap } from "../../modules/masterCv/validations";

export const validateTemplate = (req: Request, res: Response, next: NextFunction) => {
  const { templateId } = req.params;
  const schema = templateSchemaMap[templateId];

  if (!schema) {
    return res.status(400).json({
      success: false,
      message: `Unknown templateId: ${templateId}`,
    });
  }
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  req.body.data = result.data;
  next();
};