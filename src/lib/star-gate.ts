/**
 * Requires the looked-up GitHub user to have starred this project's repo
 * before insight / contrib-3d APIs will generate cards.
 */

export const STAR_REPO_OWNER =
  process.env.STAR_REPO_OWNER?.trim() || 'christianalberto';
export const STAR_REPO_NAME =
  process.env.STAR_REPO_NAME?.trim() || 'github-insights';

export const STAR_REPO_FULL_NAME = `${STAR_REPO_OWNER}/${STAR_REPO_NAME}`;
export const STAR_REPO_URL = `https://github.com/${STAR_REPO_FULL_NAME}`;

/** Demo / popular profiles allowed without starring the repo. */
export const STAR_GATE_ALLOWLIST = [
  'hzoo',
  'torvalds',
  'ljharb',
  'timrogers',
  'driesvints',
  'christianalberto',
] as const;

const ALLOWLIST_SET = new Set(
  STAR_GATE_ALLOWLIST.map((login) => login.toLowerCase())
);

const CACHE_TTL_MS = 60_000;
const MAX_STARGAZER_PAGES = 50; // up to 5,000 stargazers via REST
const MAX_USER_STARRED_PAGES = 3; // recent-star fast path (300 repos)

type StargazerCache = {
  logins: Set<string>;
  expiresAt: number;
};

let stargazerCache: StargazerCache | null = null;
let refreshPromise: Promise<Set<string>> | null = null;

export class StarRequiredError extends Error {
  readonly code = 'STAR_REQUIRED' as const;

  constructor(username: string) {
    super(
      `Please star ${STAR_REPO_FULL_NAME} to unlock cards for @${username}`
    );
    this.name = 'StarRequiredError';
  }
}

export function isStarGateEnabled(): boolean {
  const raw = process.env.REQUIRE_REPO_STAR;
  if (raw === undefined || raw === '') return true;
  return !['0', 'false', 'no', 'off'].includes(raw.trim().toLowerCase());
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'github-insights-star-gate',
  };
}

async function fetchStargazerLogins(token: string): Promise<Set<string>> {
  const logins = new Set<string>();
  const owner = encodeURIComponent(STAR_REPO_OWNER);
  const repo = encodeURIComponent(STAR_REPO_NAME);

  for (let page = 1; page <= MAX_STARGAZER_PAGES; page++) {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/stargazers?per_page=100&page=${page}`,
      { headers: authHeaders(token), cache: 'no-store' }
    );

    if (response.status === 404) {
      throw new Error(`Star gate repo not found: ${STAR_REPO_FULL_NAME}`);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(
        `Failed to list stargazers (${response.status})${body ? `: ${body.slice(0, 180)}` : ''}`
      );
    }

    const users = (await response.json()) as Array<{ login?: string }>;
    if (!Array.isArray(users) || users.length === 0) break;

    for (const user of users) {
      if (user.login) logins.add(user.login.toLowerCase());
    }

    if (users.length < 100) break;
  }

  // Repo owner can always generate for their own username
  logins.add(STAR_REPO_OWNER.toLowerCase());
  return logins;
}

async function getStargazerLogins(token: string, forceRefresh = false): Promise<Set<string>> {
  const now = Date.now();
  if (
    !forceRefresh &&
    stargazerCache &&
    stargazerCache.expiresAt > now
  ) {
    return stargazerCache.logins;
  }

  if (!forceRefresh && refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = fetchStargazerLogins(token)
    .then((logins) => {
      stargazerCache = { logins, expiresAt: Date.now() + CACHE_TTL_MS };
      return logins;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/** Fast path: user just starred us — appears near the top of their starred list. */
async function userStarredRepoRecently(
  username: string,
  token: string
): Promise<boolean> {
  const target = STAR_REPO_FULL_NAME.toLowerCase();
  const user = encodeURIComponent(username);

  for (let page = 1; page <= MAX_USER_STARRED_PAGES; page++) {
    const response = await fetch(
      `https://api.github.com/users/${user}/starred?per_page=100&page=${page}&sort=created`,
      { headers: authHeaders(token), cache: 'no-store' }
    );

    if (response.status === 404) return false;
    if (!response.ok) return false;

    const repos = (await response.json()) as Array<{ full_name?: string }>;
    if (!Array.isArray(repos) || repos.length === 0) break;

    if (repos.some((r) => r.full_name?.toLowerCase() === target)) {
      return true;
    }

    if (repos.length < 100) break;
  }

  return false;
}

export function isStarGateAllowlisted(username: string): boolean {
  return ALLOWLIST_SET.has(username.trim().toLowerCase());
}

export async function hasUserStarredRepo(username: string): Promise<boolean> {
  const normalized = username.trim().toLowerCase();
  if (!normalized) return false;

  if (isStarGateAllowlisted(normalized)) return true;

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is not configured');
  }

  const cached = await getStargazerLogins(token, false);
  if (cached.has(normalized)) return true;

  // User may have starred after the last cache fill
  if (await userStarredRepoRecently(username.trim(), token)) {
    cached.add(normalized);
    stargazerCache = {
      logins: cached,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
    return true;
  }

  const fresh = await getStargazerLogins(token, true);
  return fresh.has(normalized);
}

export async function assertUserStarredRepo(username: string): Promise<void> {
  if (!isStarGateEnabled()) return;

  const starred = await hasUserStarredRepo(username);
  if (!starred) {
    throw new StarRequiredError(username.trim());
  }
}

export function isStarRequiredError(error: unknown): error is StarRequiredError {
  return (
    error instanceof StarRequiredError ||
    (typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: unknown }).code === 'STAR_REQUIRED')
  );
}
