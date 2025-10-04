// src/lib/github-api.ts
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Store securely in .env or env variable, not in source for production
export async function searchRepositories(
  query: string,
  filters: { languages?: string[]; hasGoodFirstIssues?: boolean } = {}
): Promise<any> {
  let q = query || '';
  if (filters.languages?.length) {
    q += ' ' + filters.languages.map(lang => `language:${lang}`).join(' ');
  }
  if (filters.hasGoodFirstIssues) {
    q += ' good-first-issues:>0';
  }
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=20`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('GitHub API request failed');
  return await response.json();
}

export function convertToRepository(repo: any, healthScore: number = 0): any {
  return {
    id: repo.id?.toString(),
    name: repo.name,
    description: repo.description,
    stars: repo.stargazers_count,
    healthScore,
    lastCommit: repo.updated_at,
    goodFirstIssues: repo.open_issues_count,
    ciStatus: 'passing',
    language: repo.language,
    license: repo.license?.spdx_id ?? '',
    contributors: repo.watchers_count ?? 0,
    topics: repo.topics ?? [],
    signals: [],
    trend: 'stable',
    healthBreakdown: {
      activity: 0,
      community: 0,
      documentation: 0,
      freshness: 0,
      compatibility: 0
    },
    avgIssueResponseTime: '',
    prMergeRate: 0,
    activeContributors: 0,
    contributorDiversity: 0,
    codeCoverage: 0,
    hasGoodDocs: false,
    hasWiki: false,
    hasWebsite: false,
  };
}

export async function fetchReadme(owner: string, repo: string): Promise<string> {
  const url = `https://api.github.com/repos/${owner}/${repo}/readme`;
  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3.raw' }
  });
  if (!response.ok) throw new Error('Failed to fetch README');
  return await response.text();
}

export type SearchFilters = {
  languages?: string[];
  hasGoodFirstIssues?: boolean;
};
