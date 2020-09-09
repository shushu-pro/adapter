import adapter from '../src/'
import value from '../test/children/command/value'


const transform = adapter({
  price: String,
})

// const nextData = transform({
//   price: 1.11,
// })
const date = new Date()
const data2 = {
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

const data = {
  name: '张三',
}
const nextData = adapter({
  $increase: {
    $key: 'data1',
    $increase: {
      $key: 'data2',
      name: true,
    },
    name: true,
  },
  name: true,
}, data)


console.info(nextData)
