export default function ({ Adapter, data }, { tests, test, assert }) {
  tests('实例方法测试', () => {
    test('实例方法测试：adapter.config({strict:false, clears:[]})', () => {
      const adapter = new Adapter({});
      const data = {
        a: 1,
        b: null,
        c: 2,
      };
      assert.isEqual(
        adapter.create({ a: true, b: true, $clears: true })(data),
        {
          a: 1,
        }
      );
      adapter.config({ strict: false, clears: [] });
      assert.isEqual(
        adapter.create({ a: true, b: true, $clears: true })(data),
        {
          a: 1,
          b: null,
          c: 2,
        }
      );
    });
  });
}
