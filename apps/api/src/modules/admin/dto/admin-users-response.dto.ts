import { ApiProperty } from "@nestjs/swagger";

import {
  AuditAction,
  AuthProvider,
  EntryCommentStatus,
  EntryStatus,
  UserRole,
  UserStatus,
} from "../../../generated/prisma/enums";

class AdminPaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 84 })
  total!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

class AdminUserCountsDto {
  @ApiProperty({ example: 12 })
  entries!: number;

  @ApiProperty({ example: 4 })
  comments!: number;

  @ApiProperty({ example: 7 })
  bookmarks!: number;
}

class AdminUserListItemDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "محمود هاشمی" })
  displayName!: string;

  @ApiProperty({ example: "user@example.com" })
  email!: string;

  @ApiProperty({ nullable: true })
  profileImageUrl!: string | null;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;

  @ApiProperty()
  emailVerified!: boolean;

  @ApiProperty({ type: [String], enum: ["PASSWORD", "GOOGLE", "FACEBOOK"] })
  authMethods!: Array<"PASSWORD" | AuthProvider>;

  @ApiProperty({ type: AdminUserCountsDto })
  counts!: AdminUserCountsDto;

  @ApiProperty({ nullable: true })
  lastLoginAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ nullable: true })
  roleChangedAt!: Date | null;
}

class AdminUsersResponseDto {
  @ApiProperty({ type: [AdminUserListItemDto] })
  data!: AdminUserListItemDto[];

  @ApiProperty({ type: AdminPaginationMetaDto })
  meta!: AdminPaginationMetaDto;
}

class AdminUserProvinceDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "هرات" })
  name!: string;

  @ApiProperty({ example: "herat" })
  slug!: string;
}

class AdminUserEntryStatusCountsDto {
  @ApiProperty({ example: 12 })
  total!: number;

  @ApiProperty({ example: 2 })
  draft!: number;

  @ApiProperty({ example: 1 })
  pendingReview!: number;

  @ApiProperty({ example: 1 })
  changesRequested!: number;

  @ApiProperty({ example: 7 })
  published!: number;

  @ApiProperty({ example: 1 })
  rejected!: number;

  @ApiProperty({ example: 0 })
  hidden!: number;

  @ApiProperty({ example: 0 })
  archived!: number;
}

class AdminUserDetailStatsDto {
  @ApiProperty({ type: AdminUserEntryStatusCountsDto })
  entries!: AdminUserEntryStatusCountsDto;

  @ApiProperty({ example: 4 })
  comments!: number;

  @ApiProperty({ example: 7 })
  bookmarks!: number;

  @ApiProperty({ example: 5 })
  likes!: number;

  @ApiProperty({ example: 1 })
  reportsSubmitted!: number;

  @ApiProperty({ example: 2 })
  correctionsSubmitted!: number;

  @ApiProperty({ example: 2 })
  activeSessions!: number;
}

class AdminUserProviderDto {
  @ApiProperty({ enum: AuthProvider })
  provider!: AuthProvider;

  @ApiProperty()
  connectedAt!: Date;
}

class AdminUserDetailDto extends AdminUserListItemDto {
  @ApiProperty({ nullable: true })
  biography!: string | null;

  @ApiProperty({ type: AdminUserProvinceDto, nullable: true })
  province!: AdminUserProvinceDto | null;

  @ApiProperty({ type: [String] })
  culturalInterests!: string[];

  @ApiProperty({ nullable: true })
  emailVerifiedAt!: Date | null;

  @ApiProperty({ nullable: true })
  suspendedAt!: Date | null;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: [AdminUserProviderDto] })
  providers!: AdminUserProviderDto[];

  @ApiProperty({ type: AdminUserDetailStatsDto })
  stats!: AdminUserDetailStatsDto;
}

class AdminUserDetailResponseDto {
  @ApiProperty({ type: AdminUserDetailDto })
  data!: AdminUserDetailDto;
}

class AdminUserEntryDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "ارگ-هرات" })
  slug!: string;

  @ApiProperty({ example: "ارگ هرات" })
  title!: string;

  @ApiProperty({ example: "معرفی کوتاه ارگ هرات" })
  summary!: string;

  @ApiProperty({ enum: EntryStatus })
  status!: EntryStatus;

  @ApiProperty({ nullable: true })
  submittedAt!: Date | null;

  @ApiProperty({ nullable: true })
  publishedAt!: Date | null;

  @ApiProperty()
  updatedAt!: Date;
}

class AdminUserEntriesResponseDto {
  @ApiProperty({ type: [AdminUserEntryDto] })
  data!: AdminUserEntryDto[];

  @ApiProperty({ type: AdminPaginationMetaDto })
  meta!: AdminPaginationMetaDto;
}

class AdminUserCommentEntryDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "ارگ-هرات" })
  slug!: string;

  @ApiProperty({ example: "ارگ هرات" })
  title!: string;
}

class AdminUserCommentDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty()
  body!: string;

  @ApiProperty({ enum: EntryCommentStatus })
  status!: EntryCommentStatus;

  @ApiProperty({ type: AdminUserCommentEntryDto })
  entry!: AdminUserCommentEntryDto;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

class AdminUserCommentsResponseDto {
  @ApiProperty({ type: [AdminUserCommentDto] })
  data!: AdminUserCommentDto[];

  @ApiProperty({ type: AdminPaginationMetaDto })
  meta!: AdminPaginationMetaDto;
}

class AdminUserActivityActorDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty()
  displayName!: string;
}

class AdminUserActivityDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ enum: AuditAction })
  action!: AuditAction;

  @ApiProperty({ type: AdminUserActivityActorDto, nullable: true })
  actor!: AdminUserActivityActorDto | null;

  @ApiProperty({ nullable: true })
  reason!: string | null;

  @ApiProperty()
  createdAt!: Date;
}

class AdminUserActivityResponseDto {
  @ApiProperty({ type: [AdminUserActivityDto] })
  data!: AdminUserActivityDto[];

  @ApiProperty({ type: AdminPaginationMetaDto })
  meta!: AdminPaginationMetaDto;
}

class AdminUserStatusResponseDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;

  @ApiProperty({ nullable: true })
  suspendedAt!: Date | null;
}

class AdminUserStatusEnvelopeDto {
  @ApiProperty({ type: AdminUserStatusResponseDto })
  data!: AdminUserStatusResponseDto;
}

class AdminUserRoleResponseDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ nullable: true })
  profileImageUrl!: string | null;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;

  @ApiProperty()
  emailVerified!: boolean;

  @ApiProperty()
  updatedAt!: Date;
}

class AdminUserRoleEnvelopeDto {
  @ApiProperty({ type: AdminUserRoleResponseDto })
  data!: AdminUserRoleResponseDto;
}

class AdminRevokeSessionsResponseDto {
  @ApiProperty({ format: "uuid" })
  userId!: string;

  @ApiProperty({ example: 3 })
  revokedSessions!: number;
}

class AdminRevokeSessionsEnvelopeDto {
  @ApiProperty({ type: AdminRevokeSessionsResponseDto })
  data!: AdminRevokeSessionsResponseDto;
}

export {
  AdminPaginationMetaDto,
  AdminRevokeSessionsEnvelopeDto,
  AdminRevokeSessionsResponseDto,
  AdminUserActivityDto,
  AdminUserActivityResponseDto,
  AdminUserCommentDto,
  AdminUserCommentsResponseDto,
  AdminUserCountsDto,
  AdminUserDetailDto,
  AdminUserDetailResponseDto,
  AdminUserDetailStatsDto,
  AdminUserEntriesResponseDto,
  AdminUserEntryDto,
  AdminUserEntryStatusCountsDto,
  AdminUserListItemDto,
  AdminUserProviderDto,
  AdminUserRoleEnvelopeDto,
  AdminUserRoleResponseDto,
  AdminUserStatusEnvelopeDto,
  AdminUserStatusResponseDto,
  AdminUsersResponseDto,
};
