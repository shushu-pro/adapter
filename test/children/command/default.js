export default function ({ adapter, data }, { tests, test, assert }) {
  tests('默认值指令：$default', () => {
    const data = {
      userName: '张三',
      books: [
        { name: '水浒传', price: null, contents: null },
        { name: null, price: null, contents: [ '这是一本天书', '无人能够练成' ] },
      ],
    }
    test('字符串型配置；值模式默认值', () => {
      const nextData = adapter({
        books: {
          name: 'default:武林秘籍残本',
        },
      }, data)
      assert.isEqual(nextData.books, [
        { name: '水浒传' },
        { name: '武林秘籍残本' },
      ])
    })
    test('对象型配置；函数模式默认值', () => {
      const nextData = adapter({
        books: {
          price: () => '100.00元',
        },
      }, data)

      expect(nextData.books).toEqual([
        { price: '100.00元' },
        { price: '100.00元' },
      ])
    })
    test('单值型配置；类型模式默认值', () => {
      const nextData = adapter({
        books: {
          contents: {
            $default: Array,
          },
        },
      }, data)

      assert.isEqual(nextData.books, [
        { contents: [] },
        { contents: [ '这是一本天书', '无人能够练成' ] },
      ])
    })
  })
}
