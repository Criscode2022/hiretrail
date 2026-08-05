/** Postgres (Neon) vs SQL.js compatible date column type. */
export const DATE_COLUMN =
  process.env.DATABASE_URL?.trim() ? 'timestamptz' : 'datetime';
