"use client";

import {
  EllipsisHorizontalIcon,
  FlagIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommentDeleteDialog } from "@/features/engagement/components/comment-delete-dialog";
import { useEngagementAccess } from "@/features/engagement/hooks/use-engagement-access";
import { ReportSheet } from "@/features/moderation/components/community-moderation-actions";

type CommentMenuProps = {
  entryId: string;
  commentId: string;
  isOwner: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => Promise<void>;
};

function CommentMenu({
  entryId,
  commentId,
  isOwner,
  isDeleting,
  onEdit,
  onDelete,
}: CommentMenuProps) {
  const { ensureVerifiedAccess } = useEngagementAccess();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  async function confirmDelete() {
    try {
      await onDelete();
      setDeleteOpen(false);
    } catch {
      // The mutation displays the normalized Persian error.
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="اقدام‌های دیدگاه"
              className="text-muted-foreground"
            />
          }
        >
          <EllipsisHorizontalIcon className="size-5" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={6} className="min-w-40">
          <DropdownMenuGroup>
            {isOwner ? (
              <>
                <DropdownMenuItem onClick={onEdit}>
                  <PencilSquareIcon aria-hidden="true" />
                  ویرایش
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                  <TrashIcon aria-hidden="true" />
                  حذف
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onClick={() => ensureVerifiedAccess("report") && setReportOpen(true)}
              >
                <FlagIcon aria-hidden="true" />
                گزارش دیدگاه
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <CommentDeleteDialog
        open={deleteOpen}
        isDeleting={isDeleting}
        onOpenChange={setDeleteOpen}
        onConfirm={confirmDelete}
      />

      <ReportSheet
        entryId={entryId}
        commentId={commentId}
        open={reportOpen}
        onOpenChange={setReportOpen}
      />
    </>
  );
}

export { CommentMenu };
