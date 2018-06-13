import hasha from 'hasha'
import log from 'npmlog'
import lnd from '../lib/extensions'
import manifest from './manifest'
import * as pkg from '../../package.json'
import createDebug from 'debug'

const debug = createDebug(pkg.name)

// Verify the binary archive.
export const verify = path => {
  debug('verify: %o', { path })

  function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value)
  }

  const checksums = manifest[lnd.getBinaryVersion()]
  const checksum = getKeyByValue(checksums, lnd.getBinaryName() + lnd.getBinaryExtension())

  debug('Verifying archive against checksum', checksum)

  return hasha
    .fromFile(path, { algorithm: 'sha256' })
    .then(hash => {
      debug('Generated hash from downloaded file', hash)

      if (checksum === hash) {
        log.info(pkg.name, 'Verified checksum of downloaded file')
        return path
      }
      log.error(pkg.name, 'Checksum did not match')
      return Promise.reject(new Error('Checksum did not match'))
    })
    .catch(err => {
      log.error(pkg.name, 'Error verifying checksum of downloaded file', err)
      return Promise.reject(err)
    })
}
