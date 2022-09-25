const session = require('express-session');
const FakeDetaBaseClient = require('../test_lib/fake-deta-base-client');
const ConnectDetaBase = require('../')(session);
const client = new FakeDetaBaseClient();
const SetupUtil = require('../test_lib/setup-util');

beforeEach(async () => {
  client.savedData.splice(0);
  client.needThrowError = false;
  client.limit = 1000;
  const option = { client: client };
  await SetupUtil.setupDefaultSessions(new ConnectDetaBase(option));
});

describe('constructor', () => {
  test('no client', () => {
    expect(() => new ConnectDetaBase()).toThrow(Error);
  });

  test('default and client', () => {
    const option = { client: client };
    const store = new ConnectDetaBase(option);

    expect(store.prefix).toBe('sess:');
    expect(store.ttl).toBe(86400);
    expect(store.enableTTL).toBe(true);
    expect(store.enableTouch).toBe(true);
  });

  test('set options', () => {
    const option = {
      prefix: 'prefix',
      client: client,
      ttl: 1000,
      enableTTL: false,
      enableTouch: false,
    };
    const store = new ConnectDetaBase(option);

    expect(store.prefix).toBe('prefix');
    expect(store.ttl).toBe(1000);
    expect(store.enableTTL).toBe(false);
    expect(store.enableTouch).toBe(false);
  });

  test('set only enable TTL', () => {
    const option = {
      client: client,
      enableTTL: false,
    };
    const store = new ConnectDetaBase(option);

    expect(store.prefix).toBe('sess:');
    expect(store.ttl).toBe(86400);
    expect(store.enableTTL).toBe(false);
    expect(store.enableTouch).toBe(true);
  });
});

describe('all', () => {
  let store;
  beforeEach(async () => {
    const option = { client: client };
    store = new ConnectDetaBase(option);
  });

  test('default', (done) => {
    const cb = (error, items) => {
      try {
        expect(error).toBeNull();
        expect(items.length).toBe(3);
        {
          const { __expires: __expires, ...item } = items[0];
          expect(item).toEqual({
            key: 'sess:hoge',
            sessionData: {
              cookie: { param1: 'hoge', param2: 100 },
              message: 'this is message',
            },
          });
          expect(__expires).toBeDefined();
        }

        {
          const { __expires, ...item } = items[1];
          expect(item).toEqual({
            key: 'sess:foo',
            sessionData: {
              cookie: { param1: 'foo', param2: 3000 },
              other: 'other',
            },
          });
          expect(__expires).toBeDefined();
        }

        {
          const { __expires, ...item } = items[2];
          expect(item).toEqual({
            key: 'sess:bar',
            sessionData: {
              cookie: { param1: 'barbar', param2: 5500 },
              num: 111,
            },
          });
          expect(__expires).toBeDefined();
        }

        done();
      } catch (error) {
        done(error);
      }
    };

    store.all(cb);
  });

  test('error', (done) => {
    client.needThrowError = true;

    const cb = (error) => {
      try {
        expect(error).toBeDefined();
        done();
      } catch (error) {
        done(error);
      }
    };
    store.all(cb);
  });
});

describe('clear', () => {
  let store;
  beforeEach(async () => {
    const option = { client: client };
    store = new ConnectDetaBase(option);
  });

  test('default', (done) => {
    const cb = () => {
      try {
        const filterd = client.savedData.filter((it) =>
          it.key.startsWith(store.prefix)
        );
        expect(filterd.length).toBe(0);
        done();
      } catch (error) {
        done(error);
      }
    };
    store.clear(cb);
  });

  test('limit', (done) => {
    client.limit = 2;
    const cb = () => {
      try {
        const filterd = client.savedData.filter((it) =>
          it.key.startsWith(store.prefix)
        );
        expect(filterd.length).toBe(0);
        done();
      } catch (error) {
        done(error);
      }
    };
    store.clear(cb);
  });

  test('error', (done) => {
    client.needThrowError = true;
    const cb = (error) => {
      try {
        expect(error).toBeDefined();
        done();
      } catch (error) {
        done(error);
      }
    };
    store.clear(cb);
  });
});

