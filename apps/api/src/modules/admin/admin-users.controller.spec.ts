jest.mock("./admin-users.service", () => ({
  AdminUsersService: class AdminUsersService {},
}));

import { UserRole } from "../../generated/prisma/enums";
import { ROLES_KEY } from "../auth/auth.constants";
import { AdminUsersController } from "./admin-users.controller";
import { UpdateAdminUserRoleDto, UpdateAdminUserStatusDto } from "./dto/admin-user-actions.dto";
import {
  AdminUserActivityQueryDto,
  AdminUserCommentsQueryDto,
  AdminUserEntriesQueryDto,
  AdminUsersQueryDto,
} from "./dto/admin-users-query.dto";

describe("AdminUsersController runtime DTO metadata", () => {
  it("retains query DTO classes for Nest validation", () => {
    expect(
      Reflect.getMetadata("design:paramtypes", AdminUsersController.prototype, "listUsers"),
    ).toEqual([AdminUsersQueryDto]);
    expect(
      Reflect.getMetadata("design:paramtypes", AdminUsersController.prototype, "listUserEntries"),
    ).toEqual([String, AdminUserEntriesQueryDto]);
    expect(
      Reflect.getMetadata("design:paramtypes", AdminUsersController.prototype, "listUserComments"),
    ).toEqual([String, AdminUserCommentsQueryDto]);
    expect(
      Reflect.getMetadata("design:paramtypes", AdminUsersController.prototype, "listUserActivity"),
    ).toEqual([String, AdminUserActivityQueryDto]);
  });

  it("retains the status body DTO class for Nest validation", () => {
    const parameterTypes = Reflect.getMetadata(
      "design:paramtypes",
      AdminUsersController.prototype,
      "updateUserStatus",
    );

    expect(parameterTypes.at(-1)).toBe(UpdateAdminUserStatusDto);
  });

  it("retains the role body DTO class for Nest validation", () => {
    const parameterTypes = Reflect.getMetadata(
      "design:paramtypes",
      AdminUsersController.prototype,
      "updateUserRole",
    );

    expect(parameterTypes.at(-1)).toBe(UpdateAdminUserRoleDto);
  });

  it("requires the ADMIN role for moderator management", () => {
    expect(Reflect.getMetadata(ROLES_KEY, AdminUsersController)).toEqual([UserRole.ADMIN]);
  });
});
