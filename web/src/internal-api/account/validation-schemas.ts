import * as Joi from 'joi';

export const getResponseSchema = Joi.array().items(
  Joi.object({
    handle: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    gravatarUrl: Joi.string()
      .uri()
      .required()
  })
);
