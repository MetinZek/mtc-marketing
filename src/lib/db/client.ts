import "server-only";

import postgres from "postgres";

/**
 * Server-only Postgres client (Supabase in production). DATABASE_URL is
 * a secret, read only here — it never reaches client bundles because
 * this module is `server-only` and the variable has no NEXT_PUBLIC_
 * prefix.
 *
 * Use Supabase's *transaction pooler* URL (port 6543) on Vercel:
 * serverless instances open and drop connections constantly, which the
 * pooler absorbs. The pooler doesn't support prepared statements, hence
 * `prepare: false`.
 *
 * Pipelining is off (`max_pipeline: 0`): Supabase's transaction pooler
 * (Supavisor) drops replies when a second query is sent on a connection
 * before the first has answered — postgres.js's default — and the
 * waiting query then hangs forever (it hung the admin dashboard for
 * minutes). One query in flight per connection is 100% reliable there;
 * concurrency comes from `max` connections instead.
 *
 * Always go through `dbRead` / `dbWrite`, never a bare query: they add a
 * deadline (and one retry for reads) as a safety net, so any connection
 * that stops answering fails in seconds instead of hanging the page.
 */

export type Sql = postgres.Sql;

/** A healthy CMS query takes ~50–300ms (a cold connection ~1s). */
const READ_TIMEOUT_MS = 5_000;
/** Writes run a whole transaction (lock, read, upsert). */
const WRITE_TIMEOUT_MS = 10_000;

const cache = globalThis as unknown as { __mtcSql?: Sql };

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function sslFor(url: string): "require" | false | undefined {
  if (/[?&]sslmode=/.test(url)) return undefined; // the URL decides
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  })();
  return host === "localhost" || host === "127.0.0.1" ? false : "require";
}

function getSql(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("[db] DATABASE_URL is not set.");
  // `max_pipeline` is a real postgres.js option (see its src/index.js)
  // that its type definitions omit.
  const options: postgres.Options<Record<string, never>> & { max_pipeline: number } = {
    prepare: false,
    max_pipeline: 0,
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: sslFor(url),
    onnotice: () => {},
  };
  // Reused across requests in one instance (and across dev HMR reloads).
  cache.__mtcSql ??= postgres(url, options);
  return cache.__mtcSql;
}

/** Drops a client whose connection may be wedged; the next call to
 * getSql() starts a fresh pool. In-flight queries on it are rejected. */
function discard(sql: Sql): void {
  if (cache.__mtcSql === sql) cache.__mtcSql = undefined;
  sql.end({ timeout: 0 }).catch(() => {});
}

export class DbTimeoutError extends Error {
  constructor(ms: number) {
    super(`[db] No response from the database within ${ms / 1000}s.`);
    this.name = "DbTimeoutError";
  }
}

/** Errors a fresh connection can fix: our own deadline, or a query that
 * was rejected because a concurrent timeout discarded its client. */
function isConnectionFailure(error: unknown): boolean {
  if (error instanceof DbTimeoutError) return true;
  const code = (error as { code?: unknown } | null)?.code;
  return (
    code === "CONNECTION_ENDED" ||
    code === "CONNECTION_DESTROYED" ||
    code === "CONNECTION_CLOSED" ||
    code === "CONNECT_TIMEOUT"
  );
}

async function withDeadline<T>(run: (sql: Sql) => Promise<T>, ms: number): Promise<T> {
  const sql = getSql();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new DbTimeoutError(ms)), ms);
  });
  try {
    return await Promise.race([run(sql), deadline]);
  } catch (error) {
    if (error instanceof DbTimeoutError) discard(sql);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Runs read-only queries with a deadline. A read that hits a dead
 * connection is retried once on a fresh pool — safe because it has no
 * side effects — so a lost reply costs seconds, not a failed page.
 */
export async function dbRead<T>(run: (sql: Sql) => Promise<T>): Promise<T> {
  try {
    return await withDeadline(run, READ_TIMEOUT_MS);
  } catch (error) {
    if (!isConnectionFailure(error)) throw error;
    return withDeadline(run, READ_TIMEOUT_MS);
  }
}

/**
 * Runs a write with a deadline and fails fast instead of hanging. Never
 * retried automatically: some writes aren't idempotent (e.g. "move up").
 * An unfinished transaction is rolled back when its connection drops;
 * only if the lost reply was the COMMIT's did the write land — either
 * way the admin sees an error and can reload to check before retrying.
 */
export function dbWrite<T>(run: (sql: Sql) => Promise<T>): Promise<T> {
  return withDeadline(run, WRITE_TIMEOUT_MS);
}

/**
 * `dbWrite` inside a transaction. Not `sql.begin`: postgres.js only
 * reserves the connection for `begin` from inside its pipelining check,
 * which never runs with `max_pipeline: 0`, and then refuses the BEGIN
 * (UNSAFE_TRANSACTION). A reserved connection keeps every statement of
 * the transaction on one connection explicitly.
 */
export function dbTransaction<T>(run: (tx: Sql) => Promise<T>): Promise<T> {
  return dbWrite(async (sql) => {
    const tx = await sql.reserve();
    try {
      await tx`begin`;
      const result = await run(tx);
      await tx`commit`;
      return result;
    } catch (error) {
      await tx`rollback`.catch(() => {});
      throw error;
    } finally {
      tx.release();
    }
  });
}
