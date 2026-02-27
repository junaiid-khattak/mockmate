import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const schemaItems = [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://nayld.ai" },
    ...items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 2,
      name: item.label,
      ...(item.href ? { item: `https://nayld.ai${item.href}` } : {}),
    })),
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: schemaItems,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
          <li>
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Home
            </Link>
          </li>
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <span aria-hidden="true">/</span>
              {item.href ? (
                <Link href={item.href} className="hover:text-slate-900 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-900 font-medium" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
