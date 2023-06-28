'use strict';

const AWS = require('aws-sdk');
const zlib = require('node:zlib');
const byline = require('byline');
const mongodb = require('mongodb');

const mongoUri = 'mongodb://root:root@localhost:27017/admin?directConnection=true';
const bucketName = 'demo-bucket';
const config = {
    credentials: {
        accessKeyId: 'root',
        secretAccessKey: 'root',
    },
    endpoint: 'http://localhost:4566',
    s3ForcePathStyle: true,
};

async function* fetchObjects(filename) {
    const s3 = new AWS.S3(config);
    const stream = s3
        .getObject({Bucket: bucketName, Key: filename})
        .createReadStream()
        .pipe(zlib.createGunzip())
        .pipe(new byline.LineStream());

    for await (const chunk of stream) {
        if (chunk instanceof Buffer)
            yield JSON.parse(chunk.toString());
    }
}

async function insert(client, arr) {
    return client
        .db('admin')
        .collection('demo')
        .insertMany(arr);
}

const filenames = ['example.jsonl.gz', 'example.json.gz'];

(async () => {
    const client = new mongodb.MongoClient(mongoUri);
    await client.connect();

    let arr = [];
    for await (const object of fetchObjects(filenames[1])) {
        arr.push(object);
        if (arr.length === 100) {
            await insert(client, arr);
            arr = [];
        }
    }

    if (arr.length) await insert(client, arr);

    await client.close();
})();
