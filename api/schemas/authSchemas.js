const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(120),
  countryCode: z.string().trim().length(2).optional(),
  currencyCode: z.string().trim().length(3).optional(),
  referralCode: z.string().trim().min(4).max(32).optional()
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128)
});

const telegramMiniAppLoginSchema = z.object({
  initData: z.string().trim().min(1).max(8192),
  startParam: z.string().trim().max(512).optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  telegramMiniAppLoginSchema
};
