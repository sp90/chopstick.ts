
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

| app.methods | support |                             comment                              |
| ----------- | :-----: | :--------------------------------------------------------------: |
| app.listen  |   ✅    |                                                                  |
| app.all     |   ✅    |                                                                  |
| app.get     |   ✅    |                                                                  |
| app.put     |   ✅    |                                                                  |
| app.post    |   ✅    |                                                                  |
| app.use     |   ✅    |                                                                  |
| app.delete  |   ✅    |                                                                  |
| app.error   |   ✅    |                put at the end to catch all errors                |
| app.cors    |   ✅    | this works similar as the NPM-cors package for express extension |

| res.methods | support | comment |
| ----------- | :-----: | :-----: |
| res.status  |   ✅    |         |
| res.text    |   ✅    |         |
| res.json    |   ✅    |         |
| res.end     |   ✅    |         |
