import { RequestConfig } from '../../src/models/config';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    creationDate:  Date;
}

export const newDate = () => new Date();

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

export const config: RequestConfig = {
    delay: 2000,
    statusCode: 418
}
