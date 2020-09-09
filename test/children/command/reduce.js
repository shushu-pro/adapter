export default function ({ adapter, now }, { tests, test, assert }) {
  tests('层级减少指令：$reduce', () => {
    const data = {
      data1: {
        data2: {
          name: '张三',
          age: 1,
        },
      },
    }

    test('单层层级减少', () => {
      const nextData = adapter({
        data1: {
          $reduce: true,
          data2: true,
        },
      }, data)
      assert.isEqual(nextData, {
        data2: {
          name: '张三',
          age: 1,
        },
      })
    })

    test('多层层级减少', () => {
      const nextData = adapter({
        data1: {
          $reduce: true,
          data2: {
            $reduce: true,
            name: true,
            age: Boolean,
          },
        },
      }, data)

      assert.isEqual(nextData, {
        name: '张三',
        age: true,
      })
    })

    test('带默认值的层级减少', () => {
      const data = {
        data: null,
      }
      const nextData = adapter({
        data: {
          $reduce: true,
          $default: () => ({ a: 1 }),
        },
      }, data)
      assert.isEqual(nextData, {
        a: 1,
      })
    })
  })
}
