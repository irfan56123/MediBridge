// The one deliberate signature flourish of the whole UI — a heartbeat trace
// that lives under the top header bar. Everywhere else stays quiet on purpose.
export default function EcgDivider({ className = '' }) {
  return (
    <div className={`w-full overflow-hidden h-[10px] ${className}`} aria-hidden="true">
      <svg
        className="ecg-pulse w-full h-full"
        viewBox="0 0 600 20"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,10 L120,10 L135,10 L145,2 L155,18 L165,10 L180,10 L300,10 L315,10 L325,2 L335,18 L345,10 L360,10 L480,10 L495,10 L505,2 L515,18 L525,10 L600,10"
          fill="none"
          stroke="#146C6A"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}
