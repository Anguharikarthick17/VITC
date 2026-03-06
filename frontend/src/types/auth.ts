export interface User {
    id: string;
    email: string;
    role: 'SUPER_ADMIN' | 'STATE_ADMIN' | 'OFFICER';
    name: string;
    state: string | null;
}

export type Role = User['role'];
