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
      className="overflow-hidden rounded-[24px] border border-border bg-card px-5 shadow-[0_2px_10px_rgba(0,0,0,.04)] sm:px-7"
    >
      {items.map((item, index) => (
        <AccordionItem
          key={item.question}
          value={`faq-${index}`}
          className={cn(index > 0 && "border-t border-border")}
        >
          <AccordionTrigger className="py-5 text-[16px] font-semibold hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent>
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
              className=" space-y-4 pb-4 ps-8 text-[15px] leading-8 text-muted-foreground text-end w-full"
            >
              <p>{item.answer}</p>
              {item.details ? (
                <ul className="space-y-2 ps-5 marker:text-primary">
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
