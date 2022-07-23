import { ChopCb, ChopReq, ChopRes } from '../public'
import Chopstick from '../src/bootstrap/app'

const app = new Chopstick()

const middleware: ChopCb = (_, res) => {
  console.log('hello middleware')
  res.userData = {
    test: true,
  }
}

const returnJson: ChopCb = (_, res) => {
  console.log('hello return json')
  const anotherObj = {
    chop: 'world',
  }

  return res.json({ ...anotherObj, ...res.userData })
}

app.use(() => {
  console.log('hello everywhere')
})

app.use('/hello', () => {
  console.log('hello everywhere 2')
})

app.get('/hello', [middleware, returnJson])
app.get('/hello/:id', ({ query, params }: ChopReq, res: ChopRes) => {
  console.log('chopchop')
  console.log('params: ', params)
  console.log('query: ', query)

  return res.json({
    singleFound: true,
  })
})

app.listen({ port: process.env.PORT })
// Defaults to port 3000
//
// To run on port 8080 do:
// app.listen({ port: 8080 })
