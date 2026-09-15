jest.mock("./admin-audit.service", () => ({
  AdminAuditService: class AdminAuditService {},
}));

import { UserRole } from "../../generated/prisma/enums";
import { ROLES_KEY } from "../auth/auth.constants";
import { AdminAuditController } from "./admin-audit.controller";
import { AdminAuditQueryDto } from "./dto/admin-audit-query.dto";

describe("AdminAuditController", () => {
  it("retains the query DTO for global validation", () => {
    expect(
      Reflect.getMetadata("design:paramtypes", AdminAuditController.prototype, "list"),
    ).toEqual([AdminAuditQueryDto]);
  });

  it("is restricted to Admin users", () => {
    expect(Reflect.getMetadata(ROLES_KEY, AdminAuditController)).toEqual([UserRole.ADMIN]);
  });
});
