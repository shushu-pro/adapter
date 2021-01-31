import DEFAULT from './default';

// 支持类型转化指令的数据
const types = {
  Boolean,
  Number,
  String,
  Date,
};

export default Adapter;

function Adapter({ strict = DEFAULT.strict, clears = DEFAULT.clears } = {}) {
  const globalEnums = {};
  const globalEmaps = {};
  const globalFormats = {};

  let globalStrict = strict;
  let globalClears = clears;

  this.addEnum = createAdd(globalEnums);
  this.addEmap = createAdd(globalEmaps);
  this.addFormat = createAdd(globalFormats);
  this.create = createTransform;
  this.config = ({ strict = undefined, clears = undefined }) => {
    if (typeof strict === 'boolean') {
      globalStrict = strict;
    }
    if (clears === true) {
      globalClears = DEFAULT.clears;
    } else if (Array.isArray(clears)) {
      globalClears = clears;
    }
  };

  function createTransform(setting) {
    const { $strict = globalStrict, $clears } = setting;
    const $clearsValues = $clears === true ? globalClears : $clears || [];
    const allRules = {};

    addRules([], setting);

    let rootData = null;

    return (data) => transform(data);

    // 运行上下文中的适配器
    function adapter(setting, data?) {
      setting.$strict = $strict;
      const transform = createTransform(setting);
      if (arguments.length === 1) {
        return transform;
      }
      return transform(data);
    }

    // 添加规则
    function addRules(fullKeys, ruleSettings) {
      allRules[fullKeys] = createRules(fullKeys, ruleSettings);
    }

    // 创建规则
    function createRules(fullKeys, ruleSettings) {
      const key = fullKeys[fullKeys.length - 1];
      return (Array.isArray(ruleSettings) ? ruleSettings : [ruleSettings]).map(
        (ruleSetting) => {
          // 值复制
          if (ruleSetting === true) {
            return {
              exec(data, dataWrapper) {
                setData(dataWrapper, data, key);
              },
            };
          }

          // 类型转化
          if (typeIs(ruleSetting)) {
            const $type = ruleSetting;
            return {
              exec(data, dataWrapper) {
                setData(
                  dataWrapper,
                  $type === Date ? new Date(data) : $type(data),
                  key
                );
              },
            };
          }

          const ruleSettingType = typeof ruleSetting;

          // 值转化
          if (ruleSettingType === 'function') {
            const $value = ruleSetting;
            return {
              exec(data, dataWrapper, index, row) {
                setData(
                  dataWrapper,
                  $value(data, { row, index, root: rootData, adapter }),
                  key,
                  { prevData: data }
                );
              },
            };
          }

          // 速写指令转化
          if (ruleSettingType === 'string') {
            return createRuleFromString(fullKeys, ruleSetting);
          }

          // 无配置项或者非对象
          if (!ruleSetting || ruleSettingType !== 'object') {
            return null;
          }

          const {
            $key = key,
            $default,
            $emap,
            $enum,
            $type,
            $value,
            $deepKeys,
            $filter,
            $format,
            $increase,
            $reduce,
          } = ruleSetting;

          const $formats = $format && createFormats($format);
          const $increases = $increase && createIncreases($increase);

          // 无$value指令，无$format指令，会对内部的其他字段进行遍历转化
          if (!$value && !$formats) {
            for (const key in ruleSetting) {
              if (key.startsWith('$')) {
                // $deepKeys实现多层索引适配，必须是非严格模式
                if (key === '$deepKeys') {
                  for (const keys in $deepKeys) {
                    addRules(fullKeys.concat(keys.split('.')), $deepKeys[keys]);
                  }
                }
                continue;
              }
              addRules(fullKeys.concat(key), ruleSetting[key]);
            }
          }

          return {
            exec(data, dataWrapper, index, row) {
              // 设置默认值
              if (data == null && $default != null) {
                let defaultValue;
                if ($default === Object) {
                  defaultValue = {};
                } else if ($default === Array) {
                  defaultValue = [];
                } else if (typeof $default === 'function') {
                  defaultValue = $default({
                    row,
                    index,
                    root: rootData,
                    adapter,
                  });
                } else {
                  defaultValue = $default;
                }
                return setData(dataWrapper, defaultValue, $key, {
                  isReduce: $reduce,
                  prevData: data,
                });
              }

              let nextData;
              if (data && typeof data === 'object') {
                if ($value) {
                  nextData = $value(data, {
                    row,
                    index,
                    root: rootData,
                    adapter,
                  });
                } else if ($formats) {
                  nextData = dispatchFormats($formats, data, {
                    row,
                    index,
                    root: rootData,
                    adapter,
                  });
                } else if (Array.isArray(data)) {
                  nextData = [];
                  ($filter
                    ? data.filter((item) =>
                        $filter(item, { row, index, root: rootData, adapter })
                      )
                    : data
                  ).forEach((item, i) => {
                    walkDatas(item, fullKeys, i, nextData, data);
                  });
                } else {
                  nextData = {};

                  for (const key in data) {
                    walkDatas(
                      data[key],
                      fullKeys.concat([key]),
                      index,
                      nextData,
                      data
                    );
                  }
                }

                // 对象型数据支持$increase和$reduce
                if ($increases) {
                  const increaseData = {};
                  $increases.forEach(({ key, transform }) => {
                    const nextData = transform(data);
                    if (Array.isArray(key)) {
                      const keys = key;
                      const headKey = keys.shift();

                      if (keys.length === 0) {
                        increaseData[headKey] = nextData;
                      } else {
                        const tailKey = keys.pop();
                        let tailData;
                        increaseData[headKey] = tailData = {};
                        for (let i = 0; i < keys.length; i++) {
                          tailData = tailData[keys[i]] = {};
                        }

                        tailData[tailKey] = nextData;
                      }
                    } else {
                      increaseData[key] = transform(data);
                    }
                  });
                  Object.assign(nextData, increaseData);
                }
              } else if (typeIs($type)) {
                nextData = $type(data);
              } else if ($enum) {
                nextData = $enum[data];
              } else if ($emap) {
                nextData = $emap[data];
              } else if ($value) {
                nextData = $value(data, {
                  row,
                  index,
                  root: rootData,
                  adapter,
                });
              } else if ($formats) {
                nextData = dispatchFormats($formats, data, {
                  row,
                  index,
                  root: rootData,
                  adapter,
                });
              } else {
                nextData = data;
              }
              setData(dataWrapper, nextData, $key, {
                isReduce: $reduce,
                prevData: data,
              });
            },
          };
        }
      );
    }

    // 从字符指令中创建一个通用规则
    function createRuleFromString(fullKeys, string) {
      const setting: any = {};
      if (/^\w+$/.test(string)) {
        // 快速重命名
        setting.$key = string;
      } else {
        const formats = [];
        string.split(/\s+/).forEach((text) => {
          const hasArgs = /:/.test(text);
          const texts = text.split(':');
          let command = texts.shift();
          let args = texts.join(':');

          // 快速指令调用 '#dateDefault', '#dateFormat:YYYY年'
          if (/^#\w+/.test(command)) {
            // eslint-disable-next-line no-nested-ternary
            args = command.substr(1) + (args ? `:${args}` : hasArgs ? ':' : '');
            command = 'format';
          }

          switch (command) {
            // key:abc
            case 'key': {
              setting.$key = args || undefined;
              break;
            }

            // #dateFormat:YYYY-MM
            case 'format': {
              formats.push(createFormatOptionFromString(args));
              break;
            }

            // enum:,1,2,3,,
            case 'enum': {
              setting.$enum = args.split(',');
              break;
            }

            // emap:s1:1,s2:2,s3:3
            case 'emap': {
              setting.$emap = args.split(',').reduce((emap, item) => {
                const [key, value] = item.split(':');
                emap[key] = value;
                return emap;
              }, {});
              break;
            }

            // type:Boolean
            case 'type': {
              setting.$type = types[args];
              break;
            }

            // default:12
            case 'default': {
              setting.$default = args;
              break;
            }

            // reduce
            case 'reduce': {
              setting.$reduce = true;
              break;
            }

            // increase:name
            case 'increase': {
              setting.$increase = args;
              break;
            }
          }
        });
        if (formats.length > 0) {
          setting.$format = formats;
        }
      }

      return createRules(fullKeys, setting)[0];
    }

    // 创建一个格式化配置项
    function createFormatOptionFromString(string) {
      const arr = string.split(':');
      const name = arr.shift();
      const args = arr.length > 0 ? arr.join(':').split(',') : [];
      return { name, args };
    }

    // 创建格式化规则
    function createFormats($format) {
      const formats = [];
      if (typeof $format === 'string') {
        formats.push(createFormatOptionFromString($format));
      } else if (typeof $format === 'function') {
        formats.push({
          name: null,
          dispatch: $format,
        });
      } else if (Array.isArray($format)) {
        $format.forEach((format) => {
          const type = typeof format;
          if (type === 'string') {
            formats.push(createFormatOptionFromString(format));
          } else if (type === 'function') {
            formats.push({
              name: null,
              dispatch: format,
            });
          } else if (type === 'object') {
            const { $enum, $emap } = format;
            const map = $enum || $emap;
            if (map) {
              let data;
              if (typeof $enum === 'string') {
                data = globalEnums[$enum];
              } else if (typeof $emap === 'string') {
                data = globalEmaps[$emap];
              } else {
                data = map;
              }
              formats.push({ name: null, dispatch: (value) => data[value] });
            } else {
              formats.push(format);
            }
          } else {
            formats.push(format);
          }
        });
      } else {
        formats.push($format);
      }

      formats.forEach((format) => {
        // 生成默认参数
        if (!format.args) {
          format.args = [];
        }

        // 从预设的format仓库中取
        if (!format.dispatch) {
          format.dispatch = globalFormats[format.name];
        }
      });

      return formats;
    }

    // 创建increase规则
    function createIncreases($increase) {
      return (Array.isArray($increase) ? $increase : [$increase]).map(
        (increase) => {
          const { $key, ...rest } = increase;
          return {
            key: $key,
            transform: adapter({ ...rest }),
          };
        }
      );
    }

    // 执行格式化，formats:格式化规则，data：待格式化输入的数据，context：运行上下文
    function dispatchFormats(formats, data, context) {
      return formats.reduce(
        (nextData, { args, dispatch }) => dispatch(nextData, context, ...args),
        data
      );
    }

    // 将值插入到对象中
    function setData(
      dataWrapper: Array<any> | Record<string, any>,
      data,
      key: string | ((predata) => string) = '$data',
      { isReduce = false, prevData = null } = {}
    ) {
      if ($clearsValues.length) {
        // 值在清除列表中
        if ($clearsValues.includes(data)) {
          return;
        }

        // 处理函数返回true
        if (
          $clearsValues.some(
            (item) => typeof item === 'function' && item(data, key) === true
          )
        ) {
          return;
        }
      }

      if (Array.isArray(dataWrapper)) {
        dataWrapper.push(data);
      } else if (isReduce) {
        Object.assign(dataWrapper, data);
      } else {
        dataWrapper[typeof key === 'function' ? key(prevData) : key] = data;
      }
    }

    // data: 输入的数据， dataIndex：数据下标，dataRow：数据所在记录，rootData：数据所在根数据
    function transform(data, dataIndex?, dataRow?) {
      if (!rootData) {
        rootData = data;
      }
      const dataWrapper = { $data: data };
      walkDatas(data, [], dataIndex, dataWrapper, dataRow);
      return dataWrapper.$data;
    }

    // data: 输入的数据，dataKeys：数据完整的key路径，dataIndex：数据所在下标，dataWrapper：数据容器，dataRow数据所在对象引用
    function walkDatas(data, dataKeys, dataIndex, dataWrapper, dataRow) {
      const rules = allRules[dataKeys];
      if (rules) {
        rules.forEach((rule) =>
          rule.exec(data, dataWrapper, dataIndex, dataRow)
        );
      } else if (!$strict) {
        // 非严格模式，深度遍历，逐条进行数据适配
        let nextData;
        if (!data || typeof data !== 'object' || data instanceof Date) {
          nextData = data;
        } else if (Array.isArray(data)) {
          nextData = [];
          data.forEach((item, i) => {
            walkDatas(item, dataKeys, i, nextData, data);
          });
        } else {
          nextData = {};
          for (const key in data) {
            walkDatas(
              data[key],
              dataKeys.concat(key),
              dataIndex,
              nextData,
              data
            );
          }
        }
        setData(dataWrapper, nextData, dataKeys[dataKeys.length - 1], {
          prevData: data,
        });
      }
    }
  }
}

function createAdd(typeSet) {
  return function addItem(name, value) {
    if (typeof name === 'string') {
      return (typeSet[name] = value);
    }
    if (typeof name === 'object') {
      const items = name;
      for (const name in items) {
        typeSet[name] = items[name];
      }
    }
  };
}

// 判断是否属于类型转化
function typeIs(type) {
  return (
    type === Boolean || type === Number || type === String || type === Date
  );
}

interface kkk {
  a: string;
}

export { kkk };
