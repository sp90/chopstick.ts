import Chopstick from '../src/bootstrap/app'

const app = new Chopstick()

app.get('/hello/:id', ({ query, params }, res) => {
  console.log('hello')

  console.log(params) // { id: "1" }
  console.log(query) // { hello: [ "world", "anotherworld" ] }

  return res.json({
    singleFound: true,
  })
})

app.use(() => {
  console.log('hello middle')
})

app.listen(3000)
