import axios from 'axios';
import type { GithubUser, RepoInfo } from '../types';

const BASE_URL = 'https://api.github.com';

export const getRepoInfo = async (owner: string, repo: string): Promise<RepoInfo> => {
  const response = await axios.get<RepoInfo>(`${BASE_URL}/repos/${owner}/${repo}`);
  return response.data;
};

export const getUserRepos = async (username: string, page: number = 1, perPage: number = 30): Promise<RepoInfo[]> => {
  const response = await axios.get<RepoInfo[]>(`${BASE_URL}/users/${username}/repos`, {
    params: {
      page,
      per_page: perPage,
      sort: 'updated',
      direction: 'desc'
    },
  });
  return response.data;
};

export const getStargazers = async (owner: string, repo: string, page: number = 1, perPage: number = 30): Promise<GithubUser[]> => {
  const response = await axios.get<GithubUser[]>(`${BASE_URL}/repos/${owner}/${repo}/stargazers`, {
    params: {
      page,
      per_page: perPage,
    },
  });
  return response.data;
};

export const getForks = async (owner: string, repo: string, page: number = 1, perPage: number = 30): Promise<GithubUser[]> => {
  const response = await axios.get<Array<{ owner: GithubUser }>>(`${BASE_URL}/repos/${owner}/${repo}/forks`, {
    params: {
      page,
      per_page: perPage,
    },
  });
  return response.data.map((fork) => fork.owner);
};

export const parseInput = (input: string): { type: 'repo'; owner: string; repo: string } | { type: 'user'; username: string } | null => {
  const cleanString = input.trim().replace(/\/$/, '');

  // Handle full URL
  try {
    const url = new URL(cleanString);
    if (url.hostname === 'github.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return { type: 'repo', owner: parts[0], repo: parts[1] };
      } else if (parts.length === 1) {
        return { type: 'user', username: parts[0] };
      }
    }
  } catch {
    // Not a URL
  }

  const parts = cleanString.split('/');
  if (parts.length === 2) {
    return { type: 'repo', owner: parts[0], repo: parts[1] };
  } else if (parts.length === 1) {
    return { type: 'user', username: parts[0] };
  }

  return null;
};
