import {
  LayoutDashboard,
  Users,
  UserCog,
  Shield,
  User,
  ClipboardList,
  FileText,
  BarChart2,
  Activity,
  Settings,
  Lock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '../types/auth';

export type NavItem = {
  key: string;
  labelKey: string;      // i18n key
  path: string;
  icon: LucideIcon;
  roles: UserRole[];
  exact?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    key:      'dashboard',
    labelKey: 'Dashboard',
    path:     '/dashboard',
    icon:     LayoutDashboard,
    roles:    ['Admin'],
    exact:    true,
  },
  {
    key:      'my-team',
    labelKey: 'My Team',
    path:     '/dashboard/my-team',
    icon:     Users,
    roles:    ['Medical Team Manager'],
  },
  {
    key:      'medical-staff',
    labelKey: 'Medical Staff',
    path:     '/dashboard/medical-staff',
    icon:     UserCog,
    roles:    ['Medical Team Manager'],
  },
  {
    key:      'teams',
    labelKey: 'Teams',
    path:     '/dashboard/teams',
    icon:     Shield,
    roles:    ['Admin'],
  },
  {
    key:      'players',
    labelKey: 'Players',
    path:     '/dashboard/players',
    icon:     User,
    roles:    ['Admin', 'Medical Team Manager'],
  },
  {
    key:      'assessments',
    labelKey: 'Assessments',
    path:     '/dashboard/assessments',
    icon:     ClipboardList,
    roles:    ['Admin', 'Medical Team Manager'],
  },
  {
    key:      'reports',
    labelKey: 'Reports',
    path:     '/dashboard/reports',
    icon:     FileText,
    roles:    ['Admin', 'Medical Team Manager'],
  },
  {
    key:      'analytics',
    labelKey: 'Analytics',
    path:     '/dashboard/analytics',
    icon:     BarChart2,
    roles:    ['Admin', 'Medical Team Manager'],
  },
  {
    key:      'audit-logs',
    labelKey: 'Audit Logs',
    path:     '/dashboard/audit-logs',
    icon:     Activity,
    roles:    ['Admin'],
  },
  {
    key:      'settings',
    labelKey: 'Settings',
    path:     '/dashboard/settings',
    icon:     Settings,
    roles:    ['Admin'],
  },
  {
    key:      'security',
    labelKey: 'Security',
    path:     '/dashboard/security',
    icon:     Lock,
    roles:    ['Admin', 'Medical Team Manager'],
  },
];
