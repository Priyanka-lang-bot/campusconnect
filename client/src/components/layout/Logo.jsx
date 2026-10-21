export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#22315a" />
      <path d="M9 20.5a7 7 0 0 1 0-9M13 22.5a10 10 0 0 1 0-13" stroke="#9db4ff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="21" cy="16" r="4" fill="#c4b5fd" />
    </svg>
  );
}
