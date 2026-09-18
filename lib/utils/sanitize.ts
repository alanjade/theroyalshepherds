import sanitizeHtmlLib from "sanitize-html";

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "h2", "h3", "h4", "ul", "ol", "li",
  "a", "blockquote", "img", "figure", "figcaption", "hr",
];

/**
 * Sanitizes rich-text HTML before storage AND again before render (defense
 * in depth). Uses `sanitize-html` (pure JS, no jsdom) rather than
 * isomorphic-dompurify — the latter pulls in jsdom, whose dependency chain
 * (html-encoding-sniffer -> @exodus/bytes) hits an ESM/CJS interop bug in
 * Vercel's serverless bundler. sanitize-html avoids that entirely.
 */
export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtmlLib.simpleTransform("a", { rel: "noopener noreferrer" }, true),
    },
  });
}
