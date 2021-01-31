export default function ({ adapter, data }, { tests, test, assert }) {
  tests('映射类型转化指令：$emap', () => {
    test('对象型配置；基础映射类型转化', () => {
      const nextData = adapter(
        { mapKey: { $emap: { hasReady: '已就绪', hasDestory: '已销毁' } } },
        data
      );
      assert.isBe(nextData.mapKey, '已就绪');
    });

    test('字符串型配置；基础映射类型转化', () => {
      const nextData = adapter(
        { mapKey: 'emap:hasReady:已就绪,hasDestory:已销毁' },
        data
      );
      assert.isBe(nextData.mapKey, '已就绪');
    });
  });
}
