export default function ({ adapter }, { tests, test, assert }) {
  tests('赋值指令：$value', () => {
    const data = { name: '张三' };

    test('根下$value指令', () => {
      const nextData = adapter(
        {
          $value: (value) => `姓名：${value.name}`,
        },
        data
      );
      assert.isBe(nextData, `姓名：${data.name}`);
    });

    test('单一$value指令', () => {
      const nextData = adapter(
        {
          name: (value) => `${value} 李四`,
        },
        data
      );
      assert.isBe(nextData.name, '张三 李四');
    });

    test('对象$value指令', () => {
      const nextData = adapter(
        {
          name: {
            $key: 'name2',
            $value: (value) => `${value}2`,
          },
        },
        data
      );
      assert.isEqual(nextData, { name2: '张三2' });
    });
  });
}
