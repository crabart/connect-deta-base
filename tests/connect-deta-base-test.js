const session = require('express-session');
const FakeDetaBaseClient = require('../test_lib/fake-deta-base-client');
const ConnectDetaBase = require('../')(session);
const client = new FakeDetaBaseClient();
const SetupUtil = require('../test_lib/setup-util');

beforeEach(async () => {
  client.savedData.splice(0);
  client.needThrowError = false;
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
          const { __expire, ...item } = items[0];
          expect(item).toEqual({
            key: 'sess:hoge',
            sessionData: {
              cookie: { param1: 'hoge', param2: 100 },
              message: 'this is message',
            },
          });
          expect(__expire).toBeDefined();
        }

        {
          const { __expire, ...item } = items[1];
          expect(item).toEqual({
            key: 'sess:foo',
            sessionData: {
              cookie: { param1: 'foo', param2: 3000 },
              other: 'other',
            },
          });
          expect(__expire).toBeDefined();
        }

        {
          const { __expire, ...item } = items[2];
          expect(item).toEqual({
            key: 'sess:bar',
            sessionData: {
              cookie: { param1: 'barbar', param2: 5500 },
              num: 111,
            },
          });
          expect(__expire).toBeDefined();
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
