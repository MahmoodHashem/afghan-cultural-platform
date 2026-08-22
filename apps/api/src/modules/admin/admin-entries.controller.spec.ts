jest.mock("@/modules/admin/admin-entries.service", () => ({
  AdminEntriesService: class AdminEntriesService {},
}));

import { UserRole } from "@/generated/prisma/enums";
import { AdminEntriesController } from "@/modules/admin/admin-entries.controller";
import { AdminEntriesQueryDto } from "@/modules/admin/dto/admin-entries-query.dto";
import { AdminEntryLifecycleReasonDto } from "@/modules/admin/dto/admin-entry-actions.dto";
import { ROLES_KEY } from "@/modules/auth/auth.constants";

describe("AdminEntriesController metadata", () => {
  it("retains runtime DTO classes for whitelist validation", () => {
    expect(
      Reflect.getMetadata("design:paramtypes", AdminEntriesController.prototype, "listEntries"),
    ).toEqual([AdminEntriesQueryDto]);
    expect(
      Reflect.getMetadata("design:paramtypes", AdminEntriesController.prototype, "archiveEntry").at(
        -1,
      ),
    ).toBe(AdminEntryLifecycleReasonDto);
  });

  it("requires the ADMIN role for the whole controller", () => {
    expect(Reflect.getMetadata(ROLES_KEY, AdminEntriesController)).toEqual([UserRole.ADMIN]);
  });
});
