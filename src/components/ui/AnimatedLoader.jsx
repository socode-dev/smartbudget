import React from "react";

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
        <g
          className="animated-loader__group"
          transform={`translate(${center}, ${center})`}
        >
          {/* Outer arc */}
          <g
            className="arc-wrap arc-wrap--outer"
            transform={`translate(${-center}, ${-center})`}
          >
            <circle
              className="arc arc--outer"
              cx={center}
              cy={center}
              r={radiusOuter}
              fill="none"
              stroke="#0b2545" /* dark navy */
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${Math.PI * radiusOuter * 0.32} ${
                Math.PI * radiusOuter * 0.68
              }`}
            />
          </g>

          {/* Middle arc */}
          <g
            className="arc-wrap arc-wrap--mid"
            transform={`translate(${-center}, ${-center})`}
          >
            <circle
              className="arc arc--mid"
              cx={center}
              cy={center}
              r={radiusMid}
              fill="none"
              stroke="#1e90ff" /* blue */
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${Math.PI * radiusMid * 0.22} ${
                Math.PI * radiusMid * 0.78
              }`}
            />
          </g>

          {/* Inner arc */}
          <g
            className="arc-wrap arc-wrap--inner"
            transform={`translate(${-center}, ${-center})`}
          >
            <circle
              className="arc arc--inner"
              cx={center}
              cy={center}
              r={radiusInner}
              fill="none"
              stroke="#8a2be2" /* purple */
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${Math.PI * radiusInner * 0.28} ${
                Math.PI * radiusInner * 0.72
              }`}
            />
          </g>
        </g>
      </svg>

      <style>{`
        .animated-loader{
          display: inline-flex;
          align-items: center;
          justify-content: center;
          /* allow parent to control sizing/placement; this centers inside the parent */
        }

        .animated-loader__svg{
          display: block;
          overflow: visible;
        }

        /* Group rotation provides the smooth continuous spin */
        .animated-loader__group{
          transform-origin: center center;
          animation: rotateGroup 3.8s linear infinite;
        }

        /* Individual wraps rotate at different speeds/directions to create interlocking motion */
        .arc-wrap--outer{ animation: rotateOuter 4.6s cubic-bezier(.22,.9,.35,1) infinite; }
        .arc-wrap--mid{ animation: rotateMid 3.2s cubic-bezier(.22,.9,.35,1) infinite; }
        .arc-wrap--inner{ animation: rotateInner 2.6s cubic-bezier(.22,.9,.35,1) infinite; }

        /* The arcs also 'slide' via dashoffset animation giving the sense of interlocking */
        .arc{
          transform-origin: center center;
        }

        .arc--outer{ animation: dashOuter 1.9s ease-in-out infinite; }
        .arc--mid{ animation: dashMid 1.6s ease-in-out infinite; }
        .arc--inner{ animation: dashInner 1.3s ease-in-out infinite; }

        /* keyframes */
        @keyframes rotateGroup{
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes rotateOuter{
          0% { transform: rotate(0deg); }
          50% { transform: rotate(-25deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes rotateMid{
          0% { transform: rotate(0deg); }
          50% { transform: rotate(40deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes rotateInner{
          0% { transform: rotate(0deg); }
          50% { transform: rotate(-55deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes dashOuter{
          0%{ stroke-dashoffset: 0; opacity: 1; }
          50%{ stroke-dashoffset: -20; opacity: 0.9; }
          100%{ stroke-dashoffset: 0; opacity: 1; }
        }

        @keyframes dashMid{
          0%{ stroke-dashoffset: 0; opacity: 1; }
          50%{ stroke-dashoffset: 26; opacity: 0.95; }
          100%{ stroke-dashoffset: 0; opacity: 1; }
        }

        @keyframes dashInner{
          0%{ stroke-dashoffset: 0; opacity: 1; }
          50%{ stroke-dashoffset: -36; opacity: 0.9; }
          100%{ stroke-dashoffset: 0; opacity: 1; }
        }

        /* Subtle glow / contrast using SVG filters could be added, but keep it lightweight */
      `}</style>
    </div>
  );
};

export default AnimatedLoader;
