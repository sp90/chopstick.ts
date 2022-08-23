import { ChopCb, ChopReq, ChopRes } from '../public'
import Chopstick from '../src/bootstrap/app'

const app = new Chopstick()

const middleware: ChopCb = (_, res) => {
  console.log('hello middleware')
  res.userData = {
    test: true,
  }
}

// Works like #https://www.npmjs.com/package/cors
// But i have rewritten it to fit this little webframework
app.cors()

app.get('/hello', [
  middleware,
  (req, res) => {
    console.log('req.params: ', req.params)
    console.log('req.query: ', req.query)

    console.log('hello return json')
    const anotherObj = {
      chop: 'world',
    }

    return res.json({ ...anotherObj, ...res.userData })
  },
])

app.use(() => {
  console.log('hello everywhere 2')
})

app.get('/hello/:id', ({ query, params }: ChopReq, res: ChopRes) => {
  console.log('chopchop')
  console.log('params: ', params)
  console.log('query: ', query)

  return res.json({
    singleFound: true,
  })
})

// Error handling
app.error((err: Error, req: ChopReq, res: ChopRes) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(3000, (err: Error) => {
  // console.log('listen error: ', err
  console.log('hello world its running')
})
