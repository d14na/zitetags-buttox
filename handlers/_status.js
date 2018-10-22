const numeral = require('numeral')
const util = require('util')

/* Initialize file execution. */
const execFile = util.promisify(require('child_process').execFile)

/* Initialize handler. */
const handler = async function (_req, _res, _logger) {
    /* Initialize body. */
    let body = ''

    body += `<h1>Zitetags Registar Status</h1>`

    const { stdout } = await execFile('namecoin-cli', ['-getinfo'])
    _logger.debug(stdout)

    /* Initialize data. */
    let data = null

    try {
        data = JSON.parse(stdout)
    } catch (_err) {
        _logger.error('ERROR parsing stdout', stdout)
    }

    /* Validate data. */
    if (data) {
        body += `
<blockquote><pre><h3>
Namecoin Version: <strong>${data['version']}</strong>
Protocol Version: <strong>${data['protocolversion']}</strong>
  Wallet Version: <strong>${data['walletversion']}</strong>
  Wallet Balance: <strong>${data['balance']}</strong>
   Current Block: <strong>${numeral(data['blocks']).format('0,0')}</strong>
        Warnings: <strong>${data['warnings']}</strong>
</h3></pre></blockquote>`
    } else {
        // TODO Detect JSON request and respond with machine-readable format.
        body += `<blockquote><pre>${stdout}</pre></blockquote>`
    }

    /* Initizlize HTML. */
    const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Zitetags Status</title></head>
<body>${body}</body></html>
    `

    _res.end(html)
}

/* Export handler. */
module.exports = handler
