import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../database/prisma.service";
import type { Prisma } from "../../generated/prisma/client";
import { CorrectionStatus, EntryStatus, ReportStatus } from "../../generated/prisma/enums";

const GROWTH_DAYS = 30;
const STALE_REPORT_DAYS = 3;
const RECENT_ACTIVITY_LIMIT = 5;

const adminActivitySelect = {
  id: true,
  action: true,
  createdAt: true,
  actor: {
    select: {
      id: true,
      displayName: true,
    },
  },
  targetUser: {
    select: {
      id: true,
      displayName: true,
    },
  },
  entry: {
    select: {
      id: true,
      slug: true,
      title: true,
    },
  },
} as const;

@Injectable()
class AdminOverviewService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getOverview() {
    const now = new Date();
    const rangeStart = this.startOfUtcDay(this.addUtcDays(now, -(GROWTH_DAYS - 1)));
    const rangeEnd = this.addUtcDays(this.startOfUtcDay(now), 1);
    const staleBefore = new Date(now.getTime() - STALE_REPORT_DAYS * 24 * 60 * 60 * 1000);
    const unresolvedReportWhere: Prisma.ReportWhereInput = {
      status: { in: [ReportStatus.OPEN, ReportStatus.UNDER_REVIEW] },
    };

    const [
      usersTotal,
      publishedEntriesTotal,
      pendingReview,
      openReports,
      staleReports,
      pendingCorrections,
      usersBeforeRange,
      usersCreatedInRange,
      entriesBeforeRange,
      entriesPublishedInRange,
      recentActivity,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.culturalEntry.count({ where: { status: EntryStatus.PUBLISHED } }),
      this.prisma.culturalEntry.count({ where: { status: EntryStatus.PENDING_REVIEW } }),
      this.prisma.report.count({ where: unresolvedReportWhere }),
      this.prisma.report.count({
        where: {
          ...unresolvedReportWhere,
          createdAt: { lt: staleBefore },
        },
      }),
      this.prisma.correctionSuggestion.count({ where: { status: CorrectionStatus.PENDING } }),
      this.prisma.user.count({ where: { createdAt: { lt: rangeStart } } }),
      this.prisma.user.findMany({
        where: { createdAt: { gte: rangeStart, lt: rangeEnd } },
        select: { createdAt: true },
      }),
      this.prisma.culturalEntry.count({
        where: {
          status: EntryStatus.PUBLISHED,
          publishedAt: { lt: rangeStart },
        },
      }),
      this.prisma.culturalEntry.findMany({
        where: {
          status: EntryStatus.PUBLISHED,
          publishedAt: { gte: rangeStart, lt: rangeEnd },
        },
        select: { publishedAt: true },
      }),
      this.prisma.auditLog.findMany({
        select: adminActivitySelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: RECENT_ACTIVITY_LIMIT,
      }),
    ]);

    return {
      data: {
        stats: {
          users: {
            total: usersTotal,
            last30Days: usersCreatedInRange.length,
          },
          publishedEntries: {
            total: publishedEntriesTotal,
            last30Days: entriesPublishedInRange.length,
          },
          pendingReview,
          openReports,
          staleReports,
        },
        growth: this.createGrowthSeries({
          rangeStart,
          usersBeforeRange,
          entriesBeforeRange,
          userDates: usersCreatedInRange.map((item) => item.createdAt),
          entryDates: entriesPublishedInRange.flatMap((item) =>
            item.publishedAt ? [item.publishedAt] : [],
          ),
        }),
        attention: {
          pendingSubmissions: pendingReview,
          pendingCorrections,
          openReports,
          staleReports,
        },
        recentActivity,
        generatedAt: now,
      },
    };
  }

  private createGrowthSeries(input: {
    rangeStart: Date;
    usersBeforeRange: number;
    entriesBeforeRange: number;
    userDates: Date[];
    entryDates: Date[];
  }) {
    const usersByDate = this.countByUtcDate(input.userDates);
    const entriesByDate = this.countByUtcDate(input.entryDates);
    let users = input.usersBeforeRange;
    let publishedEntries = input.entriesBeforeRange;

    return Array.from({ length: GROWTH_DAYS }, (_, index) => {
      const date = this.toUtcDateKey(this.addUtcDays(input.rangeStart, index));
      users += usersByDate.get(date) ?? 0;
      publishedEntries += entriesByDate.get(date) ?? 0;

      return {
        date,
        users,
        publishedEntries,
      };
    });
  }

  private countByUtcDate(values: Date[]) {
    const counts = new Map<string, number>();

    for (const value of values) {
      const key = this.toUtcDateKey(value);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return counts;
  }

  private startOfUtcDay(value: Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  private addUtcDays(value: Date, days: number) {
    const result = new Date(value);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  private toUtcDateKey(value: Date) {
    return value.toISOString().slice(0, 10);
  }
}

export { AdminOverviewService };
