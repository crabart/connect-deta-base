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
    }

    all(callback = default_callback) {}

    clear(callback = default_callback) {}

    destroy(sessionId, callback = default_callback) {}

    get(sessionId, callback = default_callback) {}

    set(sessionId, session, callback = default_callback) {}

    length(callback = default_callback) {}

    touch(sessionId, session, cbcallback = default_callback) {}
  }

  return DetaBaseStore;
};
