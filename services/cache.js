const mongoose = require('mongoose');

const redis = require('redis');
const client = redis.createClient('//127.0.0.1:6379');
const util = require('util');
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this;
}

mongoose.Query.prototype.exec = async function () {
    console.log('Im about to run a query');
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    /* console.log(this.getQuery());
    console.log(this.mongooseCollection.name); */
    const key = JSON.stringify(Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name }));

    const cachedValue = await client.hget(this.hashKey, key);
    if (cachedValue) {
        const doc = JSON.parse(cachedValue);
        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc);
    }
    const result = await exec.apply(this, arguments);
    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
    return result;
};

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey || ''));
    }
}