import React from 'react'

interface TRELogoProps {
  width?: number
  height?: number
  className?: string
  animated?: boolean
}

export const TRELogo: React.FC<TRELogoProps> = ({
  width = 400,
  height = 400,
  className,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
    >
      {/* background; remove if you want transparent */}
      <rect width="100%" height="100%" fill="#000000" />

      {/* Scale original 512x512 artwork to fit provided width/height */}
      <g transform={`scale(${width / 512} ${height / 512})`}>
        {/* Green rounded bar (rotated rounded-rect)
        Center at (262, 295) so we can rotate around its center */}
        <rect
          x="214"
          y="288"
          width="80"
          height="206"
          fill="#19C15E"
          transform="rotate(22 262 295)"
        />

        {/* White triangular outline */}
        <path
          d="M256 36 L72 476 L440 476 Z"
          fill="none"
          stroke="#F5F5F5"
          strokeWidth="30"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* White circle overlapping the bar */}
        <circle cx="256" cy="288" r="40" fill="#F5F5F5" />
      </g>
    </svg>
  )
}

export default TRELogo
