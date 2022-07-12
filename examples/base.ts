import { RouteCb } from '../public'
import Chopstick from '../src/bootstrap/app'

const app = new Chopstick()

const middleware: RouteCb = (_, res) => {
  res.userData = {
    test: true,
  }
}

const returnJson: RouteCb = (_, res) => {
  const anotherObj = {
    chop: 'world',
  }

  return res.json({ ...anotherObj, ...res.userData })
}

app.get('/chop', [middleware, returnJson])
app.get('/chop/:id', ({ query, params }, res) => {
  console.log('chopchop')

  console.log(params)
  console.log(query)

  return res.json({
    singleFound: true,
  })
})

app.listen()
