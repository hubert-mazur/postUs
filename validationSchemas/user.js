const Joi = require("joi");

const registerValidation = async (data) => {
  const schema = Joi.object({
    name: Joi.string().max(25).required(),
    lastName: Joi.string().max(25).required(),
    email: Joi.string().required().max(64).email(),
    password: Joi.string().required().max(12).min(4),
    born: Joi.string(),
  });
  console.error(schema.validate(data));
  return schema.validate(data);
};

const loginValidation = async (data) => {
  const schema = Joi.object({
    email: Joi.string().required().max(64).email(),
    password: Joi.string().required().max(12).min(4),
  });
  console.error(schema.validate(data));
  return schema.validate(data);
};

module.exports = { loginValidation, registerValidation };
