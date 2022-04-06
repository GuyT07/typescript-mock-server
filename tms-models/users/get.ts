export interface User {
    id: number;
    firstName: string;
    lastName: string;
    creationDate:  Date;
}

const newDate = () => new Date();

export const data: User[] = [{
    id: 1,
    firstName: 'Guy',
    lastName: 'Theuws',
    creationDate:  newDate()
}, {
    id: 2,
    firstName: 'Generation Y',
    lastName: 'Development',
    creationDate:  newDate()
}];
