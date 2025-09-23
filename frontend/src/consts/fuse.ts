export const DEFAULT_FUSE_CONFIG = {
  keys: [
    { name: 'title', weight: 0.7 },
    { name: 'notes', weight: 0.3 },
  ],
  threshold: 0.4,
  includeScore: false,
  ignoreLocation: true,
  shouldSort: true,
}
