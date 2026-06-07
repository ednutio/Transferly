const { authService } = require('../services/authService');
const { loginSchema, registerSchema, telegramMiniAppLoginSchema } = require('../schemas/authSchemas');

async function registerController(request, response) {
  const body = registerSchema.parse(request.body || {});
  const result = await authService.register(body);
  response.status(201).json(result);
}

async function loginController(request, response) {
  const body = loginSchema.parse(request.body || {});
  const result = await authService.login(body);
  response.json(result);
}

async function telegramMiniAppLoginController(request, response) {
  const body = telegramMiniAppLoginSchema.parse(request.body || {});
  const result = await authService.loginWithTelegramMiniApp(body);
  response.json(result);
}

module.exports = {
  registerController,
  loginController,
  telegramMiniAppLoginController
};
