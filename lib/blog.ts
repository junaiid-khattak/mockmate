import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { format } from "date-fns";

const contentDirectory = path.join(process.cwd(), "content/blog");

export type BlogPost = {
  slug: string;
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  excerpt: string;
  date: string;
  formattedDate: string;
  updatedDate?: string;
  content: string;
  ogImage?: string;
  tags?: string[];
};

export function getAllPosts(): BlogPost[] {
  // Ensure directory exists
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(contentDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, "");
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        excerpt: data.excerpt || "",
        date: data.date || new Date().toISOString(),
        formattedDate: format(new Date(data.date || new Date()), "MMMM d, yyyy"),
        updatedDate: data.updatedDate,
        content,
        ogImage: data.ogImage,
        tags: data.tags || [],
      } as BlogPost;
    });

  // Sort posts by date in descending order
  return allPostsData.sort((a, b) => {
    if (new Date(a.date) < new Date(b.date)) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(contentDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || slug,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      excerpt: data.excerpt || "",
      date: data.date || new Date().toISOString(),
      formattedDate: format(new Date(data.date || new Date()), "MMMM d, yyyy"),
      updatedDate: data.updatedDate,
      content,
      ogImage: data.ogImage,
      tags: data.tags || [],
    };
  } catch {
    return null;
  }
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(contentDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map((fileName) => fileName.replace(/\.mdx$/, ""));
}
