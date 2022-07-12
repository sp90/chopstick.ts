import { TRouteCbFunction } from '../src/utility/routeHelpers'

const app = new Chop()

const middleware: TRouteCbFunction = (_, res) => {
  res.userData = {
    test: true,
  }
}

const returnJson: TRouteCbFunction = (_, res) => {
  const anotherObj = {
    chop: 'world',
  }

  return res.json({ ...anotherObj, ...res.userData })
}

app.get('/chop', [middleware, returnJson])
app.get('/chop/:id', ({ query, params }, res) => {
  console.log('chop')

  console.log(params)
  console.log(query)

  return res.json({
    singleFound: true,
  })
})

app.listen()
