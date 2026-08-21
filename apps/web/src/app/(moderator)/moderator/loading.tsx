import { ModerationQueueSkeleton } from "@/features/moderation/components/moderation-skeletons";

export default function ModeratorQueueLoading() {
  return (
    <div className="content-container space-y-7 pb-16">
      <div className="h-28" aria-hidden="true" />
      <ModerationQueueSkeleton />
    </div>
  );
}
