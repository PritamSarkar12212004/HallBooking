export interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    city: string;
    gender: string;
    photo: string;
    token: string
};

export interface UserState {
    user: User | null;
};