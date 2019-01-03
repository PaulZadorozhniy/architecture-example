import * as Joi from 'joi';

export const createSchema = Joi.object({
  baseRole: Joi.string().guid(),
  name: Joi.string().required()
});
