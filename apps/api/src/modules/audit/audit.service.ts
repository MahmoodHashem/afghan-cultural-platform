import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../database/prisma.service";
import type { Prisma } from "../../generated/prisma/client";
import type { AuditAction } from "../../generated/prisma/enums";

type AuditDbClient = Prisma.TransactionClient | PrismaService;

type CreateAuditLogInput = {
  action: AuditAction;
  actorId?: string | null;
  targetUserId?: string | null;
  entryId?: string | null;
  reportId?: string | null;
  correctionSuggestionId?: string | null;
  entryRevisionId?: string | null;
  metadata?: Prisma.InputJsonValue;
  requestId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

@Injectable()
class AuditService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(input: CreateAuditLogInput) {
    return this.createWithClient(this.prisma, input);
  }

  createWithClient(client: AuditDbClient, input: CreateAuditLogInput) {
    return client.auditLog.create({
      data: {
        action: input.action,
        actorId: input.actorId ?? null,
        targetUserId: input.targetUserId ?? null,
        entryId: input.entryId ?? null,
        reportId: input.reportId ?? null,
        correctionSuggestionId: input.correctionSuggestionId ?? null,
        entryRevisionId: input.entryRevisionId ?? null,
        metadata: input.metadata,
        requestId: input.requestId ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  }
}

export type { AuditDbClient, CreateAuditLogInput };
export { AuditService };
