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

const petSchema = Joi.object({
  name: Joi.string().trim().required(),
  birthday: Joi.date(),
  email: Joi.string().email().lowercase().trim(),
});

const logSchema = Joi.object({
  pet_id: Joi.number().required(),
  title: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  date: Joi.date().required(),
});

const resetPassSchema = Joi.object({
  email: Joi.string().email().lowercase().trim(),
  token: Joi.string().required(),
  newPass: Joi.string().required(),
});

module.exports = {
  registrationSchema,
  loginSchema,
  changePassSchema,
  forgotPassSchema,
  petSchema,
  logSchema,
  resetPassSchema,
};
