export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NayldAi",
    url: "https://nayld.ai",
    logo: "https://cdn.nayld.ai/logo/nayld-logo-light.png",
    description:
      "AI-powered mock interview platform helping job seekers prepare with personalized, resume-based practice interviews.",
    email: "hello@nayld.ai",
    sameAs: [],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "nayld.ai",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "10",
      highPrice: "69",
    },
    description:
      "AI-powered mock interview platform that analyzes your resume, generates tailored interview questions, and provides instant feedback to help you ace your next job interview.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://nayld.ai",
    name: "nayld.ai",
    description: "AI-Powered Mock Interviews",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://nayld.ai/signup",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
