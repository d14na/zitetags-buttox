/* Initialize vendor libraries. */
const crypto = require('crypto')

/**
 * Calculate Hash
 */
const _calcHash = function (_data) {
    /* Compute the SHA-1 hash of the data provided. */
    return crypto.createHash('sha1').update(_data).digest('hex')
}

/* Initialize handler. */
const handler = async function (_req, _res, _db, _logger) {
    /* Set public key. */
    let publicKey = _req.params.publicKey

    /* Initialize options. */
    const options = {
        key: publicKey,
        include_docs: true,
        descending: true
    }

    console.log('OPTIONS', options)

    const docs = await _db.allDocs(options)
        .catch(_err => _logger.error(_err))

    /* Validate docs. */
    if (docs && docs.rows.length) {
        // /* Retrieve the doc recordset. */
        const doc = docs.rows[0].doc

        _logger.info(doc)

        let authHash = _req['headers']['x-0net-auth-key'] ? _calcHash(_req['headers']['x-0net-auth-key']) : null
        let publicKey = _req['headers']['x-0net-public-key']

        /* Send back document. */
        _res.json({ doc, authHash, publicKey })
    } else {
        /* Set error. */
        const error = 'No profile found.'

        /* No records found. */
        _logger.error(error)

        _res.json({ error })
    }
}

/* Export handler. */
module.exports = handler

/*
{"zeronet":{"":""}}

{
    "zeronet": {
        "": "",
        "sub": ""
    }
}
*/
