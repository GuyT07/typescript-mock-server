# Typescript mock server
Simple mock/stub server that can be used in front end development. Instead of creating json files you can just publish TypeScript objects as json. 
This makes it easier to maintain your mocks because you can load your own models. When you change your implementation you also 
have to update your mock, otherwise you will receive compile errors.

# Quickstart
The easiest way to check out this stub/mock server is by installing it as a (dev)dependency and then 
add a script to you scripts section: `npm run --prefix node_modules/typescript-mock-server start -- --path=$INIT_CWD/tms-models`. 
Your models should export a data const and your file should be named as `^(get|post){1}(-\d)?.ts$`. 
Changes are being picked up automatically, so no need for a restart. When you add files, you have to restart.

Check out the [working example project](https://github.com/GuyT07/typescript-mock-server-examle) and [the source](https://github.com/GuyT07/typescript-mock-server/tree/main/tms-models/users).

# Options
- `--port=x`: Port number the server runs on
- `--path=x`: Path to your models
- `--cors=http://localhost:5000`: Set Access-Control-Allow-Origin header, leave empty to accept all

## Register mocks/stubs
Examples talk, so lets start with an example.

Your requirement is to have the following GET endpoints `/users`, `/users/1` and `/users/profile/1`

Create a root folder that contains your models, like `models`. Then add a folder `users` and within the newly created folder 
create a new folder `profile`. Add following files `get.ts` and `get-1.ts` in the `users` directory, `get-1.ts` in the `profile` dir. 
To register another HTTP verb, you replace `get` with your verb ('get', 'post', 'put', 'delete', 'patch', 'options' and 'head' are currently supported).

You should have the following structure:

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

export const config: RequestConfig = {
    delay: 2000, // or you can use an interval like {min: 2000, max: 5000}
    statusCode: 418
}
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
- [x] Support different headers/configurations (delays, status codes, ...)
- [x] Support most used HTTP methods
- [ ] Add tests
- [x] Refactor, split up in separate classes (first check if people actually want to use the tool)
- [ ] Setup CI/CD (+code quality + coverage tooling)
- [ ] Setup website
- [ ] Create a JVM compatible version
- [x] Create interface to force implementation of required properties and make it more stable
- [x] Improve error handling (missing properties etc.)
- [ ] Create an optional persistent state


## Release notes (will be moved to GitHub in the future)
- v1.0.8 - Minor bugfixes
- v1.0.7 - Minor bugfixes
- v1.0.6 - Bugfix: accidentally included "npm" and "install" dependency, removed again
- v1.0.5 - Set $INIT_CWD to support all platforms and add CORS option
- v1.0.3 - Updated README to include delay interval example
- v1.0.2 - Use correct command to push tags
- v1.0.1 - Include correct files in GIT tag
- v1.0.0 - Breaking change: renamed Server config to Request and added interval for delay
- v0.0.11 - Add items to roadmap, bug fixes
- v0.0.10 - Support multiple http verbs

## Bug fix contributors
- Path fix, from now on current working directory is used. Credits to [Spoodyman](https://github.com/spoodyman)

