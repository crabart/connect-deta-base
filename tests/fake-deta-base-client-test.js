const FakeDetaBaseClient = require('../test_lib/fake-deta-base-client');
const client = new FakeDetaBaseClient();

const setupDefaultSessions = async () => {
  const retArray = [];
  retArray.push(
    client.put(
      {
        sessionData: {
          cookie: { param1: 'hoge', param2: 100 },
          message: 'this is message',
        },
      },
      'sess:hoge',
      { expireIn: 86400 }
    )
  );

  retArray.push(
    client.put(
      {
        sessionData: {
          cookie: { param1: 'foo', param2: 3000 },
          other: 'other',
        },
      },
      'sess:foo'
    )
  );

  retArray.push(
    client.put(
      {
        sessionData: {
          cookie: { param1: 'barbar', param2: 5500 },
          num: 111,
        },
      },
      'sess:bar',
      { expireIn: 86400 }
    )
  );

  retArray.push(
    client.put(
      {
        sessionData: {
          cookie: { param1: 'hoge', param2: 100 },
          message: 'this is message',
        },
      },
      'another:hoge',
      { expireIn: 86400 }
    )
  );

  Promise.all(retArray);
};

beforeEach(async () => {
  client.savedData.splice(0);
  client.needThrowError = false;

  await setupDefaultSessions();
});

describe('Fake Clinet put test', () => {
  test('once', async () => {
    const key = 'sess:new_ID';
    const sessionData = {
      cookie: { param1: 'hoge', param2: 100 },
      message: 'this is message',
    };
    const expire = { expireIn: 300 };

    const ret = await client.put({ sessionData: sessionData }, key, expire);

    const checkData = client.savedData.find((element) => {
      return element.key === key;
    });

    expect(ret.key).toBe(key);
    expect(ret.sessionData).toEqual(sessionData);
    expect(ret.__expire).toBeDefined();
    expect(checkData.key).toBe(key);
    expect(checkData.sessionData).toEqual(sessionData);
    expect(checkData.__expire).toBeDefined();
  });

  test('same id', async () => {
    const key = 'sess:hoge';
    const sessionData = {
      cookie: { param1: 'hoge', param2: 100 },
      message: 'this is message',
    };
    const expire = { expireIn: 300 };

    await client.put({ sessionData }, key, expire);
    const sessionData2 = { ...sessionData, message: 'changed message' };
    const ret = await client.put({ sessionData: sessionData2 }, key, expire);

    const checkData = client.savedData.find((element) => {
      return element.key === key;
    });

    expect(client.savedData.length).toBe(4);
    expect(ret.key).toBe(key);
    expect(ret.sessionData).toEqual(sessionData2);
    expect(ret.__expire).toBeDefined();
    expect(checkData.key).toBe(key);
    expect(checkData.sessionData).toEqual(sessionData2);
    expect(checkData.__expire).toBeDefined();
  });

  test('error', async () => {
    client.needThrowError = true;

    const key = 'sess:new_ID';
    const sessionData = {
      cookie: { param1: 'hoge', param2: 100 },
      message: 'this is message',
    };
    const expire = { expireIn: 300 };

    expect(
      client.put({ sessionData: sessionData }, key, expire)
    ).rejects.toThrow(Error);
  });
});

describe('Fake Clinet get test', () => {
  test('with expire', async () => {
    const key = 'sess:hoge';
    const ret = await client.get(key);

    expect(ret.key).toBe(key);
    expect(ret.sessionData).toEqual({
      cookie: { param1: 'hoge', param2: 100 },
      message: 'this is message',
    });
    expect(ret.__expire).toBeDefined();
  });

  test('with no expire', async () => {
    const key = 'sess:foo';
    const ret = await client.get(key);

    expect(ret.key).toBe(key);
    expect(ret.sessionData).toEqual({
      cookie: { param1: 'foo', param2: 3000 },
      other: 'other',
    });
    expect(ret.__expire).toBeUndefined();
  });

  test('wiht no key', async () => {
    const key = 'sess:no_key';
    const ret = await client.get(key);

    expect(ret).toBeNull();
  });

  test('error', async () => {
    client.needThrowError = true;
    const key = 'sess:foo';

    expect(client.get(key)).rejects.toThrow(Error);
  });
});

describe('Fake Clinet get test delete test', () => {
  test('exist data', async () => {
    const key = 'sess:hoge';
    const ret = await client.delete(key);

    const index = client.savedData.findIndex((it) => it.key === key);
    const len = client.savedData.length;

    expect(ret).toBeNull();
    expect(index).toBe(-1);
    expect(len).toBe(3);
  });

  test('not exist', async () => {
    const key = 'sess:no_key';
    const ret = await client.delete(key);

    const len = client.savedData.length;

    expect(ret).toBeNull();
    expect(len).toBe(4);
  });

  test('error', async () => {
    client.needThrowError = true;
    const key = 'sess:foo';

    expect(client.delete(key)).rejects.toThrow(Error);
  });
});

describe('Fake Clinet get test fetch test', () => {
  test('no query', async () => {
    const { count, items } = await client.fetch();

    // expect(last).toBeNull(); // TODO
    expect(count).toBe(4);
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

    {
      const { __expire, ...item } = items[3];
      expect(item).toEqual({
        key: 'another:hoge',
        sessionData: {
          cookie: { param1: 'hoge', param2: 100 },
          message: 'this is message',
        },
      });
      expect(__expire).toBeDefined();
    }
  });

  test('no prefix', async () => {
    const { count, items } = await client.fetch({ query: 'dummy' });

    // expect(last).toBeNull(); // TODO
    expect(count).toBe(4);
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

    {
      const { __expire, ...item } = items[3];
      expect(item).toEqual({
        key: 'another:hoge',
        sessionData: {
          cookie: { param1: 'hoge', param2: 100 },
          message: 'this is message',
        },
      });
      expect(__expire).toBeDefined();
    }
  });

  test('sess: prefix', async () => {
    const prefix = 'sess:';
    const { count, items } = await client.fetch({ 'key?pfx': prefix });

    // expect(last).toBeNull(); // TODO
    expect(count).toBe(3);
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
  });

  test('no date', async () => {
    const prefix = 'no_data';
    const { count, items } = await client.fetch({ 'key?pfx': prefix });

    expect(count).toBe(0);
    expect(items).toEqual([]);
  });

  test('error', async () => {
    client.needThrowError = true;

    expect(client.fetch()).rejects.toThrow(Error);
  });
});
