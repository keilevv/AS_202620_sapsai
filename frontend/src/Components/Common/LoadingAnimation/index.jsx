function LoadingAnimation({ className = "", animate = true }) {
  return (
    <div className={`${className}s`}>
      {" "}
      <svg viewBox="0 0 120 120">
        {/* Bigger circle */}
        <circle cx="60" cy="60" r="58" fill="#00A63E" />

        {/* Shift leaf slightly upward so it’s optically centered */}
        <g transform="translate(0, -3)">
          {/* Leaf outline */}
          <path
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="251.2"
            strokeDashoffset={animate ? "251.2" : "0"}
            d="M60 28 C80 45, 80 75, 60 92 C40 75, 40 45, 60 28 Z"
          >
            {animate && (
              <animate
                attributeName="stroke-dashoffset"
                from="251.2"
                to="0"
                dur="1s"
                fill="freeze"
              />
            )}
          </path>

          {/* Main vertical vein */}
          <path
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="60"
            strokeDashoffset={animate ? "60" : "0"}
            d="M60 32 L60 88"
          >
            {animate && (
              <animate
                attributeName="stroke-dashoffset"
                from="60"
                to="0"
                dur="0.8s"
                begin="0.8s"
                fill="freeze"
              />
            )}
          </path>

          {/* Left side veins */}
          <path
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="40"
            strokeDashoffset={animate ? "40" : "0"}
            d="M60 45 C55 43, 50 43, 47 45"
          >
            {animate && (
              <animate
                attributeName="stroke-dashoffset"
                from="40"
                to="0"
                dur="0.5s"
                begin="1.2s"
                fill="freeze"
              />
            )}
          </path>
          <path
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="40"
            strokeDashoffset={animate ? "40" : "0"}
            d="M60 56 C55 54, 50 54, 46 56"
          >
            {animate && (
              <animate
                attributeName="stroke-dashoffset"
                from="40"
                to="0"
                dur="0.5s"
                begin="1.3s"
                fill="freeze"
              />
            )}
          </path>
          <path
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="40"
            strokeDashoffset={animate ? "40" : "0"}
            d="M60 67 C55 65, 50 65, 47 67"
          >
            {animate && (
              <animate
                attributeName="stroke-dashoffset"
                from="40"
                to="0"
                dur="0.5s"
                begin="1.4s"
                fill="freeze"
              />
            )}
          </path>

          {/* Right side veins */}
          <path
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="40"
            strokeDashoffset={animate ? "40" : "0"}
            d="M60 45 C65 43, 70 43, 73 45"
          >
            {animate && (
              <animate
                attributeName="stroke-dashoffset"
                from="40"
                to="0"
                dur="0.5s"
                begin="1.2s"
                fill="freeze"
              />
            )}
          </path>
          <path
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="40"
            strokeDashoffset={animate ? "40" : "0"}
            d="M60 56 C65 54, 70 54, 74 56"
          >
            {animate && (
              <animate
                attributeName="stroke-dashoffset"
                from="40"
                to="0"
                dur="0.5s"
                begin="1.3s"
                fill="freeze"
              />
            )}
          </path>
          <path
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="40"
            strokeDashoffset={animate ? "40" : "0"}
            d="M60 67 C65 65, 70 65, 73 67"
          >
            {animate && (
              <animate
                attributeName="stroke-dashoffset"
                from="40"
                to="0"
                dur="0.5s"
                begin="1.4s"
                fill="freeze"
              />
            )}
          </path>

          {/* Text */}
          <text
            x="60"
            y="106"
            textAnchor="middle"
            fontSize="11"
            fill="#fff"
            fontWeight="bold"
            opacity={animate ? "0" : "1"}
          >
            {animate && (
              <animate
                attributeName="opacity"
                from="0"
                to="1"
                dur="0.3s"
                fill="freeze"
              />
            )}
            Loading...
          </text>
        </g>
      </svg>
    </div>
  );
}
export default LoadingAnimation;
