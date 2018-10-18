const express = require('express')
const util = require('util')

const app = express()
const port = 3000

const execFile = util.promisify(require('child_process').execFile)

app.get('/', async (req, res) => {
    /* Initialize body. */
    let body = ''

    body += `<h1>Zitetags is Online!</h1>`
    body += `<h3>Requesting node status, please wait...</h3>`

    const { stdout } = await execFile('namecoin-cli', ['-getinfo'])
    // console.log(stdout)

    body += `<blockquote><pre>${stdout}</pre></blockquote>`

    /* Initizlize HTML. */
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Zitetags Status</title>
      </head>
      <body>
      ${body}
      </body>
    </html>
    `

    res.end(html)
})

app.listen(port, () => console.log(`Zitetags listening on port ${port}!`))
