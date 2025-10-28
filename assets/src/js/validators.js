export function validateTitle(title) {
  if (!title || title.trim().length === 0) return "Title is required.";
  if (title.trim().length > 120) return "Title must be under 120 characters.";
  return null;
}
export function validateStatus(status) {
  const allowed = ["open", "in_progress", "closed"];
  if (!status) return "Status is required.";
  if (!allowed.includes(status))
    return "Status must be open, in_progress, or closed.";
  return null;
}
export function validateDescription(desc) {
  if (!desc) return null;
  if (desc.length > 2000) return "Description too long.";
  return null;
}
