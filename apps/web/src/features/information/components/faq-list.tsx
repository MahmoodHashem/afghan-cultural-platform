"use client";

import { motion, useReducedMotion } from "motion/react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type FaqItem = {
  question: string;
  answer: string;
  details?: string[];
};

function FaqList({ items }: { items: FaqItem[] }) {
  const reducedMotion = Boolean(useReducedMotion());

  return (
    <Accordion
      multiple={false}
      defaultValue={items[0] ? ["faq-0"] : []}
      className="overflow-hidden rounded-card border border-line-soft bg-surface px-5 shadow-card sm:px-6"
    >
      {items.map((item, index) => (
        <AccordionItem
          key={item.question}
          value={`faq-${index}`}
          className={cn(index > 0 && "border-t border-line-soft")}
        >
          <AccordionTrigger className="py-4.5 text-[15px] leading-[1.9] font-bold text-ink hover:no-underline aria-expanded:text-brand-ink">
            {item.question}
          </AccordionTrigger>
          <AccordionContent>
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
              className="w-full space-y-3 pb-5 text-[14.5px] leading-[2.05] text-copy"
            >
              <p>{item.answer}</p>
              {item.details ? (
                <ul className="space-y-2 ps-5 marker:text-brand">
                  {item.details.map((detail) => (
                    <li key={detail} className="ps-2">
                      {detail}
                    </li>
                  ))}
                </ul>
              ) : null}
            </motion.div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export type { FaqItem };
export { FaqList };
