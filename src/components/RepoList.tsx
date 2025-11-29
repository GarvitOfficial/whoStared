import React from 'react';
import { Star, GitFork, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import type { RepoInfo } from '../types';

interface RepoListProps {
  repos: RepoInfo[];
  onSelectRepo: (repo: RepoInfo) => void;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const RepoList: React.FC<RepoListProps> = ({ 
  repos, 
  onSelectRepo, 
  loadingMore, 
  hasMore, 
  onLoadMore 
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Repositories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repos.map((repo, index) => (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onSelectRepo(repo)}
            className="bg-card border border-border p-5 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                {repo.name}
              </h3>
              <div className="flex items-center gap-1 text-muted-foreground text-xs bg-muted px-2 py-1 rounded-md">
                <Calendar size={12} />
                {format(new Date(repo.updated_at), 'MMM d, yyyy')}
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2 h-10">
              {repo.description || 'No description available'}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500" />
                <span>{repo.stargazers_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork size={14} className="text-blue-500" />
                <span>{repo.forks_count}</span>
              </div>
              {repo.language && (
                <div className="flex items-center gap-1 ml-auto">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>{repo.language}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
          >
            {loadingMore ? 'Loading...' : 'Load More Repositories'}
          </button>
        </div>
      )}
    </div>
  );
};
