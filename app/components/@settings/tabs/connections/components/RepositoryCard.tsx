import React from 'react';
import { motion } from 'framer-motion';
import type { GitHubRepoInfo } from '~/types/GitHub';
import { Icon } from '~/components/ui/Icon';

interface RepositoryCardProps {
  repo: GitHubRepoInfo;
  onSelect: () => void;
}

import { useMemo } from 'react';

export function RepositoryCard({ repo, onSelect }: RepositoryCardProps) {
  // Use a consistent styling for all repository cards
  const getCardStyle = () => {
    return 'from-bolt-elements-background-depth-1 to-bolt-elements-background-depth-2';
  };

  // Format the date in a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return 'Today';
    }

    if (diffDays <= 2) {
      return 'Yesterday';
    }

    if (diffDays <= 7) {
      return `${diffDays} days ago`;
    }

    if (diffDays <= 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    }

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const cardStyle = useMemo(() => getCardStyle(), []);

  // const formattedDate = useMemo(() => formatDate(repo.updated_at), [repo.updated_at]);

  return (
    <motion.div
      className={`p-5 rounded-xl bg-gradient-to-br ${cardStyle} border border-bolt-elements-borderColor hover:border-bolt-elements-borderColorActive transition-all duration-300 shadow-sm hover:shadow-md`}
      whileHover={{
        scale: 1.02,
        y: -2,
        transition: { type: 'spring', stiffness: 400, damping: 17 },
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-bolt-elements-background-depth-3 flex items-center justify-center text-bolt-elements-textSecondary shadow-sm">
            <Icon name="git-branch" size={20} />
          </div>
          <div>
            <h3 className="font-medium text-bolt-elements-textPrimary text-base">
              {repo.name}
            </h3>
            <p className="text-xs text-bolt-elements-textTertiary flex items-center gap-1">
              <Icon name="user" size={12} />
              {repo.full_name.split('/')[0]}
            </p>
          </div>
        </div>
        <motion.button
          onClick={onSelect}
          className="px-4 py-2 h-9 rounded-lg bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent hover:bg-bolt-elements-item-backgroundAccentHover transition-all duration-200 flex items-center gap-2 min-w-[100px] justify-center text-sm shadow-sm hover:shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon name="git-pull-request" size={12} />
          Import
        </motion.button>
      </div>

      {repo.description && (
        <div className="mb-4 bg-bolt-elements-background-depth-3 p-3 rounded-lg border border-bolt-elements-borderColor">
          <p className="text-sm text-bolt-elements-textSecondary line-clamp-2">
            {repo.description}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {repo.private && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent text-xs">
            <Icon name="lock" size={12} />
            Private
          </span>
        )}
        {repo.language && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-bolt-elements-background-depth-3 text-bolt-elements-textSecondary text-xs border border-bolt-elements-borderColor">
            <Icon name="code" size={12} />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-bolt-elements-background-depth-3 text-bolt-elements-textSecondary text-xs border border-bolt-elements-borderColor">
          <Icon name="star" size={12} />
          {repo.stargazers_count.toLocaleString()}
        </span>
        {repo.forks_count > 0 && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-bolt-elements-background-depth-3 text-bolt-elements-textSecondary text-xs border border-bolt-elements-borderColor">
            <Icon name="git-fork" size={12} />
            {repo.forks_count.toLocaleString()}
          </span>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-bolt-elements-borderColor flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-bolt-elements-textTertiary">
          <Icon name="clock" size={12} />
          Updated {formatDate(repo.updated_at)}
        </span>

        {repo.topics && repo.topics.length > 0 && (
          <span className="text-xs text-bolt-elements-textTertiary dark:text-bolt-elements-textTertiary-dark">
            {repo.topics.slice(0, 1).map((topic) => (
              <span
                key={topic}
                className="px-1.5 py-0.5 rounded-full bg-bolt-elements-background-depth-1/50 dark:bg-bolt-elements-background-depth-4/50 text-xs"
              >
                {topic}
              </span>
            ))}
            {repo.topics.length > 1 && <span className="ml-1">+{repo.topics.length - 1}</span>}
          </span>
        )}
      </div>
    </motion.div>
  );
}
