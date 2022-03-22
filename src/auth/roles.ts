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
    // comments
    Permission.CreateComment,
    Permission.UpdateComment,
    Permission.ReadAllComments,
    Permission.DeleteComment,
    Permission.ReadComment,
  ],
  user: [
    Permission.ReadProfile,
    // comments
    Permission.CreateComment,
    Permission.ReadAllComments,
    Permission.ReadComment,
  ],
};
