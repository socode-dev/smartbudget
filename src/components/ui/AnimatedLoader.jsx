const AnimatedLoader = ({ size = 120, stroke = 10 }) => {
  const viewBox = `0 0 ${size} ${size}`;
  const center = size / 2;
  const radiusOuter = center - stroke / 2;
  const radiusMid = center - stroke * 2;
  const radiusInner = center - stroke * 3.5;

  return (
    <div className="animated-loader" role="status" aria-label="Loading">
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        className="animated-loader__svg"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="outerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0b2545" />
            <stop offset="100%" stopColor="#1c3a63" />
          </linearGradient>
          <linearGradient id="midGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e90ff" />
            <stop offset="100%" stopColor="#63b3ff" />
          </linearGradient>
          <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8a2be2" />
            <stop offset="100%" stopColor="#b57cff" />
          </linearGradient>

          {/* Glow */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g
          className="animated-loader__group"
          transform={`translate(${center}, ${center})`}
        >
          {/* Outer arc */}
          <circle
            className="arc arc--outer"
            cx={0}
            cy={0}
            r={radiusOuter}
            fill="none"
            stroke="url(#outerGradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${Math.PI * radiusOuter * 0.32} ${
              Math.PI * radiusOuter * 0.68
            }`}
            filter="url(#glow)"
            opacity="1"
          />

          {/* Middle arc */}
          <circle
            className="arc arc--mid"
            cx={0}
            cy={0}
            r={radiusMid}
            fill="none"
            stroke="url(#midGradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${Math.PI * radiusMid * 0.22} ${
              Math.PI * radiusMid * 0.78
            }`}
            filter="url(#glow)"
            opacity="0.85"
          />

          {/* Inner arc */}
          <circle
            className="arc arc--inner"
            cx={0}
            cy={0}
            r={radiusInner}
            fill="none"
            stroke="url(#innerGradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${Math.PI * radiusInner * 0.28} ${
              Math.PI * radiusInner * 0.72
            }`}
            filter="url(#glow)"
            opacity="0.7"
          />
        </g>
      </svg>

      <style>{`
        .animated-loader{
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .animated-loader__svg{
          display: block;
          overflow: visible;
        }

        .animated-loader__group{
          transform-origin: center center;
          animation: rotateGroup 1.4s linear infinite, pulseGroup 3s ease-in-out infinite;
        }

        .arc--outer{ animation: dashOuter 0.8s ease-in-out infinite; }
        .arc--mid{ animation: dashMid 0.9s ease-in-out infinite; }
        .arc--inner{ animation: dashInner 1s ease-in-out infinite; }

        @keyframes rotateGroup{
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulseGroup{
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes dashOuter{
          0%{ stroke-dashoffset: 0; }
          50%{ stroke-dashoffset: -20; }
          100%{ stroke-dashoffset: 0; }
        }

        @keyframes dashMid{
          0%{ stroke-dashoffset: 0; }
          50%{ stroke-dashoffset: 24; }
          100%{ stroke-dashoffset: 0; }
        }

        @keyframes dashInner{
          0%{ stroke-dashoffset: 0; }
          50%{ stroke-dashoffset: -32; }
          100%{ stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default AnimatedLoader;
