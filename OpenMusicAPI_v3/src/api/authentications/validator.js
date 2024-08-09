const Joi = require('joi');
const ValidationError = require('../../exceptions/validationError');

const validateAuthenticationPayload = (payload) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(payload);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
};

const validatePutAuthenticationPayload = (payload) => {
  const schema = Joi.object({
    refreshToken: Joi.string().required(),
  });

  const { error } = schema.validate(payload);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
};

const validateDeleteAuthenticationPayload = (payload) => {
  const schema = Joi.object({
    refreshToken: Joi.string().required(),
  });

  const { error } = schema.validate(payload);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
};

module.exports = {
  validateAuthenticationPayload,
  validatePutAuthenticationPayload,
  validateDeleteAuthenticationPayload,
};
