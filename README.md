# Typescript mock server
Simple mock/stub server that can be used in front end development. Instead of creating json files you can just publish TypeScript objects as json. 
This makes it easier to maintain your mocks because you can load your own models. When you change your implementation you also 
have to update your mock, otherwise you will receive compile errors.

# Quickstart
The easiest way to check out this stub/mock server is by installing it as a (dev)dependency and then 
add a script to you scripts section: `npm run --prefix node_modules/typescript-mock-server start -- --path=$(pwd)/tms-models`. 
Your models should export a data const and your file should be named as `^(get|post){1}(-\d)?.ts$`. 
Changes are being picked up automatically, so no need for a restart.

Check out the [working example project](https://github.com/GuyT07/typescript-mock-server-examle) and [the source](https://github.com/GuyT07/typescript-mock-server/tree/main/tms-models/users).

# Options
- `--port=x`: Port number the server runs on
- `--path=x`: Path to your models

## Adding GET mocks/stubs
Examples talk, so lets start with an example.

Your requirement is to have the following endpoints `/users`, `/users/1` and `/users/profile/1`

Create a root folder that contains your models, like `models`. Then add a folder `users` and within the newly created folder 
create a new folder `profile`. Add following files `get.ts` and `get-1.ts` in the `users` directory, `get-1.ts` in the `profile` dir. You should 
have the following structure:

```
--models
    -- users
       - get.ts
       - get-1.ts
    -- profile
       - get-1.ts
```

Within the model file you can import/create your model:

```
export interface User {
    id: number;
    firstName: string;
    lastName: string;
    creationDate: Date;
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
```

## Dependencies
Following dependencies are being used:

- express
- ts-node-dev
- typescript
- @types/express
- @types/node

## Roadmap
- [x] Support other server port
- [x] Improve paths/way to start
- [ ] Support different headers
- [ ] Support all HTTP methods

