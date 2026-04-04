import React from 'react';

const EXAMPLE_PROMPTS = [
  { text: 'Create a mobile app about bolt.diy' },
  { text: 'Build a todo app in React using Tailwind' },
  { text: 'Build a simple blog using Astro' },
  { text: 'Create a cookie consent form using Material UI' },
  { text: 'Make a space invaders game' },
  { text: 'Make a Tic Tac Toe game in html, css and js only' },
];

export function ExamplePrompts(sendMessage?: { (event: React.UIEvent, messageInput?: string): void | undefined }) {
  return (
    <div id="examples" className="relative flex flex-col gap-9 w-full max-w-3xl mx-auto flex justify-center mt-6">
      <div
        className="flex flex-wrap justify-center gap-2"
        style={{
          animation: '.25s ease-out 0s 1 _fade-and-move-in_g2ptj_1 forwards',
        }}
      >
        {EXAMPLE_PROMPTS.map((examplePrompt, index: number) => {
          return (
            <button
              key={index}
              onClick={(event) => {
                sendMessage?.(event, examplePrompt.text);
              }}
              className="border border-[rgba(255,255,255,0.08)] rounded-full bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(45,212,191,0.1)] hover:border-[rgba(45,212,191,0.3)] text-gray-400 hover:text-teal-300 px-3 py-1 text-xs transition-all duration-200"
            >
              {examplePrompt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
