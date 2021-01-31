// document
// https://github.com/sschen86/ijest

import ijest from 'ijest';
import adapter, { Adapter } from '../src';

import testKey from './command/key';
import testDefault from './command/default';
import testType from './command/type';
import testEnum from './command/enum';
import testEmap from './command/emap';
import testValue from './command/value';
import testFormat from './command/format';
import strict from './command/strict';
import clears from './command/clears';
import increase from './command/increase';
import reduce from './command/reduce';
import deepKeys from './command/deep-keys';
import arrayFilter from './command/array-filter';

import immutable from './common/immutable';
import multiLevels from './common/multi-levels';
import multiRules from './common/multi-rules';
import context from './common/context';

import config from './method/config';

import normal from './example/normal';

const date = new Date();

ijest({
  // 上下文环境
  context: {
    adapter,
    Adapter,
    now: date,
    data: {
      price: 1.11,
      status: 2,
      type: 0,
      time: date,
      timestamp: +date,
      emptyString: '',
      name: '张三',
      nullKey: null,
      falseKey: false,
      mapKey: 'hasReady',
    },
  },
  // 所有测试用例
  tests: {
    testKey,
    default: testDefault,
    type: testType,
    enum: testEnum,
    emap: testEmap,
    value: testValue,
    format: testFormat,
    strict,
    clears,
    increase,
    reduce,
    deepKeys,
    arrayFilter,
    immutable,
    multiLevels,
    multiRules,
    context,
    config,
    normal,
  },
  asserts: {},
  before: null,
  after: null,
  actives: null,
});
