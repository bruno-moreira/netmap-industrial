const authService = require('../services/authService');
const { asyncHandler } = require('../middlewares/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
});

const register = asyncHandler(async (req, res) => {
  const data = req.body;
  const result = await authService.register(data);
  res.status(201).json(result);
});

module.exports = { login, register };
