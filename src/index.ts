import express = require('express');
import fs = require('fs');

const argv = (() => {
    const args = {};
    process.argv.slice(2).map( (element) => {
        const matches = element.match( '--([a-zA-Z0-9]+)=(.*)');
        if ( matches ){
            // @ts-ignore
            args[matches[1]] = matches[2]
                .replace(/^['"]/, '').replace(/['"]$/, '');
        }
    });
    return args;
})();

console.log(argv);

// Create a new express app instance
const app: express.Application = express();

// @ts-ignore
const basePath = argv['path'];

async function print(path: string) {
    const dir = await fs.promises.opendir(path);
    for await (const dirent of dir) {
        if (dirent.isDirectory()) {
            await print(`${path}/${dirent.name}`);
        } else {
            handleFile(path, dirent);
        }
    }
}

print(basePath).catch(console.error);

async function loadModule(moduleName: string) {
    return await import(moduleName);
}

app.listen(3000, function () {
    console.log('App is listening on port 3000!');
});

function handleFile(path: string, dirent: fs.Dirent) {
    console.log('File name: ' + dirent.name);
    if (dirent.name.startsWith('get')) {
        handleGetRequest(path, dirent);
    }
}

function addEndpoint(endpoint: string, model: any) {
    app.get(endpoint, function (req, res) {
        res.send(model.data)
    });
}

function handleGetRequest(path: string, dirent: fs.Dirent) {
    console.log('Adding GET request');
    const endpoint = convertFileNameToEndpoint(path, dirent);
    console.log('Endpoint: ' + endpoint);
    loadModule(`../${path}/${dirent.name}`)
        .then(model => addEndpoint(endpoint, model))
        .catch(err => console.error(err));
}

function convertFileNameToEndpoint(path: string, dirent: fs.Dirent): string {
    let endpoint = `${path.replace(basePath, '')}/${dirent.name}`;
    endpoint = endpoint.replace('.ts', '');
    endpoint = endpoint.replace('get', '');
    if (endpoint !== '') {
        endpoint = endpoint.replace('-', '');
    }
    return endpoint;
}
