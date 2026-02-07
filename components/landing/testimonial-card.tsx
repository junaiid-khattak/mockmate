import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

type Props = {
  testimonial: Testimonial;
  className?: string;
};

export function TestimonialCard({ testimonial, className }: Props) {
  return (
    <Card
      className={cn(
        "h-full border-slate-200/80 bg-white transition hover:shadow-md",
        className,
      )}
    >
      <CardContent className="flex h-full flex-col p-6">
        <Quote className="mb-4 h-8 w-8 text-mm-violet/20" />
        <p className="flex-1 text-sm leading-relaxed text-slate-600">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-900">
            {testimonial.name}
          </p>
          <p className="text-xs text-slate-500">
            {testimonial.role} &middot; {testimonial.company}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
