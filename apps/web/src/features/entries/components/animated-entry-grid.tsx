"use client";

import { AnimatePresence, motion } from "motion/react";

import { EngagementAccessProvider } from "@/features/engagement/components/engagement-access-provider";
import type { EntryListResponse } from "../types/public-entry";
import type { EntryBreadcrumbContext } from "../utils/entry-breadcrumb";
import { PublicEntryCardView } from "./public-entry-card";

type AnimatedEntryGridProps = {
  entries: EntryListResponse["data"];
  breadcrumbParent: EntryBreadcrumbContext;
};

function AnimatedEntryGrid({ entries, breadcrumbParent }: AnimatedEntryGridProps) {
  return (
    <EngagementAccessProvider>
      <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <PublicEntryCardView
                entry={entry}
                imageIndex={index}
                breadcrumbParent={breadcrumbParent}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </EngagementAccessProvider>
  );
}

export { AnimatedEntryGrid };
