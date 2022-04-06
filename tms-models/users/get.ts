export interface User {
    id: number;
    firstName: string;
    lastName: string;
}

const myNewMethod = () => new Date();

export const data: User[] = [{
    id: 1,
    firstName: 'Guy',
    lastName: 'Theuws'
}, {
    id: 2,
    firstName: 'Generation Y',
    lastName: 'Development'
}];
