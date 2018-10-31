/* Initialize vendor libraries. */
const crypto = require('crypto')

/**
 * Calculate Hash
 */
const calcHash = function (_data) {
    /* Compute the SHA-1 hash of the data provided. */
    return crypto.createHash('sha1').update(_data).digest('hex')
}


module.exports = {
    calcHash,
}
