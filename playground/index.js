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
  list: [
    { id: 1, value: 1 },
    { id: 2, value: 2 },
    { id: 3, value: 3 },
    { id: 4, value: 4 },
    { id: 5, value: 5 },
    { id: 6, value: 6 },
  ],
}
const nextData = adapter({
  list: {
    $filter: (value) => value.id % 2 === 0 || value.value === 5,
    id: {
      $key: 'name',
      $type: String,
    },
  },
}, data)


console.info(nextData)
