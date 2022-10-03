import { ObjectType, BasicType, ArrayType } from 'deta/dist/types/types/basic';

export declare type Prefix = { 'key?pfx': string };

export interface SaveData extends ObjectType {
  key: string;
  sessionData: ObjectType;
  __expires?: number;
}

export declare type ReturnData = {
  count: number;
  items: Array<SaveData>;
  last: SaveData | undefined;
};

enum ActionTypes {
  Set = 'set',
  Trim = 'trim',
  Increment = 'increment',
  Append = 'append',
  Prepend = 'prepend',
}

import { Deta, Base } from 'deta';
export type IBase = ReturnType<typeof Base>;

const deta = Deta('hoge');
const db = deta.Base('hoge');

type BaseUtils = typeof db.util;
type Action = ReturnType<typeof db.util.trim>;

export class DummyAction implements Action {
  public readonly operation: ActionTypes;

  public readonly value: any;

  constructor(action: ActionTypes, value?: any) {
    this.operation = action;
    this.value = value;
  }
}

export class DummyBaseUtils implements BaseUtils {
  public trim(): Action {
    return new DummyAction(ActionTypes.Trim);
  }

  public increment(value: number = 1): Action {
    return new DummyAction(ActionTypes.Increment, value);
  }

  public append(value: BasicType | ArrayType): Action {
    return new DummyAction(
      ActionTypes.Append,
      Array.isArray(value) ? value : [value]
    );
  }

  public prepend(value: BasicType | ArrayType): Action {
    return new DummyAction(
      ActionTypes.Prepend,
      Array.isArray(value) ? value : [value]
    );
  }
}
