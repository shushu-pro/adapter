export default function ({ adapter, data }, { tests, test, assert }) {
  tests('键名变更指令：$key', () => {
    test('字符串类型直接改变键名', () => {
      const nextData = adapter(
        {
          name: 'user',
        },
        data
      );
      assert.isEqual(nextData, {
        user: '张三',
      });
    });

    test('对象配置模式改键名', () => {
      const nextData = adapter(
        {
          name: { $key: 'user' },
        },
        data
      );
      assert.isEqual(nextData, {
        user: '张三',
      });
    });

    test('对象配置模式函数类型改键名', () => {
      const nextData = adapter(
        {
          name: {
            $key: (value) => 'user',
          },
        },
        data
      );
      assert.isEqual(nextData, {
        user: '张三',
      });
    });

    test('同时修改键名和值', () => {
      const nextData = adapter(
        {
          type: {
            $key: (value) => value,
            $value: (value, { row }) => row.value,
          },
        },
        {
          type: 'ok',
          value: '88',
        }
      );
      assert.isEqual(nextData, {
        ok: '88',
      });
    });
  });
}
