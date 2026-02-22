import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/jobs/", "/settings/"],
      },
    ],
    sitemap: "https://nayld.ai/sitemap.xml",
  };
}
