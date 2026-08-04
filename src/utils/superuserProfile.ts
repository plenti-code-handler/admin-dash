export interface SuperUserProfile {
  id: string;
  email: string;
  phone_number: string;
  username: string;
  team: string;
  permissions: string[];
  is_active: boolean;
}

export const SUPERUSER_TEAMS = [
  'OPERATIONS',
  'ENGINEERING',
  'MARKETING',
  'CUSTOMER_SUPPORT',
  'EXPANSION',
  'DATA_SCIENCE',
  'HR',
  'FINANCE',
] as const;

export const EMPTY_SUPERUSER_PROFILE: SuperUserProfile = {
  id: '',
  email: '',
  phone_number: '',
  username: '',
  team: '',
  permissions: [],
  is_active: false,
};

export function formatTeam(team: string): string {
  if (!team) return '—';
  return team
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function mapSuperUserProfile(data: Record<string, unknown>): SuperUserProfile {
  return {
    id: String(data.id || ''),
    email: String(data.email || ''),
    phone_number: String(data.phone_number || ''),
    username: String(data.username || ''),
    team: String(data.team || ''),
    permissions: Array.isArray(data.permissions) ? (data.permissions as string[]) : [],
    is_active: Boolean(data.is_active),
  };
}
