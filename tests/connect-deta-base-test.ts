import { describe, expect, test, beforeEach } from '@jest/globals';
import session, { SessionData } from 'express-session';
import FakeDetaBaseClient from '../test_lib/client/fake-deta-base-client';
import ConnectDetaBase, { DetaBaseStore } from 'connect-deta-base';
const cdb = ConnectDetaBase(session);
const client = new FakeDetaBaseClient();
const SetupUtil = require('../test_lib/setup-util');

declare module 'express-session' {
  interface SessionData {
    __expires?: number;
  }
}

beforeEach(async () => {
  client.savedData.splice(0);
  client.needThrowError = false;
  client.limit = 1000;
  const option = { client: client };
  await SetupUtil.setupDefaultSessions(new cdb(option));
});
describe('constructor', () => {
  test('hoge', () => {
    expect(1).toBe(1);
  });

  test('default and client', () => {
    const option = { client: client };
    const store = new cdb(option);

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
    const store = new cdb(option);

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
    const store = new cdb(option);

    expect(store.prefix).toBe('sess:');
    expect(store.ttl).toBe(86400);
    expect(store.enableTTL).toBe(false);
    expect(store.enableTouch).toBe(true);
  });
});

describe('all', () => {
  const option = { client: client };

  let store: DetaBaseStore = new cdb(option);
  beforeEach(async () => {
    const option = { client: client };
    store = new cdb(option);
  });

  test('default', (done) => {
    const cb = (
      err: any,
      obj: SessionData[] | { [sid: string]: SessionData } | null | undefined
    ) => {
      try {
        const items = obj as SessionData[];
        expect(err).toBeNull();
        expect(obj?.length).toBe(3);
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

    store.all ? store.all(cb) : {};
  });

  test('error', (done) => {
    client.needThrowError = true;

    const cb = (error: any) => {
      try {
        expect(error).toBe('Unauthorized');
        done();
      } catch (error) {
        done(error);
      }
    };
    store.all ? store.all(cb) : {};
  });
});
