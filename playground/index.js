import adapter from '../src/'
import value from '../test/children/command/value'


const transform = adapter({
  price: String,
})

// const nextData = transform({
//   price: 1.11,
// })
const date = new Date()
const data = {
  value: 1,
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
}

adapter.addFormat('increase', (value, ctx, num = 1) => { // 一个累加器，可以给一个值进行累加操作
  return value + Number(num)
})
adapter.addFormat('toArray', (value, ctx, token = ',') => { // 转换数组
  return value.split(token)
})

const nextData = adapter({ // 传递多条指令，就像管道函数一样，前面的结果作为后面的输入
  value: {
    $format: [
      'increase:1',
      'increase:-2',
      'increase:1234',
      String,
      'toArray:',
      (arr) => arr.map(Number),
    ],
  },
}, data)

console.info(nextData, { value: [ '1', '2', '3', '4' ] })
