import z from "zod";
import { temp01Schema } from "./template1.validations";
import { temp02Schema } from "./template2.validations";


// Map templateId
export const templateSchemaMap: Record<string, z.ZodSchema> = {
    "temp-01": temp01Schema,
    "temp-02": temp02Schema,
};