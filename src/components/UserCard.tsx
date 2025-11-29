import React from 'react';
import { ExternalLink, Github } from 'lucide-react';
import type { GithubUser } from '../types';
import { motion } from 'framer-motion';

interface UserCardProps {
  user: GithubUser;
  index: number;
}

export const UserCard: React.FC<UserCardProps> = ({ user, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-card border border-border text-card-foreground rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group"
    >
      <div className="relative">
        <img
          src={user.avatar_url}
          alt={user.login}
          className="w-12 h-12 rounded-full border-2 border-border group-hover:border-primary transition-colors"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
          {user.login}
        </h3>
        <a
          href={user.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1 w-fit"
        >
          <Github size={12} />
          View Profile
        </a>
      </div>

      <a
        href={user.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-colors"
      >
        <ExternalLink size={16} />
      </a>
    </motion.div>
  );
};
