export default function ({ adapter, data }, { tests, test, assert }) {
  tests('格式化指令：$format', () => {
    adapter.addFormat('dateFormat', (value) => String(new Date(value)));

    test('对象型配置；调用格式化指令', () => {
      const nextData = adapter(
        {
          timestamp: { $format: 'dateFormat' },
        },
        data
      );
      assert.isBe(nextData.timestamp, String(data.time));
    });

    test('字符型配置；调用格式化指令', () => {
      const nextData = adapter(
        {
          timestamp: 'format:dateFormat',
        },
        data
      );
      assert.isBe(nextData.timestamp, String(data.time));
    });

    test('字符型配置简化模式；调用格式化指令', () => {
      const nextData = adapter(
        {
          timestamp: '#dateFormat',
        },
        data
      );
      assert.isBe(nextData.timestamp, String(data.time));
    });

    test('添加多条格化指令', () => {
      adapter.addFormat({
        prependYuan: (value) => `￥${value}`,
        appendTx: (value) => `${value}同学`,
      });

      const nextData = adapter(
        {
          price: 'format:prependYuan',
          name: { $format: 'appendTx' },
        },
        data
      );

      assert.isEqual(nextData, {
        price: `￥${data.price}`,
        name: `${data.name}同学`,
      });
    });

    test('添加带多个字符串参数的格式化指令', () => {
      adapter.addFormat({
        appendUnit: (value, ctx, unit, desc) => value + unit + desc,
      });

      const nextData = adapter(
        {
          name: { $format: 'appendUnit:同学,很厉害' },
          price: '#appendUnit:元,很贵',
        },
        data
      );
      assert.isBe(nextData.name, `${data.name}同学很厉害`);
      assert.isBe(nextData.price, `${data.price}元很贵`);
    });

    test('调用任意类型参数的格式化指令', () => {
      adapter.addFormat(
        'addChildren',
        (value, ctx, children) => `${value}:${children.join(',')}`
      );
      const data = { province: '浙江', china: '中国' };
      const nextData = adapter(
        {
          province: {
            $format: {
              name: 'addChildren',
              args: [['杭州', '丽水', '温州']],
            },
          },
          china: {
            $format: { name: 'addChildren', args: [['浙江', '北京', '上海']] },
          },
        },
        data
      );

      assert.isBe(nextData.province, `浙江:${['杭州', '丽水', '温州']}`);
      assert.isBe(nextData.china, `中国:${['浙江', '北京', '上海']}`);
    });

    test('多次调用指令', () => {
      adapter.addFormat(
        'increase',
        (
          value,
          ctx,
          num = 1 // 一个累加器，可以给一个值进行累加操作
        ) => value + Number(num)
      );
      adapter.addFormat('toArray', (
        value,
        ctx,
        token = ',' // 转换数组
      ) => value.split(token));

      const data = { value: 1 };
      const nextData = adapter(
        {
          // 传递多条指令，就像管道函数一样，前面的结果作为后面的输入
          value: {
            $format: [
              'increase:1',
              'increase:-2',
              'increase:1234',
              String,
              'toArray:',
              (arr) => arr.map(Number),
            ],
          },
        },
        data
      );
      assert.isEqual(nextData, { value: [1, 2, 3, 4] });
    });

    test('形参个数不足调用', () => {
      adapter.addFormat('timeDefault', (value, ctx, format = '#') =>
        value ? String(value) + format : '/'
      );
      const now = new Date();
      const data = [{ time: now }, { time: null }, { time: undefined }];
      const nextData = adapter(
        {
          time: {
            $format: 'timeDefault',
          },
        },
        data
      );

      assert.isEqual(nextData, [
        { time: `${String(now)}#` },
        { time: '/' },
        { time: '/' },
      ]);
    });

    test('待转化的数据是数组', () => {
      adapter.addFormat({
        timeBegin: (value) => (value && value[0] ? String(value[0]) : null),
        timeEnd: (value) => (value && value[1] ? String(value[1]) : null),
      });
      const now = new Date();
      const data = {
        time: [now, now],
      };
      const nextData = adapter(
        {
          time: [
            { $key: 'timeBegin', $format: 'timeBegin' },
            { $key: 'timeEnd', $format: 'timeEnd' },
          ],
        },
        data
      );

      assert.isEqual(nextData, {
        timeBegin: String(now),
        timeEnd: String(now),
      });
    });

    test('$format 使用$enum,$emap', () => {
      const data = {
        list: [{ value: 0 }, { value: 1 }, { value: 2 }],
      };
      adapter.addEnum({
        prov: ['zj', 'bj', 'sh'],
      });
      adapter.addEmap({
        prov: { zj: '浙江', bj: '北京', sh: '上海' },
      });

      const nextData = adapter(
        {
          list: {
            value: {
              $format: [{ $enum: 'prov' }, { $emap: 'prov' }],
            },
          },
        },
        data
      );

      assert.isEqual(nextData, {
        list: [{ value: '浙江' }, { value: '北京' }, { value: '上海' }],
      });

      const nextData2 = adapter(
        {
          list: {
            value: {
              $format: [
                { $enum: ['zj', 'bj', 'sh'] },
                { $emap: { zj: '浙江', bj: '北京', sh: '上海' } },
              ],
            },
          },
        },
        data
      );

      assert.isEqual(nextData2, {
        list: [{ value: '浙江' }, { value: '北京' }, { value: '上海' }],
      });
    });
  });
}
