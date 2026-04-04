/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import { MODEL_REGEX, PROVIDER_REGEX } from '~/utils/constants';
import { Markdown } from './Markdown';
import { Icon } from '~/components/ui/Icon';
import { useNanoStore } from '~/lib/hooks/useNanoStore';
import { profileStore } from '~/lib/stores/profile';
import type {
  TextUIPart,
  ReasoningUIPart,
  ToolInvocationUIPart,
  SourceUIPart,
  FileUIPart,
  StepStartUIPart,
} from '@ai-sdk/ui-utils';

interface UserMessageProps {
  content: string | Array<{ type: string; text?: string; image?: string }>;
  parts:
  | (TextUIPart | ReasoningUIPart | ToolInvocationUIPart | SourceUIPart | FileUIPart | StepStartUIPart)[]
  | undefined;
}

export function UserMessage({ content, parts }: UserMessageProps) {
  const profile = useNanoStore(profileStore);

  const images =
    parts?.filter(
      (part): part is FileUIPart => part.type === 'file' && 'mimeType' in part && part.mimeType.startsWith('image/'),
    ) || [];

  if (Array.isArray(content)) {
    const textItem = content.find((item) => item.type === 'text');
    const textContent = stripMetadata(textItem?.text || '');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-end' }}>
          {profile?.username && (
            <span
              style={{
                color: 'var(--cx-text-muted)',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              {profile.username}
            </span>
          )}
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt={profile?.username || 'User'}
              style={{
                width: '26px',
                height: '26px',
                objectFit: 'cover',
                borderRadius: '50%',
                border: '1px solid var(--cx-border)',
              }}
              loading="eager"
              decoding="sync"
            />
          ) : (
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'var(--cx-hover)',
                border: '1px solid var(--cx-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cx-text-muted)',
                fontSize: '13px',
              }}
            >
              <Icon name="user" />
            </div>
          )}
        </div>

        {images.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end' }}>
            {images.map((item, index) => (
              <img
                key={index}
                src={`data:${item.mimeType};base64,${item.data}`}
                alt={`Image ${index + 1}`}
                style={{
                  maxWidth: '240px',
                  maxHeight: '180px',
                  objectFit: 'contain',
                  borderRadius: '10px',
                  border: '1px solid var(--cx-border)',
                }}
              />
            ))}
          </div>
        )}

        {textContent && (
          <div
            className="devcure-user-message"
            style={{
              background: 'color-mix(in srgb, var(--cx-accent-vivid), transparent 88%)',
              border: '1px solid color-mix(in srgb, var(--cx-accent-vivid), transparent 75%)',
              borderRadius: '14px 14px 4px 14px',
              padding: '10px 14px',
              maxWidth: '85%',
              color: 'var(--cx-text-primary)',
              fontSize: '14px',
              lineHeight: '1.55',
            }}
          >
            <Markdown html>{textContent}</Markdown>
          </div>
        )}
      </div>
    );
  }

  const textContent = stripMetadata(content);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%', gap: '8px' }}>
      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end' }}>
          {images.map((item, index) => (
            <div
              key={index}
              style={{
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid var(--cx-border)',
              }}
            >
              <img
                src={`data:${item.mimeType};base64,${item.data}`}
                alt={`Image ${index + 1}`}
                style={{ height: '64px', width: '64px', objectFit: 'fill', display: 'block' }}
              />
            </div>
          ))}
        </div>
      )}

      <div
        className="devcure-user-message"
        style={{
          background: 'color-mix(in srgb, var(--cx-accent-vivid), transparent 88%)',
          border: '1px solid color-mix(in srgb, var(--cx-accent-vivid), transparent 75%)',
          borderRadius: '14px 14px 4px 14px',
          padding: '10px 14px',
          maxWidth: '85%',
          color: 'var(--cx-text-primary)',
          fontSize: '14px',
          lineHeight: '1.55',
        }}
      >
        <Markdown html>{textContent}</Markdown>
      </div>
    </div>
  );
}

function stripMetadata(content: string) {
  const artifactRegex = /<cortexArtifact\s+[^>]*>[\s\S]*?<\/cortexArtifact>/gm;
  return content.replace(MODEL_REGEX, '').replace(PROVIDER_REGEX, '').replace(artifactRegex, '');
}
