import Adapter from './Adapter';

const globalAdapter = new Adapter({});
function adapter(setting, data) {
  const adp = globalAdapter.create(setting);
  if (arguments.length === 1) {
    return adp;
  }
  return adp(data);
}

adapter.addEnum = globalAdapter.addEnum;
adapter.addEmap = globalAdapter.addEmap;
adapter.addFormat = globalAdapter.addFormat;
adapter.config = globalAdapter.config;

export default adapter;

export { Adapter };
