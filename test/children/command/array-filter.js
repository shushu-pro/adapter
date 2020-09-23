export default function ({ adapter }, { tests, test, assert }) {
  tests('数组过滤指令：$filter', () => {
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

    test('$filter正常触发', () => {
      const nextData = adapter({
        list: {
          $filter: (value) => value.id % 2 === 0 || value.value === 5,
          id: {
            $key: 'name',
            $type: String,
          },
        },
      }, data)

      assert.isEqual(nextData, {
        list: [
          { name: '2' },
          { name: '4' },
          { name: '5' },
          { name: '6' },
        ],
      })
    })

    test('$filter被丢弃', () => {
      const nextData = adapter({
        list: {
          $filter: (value) => value.id % 2 === 0 || value.value === 5,
          $value: (value) => value.length,
          id: {
            $key: 'name',
            $type: String,
          },
        },
      }, data)

      assert.isEqual(nextData, {
        list: 6,
      })
    })
  })
}
