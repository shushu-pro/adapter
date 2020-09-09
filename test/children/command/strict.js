export default function ({ adapter, now }, { tests, test, assert }) {
  tests('严格模式指令：$strict', () => {
    const data = {
      data1: {
        data: {
          c: [
            { a: 1 },
            { a: 1 },
          ],
          b: '1.00',
        },
        value: now,
      },
      data2: {
        value1: 1,
        value2: 2,
      },
      value: 3,
    }
    test('默认strict模式适配', () => {
      const nextData = adapter({
        data1: {
          data: {
            c: {
              a: 'xxx',
            },
          },
        },
      }, data)
      assert.isEqual(nextData, {
        data1: {
          data: {
            c: [
              { xxx: 1 },
              { xxx: 1 },
            ],
          },
        },
      })
    })
    test('关闭stricr模式适配', () => {
      const nextData = adapter({
        $strict: false,
        data1: {
          data: {
            c: {
              a: 'xxx',
            },

          },
        },
      }, data)
      assert.isEqual(nextData, {
        data1: {
          data: {
            c: [
              { xxx: 1 },
              { xxx: 1 },
            ],
            b: '1.00',
          },
          value: now,
        },
        data2: {
          value1: 1,
          value2: 2,
        },
        value: 3,
      })
    })
  })
}
