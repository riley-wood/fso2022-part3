const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

morgan.token('person', (request, response) => {
    return JSON.stringify(request.body)
})

app.use(morgan('tiny', {
    skip: function (request, response) {
        return request.method === 'POST'
    }
}))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person', {
    skip: function (request, response) { 
        return request.method !== 'POST'
    }
}))

let data = 
[
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(data)
})

app.get('/info', (request, response) => {
    const currentTime = new Date()
    const responseContent = 
    `Phonebook has info for ${data.length} people.<br />
    ${currentTime}`

    response.send(responseContent)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = data.find(a => a.id === id)
    person ? response.json(person) : response.status(404).end()
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    data = data.filter(a => a.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const entry = request.body

    if(!entry.name) {
        return response.status(400).json( {
            error: 'name missing'
        })
    }

    if(!entry.number) {
        return response.status(400).json( {
            error: 'number missing'
        })
    }

    if (data.some( a => a.name.toLowerCase() === entry.name.toLowerCase() )) {
        return response.status(400).json( {
            error: 'that person already exists in the database'
        })
    }
    entry.id = Math.floor(Math.random()*10000)

    data = data.concat(entry)
    response.json(entry)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})