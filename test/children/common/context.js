export default function ({ adapter, data }, { tests, test, assert }) {
  tests('运行环境变量测试', () => {
    const data = {
      type: 1,
      list: [
        {
          name: '张三',
          books: [
            { name: '水浒传' },
            { name: '西游记' },
          ],
        },
        {
          name: '李四',
          books: [
            { name: '三国演义' },
            { name: '红楼梦' },

          ],
        },
      ],
    }
    test('读取环境变量：$value指令', () => {
      const nextData = adapter({
        list: {
          name: (value, { row, index, root }) => {
            return {
              value,
              row,
              index,
              root,
            }
          },
        },
      }, data)
      assert.isEqual(nextData, {
        list: [
          {
            name: {
              value: '张三',
              row: data.list[0],
              index: 0,
              root: data,
            },
          },
          {
            name: {
              value: '李四',
              row: data.list[1],
              index: 1,
              root: data,
            },
          },

        ],
      })
    })

    test('读取环境变量：$default指令', () => {
      const data = {
        type: 1,
        list: [
          { name: null, books: [ '水浒传', '西游记' ] },
        ],
      }
      const nextData = adapter({
        list: {
          name: {
            $default ({ root, index, row }) {
              return {
                type: root.type,
                index: index,
                books: row.books,
              }
            },
          },
        },
      }, data)

      assert.isEqual(nextData, {
        list: [
          {
            name: {
              type: data.type,
              index: 0,
              books: data.list[0].books,
            },
          },
        ],
      })
    })

    test('读取环境变量：$format指令 - 匿名', () => {
      const nextData = adapter({
        list: {
          name: {
            $format (value, { row, index, root }) {
              return {
                value,
                row,
                index,
                root,
              }
            },
          },
        },
      }, data)
      assert.isEqual(nextData, {
        list: [
          {
            name: {
              value: data.list[0].name,
              row: data.list[0],
              index: 0,
              root: data,
            },
          },
          {
            name: {
              value: data.list[1].name,
              row: data.list[1],
              index: 1,
              root: data,
            },
          },
        ],
      })
    })

    test('读取环境变量：$format指令 - 具名', () => {
      adapter.addFormat('testForRuntime', (value, { row, index, root }, arg1, arg2) => {
        return {
          value,
          row,
          index,
          root,
          arg1,
          arg2,
        }
      })
      const nextData = adapter({
        list: {
          name: {
            $format: [ { name: 'testForRuntime', args: [ 1, 2 ] } ],
          },
        },
      }, data)
      assert.isEqual(nextData, {
        list: [
          {
            name: {
              value: data.list[0].name,
              row: data.list[0],
              index: 0,
              root: data,
              arg1: 1,
              arg2: 2,
            },
          },
          {
            name: {
              value: data.list[1].name,
              row: data.list[1],
              index: 1,
              root: data,
              arg1: 1,
              arg2: 2,
            },
          },
        ],
      })
    })

    // test('读取环境变量：$increase.$value指令', () => {
    //   const nextData = adapter({
    //     list: {
    //       books: {
    //         $increase: {
    //           level1: {
    //             $value (value, runtime) {
    //               return {
    //                 value, runtime,
    //               }
    //             },
    //           },
    //         },
    //       },
    //     },
    //   }, data)

    //   assert.isEqual(nextData, {
    //     list: [ {
    //       books: [
    //         {
    //           level1: {
    //             value: data.list[0].books[0],
    //             runtime: {
    //               row: data.list[0].books,
    //               index: 0,
    //               root: data,
    //             },
    //           },
    //         },
    //         {
    //           level1: {
    //             value: data.list[0].books[1],
    //             runtime: {
    //               row: data.list[0].books,
    //               index: 1,
    //               root: data,
    //             },
    //           },
    //         },
    //       ],
    //     },
    //     {
    //       books: [
    //         {
    //           level1: {
    //             value: data.list[1].books[0],
    //             runtime: {
    //               row: data.list[1].books,
    //               index: 0,
    //               root: data,
    //             },
    //           },

    //         },
    //         {
    //           level1: {
    //             value: data.list[1].books[1],
    //             runtime: {
    //               row: data.list[1].books,
    //               index: 1,
    //               root: data,
    //             },
    //           },
    //         },
    //       ],

    //     } ],
    //   })
    // })

    // test('读取环境变量：$reduce内部$value指令', () => {
    //   const data = {
    //     level1: {
    //       books: [
    //         { info: { name: '西游记' } },
    //         { info: { name: '水浒传' } },
    //       ],
    //     },
    //   }
    //   const nextData = adapter({
    //     $reduce: {
    //       level1: {
    //         books: {
    //           $reduce: {
    //             info: {
    //               name: true,
    //             },
    //           },
    //         },

    //       },
    //     },
    //   }, data)

    //   assert.isEqual(nextData, {
    //     books: [ { name: '西游记' }, { name: '水浒传' } ],
    //   })
    // })
  })
}
