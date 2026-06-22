import authService from '../services/authService.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

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

export { login, register };
export default { login, register };
