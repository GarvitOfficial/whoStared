export interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name?: string | null;
  bio?: string | null;
  location?: string | null;
  twitter_username?: string | null;
  followers: number;
  following: number;
  public_repos: number;
}

export interface RepoInfo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  language: string | null;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}
