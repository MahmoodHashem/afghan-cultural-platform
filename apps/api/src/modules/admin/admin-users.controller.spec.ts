jest.mock("./admin-users.service", () => ({
  AdminUsersService: class AdminUsersService {},
}));

import { AdminUsersController } from "./admin-users.controller";
import { UpdateAdminUserStatusDto } from "./dto/admin-user-actions.dto";
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
});
