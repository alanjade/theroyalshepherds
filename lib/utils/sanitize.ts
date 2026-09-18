import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p","br","strong","em","u","s","h2","h3","h4","ul","ol","li",
  "a","blockquote","img","figure","figcaption","hr",
];

/** Sanitizes rich-text HTML before storage AND again before render (defense in depth). */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel"],
  });
}
