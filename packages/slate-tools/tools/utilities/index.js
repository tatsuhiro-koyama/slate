const path = require('path');
const {promisify} = require('util');
const {existsSync, readFileSync} = require('fs');
const portscanner = require('portscanner');
const config = require('../../slate-tools.config');

const findAPortInUse = promisify(portscanner.findAPortInUse);

function sslKeyCert() {
  const key = readFileSync(getSSLKeyPath());
  const cert = readFileSync(getSSLCertPath());

  return {key, cert};
}

function getSSLKeyPath() {
  return existsSync(config.paths.ssl.key)
    ? config.paths.ssl.key
    : path.join(__dirname, './server.pem');
}

function getSSLCertPath() {
  return existsSync(config.paths.ssl.cert)
    ? config.paths.ssl.cert
    : path.join(__dirname, './server.pem');
}

// Finds a series of available ports of length quantity, starting at a given
// port number and incrementing up. Returns an array of port numbers.
function getAvailablePortSeries(start, quantity, increment = 1) {
  const startPort = start;
  const endPort = start + (quantity - 1);

  return findAPortInUse(startPort, endPort, '127.0.0.1').then((port) => {
    if (typeof port === 'number') {
      return getAvailablePortSeries(port++, quantity);
    }

    const ports = [];

    for (let i = startPort; i <= endPort; i += increment) {
      ports.push(i);
    }

    return ports;
  });
}

module.exports = {
  sslKeyCert,
  getSSLKeyPath,
  getSSLCertPath,
  getAvailablePortSeries,
};
