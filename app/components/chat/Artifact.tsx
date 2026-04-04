import { useNanoStore } from '~/lib/hooks/useNanoStore';
import { Icon } from '~/components/ui/Icon';
import { AnimatePresence, motion } from 'framer-motion';
import { computed, map } from 'nanostores';
import { memo, useEffect, useRef, useState, useMemo } from 'react';
import { createHighlighter, type BundledLanguage, type BundledTheme, type HighlighterGeneric } from 'shiki';
import type { ActionState } from '~/lib/runtime/action-runner';
import { workbenchStore } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { cubicEasingFn } from '~/utils/easings';
import { WORK_DIR } from '~/utils/constants';

const highlighterOptions = {
  langs: ['shell'],
  themes: ['light-plus', 'dark-plus'],
};

const shellHighlighter: HighlighterGeneric<BundledLanguage, BundledTheme> =
  import.meta.hot?.data.shellHighlighter ?? (await createHighlighter(highlighterOptions));

if (import.meta.hot) {
  import.meta.hot.data.shellHighlighter = shellHighlighter;
}

interface ArtifactProps {
  messageId: string;
  artifactId: string;
}

export const Artifact = memo(({ messageId }: ArtifactProps) => {
  const userToggledActions = useRef(false);
  const [showActions, setShowActions] = useState(false);
  const [allActionFinished, setAllActionFinished] = useState(false);

  const artifacts = useNanoStore(workbenchStore.artifacts);
  const artifact = artifacts[messageId];

  const actionsStore = useMemo(() => {
    return computed(artifact?.runner?.actions ?? map({}), (actions) => {
      return Object.values(actions).filter((action) => {
        return !(action.type === 'shell' && action.content?.includes('supabase'));
      });
    });
  }, [artifact?.runner?.actions]);

  const actions = useNanoStore(actionsStore);

  const toggleActions = (e: React.MouseEvent) => {
    e.stopPropagation();
    userToggledActions.current = true;
    setShowActions(!showActions);
  };

  useEffect(() => {
    if (actions.length && !userToggledActions.current) {
      setShowActions(false);
    }

    if (actions.length !== 0 && artifact.type === 'bundled') {
      const finished = !actions.find(
        (action) => action.status !== 'complete' && !(action.type === 'start' && action.status === 'running'),
      );

      if (allActionFinished !== finished) {
        setAllActionFinished(finished);
      }
    }
  }, [actions, artifact.type, allActionFinished]);

  const dynamicTitle =
    artifact?.type === 'bundled'
      ? allActionFinished
        ? artifact?.id === 'restored-project-setup'
          ? 'Project Restored'
          : 'Project Created'
        : artifact?.id === 'restored-project-setup'
          ? 'Restoring Project...'
          : 'Creating Project...'
      : artifact?.title;

  const isLoading = artifact?.type === 'bundled' && !allActionFinished;

  return (
    <div
      style={{
        background: 'var(--cx-surface)',
        border: '1px solid var(--cx-border)',
        borderRadius: '14px',
        overflow: 'hidden',
        width: '100%',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
      }}
      className="artifact-card"
    >
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: '14px 16px',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        onClick={() => {
          const showWorkbench = workbenchStore.showWorkbench.get();
          workbenchStore.showWorkbench.set(!showWorkbench);
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: isLoading
              ? 'linear-gradient(135deg, var(--cx-accent-glow), var(--cx-bg))'
              : 'color-mix(in srgb, var(--cx-accent-vivid), transparent 88%)',
            border: '1px solid color-mix(in srgb, var(--cx-accent-vivid), transparent 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.3s ease',
          }}
        >
          {isLoading ? (
            <div
              className="i-svg-spinners:90-ring-with-bg"
              style={{ color: 'var(--cx-accent-vivid)', fontSize: '14px' }}
            />
          ) : (
            <div
              className="i-ph:folder-open-duotone"
              style={{ color: 'var(--cx-accent-vivid)', fontSize: '14px' }}
            />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: 'var(--cx-text-primary)',
              fontSize: '13px',
              fontWeight: 500,
              lineHeight: '18px',
              letterSpacing: '-0.01em',
            }}
          >
            {dynamicTitle}
          </div>
          <div
            style={{
              color: 'var(--cx-text-muted)',
              fontSize: '11px',
              marginTop: '2px',
              letterSpacing: '0.01em',
            }}
          >
            Click to open Workbench
          </div>
        </div>

        {artifact?.type !== 'bundled' && actions.length > 0 && (
          <button
            onClick={toggleActions}
            style={{
              background: 'color-mix(in srgb, var(--cx-text-primary), transparent 90%)',
              border: 'none',
              borderRadius: '6px',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.15s ease',
              color: 'var(--cx-text-secondary)',
              fontSize: '11px',
            }}
          >
            <Icon name={showActions ? 'chevron-up' : 'chevron-down'} />
          </button>
        )}
      </button>

      {artifact?.type === 'bundled' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            borderTop: '1px solid var(--cx-border)',
            background: 'color-mix(in srgb, var(--cx-bg), transparent 40%)',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              color: allActionFinished ? 'var(--cx-icon-success, #34d399)' : 'var(--cx-accent-vivid)',
            }}
          >
            {allActionFinished ? (
              <Icon name="check" />
            ) : (
              <div className="i-svg-spinners:90-ring-with-bg" />
            )}
          </div>
          <span
            style={{
              color: 'var(--cx-text-secondary)',
              fontSize: '12px',
              fontWeight: 400,
            }}
          >
            {allActionFinished
              ? artifact?.id === 'restored-project-setup'
                ? 'Restore files from snapshot'
                : 'Initial files created'
              : 'Creating initial files'}
          </span>
        </div>
      )}

      <AnimatePresence>
        {artifact?.type !== 'bundled' && showActions && actions.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                borderTop: '1px solid var(--cx-border)',
                padding: '14px 16px',
                background: 'color-mix(in srgb, var(--cx-bg), transparent 30%)',
              }}
            >
              <ActionList actions={actions} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

