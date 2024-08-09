const Joi = require('joi');
const ValidationError = require('../../exceptions/validationError');

const validateUserPayload = (payload) => {
    const schema = Joi.object({
        username: Joi.string().max(100).required(),
        password: Joi.string().max(128).required(),
        fullname: Joi.string().max(256).required(),
    });

    const { error } = schema.validate(payload);
    if (error) {
        throw new ValidationError(error.details[0].message);
    }
};

module.exports = {
    validateUserPayload,
};
