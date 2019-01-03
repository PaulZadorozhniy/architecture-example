import * as Joi from 'joi';

export const createSchema = Joi.object({
  roleId: Joi.string()
    .guid()
    .required(),
  name: Joi.string().required(),
  isDraft: Joi.boolean().required(),
  isOptional: Joi.boolean().required()
});

export const updateSchema = Joi.object({
  id: Joi.string()
    .guid()
    .required(),
  currentRoleId: Joi.string()
    .guid()
    .required(),
  updatedRoleId: Joi.string()
    .guid()
    .required(),
  name: Joi.string().required(),
  isDraft: Joi.boolean().required(),
  isOptional: Joi.boolean().required()
});

export const retireSchema = Joi.object({
  id: Joi.string()
    .guid()
    .required(),
  roleId: Joi.string()
    .guid()
    .required(),
  reason: Joi.string().allow('')
});
