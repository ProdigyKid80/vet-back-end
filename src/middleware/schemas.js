const Joi = require("joi");

const registrationSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const changePassSchema = Joi.object({
  oldPass: Joi.string().required(),
  newPass: Joi.string().required(),
});

const forgotPassSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
});

module.exports = {
  registrationSchema,
  loginSchema,
  changePassSchema,
  forgotPassSchema,
};
