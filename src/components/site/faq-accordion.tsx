"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FaqAccordion({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-primary-100 rounded-2xl border border-primary-100 bg-white">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index}>
            <button
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
            >
              <span className="font-medium text-primary-900">{faq.question}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-primary-600 transition-transform",
                  isOpen && "rotate-180"
                )}
                aria-hidden
              />
            </button>
            {isOpen && (
              <p className="animate-fade-up px-6 pb-5 text-sm leading-relaxed text-gray-600">
                {faq.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
