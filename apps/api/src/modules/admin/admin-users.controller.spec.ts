jest.mock("@/modules/admin/admin-users.service", () => ({
  AdminUsersService: class AdminUsersService {},
}));

import { AdminUsersController } from "@/modules/admin/admin-users.controller";
import { UpdateAdminUserStatusDto } from "@/modules/admin/dto/admin-user-actions.dto";
import {
  AdminUserActivityQueryDto,
  AdminUserEntriesQueryDto,
  AdminUserReviewsQueryDto,
  AdminUsersQueryDto,
} from "@/modules/admin/dto/admin-users-query.dto";

describe("AdminUsersController runtime DTO metadata", () => {
  it("retains query DTO classes for Nest validation", () => {
    expect(
      Reflect.getMetadata("design:paramtypes", AdminUsersController.prototype, "listUsers"),
    ).toEqual([AdminUsersQueryDto]);
    expect(
      Reflect.getMetadata("design:paramtypes", AdminUsersController.prototype, "listUserEntries"),
    ).toEqual([String, AdminUserEntriesQueryDto]);
    expect(
      Reflect.getMetadata("design:paramtypes", AdminUsersController.prototype, "listUserReviews"),
    ).toEqual([String, AdminUserReviewsQueryDto]);
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
