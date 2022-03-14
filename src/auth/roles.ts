import { Permission } from './permission.enum';

export const Roles = {
  admin: [
    Permission.ReadProfile,
    // users
    Permission.CreateUser,
    Permission.UpdateUser,
    Permission.ReadAllUsers,
    Permission.DeleteUser,
    Permission.ReadUser,
  ],
  user: [Permission.ReadProfile],
};
