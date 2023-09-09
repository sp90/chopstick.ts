# <img src="https://github.com/sp90/chopstick.ts/blob/e71c2d3830cef14b0b1617328f07826bded1d892/misc/chopstick.svg" width="60px"></img> Chopstick.ts

A Typescript first web framework running on [Bun](https://bun.sh)

<br />
  
[![Chopstick.ts - build and test](https://github.com/sp90/chopstick.ts/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/sp90/chopstick.ts/actions/workflows/build-and-test.yml) [![npm version](https://badge.fury.io/js/chopstick.ts.svg)](https://badge.fury.io/js/chopstick.ts)

## Table of content

- Getting started
- Method support state

<br />

### Getting started

Important to know is, this is not aiming to be a drop in replacement for express this aims to be a slim framework that works super will in the 🥟 bun ecosystem.

It is though very inspired by the express syntax so its easy to adopt, currently solo working on the project but are open to PR's - besides that documentation & unit tests are coming

I'm also working on my first application that is utilizing this package in production

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

app.methods        | Support | Comment                                                          |
-------------------| :-----: | :--------------------------------------------------------------: |
app.listen         |   ✅    | Starts a server and listens for incoming requests                |
app.all            |   ✅    | Matches any HTTP method and route                                |
app.get            |   ✅    | Handles GET requests                                             |
app.put            |   ✅    | Handles PUT requests                                             |
app.post           |   ✅    | Handles POST requests                                            |
app.use            |   ✅    | Mounts middleware to be executed in the request-response cycle   |
app.delete         |   ✅    | Handles DELETE requests                                          |
app.error          |   ✅    | Put at the end to catch all errors                               |
app.cors           |   ✅    | This works similar to the NPM-cors package for express extension |
app.defaultHeaders |   ✅    | Override the default headers in the application                  |

res.methods       | Support | Comment                                          |
------------------| :-----: | :----------------------------------------------: |
res.status        |   ✅    | Sets the HTTP status code for the response       |
res.text          |   ✅    | Sends a plain text response                      |
res.json          |   ✅    | Sends a JSON response                            |
res.end           |   ✅    | Ends the response process                        |
res.setHeader     |   ✅    | Overrides a single header for this one response  |
res.setHeaders    |   ✅    | Overrides multiple headers for this one response |

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
