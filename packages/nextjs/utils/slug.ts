/**
 * Converts a string to a URL-friendly slug
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Creates a project URL with ID and slug
 */
export function createProjectUrl(projectId: string | number, title: string): string {
  const slug = createSlug(title);
  return `/projects/${projectId}/${slug}`;
}

/**
 * Extracts project ID from URL (handles both old and new formats)
 */
export function extractProjectIdFromUrl(pathname: string): string | null {
  // Match /projects/[id] or /projects/[id]/[slug]
  const match = pathname.match(/^\/projects\/(\d+)(?:\/.*)?$/);
  return match ? match[1] : null;
}

