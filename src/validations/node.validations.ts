import { z } from "zod";
import { ApiError } from "../utils/ApiError";

// Validation Schema
const nodeSchema = z.object({
    name: z.string().min(1),
    type: z.enum(["LOCATION", "DEPARTMENT", "EMPLOYEE"]),
    parentId: z
        .string()
        .optional()
        .transform((val) => {
            if (val === undefined || val === null) return undefined;
            const numberValue = Number(val);
            if (isNaN(numberValue)) {
                throw new Error("parentId must be a valid number");
            }
            return numberValue;
        }),
});

export const validateNodeInput = (data: any) => {
    const result = nodeSchema.safeParse(data);
    if (!result.success) {
        console.log("Validation Error:", result.error);
        throw new ApiError("Invalid input data", 400);
    }
    return result.data;
};
