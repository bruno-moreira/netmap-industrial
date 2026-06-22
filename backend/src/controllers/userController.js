import { asyncHandler } from '../middlewares/asyncHandler.js';
import userService from '../services/userService.js';

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers(req.tenantId);
  res.json(users);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(
    parseInt(req.params.id),
    req.tenantId
  );
  res.json(user);
});

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(
    req.body,
    req.tenantId
  );
  res.status(201).json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(
    parseInt(req.params.id),
    req.body,
    req.tenantId,
    req.user.id
  );
  res.json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(
    parseInt(req.params.id),
    req.tenantId
  );
  res.sendStatus(204);
});

export {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
