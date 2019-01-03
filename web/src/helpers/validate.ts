import * as joi from 'joi';

export function validate(
  paramsToValidate,
  schema
): { errors?: any; errorMessage?: string } {
  const validationResult: joi.ValidationResult<object> = joi.validate(
    paramsToValidate,
    schema,
    {
      abortEarly: false
    }
  );

  const result: any = {};

  if (validationResult.error) {
    result.errors = validationResult.error.details.map(
      detail => detail.message
    );

    result.errorMessage = validationResult.error.message;
  }

  return result;
}
