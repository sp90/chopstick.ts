# <img src="https://github.com/sp90/chopstick.ts/blob/e71c2d3830cef14b0b1617328f07826bded1d892/misc/chopstick.svg" width="60px"></img> Chopstick.ts

A Typescript first web framework running on [Bun](https://bun.sh)

<br />
  
[![Chopstick.ts - build and test](https://github.com/sp90/chopstick.ts/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/sp90/chopstick.ts/actions/workflows/build-and-test.yml) [![npm version](https://badge.fury.io/js/chopstick.ts.svg)](https://badge.fury.io/js/chopstick.ts)

## Table of content

- Getting started
- Method support state

<br />

### Getting started

```sh
# Install package
bun install chopstick.ts
```

```ts
// basic app called on
// localhost:3000/hello/1?hello=world&hello=anotherworld
import Chopstick from 'chopstick.ts'

const app = new Chopstick()

app.use('/hello', () => {
  console.log('hello middle')
})

app.get('/hello/:id', ({ query, params }, res) => {
  console.log('hello')

  console.log(params) // { id: "1" }
  console.log(query) // { hello: [ "world", "anotherworld" ] }

  return res.json({
    singleFound: true,
  })
})

app.listen()
```

<br />

### Method support state

| app.methods        | support |                             comment                              |
| ------------------ | :-----: | :--------------------------------------------------------------: |
| app.listen         |   ✅    |                                                                  |
| app.all            |   ✅    |                                                                  |
| app.get            |   ✅    |                                                                  |
| app.put            |   ✅    |                                                                  |
| app.post           |   ✅    |                                                                  |
| app.use            |   ✅    |                                                                  |
| app.delete         |   ✅    |                                                                  |
| app.error          |   ✅    |                put at the end to catch all errors                |
| app.cors           |   ✅    | this works similar as the NPM-cors package for express extension |
| app.defaultHeaders |   ✅    |         Override the default headers in the application          |

| res.methods    | support |                          comment                          |
| -------------- | :-----: | :-------------------------------------------------------: |
| res.status     |   ✅    |                                                           |
| res.text       |   ✅    |                                                           |
| res.json       |   ✅    |                                                           |
| res.end        |   ✅    |                                                           |
| res.setHeader  |   ✅    | This will override a single header for this one response  |
| res.setHeaders |   ✅    | This will override multiple headers for this one response |

### Default headers

The base headers are the same base headers that are represented in NPM-helmet

| header                            | default header value                                                                                                                                                                                                                                                                |
| --------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content-Security-Policy           | default-src 'self';base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests |
| Cross-Origin-Embedder-Policy      | require-corp                                                                                                                                                                                                                                                                        |
| Cross-Origin-Opener-Policy        | same-origin                                                                                                                                                                                                                                                                         |
| Cross-Origin-Resource-Policy      | same-origin                                                                                                                                                                                                                                                                         |
| Expect-CT                         | max-age=0                                                                                                                                                                                                                                                                           |
| Origin-Agent-Cluster              | ?1                                                                                                                                                                                                                                                                                  |
| Referrer-Policy                   | no-referrer                                                                                                                                                                                                                                                                         |
| Strict-Transport-Security         | max-age=15552000; includeSubDomains                                                                                                                                                                                                                                                 |
| X-Content-Type-Options            | nosniff                                                                                                                                                                                                                                                                             |
| X-DNS-Prefetch-Control            | off                                                                                                                                                                                                                                                                                 |
| X-Download-Options                | noopen                                                                                                                                                                                                                                                                              |
| X-Frame-Options                   | SAMEORIGIN                                                                                                                                                                                                                                                                          |
| X-Permitted-Cross-Domain-Policies | none                                                                                                                                                                                                                                                                                |
| X-XSS-Protection                  | 0                                                                                                                                                                                                                                                                                   |
