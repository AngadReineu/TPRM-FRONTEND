import type { PiiVolume } from '../types';
import { piiStrokeW, innerColor } from '../services/library.data';

interface SupCircleProps {
  riskScore: number | null;
  piiVolume: PiiVolume;
  size: number;
}

export function SupCircle({ riskScore, piiVolume, size }: SupCircleProps) {
  const sw = piiStrokeW(piiVolume);
  const r = size / 2 - sw / 2 - 1;
  const ir = size * 0.34;
  return (
    <svg width={size} height={size} className="block shrink-0 overflow-visible">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EF4444" strokeWidth={sw} opacity={0.35} />
      <circle cx={size / 2} cy={size / 2} r={ir} fill={innerColor(riskScore)} stroke="#fff" strokeWidth={2} />
    </svg>
  );
}
