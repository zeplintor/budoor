import { ReactNode } from "react";

/**
 * SEO optimized heading component
 * Automatically adds semantic markup and improves keyword visibility
 */
export function SeoHeading({
  as = "h1",
  children,
  className = "",
  ...props
}: {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  children: ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const HeadingTag = as;
  const baseClasses = {
    h1: "text-4xl md:text-5xl font-bold",
    h2: "text-3xl md:text-4xl font-bold",
    h3: "text-2xl md:text-3xl font-bold",
    h4: "text-xl md:text-2xl font-bold",
    h5: "text-lg md:text-xl font-bold",
    h6: "text-base md:text-lg font-bold",
  };

  return (
    <HeadingTag className={`${baseClasses[as]} ${className}`} {...props}>
      {children}
    </HeadingTag>
  );
}

/**
 * SEO optimized paragraph with better readability
 */
export function SeoParagraph({
  children,
  className = "",
  ...props
}: {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <p
      className={`text-base md:text-lg leading-relaxed text-[var(--text-secondary)] ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

/**
 * Breadcrumb navigation for SEO
 */
export function Breadcrumbs({
  items,
}: {
  items: { name: string; url?: string }[];
}) {
  return (
    <nav aria-label="breadcrumbs" className="mb-6">
      <ol className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {item.url ? (
              <a href={item.url} className="hover:text-[var(--text-primary)]">
                {item.name}
              </a>
            ) : (
              <span>{item.name}</span>
            )}
            {index < items.length - 1 && <span>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Schema.org markup helper for rich snippets
 */
export function SchemaScript({ data }: { data: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

/**
 * Article schema markup
 */
export function ArticleSchema({
  title,
  description,
  image,
  author,
  publishedDate,
  updatedDate,
}: {
  title: string;
  description: string;
  image: string;
  author: string;
  publishedDate: string;
  updatedDate?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image,
    author: {
      "@type": "Person",
      name: author,
    },
    datePublished: publishedDate,
    dateModified: updatedDate || publishedDate,
  };

  return <SchemaScript data={schema} />;
}
