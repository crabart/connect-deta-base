const session = require('express-session');
const FakeDetaBaseClient = require('../test_lib/fake-deta-base-client');
const ConnectDetaBase = require('../')(session);
const client = new FakeDetaBaseClient();

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
