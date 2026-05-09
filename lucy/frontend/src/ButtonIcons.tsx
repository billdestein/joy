import React from 'react'

const iconStyle: React.CSSProperties = { width: 14, height: 14, display: 'block' }

export const ButtonIcons = {
  plus: (
    <svg style={iconStyle} viewBox="0 0 14 14" fill="currentColor">
      <path d="M6 0h2v6h6v2H8v6H6V8H0V6h6z" />
    </svg>
  ),
  upload: (
    <svg style={iconStyle} viewBox="0 0 14 14" fill="currentColor">
      <path d="M7 0L2 5h3v5h4V5h3L7 0zm-5 12h10v2H2v-2z" />
    </svg>
  ),
  close: (
    <svg style={iconStyle} viewBox="0 0 14 14" fill="currentColor">
      <path d="M1.4 0L0 1.4 5.6 7 0 12.6 1.4 14 7 8.4l5.6 5.6 1.4-1.4L8.4 7l5.6-5.6L12.6 0 7 5.6 1.4 0z" />
    </svg>
  ),
}
