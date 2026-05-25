import z from "zod";
import { temp01Schema } from "./template1.validations";
import { temp02Schema } from "./template2.validations";
import { temp03Schema } from "./template3.validations";
import { temp04Schema } from "./template4.validations";
import { temp05Schema } from "./template5.validations";
import { temp06Schema } from "./template6.validations";
import { temp07Schema } from "./template7.validations";
import { temp08Schema } from "./template8.validations";


// Map templateId
export const templateSchemaMap: Record<string, z.ZodSchema> = {
    "temp-01": temp01Schema,
    "temp-02": temp02Schema,
    "temp-03": temp03Schema,
    "temp-04": temp04Schema,
    "temp-05": temp05Schema,
    "temp-06": temp06Schema,
    "temp-07": temp07Schema,
    "temp-08": temp08Schema,
};