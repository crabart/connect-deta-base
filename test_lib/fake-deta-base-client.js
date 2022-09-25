class FakeDetaBaseClient {
  savedData = [];
  needThrowError = false;
  limit = 1000;

  constructor() {}

  fetch(query) {
    return new Promise((resolve, reject) => {
      try {
        if (this.needThrowError) {
          throw Error('Unauthorized');
        }

        let retData = { count: 0, items: [], last: undefined };

        if (query) {
          const { 'key?pfx': prefix } = query;

          if (prefix) {
            retData.items = this.savedData.filter((it) =>
              it.key.startsWith(prefix)
            );

            this._limitItems(retData);

            retData.count = retData.items.length;
          } else {
            retData.items = [...this.savedData];
            this._limitItems(retData);
            retData.count = retData.items.length;
          }
        } else {
          retData.items = [...this.savedData];
          this._limitItems(retData);
          retData.count = retData.items.length;
        }

        resolve(retData);
      } catch (error) {
        reject(error);
      }
    });
  }

  _limitItems(retData) {
    const spliced = retData.items.splice(this.limit);
    if (spliced.length > 0) {
      retData.last = retData.items[retData.items.length - 1];
    }
  }

  delete(key) {
    return new Promise((resolve, reject) => {
      try {
        if (this.needThrowError) {
          throw Error('Unauthorized');
        }

        this.savedData = this.savedData.filter((it) => it.key !== key);
        resolve(null);
      } catch (error) {
        reject(error);
      }
    });
  }

  get(key) {
    return new Promise((resolve, reject) => {
      try {
        if (this.needThrowError) {
          throw Error('Unauthorized');
        }

        const data = this.savedData.find((element) => element.key === key);

        resolve(data === undefined ? null : data);
      } catch (error) {
        reject(error);
      }
    });
  }

  put({ sessionData }, key, expire) {
    return new Promise((resolve, reject) => {
      try {
        if (this.needThrowError) {
          throw Error('Unauthorized');
        }

        const isExpireIn = expire && expire.expireIn && true;
        const isExpireAt = expire && expire.expireAt && true;

        if (isExpireIn && isExpireAt) {
          throw Error("can't set both expireIn and expireAt options");
        }

        let expireTime;

        if (isExpireIn) {
          expireTime = isExpireIn && Date.now() + expire.expireIn * 1000;
        } else if (isExpireAt) {
          expireTime = expire.expireAt;
        }

        const data =
          isExpireIn || isExpireAt
            ? {
                key: key,
                sessionData: { ...sessionData },
                __expires: expireTime,
              }
            : { key: key, sessionData: { ...sessionData } };

        const index = this.savedData.findIndex((element) => {
          return element.key === key;
        });

        if (index === -1) {
          this.savedData.push(data);
        } else {
          this.savedData[index] = data;
        }

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = FakeDetaBaseClient;
