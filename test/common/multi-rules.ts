export default function ({ adapter, data }, { tests, test, assert }) {
  tests('多规则处理', () => {
    test('多规则适配', () => {
      const data = {
        status: 1,
        name: '张三',
      };

      const nextData = adapter(
        {
          status: [
            true,
            { $key: 'statusText', $enum: ['已下架', '已上架'] },
            { $key: 'statusText2', $emap: { 0: '否', 1: '是' } },
            { $key: 'isOK', $type: Boolean },
            { $key: 'fixedValue', $value: (value) => value.toFixed(2) },
            { $key: 'name', $value: (value) => value.toFixed(2) },
          ],
        },
        data
      );

      assert.isEqual(nextData, {
        status: 1,
        statusText: '已上架',
        statusText2: '是',
        isOK: true,
        fixedValue: '1.00',
        name: '1.00',
      });
    });
  });
}
