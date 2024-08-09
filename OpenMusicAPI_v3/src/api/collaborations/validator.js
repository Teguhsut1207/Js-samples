const Joi = require('joi');
const ValidationError = require('../../exceptions/validationError');

const validateCollaborationPayload = (payload) => {
  const schema = Joi.object({
    playlistId: Joi.string().required(),
    userId: Joi.string().required(),
  });

  const { error } = schema.validate(payload);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
};

module.exports = {
  validateCollaborationPayload,
};
