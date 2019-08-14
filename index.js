const emailRegex = require('email-regex');
const ping = require('ping');
const EWeLink = require('ewelink-api');
const isIp = require('is-ip');
const isDomain = require('is-domain-name')

function pingAddress(addr) {
  return new Promise((resolve, reject) => ping.sys.probe(addr, (isAlive, error) => {
    if (error) reject(error);
    resolve(isAlive);
  }));
}

async function rebootWhenDead(device, ewelink, isAlive, onOffInterval = 10000) {
  if (isAlive) return false;

  await ewelink.setDevicePowerState(device, 'off');
  await new Promise((resolve) => setTimeout(async () => {
    resolve(await ewelink.setDevicePowerState(device, 'on'));
  }), onOffInterval);

  return true;
}

module.exports = async function ewelinkReboot({ region, email, password, device, api, addr, onOffInterval }) {
  if (!isIp(addr) && !isDomain(addr)) {
    throw new Error(`invalid hostname or address: ${addr}`);
  }

  const ewelink = api || (() => {
    if (!password) throw new Error('Password not found');
    if (!email) throw new Error('Email not found');
    if (!emailRegex({exact: true}).test(email)) throw new Error('Invalid email address');
    return new EWeLink({ region, email, password })
  })();

  const login = await ewelink.login();
  if (typeof login === 'object' && login.error) {
    throw new Error(login.msg || `${login.error} Authentication error`);
  }

  const devices = await ewelink.getDevices();
  const target = Array.isArray(devices) ? devices.find(({deviceid, name}) => deviceid == device || 
    name == device) : undefined;
  if (!target) throw new Error(`Can't find that device, available are: ${Array.isArray(devices) ?
      devices.map(({ name, deviceid }) => `'${name}' [${deviceid}]`).join(', ') :
      'none'}.`);

  const isAlive = await pingAddress(addr);
  return rebootWhenDead(target.deviceid, ewelink, isAlive, onOffInterval);
}