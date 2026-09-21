/** Backend access list ka role (`src/access/access.config.ts`). */
export type AccessRole = 'CEO' | 'ADMIN' | 'USER';

export interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    city: string;
    gender: string;
    photo: string;
    token: string;
    /** Backend access list ka role — CEO UI isi se milti hai. */
    accessRole?: AccessRole | null;
    /** DB role (`user` / `admin` / `ceo`) — purane sessions ke liye fallback. */
    role?: string;
};

export interface UserState {
    user: User | null;
};