import { UserRole, UserStatus } from "../../src/generated/prisma/enums";
import { createDeterministicUuid } from "../../src/modules/entries/utils/normalized-content.util";

const DEMO_USER_PASSWORD = "DemoPassword123!";

type DemoUserDefinition = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
};

const demoUsers: DemoUserDefinition[] = [
  {
    id: createDeterministicUuid("demo-user", "admin"),
    email: "admin.demo@afghan-culture.local",
    displayName: "مدیر نمونه",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    emailVerified: true,
  },
  {
    id: createDeterministicUuid("demo-user", "moderator-one"),
    email: "moderator.one.demo@afghan-culture.local",
    displayName: "بازبین نمونه یک",
    role: UserRole.MODERATOR,
    status: UserStatus.ACTIVE,
    emailVerified: true,
  },
  {
    id: createDeterministicUuid("demo-user", "moderator-two"),
    email: "moderator.two.demo@afghan-culture.local",
    displayName: "بازبین نمونه دو",
    role: UserRole.MODERATOR,
    status: UserStatus.ACTIVE,
    emailVerified: true,
  },
  {
    id: createDeterministicUuid("demo-user", "contributor-herat"),
    email: "contributor.herat.demo@afghan-culture.local",
    displayName: "همکار فرهنگی هرات",
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    emailVerified: true,
  },
  {
    id: createDeterministicUuid("demo-user", "contributor-kabul"),
    email: "contributor.kabul.demo@afghan-culture.local",
    displayName: "همکار فرهنگی کابل",
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    emailVerified: true,
  },
  {
    id: createDeterministicUuid("demo-user", "contributor-national"),
    email: "contributor.national.demo@afghan-culture.local",
    displayName: "همکار فرهنگی ملی",
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    emailVerified: true,
  },
  {
    id: createDeterministicUuid("demo-user", "contributor-unverified"),
    email: "contributor.unverified.demo@afghan-culture.local",
    displayName: "همکار تاییدنشده نمونه",
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    emailVerified: false,
  },
];

export type { DemoUserDefinition };
export { DEMO_USER_PASSWORD, demoUsers };
