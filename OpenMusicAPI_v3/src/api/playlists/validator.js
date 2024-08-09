const Joi = require('joi');
const ValidationError = require('../../exceptions/validationError');

const validatePlaylistPayload = (payload) => {
  const schema = Joi.object({
    name: Joi.string().required(),
  });

  const { error } = schema.validate(payload);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
};

const validateSongPayload = (payload) => {
  const schema = Joi.object({
    songId: Joi.string().required(),
  });

  const { error } = schema.validate(payload);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
};

module.exports = {
  validatePlaylistPayload,
  validateSongPayload,
};
