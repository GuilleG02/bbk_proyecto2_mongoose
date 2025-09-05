const express = require('express')
const cors = require('cors') 
const path = require('path') 
const app = express()
const PORT = 3001
const { dbConnection } = require('./config/config')
const { typeError } = require('./middlewares/errors')

app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

dbConnection()

app.use('/users', require('./routes/users'))
app.use('/posts', require('./routes/posts'))
app.use('/comments', require('./routes/comments'))

app.use(typeError)

app.listen(PORT, () => console.log(`Server started at port ${PORT}`))
