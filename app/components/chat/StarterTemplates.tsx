import React from 'react';
import type { Template } from '~/types/template';
import { STARTER_TEMPLATES } from '~/utils/constants';

interface FrameworkLinkProps {
  template: Template;
}

const FrameworkLink: React.FC<FrameworkLinkProps> = ({ template }) => (
  <a
    href={`/git?url=https://github.com/${template.githubRepo}.git`}
    data-state="closed"
    data-discover="true"
    title={template.label}
    style={{ textDecoration: 'none' }}
  >
    <div
      className={`cx-template-icon inline-block ${template.icon} w-7 h-7`}
    />
  </a>
);

const StarterTemplates: React.FC = () => {
  return (
    <div
      className="flex flex-col items-center gap-4 pb-8"
      style={{ animation: '0.4s ease-out 0.45s both cx-fade-up' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-px flex-1 w-12"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.08))' }}
        />
        <span
          className="text-[11px] font-medium tracking-[0.06em] uppercase"
          style={{ color: '#334155' }}
        >
          or start with a template
        </span>
        <div
          className="h-px flex-1 w-12"
          style={{ background: 'linear-gradient(to left, transparent, rgba(255, 255, 255, 0.08))' }}
        />
      </div>
      <div className="flex justify-center">
        <div className="flex flex-wrap justify-center items-center gap-5 max-w-xs">
          {STARTER_TEMPLATES.map((template) => (
            <FrameworkLink key={template.name} template={template} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StarterTemplates;
