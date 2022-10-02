import {
  DetaType,
  CompositeType,
  ObjectType,
  ArrayType,
  BasicType,
} from 'deta/dist/types/types/basic';
import {
  PutOptions,
  FetchOptions,
  UpdateOptions,
  InsertOptions,
  PutManyOptions,
} from 'deta/dist/types/types/base/request';
import {
  GetResponse,
  PutResponse,
  FetchResponse,
  DeleteResponse,
  InsertResponse,
  UpdateResponse,
  PutManyResponse,
} from 'deta/dist/types/types/base/response';
import { Prefix, SaveData } from './types/utilTypes';
import { Client } from 'connect-deta-base';
import { DummyBaseUtils } from './types/utilTypes';

declare type RecieveData = {
  sessionData: object;
};

// @ts ignore
export default class FakeDetaBaseClient implements Client {
  public util: DummyBaseUtils;
  savedData: Array<SaveData> = [];
  needThrowError = false;
  limit = 1000;

  constructor() {
    //super('', 0, '', '');
    // this._requests = new Requests('', 0, '');
    this.util = new DummyBaseUtils();
  }

  fetch(query?: CompositeType, options?: FetchOptions): Promise<FetchResponse> {
    return new Promise((resolve, reject) => {
      try {
        if (this.needThrowError) {
          throw Error('Unauthorized');
        }

        let retData: FetchResponse = { count: 0, items: [], last: undefined };

        if (query) {
          const a: Prefix = query as Prefix;

          const { 'key?pfx': prefix } = a;

          if (prefix) {
            const items = this.savedData.filter((it) =>
              it.key.startsWith(prefix)
            );
            retData.items = items;

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

  _limitItems(retData: FetchResponse) {
    const spliced = retData.items.splice(this.limit);
    if (spliced.length > 0) {
      const items: SaveData[] = retData.items as SaveData[];
      retData.last = items[retData.items.length - 1].key;
    }
  }

  delete(key: string): Promise<DeleteResponse> {
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

  get(key: string): Promise<GetResponse> {
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

  put(
    data: DetaType,
    key?: string,
    options?: PutOptions
  ): Promise<PutResponse> {
    return new Promise((resolve, reject) => {
      try {
        if (this.needThrowError) {
          throw Error('Unauthorized');
        }

        const isExpireIn = options && options.expireIn && true;
        const isExpireAt = options && options.expireAt && true;

        if (isExpireIn && isExpireAt) {
          throw Error("can't set both expireIn and expireAt options");
        }

        let expireTime;

        if (options && options.expireIn) {
          expireTime = isExpireIn && Date.now() + options.expireIn * 1000;
        } else if (options && options.expireAt) {
          const date = new Date(options.expireAt);
          expireTime = Math.round(date.getTime() / 1000);
        }

        const sessionData = JSON.stringify((data as RecieveData).sessionData);

        const hoge: SaveData = {
          key: key as string,
          sessionData: JSON.parse(sessionData),
        };
        const saveData: SaveData =
          isExpireIn || isExpireAt
            ? {
                key: key as string,
                sessionData: JSON.parse(sessionData),
                __expires: expireTime,
              }
            : { key: key as string, sessionData: JSON.parse(sessionData) };

        const index = this.savedData.findIndex((element) => {
          return element.key === key;
        });

        if (index === -1) {
          this.savedData.push(saveData);
        } else {
          this.savedData[index] = saveData;
        }

        resolve(saveData);
      } catch (error) {
        reject(error);
      }
    });
  }

  insert(
    data: DetaType,
    key?: string,
    options?: InsertOptions
  ): Promise<InsertResponse> {
    return new Promise((resolve, reject) => {});
  }

  putMany(
    items: DetaType[],
    options?: PutManyOptions
  ): Promise<PutManyResponse> {
    return new Promise((resolve, reject) => {});
  }

  update(
    updates: ObjectType,
    key: string,
    options?: UpdateOptions
  ): Promise<UpdateResponse> {
    return new Promise((resolve, reject) => {});
  }
}
module.exports = FakeDetaBaseClient;
