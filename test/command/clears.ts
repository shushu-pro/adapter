export default function ({ adapter }, { tests, test, assert }) {
  tests('清除键指令：$clears', () => {
    const data = {
      key1: null,
      key2: false,
      key3: 111,
      key4: 555,
      key5: undefined,
      key6: '',
      key7: true,
    };

    test('预设清除指令', () => {
      const nextData = adapter(
        {
          $clears: true,
          $strict: false,
        },
        data
      );

      assert.isEqual(nextData, {
        key2: false,
        key3: 111,
        key4: 555,
        key7: true,
      });
    });

    test('自定义清除指令', () => {
      const nextData = adapter(
        {
          $clears: [
            false,
            null,
            111,
            (value, key) => value === true || key === 'key6',
          ],
          $strict: false,
        },
        data
      );

      assert.isEqual(nextData, {
        key4: 555,
        key5: undefined,
      });
    });
  });
}
