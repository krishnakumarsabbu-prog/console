export function Spinner({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5" opacity="0.25" />
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeDasharray="100"
        strokeDashoffset="60"
      >
        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