interface ShellCodeBlockProps {
  classsName?: string;
  code: string;
}

function ShellCodeBlock({ classsName, code }: ShellCodeBlockProps) {
  return (
    <div
      className={classNames('text-xs', classsName)}
      style={{
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid var(--cx-border)',
        marginTop: '6px',
      }}
      dangerouslySetInnerHTML={{
        __html: shellHighlighter.codeToHtml(code, {
          lang: 'shell',
          theme: 'dark-plus',
        }),
      }}
    />
  );
}

interface ActionListProps {
  actions: readonly ActionState[];
}

const actionVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export function openArtifactInWorkbench(filePath: any) {
  if (workbenchStore.currentView.get() !== 'code') {
    workbenchStore.currentView.set('code');
  }

  workbenchStore.setSelectedFile(`${WORK_DIR}/${filePath}`);
}

const ActionList = memo(({ actions }: ActionListProps) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {actions.map((action, index) => {
          const { status, type, content } = action;
          const isLast = index === actions.length - 1;

          return (
            <motion.li
              key={index}
              variants={actionVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.18, ease: cubicEasingFn, delay: index * 0.04 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <div
                  style={{
                    fontSize: '14px',
                    width: '18px',
                    flexShrink: 0,
                    color: getIconColor(status),
                  }}
                >
                  {status === 'running' ? (
                    <>
                      {type !== 'start' ? (
                        <div className="i-svg-spinners:90-ring-with-bg" />
                      ) : (
                        <Icon name="terminal" />
                      )}
                    </>
                  ) : status === 'pending' ? (
                    <Icon name="circle" />
                  ) : status === 'complete' ? (
                    <Icon name="check" />
                  ) : status === 'failed' || status === 'aborted' ? (
                    <Icon name="x" />
                  ) : null}
                </div>
                {type === 'file' ? (
                  <span style={{ color: 'var(--cx-text-secondary)' }}>
                    Create{' '}
                    <code
                      style={{
                        background: 'color-mix(in srgb, var(--cx-accent-vivid), transparent 90%)',
                        color: 'var(--cx-accent-vivid)',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontFamily: 'ui-monospace, "SF Mono", monospace',
                      }}
                      onClick={() => openArtifactInWorkbench(action.filePath)}
                    >
                      {action.filePath}
                    </code>
                  </span>
                ) : type === 'shell' ? (
                  <span style={{ color: 'var(--cx-text-secondary)' }}>Run command</span>
                ) : type === 'start' ? (
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      workbenchStore.currentView.set('preview');
                    }}
                    style={{ color: 'var(--cx-accent-vivid)', cursor: 'pointer', textDecoration: 'none' }}
                  >
                    Start Application
                  </a>
                ) : null}
              </div>
              {(type === 'shell' || type === 'start') && (
                <ShellCodeBlock
                  classsName={classNames({ 'mb-2': !isLast })}
                  code={content}
                />
              )}
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
});

function getIconColor(status: ActionState['status']): string {
  switch (status) {
    case 'pending':
      return 'var(--cx-text-muted)';
    case 'running':
      return 'var(--cx-accent-vivid)';
    case 'complete':
      return 'var(--bolt-elements-icon-success, #34d399)';
    case 'aborted':
      return 'var(--cx-text-secondary)';
    case 'failed':
      return 'var(--bolt-elements-icon-error, #f87171)';
    default:
      return 'var(--cx-text-muted)';
  }
}
