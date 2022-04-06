interface User {
    id: number;
    firstName: string;
    lastName: string;
}

export const data: User = {
    id: new Date().getMilliseconds(),
    firstName: 'Guy created',
    lastName: 'Theuws created'
};