describe('destroy', () => {
  let store;
  beforeEach(async () => {
    const option = { client: client };
    store = new ConnectDetaBase(option);
  });

  test('exist session', (done) => {
    const index = client.savedData.findIndex((it) =>
      it.key.startsWith(store.prefix + 'hoge')
    );

    expect(index).not.toBe(-1);

    const beforeLength = client.savedData.length;

    const cb = (error) => {
      try {
        expect(error).toBeNull();
        const index = client.savedData.findIndex((it) =>
          it.key.startsWith(store.prefix + 'hoge')
        );
        expect(index).toBe(-1);
        expect(client.savedData.length).toBe(beforeLength - 1);
        done();
      } catch (error) {
        done(error);
      }
    };
    store.destroy('hoge', cb);
  });

  test('not exist session', (done) => {
    const beforeLength = client.savedData.length;

    const cb = (error) => {
      try {
        expect(error).toBeNull();
        expect(client.savedData.length).toBe(beforeLength);
        done();
      } catch (error) {
        done(error);
      }
    };
    store.destroy('no_session', cb);
  });

  test('error', (done) => {
    client.needThrowError = true;
    const cb = (error) => {
      try {
        expect(error).toBeDefined();
        done();
      } catch (error) {
        done(error);
      }
    };
    store.destroy('hoge', cb);
  });
});

describe('get', () => {
  let store;
  beforeEach(async () => {
    const option = { client: client };
    store = new ConnectDetaBase(option);
  });

  test('exist session', (done) => {
    const cb = (error, session) => {
      try {
        expect(error).toBeNull();
        expect(session).toEqual({
          cookie: { param1: 'hoge', param2: 100 },
          message: 'this is message',
        });
        done();
      } catch (error) {
        done(error);
      }
    };
    store.get('hoge', cb);
  });

  test('not exist session', (done) => {
    const cb = (error, session) => {
      try {
        expect(error).toBeUndefined();
        expect(session).toBeUndefined();
        done();
      } catch (error) {
        done(error);
      }
    };
    store.get('no_session', cb);
  });

  test('error', (done) => {
    client.needThrowError = true;
    const cb = (error) => {
      try {
        expect(error).toBeDefined();
        done();
      } catch (error) {
        done(error);
      }
    };
    store.get('hoge', cb);
  });
});

describe('set', () => {
  let store;
  beforeEach(async () => {
    const option = { client: client };
    store = new ConnectDetaBase(option);
  });

  test('disable TTL', (done) => {
    store.enableTTL = false;
    const expires = new Date(Date.now() + 60 * 1000).toISOString();

    const cb = (error) => {
      try {
        expect(error).toBeDefined();
        const dat = client.savedData.find(
          (it) => it.key === store.prefix + 'new_session'
        );
        expect(dat).toEqual({
          key: store.prefix + 'new_session',
          sessionData: {
            cookie: { param1: 'hoge', param2: 100, expires: expires },
            message: 'this is message',
          },
        });

        done();
      } catch (error) {
        done(error);
      }
    };

    store.set(
      'new_session',
      {
        cookie: { param1: 'hoge', param2: 100, expires: expires },
        message: 'this is message',
      },
      cb
    );
  });

  test('expires exist', (done) => {
    const expires = new Date(Date.now() + 60 * 1000).toISOString();

    const cb = (error) => {
      try {
        expect(error).toBeDefined();
        const dat = client.savedData.find(
          (it) => it.key === store.prefix + 'new_session'
        );
        expect(dat).toEqual({
          key: store.prefix + 'new_session',
          sessionData: {
            cookie: { param1: 'hoge', param2: 100, expires: expires },
            message: 'this is message',
          },
          __expires: Math.round(new Date(expires).getTime() / 1000),
        });

        done();
      } catch (error) {
        done(error);
      }
    };

    store.set(
      'new_session',
      {
        cookie: { param1: 'hoge', param2: 100, expires: expires },
        message: 'this is message',
      },
      cb
    );
  });

  test('expires not exist', (done) => {
    const execTime = new Date();

    const cb = (error) => {
      try {
        expect(error).toBeDefined();
        const dat = client.savedData.find(
          (it) => it.key === store.prefix + 'new_session'
        );
        expect(dat.key).toBe(store.prefix + 'new_session');
        expect(dat.sessionData).toEqual({
          cookie: { param1: 'hoge', param2: 100 },
          message: 'this is message',
        });
        expect(dat.__expires).toBeLessThanOrEqual(
          execTime.getTime() / 1000 + store.ttl + 5
        );
        expect(dat.__expires).toBeGreaterThanOrEqual(
          execTime.getTime() / 1000 + store.ttl - 5
        );

        done();
      } catch (error) {
        done(error);
      }
    };

    store.set(
      'new_session',
      {
        cookie: { param1: 'hoge', param2: 100 },
        message: 'this is message',
      },
      cb
    );
  });

  test('error', (done) => {
    client.needThrowError = true;
    const cb = (error) => {
      try {
        expect(error).toBeDefined();
        done();
      } catch (error) {
        done(error);
      }
    };
    store.set(
      'new_session',
      {
        cookie: { param1: 'hoge', param2: 100 },
        message: 'this is message',
      },
      cb
    );
  });
});

