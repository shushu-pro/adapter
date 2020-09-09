export default function ({ adapter, now }, { tests, test, assert }) {
  tests('层级增加指令：$increase', () => {
    const data = {
      name: '张三',
      age: 12,
      books: [
        { name: '水浒传', price: 12 },
        { name: '西游记', price: 12 },
      ],
    }

    test('增加单层层级', () => {
      const nextData = adapter({
        $increase: {
          $key: 'data1',
          name: true,
        },
      }, data)

      assert.isEqual(nextData, {
        data1: {
          name: '张三',
        },
      })
    })

    test('增加多层层级 - 逐层', () => {
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

      assert.isEqual(nextData, {
        name: '张三',
        data1: {
          name: '张三',
          data2: {
            name: '张三',
          },
        },
      })
    })

    test('增加多层层级 - $key数组模式', () => {
      const nextData = adapter({
        $increase: [
          {
            $key: [ 'a' ],
            name: true,
          },
          {
            $key: [ 'b', 'c' ],
            name: true,
          },
          {
            $key: [ 'c', 'a', 'b' ],
            name: true,
          },
        ],
      }, data)
      assert.isEqual(nextData, {
        a: { name: '张三' },
        b: { c: { name: '张三' } },
        c: { a: { b: { name: '张三' } } },
      })
    })

    test('增加多个层级', () => {
      const nextData = adapter({
        $increase: [
          {
            $key: 'data1',
            name: true,
          },
          {
            $key: 'data2',
            name: true,
          },
        ],
      }, data)

      assert.isEqual(nextData, {
        data1: {
          name: '张三',
        },
        data2: {
          name: '张三',
        },
      })
    })
  })
}
