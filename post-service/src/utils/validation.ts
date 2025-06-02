import Joi from "joi";

export const validateCreatePost = (data: any) => {
    const schema = Joi.object({
        content: Joi.string().min(3).max(5000).required(),
        mediaIds: Joi.string().optional(),
    });

    return schema.validate(data);
}