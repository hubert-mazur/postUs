const Joi = require('joi');

const registerValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().max(25).required(),
        lastName: Joi.string().max(25).required(),
        email: Joi.string().required().max(64).email(),
        password: Joi.string().required().max(12).min(4),
      });

      return schema.validate(data);
};

const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().required().max(64).email(),
        password: Joi.string().required().max(12).min(4),
      });

      return schema.validate(data);
};


module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;