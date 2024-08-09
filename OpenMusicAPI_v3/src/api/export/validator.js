const Joi = require('joi');
const ValidationError = require('../../exceptions/validationError');

const ExportPlaylistPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

const validateExportPlaylistPayload = (payload) => {
  const validationResult = ExportPlaylistPayloadSchema.validate(payload);
  if (validationResult.error) {
    throw new ValidationError(validationResult.error.message);
  }
};

module.exports = { validateExportPlaylistPayload };
