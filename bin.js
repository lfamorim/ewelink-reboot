#!/usr/bin/env node
require('dotenv/config');

const program = require('commander');
const ewelinkReboot = require('.');

const defaultWait = 300;

const log = (message, stdout = false, ...args) => console[!stdout ? 'log' : 'error'](`${new Date().toString()}: ${message}`, ...args)

const {
  EWELINK_EMAIL: enviromentEmail,
  EWELINK_PASSWORD: enviromentPassword,
  EWELINK_REGION: enviromentRegion,
  EWELINK_REBOOT_LOOP: enviromentLoop,
  EWELINK_REBOOT_WAIT: enviromentWait,
  EWELINK_REBOOT_ON_OFF_INTERVAL: enviromentOnOffInterval
} = process.env || {};

if (enviromentPassword) {
  log('Alert: It is not safe to set passwords on environment variables.', true);
}

program
  .version(require('./package.json').version)
  .arguments('<addr> <device>', { isDefault: true })
  .option('-e --email <email>', 'Email address to eWeLink.')
  .option('-e --email <email>', 'Email address to eWeLink.')
  .option('-p --password <password>', 'Your password to eWeLink.')
  .option('-r --region <region>', "The API region you use, valid ones are 'us', 'eu' and 'cn'.")
  .option('-l, --loop <loop>', "Run the program in loop, checking.")
  .option('-w, --wait <wait>', `Wait to check again (Default: ${defaultWait}).`)
  .action(async (addr, device, {
    email = enviromentEmail,
    password = enviromentPassword,
    region = enviromentRegion,
    loop = enviromentLoop,
    wait = enviromentWait || defaultWait,
    onOffInterval = enviromentOnOffInterval,
  }) => {
    const useInterval = intervalParser(loop);
    const useWait = intervalParser(wait);
    const useOnOffInterval = intervalParser(onOffInterval);

    let isRebooted = false;

    do {
      try {
        isRebooted = await checkOnWeLink(email, password, region, addr, device, useOnOffInterval);
      } catch (error) {
        log(error, true);
        return 2;
      }
      if (useInterval && isRebooted && useWait) await sleepUntil(useWait);
    } while (await sleepUntil(useInterval));

    return isRebooted ? 1 : 0;
  });

program.parse(process.argv);

function sleepUntil(useInterval) {
  return useInterval ? new Promise(resolve => {
    log(`Waiting until ${new Date(Date.now() + useInterval)}`);
    setTimeout(() => resolve(true), useInterval);
  }) : false;
}

function intervalParser(loop) {
  return loop ? Math.max(intervalParser(loop), 1000) : null;
}

function intervalParser(onOffInterval) {
  return (onOffInterval ?
    (typeof onOffInterval === 'string' ? parseInt(onOffInterval, 10) :
      (typeof onOffInterval === 'number' ? onOffInterval : 0)) : 0) * 1000;
}

async function checkOnWeLink(email, password, region, addr, device, onOffInterval) {
  const isRebooted = await ewelinkReboot({ email, password, region, addr, device, onOffInterval });
  log(isRebooted ? `The device ${device} has been restarted.` : `The device ${device} is active, not restarted.`);
  return isRebooted;
}