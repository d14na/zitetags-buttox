const util = require('util')

/* Initialize file execution. */
const execFile = util.promisify(require('child_process').execFile)

/* Initialize handler. */
const handler = async function (_req, _res, _logger) {
    /* Set tag. */
    let tag = _req.params.tag

    /* Validate tag. */
    if (tag) {
        if (tag.indexOf('d/') !== 0) {
            tag = 'd/' + tag
        }

        _logger.info(`Requested tag [ ${tag} ]`)
    } else {
        return _res.json({ error: `[ ${tag} ] is NOT valid.` })
    }

    let results = null
    let error = null

    results = await execFile('namecoin-cli', ['name_show', tag])
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

            try {
                /* Try to decode the value. */
                data.value = JSON.parse(data.value)
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
