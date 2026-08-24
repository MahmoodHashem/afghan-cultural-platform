"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { engagementQueryKeys } from "@/features/engagement/constants/engagement-query-keys";
import {
  decideCorrection,
  getCorrection,
  getReport,
  listCorrections,
  listModerationHistory,
  listReports,
  resolveReport,
  submitContentReport,
  submitCorrection,
} from "@/features/moderation/api/content-moderation-api";
import type {
  CorrectionStatus,
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from "@/features/moderation/types/content-moderation";
import { getModerationErrorMessage } from "@/features/moderation/utils/moderation-errors";

const contentModerationKeys = {
  all: ["content-moderation"] as const,
  corrections: () => [...contentModerationKeys.all, "corrections"] as const,
  correctionList: (query: unknown) =>
    [...contentModerationKeys.corrections(), "list", query] as const,
  correction: (id: string) => [...contentModerationKeys.corrections(), id] as const,
  reports: () => [...contentModerationKeys.all, "reports"] as const,
  reportList: (query: unknown) => [...contentModerationKeys.reports(), "list", query] as const,
  report: (id: string) => [...contentModerationKeys.reports(), id] as const,
  histories: () => [...contentModerationKeys.all, "history"] as const,
  history: (query: unknown) => [...contentModerationKeys.histories(), query] as const,
};

function useCorrectionQueue(query: { page: number; limit: number; status?: CorrectionStatus }) {
  return useQuery({
    queryKey: contentModerationKeys.correctionList(query),
    queryFn: ({ signal }) => listCorrections(query, signal),
  });
}

function useCorrection(id: string) {
  return useQuery({
    queryKey: contentModerationKeys.correction(id),
    queryFn: ({ signal }) => getCorrection(id, signal),
  });
}

function useCorrectionDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: decideCorrection,
    onSuccess: async (response, input) => {
      toast.success(
        input.decision === "ACCEPT" ? "پیشنهاد اصلاح پذیرفته شد." : "پیشنهاد اصلاح رد شد.",
      );
      queryClient.setQueryData(contentModerationKeys.correction(input.id), response);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: contentModerationKeys.corrections() }),
        queryClient.invalidateQueries({ queryKey: ["public-entries"] }),
      ]);
    },
    onError: (error) => toast.error(getModerationErrorMessage(error)),
  });
}

function useReportsQueue(query: {
  page: number;
  limit: number;
  status?: ReportStatus;
  reason?: ReportReason;
  targetType?: ReportTargetType;
}) {
  return useQuery({
    queryKey: contentModerationKeys.reportList(query),
    queryFn: ({ signal }) => listReports(query, signal),
  });
}

function useReport(id: string) {
  return useQuery({
    queryKey: contentModerationKeys.report(id),
    queryFn: ({ signal }) => getReport(id, signal),
  });
}

function useResolveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resolveReport,
    onSuccess: async (response, input) => {
      toast.success("گزارش بررسی و بسته شد.");
      queryClient.setQueryData(contentModerationKeys.report(input.id), response);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: contentModerationKeys.reports() }),
        queryClient.invalidateQueries({
          queryKey: engagementQueryKeys.comments(response.data.entryId),
        }),
        queryClient.invalidateQueries({ queryKey: ["public-entries"] }),
        queryClient.invalidateQueries({ queryKey: contentModerationKeys.histories() }),
      ]);
    },
    onError: (error) => toast.error(getModerationErrorMessage(error)),
  });
}

function useModerationHistory(query: { page: number; limit: number; action?: string }) {
  return useQuery({
    queryKey: contentModerationKeys.history(query),
    queryFn: ({ signal }) => listModerationHistory(query, signal),
  });
}

function useSubmitCorrection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitCorrection,
    onSuccess: async () => {
      toast.success("پیشنهاد اصلاح برای بررسی فرستاده شد.");
      await queryClient.invalidateQueries({ queryKey: contentModerationKeys.corrections() });
    },
    onError: (error) => toast.error(getModerationErrorMessage(error)),
  });
}

function useSubmitReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitContentReport,
    onSuccess: async () => {
      toast.success("گزارش شما برای بررسی فرستاده شد.");
      await queryClient.invalidateQueries({ queryKey: contentModerationKeys.reports() });
    },
    onError: (error) => toast.error(getModerationErrorMessage(error)),
  });
}

export {
  contentModerationKeys,
  useCorrection,
  useCorrectionDecision,
  useCorrectionQueue,
  useModerationHistory,
  useReport,
  useReportsQueue,
  useResolveReport,
  useSubmitCorrection,
  useSubmitReport,
};
