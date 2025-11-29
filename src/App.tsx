import React, { useState } from 'react';
import { Search, Star, GitFork, Github, AlertCircle, ChevronLeft } from 'lucide-react';
import { getRepoInfo, getStargazers, getForks, getUserRepos, parseInput } from './lib/github';
import type { GithubUser, RepoInfo } from './types';
import { UserCard } from './components/UserCard';
import { RepoList } from './components/RepoList';
import { Spinner } from './components/Spinner';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // View State
  const [view, setView] = useState<'search' | 'user-repos' | 'repo-details'>('search');
  
  // Data State
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [userRepos, setUserRepos] = useState<RepoInfo[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  // Repo Details State
  const [activeTab, setActiveTab] = useState<'stars' | 'forks'>('stars');
  const [stargazers, setStargazers] = useState<GithubUser[]>([]);
  const [forks, setForks] = useState<GithubUser[]>([]);
  const [starsPage, setStarsPage] = useState(1);
  const [forksPage, setForksPage] = useState(1);
  const [hasMoreStars, setHasMoreStars] = useState(true);
  const [hasMoreForks, setHasMoreForks] = useState(true);
  
  // Pagination State
  const [loadingMore, setLoadingMore] = useState(false);
  const [reposPage, setReposPage] = useState(1);
  const [hasMoreRepos, setHasMoreRepos] = useState(true);

  const resetState = () => {
    setRepoInfo(null);
    setStargazers([]);
    setForks([]);
    setUserRepos([]);
    setStarsPage(1);
    setForksPage(1);
    setReposPage(1);
    setHasMoreStars(true);
    setHasMoreForks(true);
    setHasMoreRepos(true);
    setError(null);
  };

  const fetchRepoDetails = async (owner: string, repo: string) => {
    setLoading(true);
    resetState();
    
    try {
      const info = await getRepoInfo(owner, repo);
      setRepoInfo(info);
      
      const [stars, forksData] = await Promise.all([
        getStargazers(owner, repo, 1),
        getForks(owner, repo, 1)
      ]);

      setStargazers(stars);
      setForks(forksData);
      
      if (stars.length < 30) setHasMoreStars(false);
      if (forksData.length < 30) setHasMoreForks(false);
      
      setView('repo-details');
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRepos = async (username: string) => {
    setLoading(true);
    resetState();
    setCurrentUser(username);

    try {
      const repos = await getUserRepos(username, 1);
      setUserRepos(repos);
      if (repos.length < 30) setHasMoreRepos(false);
      setView('user-repos');
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    if (err.response?.status === 404) {
      setError('User or repository not found.');
    } else if (err.response?.status === 403) {
      setError('API rate limit exceeded. Please try again later.');
    } else {
      setError('An error occurred while fetching data.');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const parsed = parseInput(input);
    if (!parsed) {
      setError('Invalid input. Use "username", "username/repo", or a full URL.');
      return;
    }

    if (parsed.type === 'repo') {
      await fetchRepoDetails(parsed.owner, parsed.repo);
    } else {
      await fetchUserRepos(parsed.username);
    }
  };

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);

    try {
      if (view === 'repo-details' && repoInfo) {
        const parsed = parseInput(repoInfo.html_url);
        if (parsed?.type !== 'repo') return;

        if (activeTab === 'stars') {
          const nextPage = starsPage + 1;
          const newStars = await getStargazers(parsed.owner, parsed.repo, nextPage);
          setStargazers(prev => [...prev, ...newStars]);
          setStarsPage(nextPage);
          if (newStars.length < 30) setHasMoreStars(false);
        } else {
          const nextPage = forksPage + 1;
          const newForks = await getForks(parsed.owner, parsed.repo, nextPage);
          setForks(prev => [...prev, ...newForks]);
          setForksPage(nextPage);
          if (newForks.length < 30) setHasMoreForks(false);
        }
      } else if (view === 'user-repos' && currentUser) {
        const nextPage = reposPage + 1;
        const newRepos = await getUserRepos(currentUser, nextPage);
        setUserRepos(prev => [...prev, ...newRepos]);
        setReposPage(nextPage);
        if (newRepos.length < 30) setHasMoreRepos(false);
      }
    } catch (err) {
      console.error("Failed to load more", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
            setView('search');
            setInput('');
            resetState();
          }}>
            <div className="p-2 bg-primary text-primary-foreground rounded-lg">
              <Search size={20} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight">whoStared</span>
          </div>
          <a
            href="https://github.com/GarvitOfficial/whoAppreciated"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <Github size={16} />
            <span>GitHub</span>
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero / Search */}
        {view === 'search' && (
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Discover who <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">appreciates</span> your code.
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Enter a GitHub username or repository to start analyzing.
            </p>

            <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-card rounded-xl p-2 shadow-xl ring-1 ring-white/10">
                  <Search className="ml-3 text-muted-foreground" size={20} />
                  <input
                    type="text"
                    placeholder="username or username/repo"
                    className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 text-base placeholder:text-muted-foreground/50"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <Spinner className="w-4 h-4" /> : 'Analyze'}
                  </button>
                </div>
              </div>
            </form>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center justify-center gap-2 text-sm"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </div>
        )}

        {/* Back Button for non-search views */}
        {view !== 'search' && (
          <button
            onClick={() => {
              if (view === 'repo-details' && currentUser) {
                setView('user-repos');
              } else {
                setView('search');
                setInput('');
                resetState();
              }
            }}
            className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={16} />
            Back to {view === 'repo-details' && currentUser ? 'Repositories' : 'Search'}
          </button>
        )}

        <AnimatePresence mode="wait">
          {/* User Repos List View */}
          {view === 'user-repos' && (
            <motion.div
              key="user-repos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center gap-4 mb-8">
                {userRepos.length > 0 && (
                  <img 
                    src={userRepos[0].owner.avatar_url} 
                    alt={userRepos[0].owner.login}
                    className="w-16 h-16 rounded-full border-2 border-border"
                  />
                )}
                <div>
                  <h2 className="text-3xl font-bold">{currentUser}</h2>
                  <p className="text-muted-foreground">Select a repository to analyze</p>
                </div>
              </div>
              
              <RepoList 
                repos={userRepos}
                onSelectRepo={(repo) => fetchRepoDetails(repo.owner.login, repo.name)}
                loadingMore={loadingMore}
                hasMore={hasMoreRepos}
                onLoadMore={loadMore}
              />
            </motion.div>
          )}

          {/* Repo Details View */}
          {view === 'repo-details' && repoInfo && (
            <motion.div
              key="repo-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-8"
            >
              {/* Repo Card */}
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <img
                    src={repoInfo.owner.avatar_url}
                    alt={repoInfo.owner.login}
                    className="w-16 h-16 rounded-xl border border-border"
                  />
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{repoInfo.full_name}</h2>
                    <p className="text-muted-foreground max-w-xl line-clamp-2">
                      {repoInfo.description || 'No description available.'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="px-4 py-2 bg-muted/50 rounded-lg flex items-center gap-2 border border-border/50">
                    <Star className="text-yellow-500 fill-yellow-500" size={18} />
                    <span className="font-bold">{repoInfo.stargazers_count.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm">Stars</span>
                  </div>
                  <div className="px-4 py-2 bg-muted/50 rounded-lg flex items-center gap-2 border border-border/50">
                    <GitFork className="text-blue-500" size={18} />
                    <span className="font-bold">{repoInfo.forks_count.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm">Forks</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-6 border-b border-border">
                <button
                  onClick={() => setActiveTab('stars')}
                  className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                    activeTab === 'stars'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Stargazers
                  {activeTab === 'stars' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('forks')}
                  className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                    activeTab === 'forks'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Forks
                  {activeTab === 'forks' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </button>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTab === 'stars' ? (
                  stargazers.map((user, i) => (
                    <UserCard key={`${user.id}-${i}`} user={user} index={i} />
                  ))
                ) : (
                  forks.map((user, i) => (
                    <UserCard key={`${user.id}-${i}`} user={user} index={i} />
                  ))
                )}
              </div>

              {/* Empty States */}
              {activeTab === 'stars' && stargazers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No stargazers yet. Be the first!
                </div>
              )}
              {activeTab === 'forks' && forks.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No forks yet.
                </div>
              )}

              {/* Load More */}
              {((activeTab === 'stars' && hasMoreStars) || (activeTab === 'forks' && hasMoreForks)) && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-6 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    {loadingMore && <Spinner className="w-4 h-4" />}
                    Load More
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
