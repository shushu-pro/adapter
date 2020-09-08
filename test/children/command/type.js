export default function ({ adapter, data }, { tests, test, assert }) {
  tests('数据类型转化指令：$type', () => {
    test('单值型配置；数字转字符串', () => {
      const nextData = adapter({ price: String }, data)
      assert.isBe(nextData.price, '1.11')
    })

    test('对象型配置；数字转字符串', () => {
      const nextData = adapter({ price: { $type: String } }, data)
      assert.isBe(nextData.price, '1.11')
    })

    test('字符串型配置；数字转字符', () => {
      const nextData = adapter({ price: 'type:String' }, data)
      assert.isBe(nextData.price, '1.11')
    })

    test('单值型配置；数字转布尔值', () => {
      const nextData = adapter({ status: Boolean, type: Boolean }, data)
      assert.isTrue(nextData.status)
      assert.isFalse(nextData.type)
    })

    test('单值型配置；字符串转布尔值', () => {
      const nextData = adapter({ name: Boolean, emptyString: Boolean }, data)
      assert.isTrue(nextData.name)
      assert.isFalse(nextData.emptyString)
    })

    test('单值型配置；时间戳转时间', () => {
      const nextData = adapter({ timestamp: Date, time: Number }, data)
      assert.isTrue(nextData.timestamp instanceof Date)
      assert.isBe(nextData.time, data.timestamp)
    })
  })
}
