import { RequestConfig } from '../../src/models/config';

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

export const data: User = {
  id: 1,
  firstName: 'Guy',
  lastName: 'Theuws',
};

export const config: RequestConfig = {
  delay: {
    min: 1000,
    max: 5000,
  },
};
