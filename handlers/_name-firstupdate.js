const util = require('util')

/* Initialize file execution. */
const execFile = util.promisify(require('child_process').execFile)

/* Initialize handler. */
const handler = async function (_req, _res, _db, _logger) {
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

    /* Initialize options. */
    const options = {
        key: tag.slice(2),
        include_docs: true,
        descending: true
    }

    console.log('OPTIONS', options)

    const docs = await _db.allDocs(options)
        .catch(_err => _logger.error(_err))

    /* Validate docs. */
    if (docs && docs.rows.length) {
        /* Retrieve the doc recordset. */
        const doc = docs.rows[0].doc

        _logger.info(doc)

        let results = null
        let error = null

        /* Set rand. */
        const rand = doc['nameNew'][1]

        /* Set transaction id. */
        const txId = doc['nameNew'][0]

        /* Set initial value. */
        // FIXME Require a valid zite address.
        const initValue = '{}'

        /* Set manager. */
        const manager = 'MyZTAGS74akZBiqYPKuvD3zGCfL8tGmXpz'

        results = await execFile('namecoin-cli', ['name_firstupdate', tag, rand, txId, initValue, manager])
            .catch(_err => {
                _logger.error('ERROR:', _err)
                error = _err.stderr
                // error = _err.message

                _res.json({ error })
            })

        _logger.debug(results)

        if (results && results.stdout !== '') {
            /* Update doc completed status. */
            doc['isCompleted'] = true

            /* Set first update. */
            doc['firstUpdate'] = new Date().toISOString()

            _db.put(doc, function (_err, _result) {
                if (_err) {
                    return _logger.error('ERROR updating database', _err)
                }

                _logger.info('Successfully updated entry', _result)

                /* Return ALL results. */
                _res.json({ results, _result })
            })
        } else {
            _logger.error('Failed to update blockchain', results)

            /* Return error results. */
            _res.json(results)
        }
    } else {
        /* Set error. */
        const error = 'No records found.'

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
