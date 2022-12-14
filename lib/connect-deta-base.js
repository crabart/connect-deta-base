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

      this.prefix = options.prefix ?? 'sess:';
      this.client = options.client;
      this.ttl = options.ttl || 86400;
      this.enableTTL = options.enableTTL ?? true;
      this.enableTouch = options.enableTouch ?? true;
    }

    async all(callback = default_callback) {
      try {
        const { items } = await this.client.fetch({ 'key?pfx': this.prefix });

        return callback(null, items);
      } catch (error) {
        return callback(error.message, []);
      }
    }

    async clear(callback = default_callback) {
      try {
        let res = await this.client.fetch({
          'key?pfx': this.prefix,
        });
        const procs = res.items.map((item) => {
          this.client.delete(item.key);
        });

        await Promise.all(procs);

        while (res.last) {
          res = await this.client.fetch({
            'key?pfx': this.prefix,
          });
          const procs = res.items.map((item) => {
            this.client.delete(item.key);
          });

          await Promise.all(procs);
        }

        return callback(null);
      } catch (error) {
        return callback(error.message);
      }
    }

    async destroy(sessionId, callback = default_callback) {
      try {
        await this.client.delete(this.prefix + sessionId);
        callback(null);
      } catch (error) {
        callback(error.message);
      }
    }

    async get(sessionId, callback = default_callback) {
      try {
        const item = await this.client.get(this.prefix + sessionId);
        if (item == null) {
          callback();
          return;
        } else {
          const session = item.sessionData;
          callback(null, session);
        }
      } catch (error) {
        callback(error.message);
      }
    }

    async set(sessionId, session, callback = default_callback) {
      try {
        const key = this.prefix + sessionId;

        let expire;

        if (this.enableTTL) {
          expire = this._getExpires(session);
        }

        await this.client.put({ sessionData: session }, key, {
          expireAt: expire,
        });

        callback(null);
      } catch (error) {
        callback(error.message);
      }
    }

    async length(callback = default_callback) {
      try {
        const { count } = await this.client.fetch({ 'key?pfx': this.prefix });

        return callback(null, count);
      } catch (error) {
        return callback(error.message);
      }
    }

    async touch(sessionId, session, callback = default_callback) {
      if (!this.enableTouch || !this.enableTTL) return callback();
      const item = await this.client.get(this.prefix + sessionId);

      if (item === null) {
        callback();
      } else {
        await this.set(sessionId, session, callback);
      }
    }

    _getExpires(session) {
      let expires = new Date(Date.now() + this.ttl * 1000);
      if (session && session.cookie && session.cookie.expires) {
        expires = new Date(session.cookie.expires);
      }

      return expires;
    }
  }

  return DetaBaseStore;
};
