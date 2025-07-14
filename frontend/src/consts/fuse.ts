export const DEFAULT_FUSE_CONFIG = {
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'username', weight: 0.3 },
    { name: 'notes', weight: 0.2 },
  ],
  threshold: 0.4,
  includeScore: false,
  ignoreLocation: true,
  shouldSort: true,
}
