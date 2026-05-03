declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';

  export interface LucideProps extends Partial<Omit<SVGProps<SVGSVGElement>, 'ref'>> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  }

  export type LucideIcon = FC<LucideProps>;

  // Export all icons as LucideIcon type
  export const Languages: LucideIcon;
  export const Info: LucideIcon;
  export const CheckIcon: LucideIcon;
  export const XIcon: LucideIcon;
  export const X: LucideIcon;
  export const Upload: LucideIcon;
  export const File: LucideIcon;
  export const ChevronDownIcon: LucideIcon;
  export const ChevronUpIcon: LucideIcon;
  export const CircleCheckIcon: LucideIcon;
  export const InfoIcon: LucideIcon;
  export const TriangleAlertIcon: LucideIcon;
  export const OctagonXIcon: LucideIcon;
  export const Loader2Icon: LucideIcon;
  export const Moon: LucideIcon;
  export const Sun: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const XCircle: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const Mail: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Settings: LucideIcon;
  export const Loader2: LucideIcon;
  export const Copy: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Trash2: LucideIcon;
  export const FileText: LucideIcon;
  export const Zap: LucideIcon;
  export const Shield: LucideIcon;

  // Export all other icons
  export * from 'lucide-react';
}
