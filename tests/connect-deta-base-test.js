const session = require('express-session');
const FakeDetaBaseClient = require('../test_lib/fake-deta-base-client');
const ConnectDetaBase = require('../')(session);
const client = new FakeDetaBaseClient();
const SetupDefaultSessions = require('../test_lib/setup-util');

beforeEach(async () => {
  client.savedData.splice(0);
  client.needThrowError = false;

  await SetupDefaultSessions(client);
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
          expect(items[1]).toEqual({
            key: 'sess:foo',
            sessionData: {
              cookie: { param1: 'foo', param2: 3000 },
              other: 'other',
            },
          });
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
