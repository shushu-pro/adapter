export default function ({ adapter, data }, { tests, test, assert }) {
  tests('非严格模式开启多层索引：$deepKeys', () => {
    const data = {
      user: {
        name: '张三',
        book: {
          name: '水浒传',
          price: 999,
        },
      },
    };

    test('纯多层索引', () => {
      const nextData = adapter(
        {
          $strict: false,
          $deepKeys: {
            'user.book.name': (value) => `《${value}》`,
            'user.book.price': String,
          },
        },
        data
      );
      assert.isEqual(nextData, {
        user: {
          name: '张三',
          book: {
            name: '《水浒传》',
            price: '999',
          },
        },
      });
    });

    test('多层索引同名优先级', () => {
      const nextData = adapter(
        {
          $strict: false,
          $deepKeys: {
            'user.book.name': (value) => `《${value}》`,
            'user.book.price': String,
          },
          user: {
            book: {
              name: Boolean,
              price: (value) => `$${value}`,
            },
          },
        },
        data
      );
      assert.isEqual(nextData, {
        user: {
          name: '张三',
          book: {
            name: true,
            price: '$999',
          },
        },
      });
    });

    test('多层索引混合', () => {
      const nextData = adapter(
        {
          $strict: false,
          user: {
            $deepKeys: {
              'book.name': Boolean,
            },
          },
        },
        data
      );
      assert.isEqual(nextData, {
        user: {
          name: '张三',
          book: {
            name: true,
            price: 999,
          },
        },
      });
    });
  });
}
