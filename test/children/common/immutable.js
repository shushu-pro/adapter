export default function ({ adapter, data }, { tests, test, assert }) {
  tests('数据转化不影响原始数据', () => {
    const data = {
      data: {
        value1: 1,
        value2: 2,
      },
    }
    const nextData = adapter({
      data: {
        $key: 'data2',
        value1: String,
        value2: Boolean,
      },
    }, data)

    test('数据转化不影响原始数据', () => {
      assert.isEqual(nextData, {
        data2: {
          value1: '1',
          value2: true,
        },
      })
      assert.isEqual(data, {
        data: {
          value1: 1,
          value2: 2,
        },
      })
    })
  })
}
