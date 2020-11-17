import { User } from '../get';

interface Profile {
    id: number;
    title: string
    user: User;
}

export const data: Profile = { id: 1, title: 'Hello profile', user: {
        id: 1,
        firstName: 'Guy',
        lastName: 'Theuws'
    }};
