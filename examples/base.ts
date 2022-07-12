import Hello from '../public'
import { TRouteCbFunction } from '../src/utility/routeHelpers'

const app = new Hello()

const middleware: TRouteCbFunction = (_, res) => {
  res.userData = {
    test: true,
  }
}

const returnJson: TRouteCbFunction = (_, res) => {
  const anotherObj = {
    hello: 'world',
  }

  return res.json({ ...anotherObj, ...res.userData })
}

app.get('/hello', [middleware, returnJson])
app.get('/hello/:id', ({ query, params }, res) => {
  console.log('hello')

  console.log(params)
  console.log(query)

  return res.json({
    singleFound: true,
  })
})

app.listen()
