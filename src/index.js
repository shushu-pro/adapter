import Adapter from './Adapter'

const globalAdapter = new Adapter()

function adapter (option, data) {
  const adp = globalAdapter.create(option)
  if (arguments.length === 1) {
    return adp
  }
  return adp(data)
}
adapter.addEnum = globalAdapter.addEnum
adapter.addEmap = globalAdapter.addEmap
adapter.addFormat = globalAdapter.addFormat

export default adapter
export {
  Adapter,
}
