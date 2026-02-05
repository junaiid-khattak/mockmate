import * as React from "react";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  title: string;
  content: React.ReactNode;
};

interface AccordionProps {
  items: Item[];
  type?: "single" | "multiple";
  defaultValue?: string;
  className?: string;
}

export function Accordion({ items, type = "single", defaultValue, className }: AccordionProps) {
  const [open, setOpen] = React.useState<string[]>(defaultValue ? [defaultValue] : []);

  const toggle = (id: string) => {
    if (type === "single") {
      setOpen((prev) => (prev[0] === id ? [] : [id]));
    } else {
      setOpen((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    }
  };

  return (
    <div className={cn("divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white/70 shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/60", className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        return (
          <div key={item.id}>
            <button
              className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800/60"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              aria-controls={`${item.id}-content`}
            >
              <span>{item.title}</span>
              <span className="text-xl">{isOpen ? "−" : "+"}</span>
            </button>
            <div
              id={`${item.id}-content`}
              className={cn(
                "overflow-hidden px-6 transition-all",
                isOpen ? "max-h-96 pb-4 pt-0" : "max-h-0"
              )}
            >
              <div className="pb-4 text-sm text-slate-600 dark:text-slate-300">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
