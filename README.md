# ewelink-reboot
Reboot a device using eWeLink account when a device doesn't ping anymore. 

# Installing

```sh
npm install -g ewelink-reboot 
```

# Using

```bash
user@hostname:~/$ ewelink-reboot --help
Wed Aug 14 2019 15:53:30 GMT-0300 (-03): Alert: It is not safe to set passwords on environment variables.
Usage: ewelink-reboot [options] <addr> <device>

Options:
  -V, --version             output the version number
  -e --email <email>        Email address to eWeLink.
  -p --password <password>  Your password to eWeLink.
  -r --region <region>      The API region you use, valid ones are 'us', 'eu' and 'cn'.
  -l, --loop <loop>         Run the program in loop, checking.
  -w, --wait <wait>         Wait to check again (Default: 300).
  -h, --help                output usage information
```

# API

```js
const ewelinkReboot = require('ewelink-reboot');

ewelinkReboot({
  email: 'your@email.com',
  password: 'your-password',
  addr: 'localhost',
  device: 'name-or-deviceid'
}).then(isRebooted => console.log(isRebooted))
```
