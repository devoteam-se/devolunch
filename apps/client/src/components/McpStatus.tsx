// What: Small status pill showing MCP WS connectivity
// Why: Surface reliability state to users

import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { getMcpStatus, onMcpStatus } from '@/utils/mcp';

const wrap = css`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: #333;
`;

const dot = (color: string) => css`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${color};
`;

function colorFor(status: string) {
  switch (status) {
    case 'connected':
      return '#21a366';
    case 'connecting':
      return '#f0ad4e';
    case 'error':
      return '#d9534f';
    default:
      return '#999';
  }
}

export default function McpStatus() {
  const [status, setStatus] = useState(getMcpStatus());
  useEffect(() => onMcpStatus(setStatus), []);
  const color = colorFor(status);
  return (
    <span css={wrap} title={`AI connection: ${status}`} aria-label={`AI connection: ${status}`}>
      <span css={dot(color)} />
      <span>AI</span>
    </span>
  );
}

