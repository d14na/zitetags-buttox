const util = require('util')

/* Initialize file execution. */
const execFile = util.promisify(require('child_process').execFile)

/* Initialize handler. */
const handler = async function (_req, _res, _profilesDb, _zitetagsDb, _logger) {
    /* Set headers. */
    const headers = _req.headers

    let authKey = headers['x-0net-auth-key']
    let publicKey = headers['x-0net-public-key']

    // TODO Search profiles database for matching record WITH ADMIN usertype.

    /* Hanlde "simple" authorization. */
    // FIXME `auth_key` is DEPRECATED in Core, replace with Pub/Priv key auth.
    if ('GUEST' !== 'ADMIN') {
        /* Set error package. */
        const pkg = {
            error: 'ERROR TESTING!!!',
            code: 401,
            message: 'User is NOT authorized to perform this action.',
            // headers,
            authKey,
            publicKey
        }

        return _res.json(pkg)
    }

    /* Set tag. */
    let tag = _req.params.tag

    /* Validate tag. */
    if (tag) {
        if (tag.indexOf('d/') !== 0) {
            tag = 'd/' + tag
        }
    } else {
        return _res.json({ error: `[ ${tag} ] is NOT valid.` })
    }

    let results = null
    let error = null

    results = await execFile('namecoin-cli', ['name_new', tag])
        .catch(_err => {
            _logger.error('ERROR:', _err)
            error = _err.stderr
            // error = _err.message

            _res.json({ error })
        })

    _logger.debug(results)

    if (results && results.stdout !== '') {
        /* Set data. */
        try {
            const data = JSON.parse(results.stdout)
            console.log('DATA', data)

            try {
                /* Set db id. */
                const _id = tag.slice(2)

                /* Set NAME_NEW request. */
                const nameNew = data

                /* Set completed. */
                const isCompleted = false

                /* Set date added. */
                const dateAdded = new Date().toISOString()

                /* Set db entry. */
                const entry = { _id, nameNew, isCompleted, dateAdded }

                _zitetagsDb.put(entry, function (_err, _result) {
                    if (_err) {
                        return _logger.error('ERROR saving to database', _err)
                    }

                    _logger.info('Successfully added new entry', _result)
                })
            } catch (_err) {
                _logger.error('Could NOT decode value. Probably NOT a zite.')
            }

            /* Send back JSON. */
            _res.json(data)
        } catch (_err) {
            _logger.error('ERROR:', _err)

            _res.json({ error: _err })
        }
    }

    if (!results && !error) {
        _res.json({})
    }
}

/* Export handler. */
module.exports = handler
