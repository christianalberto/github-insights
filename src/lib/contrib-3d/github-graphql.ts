import * as type from './type';

const GITHUB_GRAPHQL_API =
  process.env.GITHUB_ENDPOINT || 'https://api.github.com/graphql';
const maxReposOneQuery = 100;

export type CommitContributionsByRepository = Array<{
  contributions: {
    totalCount: number;
  };
  repository: {
    primaryLanguage: {
      name: string;
      color: string | null;
    } | null;
  };
}>;

export type ContributionCalendar = {
  isHalloween: boolean;
  totalContributions: number;
  weeks: Array<{
    contributionDays: Array<{
      contributionCount: number;
      contributionLevel: type.ContributionLevel;
      date: string;
    }>;
  }>;
};

export type Repositories = {
  edges: Array<{
    cursor: string;
  }>;
  nodes: Array<{
    forkCount: number;
    stargazerCount: number;
  }>;
};

export type ResponseType = {
  data?: {
    user: {
      contributionsCollection: {
        commitContributionsByRepository: CommitContributionsByRepository;
        contributionCalendar: ContributionCalendar;
        totalCommitContributions: number;
        totalIssueContributions: number;
        totalPullRequestContributions: number;
        totalPullRequestReviewContributions: number;
        totalRepositoryContributions: number;
      };
      repositories: Repositories;
    } | null;
  };
  errors?: Array<{
    message: string;
  }>;
};

export type ResponseNextType = {
  data?: {
    user: {
      repositories: Repositories;
    } | null;
  };
  errors?: Array<{
    message: string;
  }>;
};

async function postGraphQL<T>(
  token: string,
  query: string,
  variables: Record<string, string>
): Promise<T> {
  const response = await fetch(GITHUB_GRAPHQL_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = (await response.json().catch(() => null)) as T & {
    message?: string;
    errors?: Array<{ message: string }>;
  };

  if (!response.ok) {
    const detail =
      payload?.message ||
      payload?.errors?.[0]?.message ||
      `${response.status} ${response.statusText}`;
    throw new Error(`GitHub API error: ${detail}`);
  }

  return payload as T;
}

export const fetchFirst = async (
  token: string,
  userName: string,
  year: number | null = null
): Promise<ResponseType> => {
  const yearArgs = year
    ? `(from:"${year}-01-01T00:00:00.000Z", to:"${year}-12-31T23:59:59.000Z")`
    : '';

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection${yearArgs} {
          contributionCalendar {
            isHalloween
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                contributionLevel
                date
              }
            }
          }
          commitContributionsByRepository(maxRepositories: ${maxReposOneQuery}) {
            repository {
              primaryLanguage {
                name
                color
              }
            }
            contributions {
              totalCount
            }
          }
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          totalRepositoryContributions
        }
        repositories(first: ${maxReposOneQuery}, ownerAffiliations: OWNER) {
          edges {
            cursor
          }
          nodes {
            forkCount
            stargazerCount
          }
        }
      }
    }
  `.replace(/\s+/g, ' ');

  return postGraphQL<ResponseType>(token, query, { login: userName });
};

export const fetchNext = async (
  token: string,
  userName: string,
  cursor: string
): Promise<ResponseNextType> => {
  const query = `
    query($login: String!, $cursor: String!) {
      user(login: $login) {
        repositories(after: $cursor, first: ${maxReposOneQuery}, ownerAffiliations: OWNER) {
          edges {
            cursor
          }
          nodes {
            forkCount
            stargazerCount
          }
        }
      }
    }
  `.replace(/\s+/g, ' ');

  return postGraphQL<ResponseNextType>(token, query, {
    login: userName,
    cursor,
  });
};

export const fetchData = async (
  token: string,
  userName: string,
  maxRepos: number,
  year: number | null = null
): Promise<ResponseType> => {
  const res1 = await fetchFirst(token, userName, year);
  const result = res1.data;

  if (
    result?.user &&
    result.user.repositories.nodes.length === maxReposOneQuery
  ) {
    const repos1 = result.user.repositories;
    let cursor = repos1.edges[repos1.edges.length - 1].cursor;
    while (repos1.nodes.length < maxRepos) {
      const res2 = await fetchNext(token, userName, cursor);
      if (res2.data?.user) {
        const repos2 = res2.data.user.repositories;
        repos1.nodes.push(...repos2.nodes);
        if (repos2.nodes.length !== maxReposOneQuery) {
          break;
        }
        cursor = repos2.edges[repos2.edges.length - 1].cursor;
      } else {
        break;
      }
    }
  }

  return res1;
};
