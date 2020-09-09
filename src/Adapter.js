import DEFAULT from './config/default'

// 支持类型转化指令的数据
const TYPES = {
  Boolean: Boolean,
  Number: Number,
  String: String,
  Date: Date,
}

function Adapter ({ $strict, $clears } = {}) {
  const DEFAULT_STRICT = $strict || DEFAULT.$strict
  const DEFAULT_CLEARS = $clears || DEFAULT.$clears
  const enums = {}
  const emaps = {}
  const formats = {}

  this.addEnum = createAdd(enums)
  this.addEmap = createAdd(emaps)
  this.addFormat = createAdd(formats)
  this.create = createTransform

  // 创建适配转化器
  function createTransform (setting) {
    const { $strict = DEFAULT_STRICT, $clears } = setting
    const allRules = {} // 转化规则集合
    let rootData = null
    let rootDataLock = false
    const $clearsValues = $clears === true ? DEFAULT_CLEARS : ($clears || [])

    addRules([], setting)

    return (data) => transform(data)

    // 运行上下文中的适配器
    function adapter (setting, data) {
      setting.$strict = $strict
      const transform = createTransform(setting)
      if (arguments.length === 1) {
        return transform
      }
      return transform(data)
    }

    // data: 输入的数据， dataIndex：数据下标，dataRow：数据所在记录，rootData：数据所在根数据
    function transform (data, dataIndex, dataRow) {
      if (!rootDataLock) {
        rootData = data
        rootDataLock = true
      }
      const dataParent = { exportData: data }
      walkDatas(data, [], dataIndex, dataParent, dataRow)
      return dataParent.exportData
    }

    // data: 输入的数据，dataKeys：数据完整的key路径，dataIndex：数据所在下标，dataParent：数据容器，dataRow数据所在对象引用
    function walkDatas (data, dataKeys, dataIndex, dataParent, dataRow) {
      const rules = allRules[dataKeys]
      if (rules) {
        rules.forEach(rule => rule.exec(data, dataParent, dataIndex, dataRow))
      } else if (!$strict) {
        // 非严格模式，深度遍历，逐条进行数据适配
        let nextData
        if (!data || typeof data !== 'object' || data instanceof Date) {
          nextData = data
        } else if (Array.isArray(data)) {
          nextData = []
          data.forEach((item, i) => {
            walkDatas(item, dataKeys, i, nextData, data)
          })
        } else {
          nextData = {}
          for (const key in data) {
            walkDatas(data[key], dataKeys.concat(key), dataIndex, nextData, data)
          }
        }
        addData(dataParent, nextData, dataKeys[dataKeys.length - 1])
      }
    }

    // 创建规则
    function createRules (fullKeys, setting) {
      const key = fullKeys[fullKeys.length - 1]
      return (Array.isArray(setting) ? setting : [ setting ]).map(setting => {
        // 复制值
        if (setting === true) {
          return {
            exec (data, dataParent) {
              addData(dataParent, data, key)
            },
          }
        }

        // 类型转化
        if (typeIs(setting)) {
          const $type = setting
          return {
            exec (data, dataParent) {
              addData(dataParent, $type === Date ? new Date(data) : $type(data), key)
            },
          }
        }

        const settingType = typeof setting

        // 值转化
        if (settingType === 'function') {
          const $value = setting
          return {
            exec (data, dataParent, index, row) {
              addData(dataParent, $value(data, { row, index, root: rootData, adapter }), key)
            },
          }
        }

        // 速写指令转化
        if (settingType === 'string') {
          return createRuleFromString(fullKeys, setting)
        }

        // 无配置项或者非对象
        if (!setting || settingType !== 'object') {
          return null
        }

        const { $key = key, $default, $emap, $enum, $type, $value } = setting
        let { $format, $increase, $reduce } = setting

        if ($format) {
          $format = createFormat($format)
        }

        if ($increase) {
          $increase = createIncrease($increase)
        }

        // 无$value指令，无$format指令，会对内部的其他字段进行遍历转化
        if (!$value && !$format) {
          for (const key in setting) {
            if (key.startsWith('$')) {
              continue
            }
            addRules(fullKeys.concat(key), setting[key])
          }
        }

        return {
          exec (data, dataParent, index, row) {
            // 设置默认值
            if (data == null && $default != null) {
              let defaultValue
              if ($default === Object) {
                defaultValue = {}
              } else if ($default === Array) {
                defaultValue = []
              } else if (typeof $default === 'function') {
                defaultValue = $default({ row, index, root: rootData, adapter })
              } else {
                defaultValue = $default
              }
              return addData(dataParent, defaultValue, $key, $reduce)
            }

            let nextData
            if (data && typeof data === 'object') {
              // 日期类型的数据
              if (data instanceof Date) {
                // 执行值转化
                if ($value) {
                  nextData = $value(data, { row, index, root: rootData, adapter })
                } else if ($format) {
                  nextData = dispatchFormats($format, data, { row, index, root: rootData, adapter })
                }
              } else if ($value) {
                nextData = $value(data, { row, index, root: rootData, adapter })
              } else if ($format) {
                nextData = dispatchFormats($format, data, { row, index, root: rootData, adapter })
              } else if (Array.isArray(data)) {
                nextData = []
                data.forEach((item, i) => {
                  walkDatas(item, fullKeys, i, nextData, data)
                })
              } else {
                nextData = {}
                for (const key in data) {
                  if (key.startsWith('$')) {
                    continue
                  }
                  walkDatas(data[key], fullKeys.concat([ key ]), index, nextData, data)
                }
              }

              // 对象型数据支持$increase和$reduce
              if (typeof data === 'object') {
                if ($increase) {
                  const increaseData = {}
                  $increase.forEach(({ key, transform }) => {
                    const nextData = transform(data)
                    if (Array.isArray(key)) {
                      const keys = key
                      const headKey = keys.shift()

                      if (keys.length === 0) {
                        increaseData[headKey] = nextData
                      } else {
                        const tailKey = keys.pop()
                        let tailData
                        increaseData[headKey] = tailData = {}
                        for (let i = 0; i < keys.length; i++) {
                          tailData = tailData[keys[i]] = {}
                        }

                        tailData[tailKey] = nextData
                      }
                    } else {
                      increaseData[key] = transform(data)
                    }
                  })
                  nextData = Object.assign(nextData, increaseData)
                }
              }
            } else { // 直接量
              if (typeIs($type)) {
                nextData = $type(data)
              } else if ($enum) {
                nextData = $enum[data]
              } else if ($emap) {
                nextData = $emap[data]
              } else if ($value) {
                nextData = $value(data, { row, index, root: rootData, adapter })
              } else if ($format) {
                nextData = dispatchFormats($format, data, { row, index, root: rootData, adapter })
              } else {
                nextData = data
              }
            }
            addData(dataParent, nextData, $key, $reduce)
          },
        }
      })
    }

    // 从字符指令中创建一个通用规则
    function createRuleFromString (fullKeys, string) {
      const setting = {}
      if (/^\w+$/.test(string)) { // 快速重命名
        setting.$key = string
      } else {
        const formats = []
        string.split(/\s+/).forEach(text => {
          const hasArgs = /:/.test(text)
          text = text.split(':')
          let command = text.shift()
          let args = text.join(':')

          // 快速指令调用 '#dateDefault', '#dateFormat:YYYY年'
          if (/^#\w+/.test(command)) {
            args = command.substr(1) + (args ? `:${args}` : hasArgs ? ':' : '')
            command = 'format'
          }

          switch (command) {
            // key:abc
            case 'key': {
              setting.$key = args || undefined
              break
            }

            // #dateFormat:YYYY-MM
            case 'format': {
              formats.push(createFormatOptionFromString(args))
              break
            }

            // enum:,1,2,3,,
            case 'enum': {
              setting.$enum = args.split(',')
              break
            }

            // emap:s1:1,s2:2,s3:3
            case 'emap': {
              setting.$emap = args.split(',').reduce((emap, item) => {
                const [ key, value ] = item.split(':')
                emap[key] = value
                return emap
              }, {})
              break
            }

            // type:Boolean
            case 'type': {
              setting.$type = TYPES[args]
              break
            }

            // default:12
            case 'default': {
              setting.$default = args
              break
            }

            // reduce
            case 'reduce': {
              setting.$reduce = true
              break
            }

            // increase:name
            case 'increase': {
              setting.$increase = args
              break
            }
          }
        })
        if (formats.length > 0) {
          setting.$format = formats
        }
      }
      return createRules(fullKeys, setting)[0]
    }

    // 创建一个格式化配置项
    function createFormatOptionFromString (string) {
      string = string.split(':')
      const name = string.shift()
      const args = string.length > 0 ? string.join(':').split(',') : []
      return { name, args }
    }

    // 创建格式化规则
    function createFormat ($format) {
      const nextFormat = []
      if (typeof $format === 'string') {
        nextFormat.push(createFormatOptionFromString($format))
      } else if (typeof $format === 'function') {
        nextFormat.push({
          name: null,
          dispatch: $format,
        })
      } else if (Array.isArray($format)) {
        $format.forEach(format => {
          if (typeof format === 'string') {
            nextFormat.push(createFormatOptionFromString(format))
          } else if (typeof format === 'function') {
            nextFormat.push({
              name: null,
              dispatch: format,
            })
          } else {
            nextFormat.push(format)
          }
        })
      } else {
        nextFormat.push($format)
      }

      nextFormat.forEach(format => {
        // 生产默认参数
        if (!format.args) {
          format.args = []
        }

        // 从预设的format仓库中取
        if (!format.dispatch) {
          format.dispatch = formats[format.name]
        }
      })

      return nextFormat
    }

    // 创建increase规则
    function createIncrease ($increase) {
      return (Array.isArray($increase) ? $increase : [ $increase ]).map(increase => {
        const { $key, ...rest } = increase
        return {
          key: $key,
          transform: adapter({ ...rest }),
        }
      })
    }

    // 执行格式化，formats:格式化规则，data：待格式化输入的数据，context：运行上下文
    function dispatchFormats (formats, data, context) {
      return formats.reduce((nextData, { args, dispatch }) => dispatch(nextData, context, ...args), data)
    }

    // 添加到适配器
    function addRules (fullKeys, setting) {
      allRules[fullKeys] = createRules(fullKeys, setting)
    }

    // 将值插入到对象中
    function addData (dataParent, data, key = 'exportData', isReduce) {
      // 过滤掉符合过滤条件的值
      if ($clearsValues.length) {
        for (let i = 0; i < $clearsValues.length; i++) {
          const clearValue = $clearsValues[i]
          if (typeof clearValue === 'function') {
            // 函数类型，返回true则进行过滤
            if (clearValue(data, key) === true) {
              return
            }
          } else if (clearValue === data) {
            // 值和过滤表中的一直，则进行过滤
            return
          }
        }
      }

      if ($clearsValues.includes(data)) {
        return
      }
      if (Array.isArray(dataParent)) {
        dataParent.push(data)
      } else {
        if (isReduce) {
          Object.assign(dataParent, data)
        } else {
          dataParent[key] = data
        }
      }
    }
  }
}

export default Adapter

function createAdd (typeSet) {
  return function addItem (name, value) {
    if (typeof name === 'string') {
      return (typeSet[name] = value)
    }
    if (typeof name === 'object') {
      const items = name
      for (const name in items) {
        typeSet[name] = items[name]
      }
    }
  }
}

function typeIs (type) {
  return type === Boolean || type === Number || type === String || type === Date
}


// 数据转化指令
// $default > $type > $enum > $emap > $value > $format
// 直接量支持所有转化指令
// 引用类型支持: $default, $value, $format指令

// 结构调整指令
// $increase > $reduce
// $reduce: true 缩减层级，仅对引用数据有效

// 深度keys索引
// $deepKeys

// $increase: String | Array
// $reduce: true
// $deepKeys: true | RegExp | String
