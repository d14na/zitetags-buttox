#!/usr/bin/env node

const request = require('superagent')

console.log('Managing Zitetag Firstupdates')
console.log('-----------------------------')

request
    .get('https://zitetags.0net.io/zitetags')
    // .post('/api/pet')
    .send({ name: 'Manny', species: 'cat' }) // sends a JSON post body
    .set('X-API-Key', 'foobar')
    .set('accept', 'json')
    .end((_err, _res) => {
        if (_err) {
            return console.error('ERROR', _err)
        }

        /* Retrieve body. */
        let body = _res.body

        try {
            /* Parse body. */
            // const data = JSON.parse(body)

            /* Retrieve rows. */
            let rows = body['rows']

            // return console.log('ROWS', rows)

            for (let entry of rows) {
                if (entry['doc'].isCompleted === false) {
                    console.log('\nUNCOMLETED', entry)

                    /* Set id. */
                    const id = entry.id
                    console.log(`Now updating [ ${id} ]`)

                    /* Request firstupdate. */
                    request
                        .get(`https://zitetags.0net.io/name-firstupdate/d/${id}`)
                        .end((_err, _res) => {
                            if (_err) {
                                return console.error('ERROR', _err)
                            }

                            /* Retrieve body. */
                            let body = _res.body

                            console.log('\nFIRST UPDATE', body)
                        })

                    break
                }
            }
        } catch (_err) {
            return console.errro('ERROR: Parsing text', text)
        }
    })
