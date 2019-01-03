import * as Joi from 'joi';

const validationErrorObjectSchema = Joi.object().keys({
  rowIndex: Joi.number()
    .min(0)
    .integer()
    .required(),
  message: Joi.string().required()
});

const validationErrorsSchema = Joi.array().items(
  validationErrorObjectSchema.required()
);

const successResponseSchema = Joi.object({
  validationErrors: Joi.array()
    .max(0)
    .required()
});

const unprocessableEntityResponseSchema = Joi.object({
  validationErrors: validationErrorsSchema.required()
});

const rowSchema = Joi.object().keys({
  bloomsLevel: Joi.string()
    .allow('')
    .allow(null),
  skillNames: Joi.array()
    .items(Joi.string().required())
    .required(),
  roleNames: Joi.array()
    .items(Joi.string().required())
    .required()
});

export {
  successResponseSchema,
  unprocessableEntityResponseSchema,
  validationErrorsSchema,
  rowSchema
};
