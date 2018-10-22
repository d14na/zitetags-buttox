const express = require('express')
const moment = require('moment')
const PouchDB = require('pouchdb')
const util = require('util')
const winston = require('winston')

/* Initialize databases. */
const profiles = new PouchDB('profiles')
const zitetags = new PouchDB('zitetags')

/* Import handlers. */
// const nameRegisterComplete = require('./handlers/_name-firstupdate.js')
const nameFirstupdate = require('./handlers/_name-firstupdate.js')
const nameNew = require('./handlers/_name-new.js')
const nameShow = require('./handlers/_name-show.js')
const profileAdd = require('./handlers/_profile-add.js')
const status = require('./handlers/_status.js')

const app = express()
const port = 3000

const execFile = util.promisify(require('child_process').execFile)

/**
 * Calculate Log Name (by Date)
 */
const _calcLogName = function (_isError) {
    const today = moment().format('YYYYMMDD')

    if (_isError) {
        return `${today}-error.log`
    } else {
        return `${today}.log`
    }
}

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: './logs/' + _calcLogName(true), level: 'error' }),
        new winston.transports.File({ filename: './logs/' + _calcLogName() })
    ]
})

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }))
}

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

    next()
})

/* Serve favicon.ico. */
app.use('/favicon.ico', express.static(__dirname + '/public/images/favicon.ico'))

/**
 * Namecoin Daemon Status
 */
app.get('/', (_req, _res) => status(_req, _res, logger))

/**
 * Profiles Database Dump
 */
app.get('/profiles', async (_req, _res) => {
    /* Set options. */
    const options = {
        include_docs: true,
        descending: true
    }

    /* Retrieve all docs. */
    const docs = await profiles.allDocs(options)
        .catch(_err => logger.error(_err))

    _res.send(`<pre>${JSON.stringify(docs, null, 4)}</pre>`)
})

/**
 * Registrar Database Dump
 */
app.get('/zitetags', async (_req, _res) => {
    /* Set options. */
    const options = {
        include_docs: true,
        descending: true
    }

    /* Retrieve all docs. */
    const docs = await zitetags.allDocs(options)
        .catch(_err => logger.error(_err))

    _res.send(`<pre>${JSON.stringify(docs, null, 4)}</pre>`)
})

/**
 * Add New Profile
 *
 * FIXME: Change to PUT
 */
app.get('/profile-add/:profileId/:publicKey', (_req, _res) => profileAdd (_req, _res, profiles, logger))

/**
 * Retrieve Profile
 */
// app.get('/profile/:profileId', (_req, _res) => profileInfo (_req, _res, profiles, logger))

/**
 * Command: NAME_NEW
 *
 * FIXME: Change to PUT
 */
app.get('/name-new/d/:tag', (_req, _res) => nameNew (_req, _res, zitetags, logger))

/**
 * Command: NAME_FIRSTUPDATE
 *
 * FIXME: Change to PUT
 *
 * NOTE: Required to wait 12 blocks before finalizing a new registration.
 *       (https://wiki.namecoin.org/index.php?title=Register_and_Configure_.bit_Domains#Finalize_your_registration)
 */
app.get('/name-firstupdate/d/:tag', (_req, _res) => nameFirstupdate (_req, _res, zitetags, logger))

/**
 * Command: NAME_UPDATE
 *
 * FIXME: Change to PUT
 */
// app.get('/name-update/d/:tag', (_req, _res) => nameUpdate (_req, _res, logger))

/**
 * Command: NAME_SHOW
 */
app.get('/name/d/:tag', (_req, _res) => nameShow(_req, _res, logger))

app.listen(port, () => logger.debug(`Zitetags Registrar listening on port ${port}!`))
