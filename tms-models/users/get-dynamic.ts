import { Request, Response } from 'express';
import { MockModel, RequestConfig } from '../../src/models/config';

export interface User {
    id: number;
    username: string;
    email: string;
}

export const data = (req: Request, res: Response): User => {
    const userId = req.query.id ? parseInt(req.query.id as string) : 1;
    
    return {
        id: userId,
        username: `user_${userId}`,
        email: `user_${userId}@example.com`
    };
};

export const config: RequestConfig = {
    statusCode: 200
};
