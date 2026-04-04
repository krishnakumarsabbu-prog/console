import React from 'react';

const EXAMPLE_PROMPTS = [
  { text: 'Build a React dashboard with dark mode', icon: '⚡' },
  { text: 'Create a REST API with TypeScript & Express', icon: '🔧' },
  { text: 'Fix bugs in my Node.js backend', icon: '🛠' },
  { text: 'Optimize performance of my React app', icon: '📈' },
  { text: 'Build a space invaders game in HTML/JS', icon: '🎮' },
  { text: 'Create a Next.js e-commerce store', icon: '🛒' },
];

export function ExamplePrompts(sendMessage?: { (event: React.UIEvent, messageInput?: string): void | undefined }) {
  return (
    <div
      id="examples"
      className="relative w-full max-w-2xl mx-auto mt-4 mb-2"
      style={{ animation: '0.35s ease-out 0.3s both cx-fade-up' }}
    >
      <div className="flex flex-wrap justify-center gap-2 px-4">
        {EXAMPLE_PROMPTS.map((examplePrompt, index: number) => (
          <button
            key={index}
            onClick={(event) => {
              sendMessage?.(event, examplePrompt.text);
            }}
            className="cx-prompt-pill"
            style={{ animationDelay: `${0.3 + index * 0.05}s` }}
          >
            <span style={{ fontSize: '11px' }}>{examplePrompt.icon}</span>
            <span>{examplePrompt.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
