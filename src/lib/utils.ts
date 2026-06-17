import {
  Cpu,
  Monitor,
  Zap,
  Activity,
  TrendingUp,
  BatteryCharging,
  Wifi,
  Layout,
  Radio,
  Bluetooth,
  Antenna,
  Gauge,
  Power,
  PlugZap,
  Cable,
  HardDrive,
  Server,
  Smartphone,
  Tablet,
  Rss,
  Waves,
  SatelliteDish,
  MemoryStick,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const categoryIcons: Record<string, LucideIcon> = {
  cpu: Cpu,
  monitor: Monitor,
  zap: Zap,
  activity: Activity,
  'trending-up': TrendingUp,
  'battery-charging': BatteryCharging,
  wifi: Wifi,
  layout: Layout,
  radio: Radio,
  bluetooth: Bluetooth,
  antenna: Antenna,
  gauge: Gauge,
  power: Power,
  'plug-zap': PlugZap,
  cable: Cable,
  'hard-drive': HardDrive,
  server: Server,
  smartphone: Smartphone,
  tablet: Tablet,
  rss: Rss,
  waves: Waves,
  'satellite-dish': SatelliteDish,
  'memory-stick': MemoryStick,
};

export function formatSpecKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bMhz\b/g, 'MHz').replace(/\bGhz\b/g, 'GHz')
    .replace(/\bMb\b/g, 'MB').replace(/\bKb\b/g, 'KB').replace(/\bGb\b/g, 'GB')
    .replace(/\bUsd\b/g, 'USD ($)').replace(/\bIo\b/g, 'I/O')
    .replace(/\bAdc\b/g, 'ADC').replace(/\bDac\b/g, 'DAC')
    .replace(/\bGpio\b/g, 'GPIO').replace(/\bSram\b/g, 'SRAM')
    .replace(/\bRam\b/g, 'RAM').replace(/\bFpu\b/g, 'FPU')
    .replace(/\bUsb\b/g, 'USB').replace(/\bPio\b/g, 'PIO');
}

export function formatSpecValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value || '—';
  return String(value);
}

export function getSpecDiff(specs: Record<string, unknown>[], key: string): 'same' | 'diff' | 'na' {
  const values = specs.map((s) => s[key]);
  const defined = values.filter((v) => v !== undefined && v !== null);
  if (defined.length === 0) return 'na';
  return defined.every((v) => String(v) === String(defined[0])) ? 'same' : 'diff';
}

export function getAllSpecKeys(specs: Record<string, unknown>[]): string[] {
  const keys = new Set<string>();
  specs.forEach((s) => Object.keys(s).forEach((k) => keys.add(k)));
  return Array.from(keys);
}
