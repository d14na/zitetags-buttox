/* Initialize handler. */
const handler = async function (_req, _res, _db, _logger) {
    return res.json({
        error: 'Offline.'
    })

    /* Set profile id. */
    let profileId = _req.params.profileId

    /* Set public key. */
    let publicKey = _req.params.publicKey

    /* Validate profile id. */
    if (!profileId || profile.indexOf('@') === -1) {
        return _res.json({ error: `[ ${profileId} ] is NOT valid.` })
    }

    /* Set unconfirmed flag. */
    const unconfirmed = false

    const entry = { profileId, publicKey, unconfirmed }

    _db.put(entry, function (_err, _result) {
        if (_err) {
            return _logger.error('ERROR saving to database', _err)
        }

        _logger.info('Successfully added new entry', _result)
    })
}

/* Export handler. */
module.exports = handler
