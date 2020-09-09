// document
// https://github.com/sschen86/ijest

import ijest from 'ijest'
import adapter from '../src'

import testDefault from './children/command/default'
import testType from './children/command/type'
import testEnum from './children/command/enum'
import testEmap from './children/command/emap'
import testValue from './children/command/value'
import testFormat from './children/command/format'
import strict from './children/command/strict'
import clears from './children/command/clears'
import increase from './children/command/increase'
import reduce from './children/command/reduce'


import immutable from './children/common/immutable'
import multiLevels from './children/common/multi-levels'
import multiRules from './children/common/multi-rules'
import context from './children/common/context'
import normal from './children/example/normal'

const date = new Date()

ijest({
  // 上下文环境
  context: {
    adapter,
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

  // 测试开始前运行
  before (context) {
    // 初始化一些东西
  },

  // 测试结束后运行
  after (context) {
    // 清理东西
  },

  // 所有测试用例
  tests: {
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
    immutable,
    multiLevels,
    multiRules,
    context,
    normal,

  },

  // 自定义断言
  asserts: {
    // 定义来一个判断值是否是长度为2的字符串断言，可以在测试中使用
    isString2 (value) {
      expect(typeof value).toBe('string')
      expect(value.length).toBe(2)
    },
  },
})