describe('length', () => {
  let store;
  beforeEach(async () => {
    const option = { client: client };
    store = new ConnectDetaBase(option);
  });

  test('default', (done) => {
    const cb = (error, count) => {
      try {
        expect(error).toBeNull();
        expect(count).toBe(3);
        done();
      } catch (error) {
        done(error);
      }
    };
    store.length(cb);
  });

  test('error', (done) => {
    client.needThrowError = true;
    const cb = (error, count) => {
      try {
        expect(error).toBeDefined();
        expect(count).toBeUndefined();
        done();
      } catch (error) {
        done(error);
      }
    };
    store.length(cb);
  });
});

describe('touch', () => {
  let store;
  beforeEach(async () => {
    const option = { client: client };
    store = new ConnectDetaBase(option);
  });

  test('disable touch', (done) => {
    store.enableTouch = false;

    const new_session = {
      cookie: { param1: 'change', param2: 200 },
      message: 'message changed',
    };

    const before = {
      ...client.savedData.find((it) => it.key === store.prefix + 'hoge'),
    };

    const cb = (error) => {
      try {
        expect(error).toBeNull();
        const after = client.savedData.find(
          (it) => it.key === store.prefix + 'hoge'
        );
        expect(after).toEqual(before);
        done();
      } catch (error) {
        done(error);
      }
    };

    store.touch('hoge', new_session, cb);
  });

  test('disable ttl', (done) => {
    store.enableTTL = false;

    const new_session = {
      cookie: { param1: 'change', param2: 200 },
      message: 'message changed',
    };

    const before = {
      ...client.savedData.find((it) => it.key === store.prefix + 'hoge'),
    };

    const cb = (error) => {
      try {
        expect(error).toBeNull();
        const after = client.savedData.find(
          (it) => it.key === store.prefix + 'hoge'
        );
        expect(after).toEqual(before);
        done();
      } catch (error) {
        done(error);
      }
    };

    store.touch('hoge', new_session, cb);
  });

  test('enable touch with no expire', (done) => {
    const execTime = new Date();

    const new_session = {
      cookie: { param1: 'change', param2: 200 },
      message: 'message changed',
    };

    const before = {
      ...client.savedData.find((it) => it.key === store.prefix + 'hoge'),
    };

    setTimeout(() => {
      const cb = (error) => {
        try {
          expect(error).toBeNull();
          const after = client.savedData.find(
            (it) => it.key === store.prefix + 'hoge'
          );
          expect(after.sessionData).toEqual(new_session);
          expect(after.__expires).not.toBe(before.__expires);

          expect(after.__expires).toBeLessThanOrEqual(
            execTime.getTime() / 1000 + store.ttl + 5
          );
          expect(after.__expires).toBeGreaterThanOrEqual(
            execTime.getTime() / 1000 + store.ttl - 5
          );
          done();
        } catch (error) {
          done(error);
        }
      };

      store.touch('hoge', new_session, cb);
    }, 1000);
  });
  test('enable touch with expire', (done) => {
    const expires = new Date(Date.now() + 600 * 1000).toISOString();

    const new_session = {
      cookie: { param1: 'change', param2: 200, expires: expires },
      message: 'message changed',
    };

    const cb = (error) => {
      try {
        expect(error).toBeNull();
        const after = client.savedData.find(
          (it) => it.key === store.prefix + 'hoge'
        );
        expect(after.sessionData).toEqual(new_session);
        expect(after.__expires).toBe(
          Math.round(new Date(expires).getTime() / 1000)
        );

        done();
      } catch (error) {
        done(error);
      }
    };

    store.touch('hoge', new_session, cb);
  });
});
