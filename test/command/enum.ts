export default function ({ adapter, data }, { tests, test, assert }) {
  tests('枚举类型转化指令：$enum', () => {
    test('对象型配置；基础枚举转化', () => {
      const nextData = adapter(
        { status: { $enum: ['中国', '美国', '日本', '英国'] } },
        data
      );
      assert.isBe(nextData.status, '日本');
    });
    test('字符串型配置；基础枚举转化', () => {
      const nextData = adapter({ status: 'enum:中国,美国,日本,英国' }, data);
      assert.isBe(nextData.status, '日本');
    });
  });
}
