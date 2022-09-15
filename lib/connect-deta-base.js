/*!
 * Connect - Deta - Base
 * Copyright(c) 2022 crabart
 * MIT Licensed
 */

module.exports = function (session) {
  const Store = session.Store;

  const default_callback = () => {};

  class DetaBaseStore extends Store {
    constructor(options = {}) {
      super(options);

      if (!options.client) {
        throw new Error('A client must be provided to the DetaBaseStore');
      }

      this.prefix = options.prefix == null ? 'sess:' : options.prefix;
      this.client = options.client;
      this.ttl = options.ttl || 86400;
      this.enableTTL = options.enableTTL || true;
      this.enableTouch = options.enableTouch || true;
    }

    async all(callback = default_callback) {
      try {
        const { items } = await this.client.fetch({ 'key?pfx': this.prefix });

        return callback(null, items);
      } catch (error) {
        return callback(error, []);
      }
    }

    async clear(callback = default_callback) {
      try {
        const { items } = await this.client.fetch({ 'key?pfx': this.prefix });
        const procs = items.map((item) => {
          this.client.delete(item.key);
        });

        await Promise.all(procs);

        return callback(null);
      } catch (error) {
        return callback(error);
      }
    }

    async destroy(sessionId, callback = default_callback) {
      try {
        await this.client.delete(this.prefix + sessionId);
        callback(null);
      } catch (error) {
        callback(error);
      }
    }

    get(sessionId, callback = default_callback) {}

    async set(sessionId, session, callback = default_callback) {
      try {
        const key = this.prefix + sessionId;
        const sessionData = [key];
        sessionData.push(JSON.stringify(session));

        const expire = this.enableTTL ? { expireIn: this.ttl } : {};

        await this.client.put({ sessionData: sessionData }, key, expire);

        callback(null);
      } catch (error) {
        callback(error);
      }
    }

    length(callback = default_callback) {}

    touch(sessionId, session, cbcallback = default_callback) {}
  }

  return DetaBaseStore;
};
