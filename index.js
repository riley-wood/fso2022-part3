require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const { default: mongoose } = require('mongoose')
const { response } = require('express')

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

let data = []

Person.find({}).then( result => {
    data = result.map(a => a.toJSON())
    console.log(data)
})

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then( result => {
        data = result.map(a => a.toJSON())
    })
    response.json(data)
})

app.get('/info', (request, response) => {
    const currentTime = new Date()
    const responseContent =
    `Phonebook has info for ${data.length} people.<br />
    ${currentTime}`

    response.send(responseContent)
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then( person => {
            if ( person ) {
                response.json( person.toJSON() )
            } else {
                response.status(404).end()
            }
        })
        .catch( error => {
            next(error)
        })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person.findByIdAndUpdate(
        request.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            response.json(updatedPerson.toJSON())
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const entry = request.body

    if (data.some( a => a.name.toLowerCase() === entry.name.toLowerCase() )) {
        return response.status(400).json( {
            error: 'that person already exists in the database'
        })
    }

    const person = new Person({
        name: entry.name,
        number: entry.number
    })
    person.save().then( (savedPerson) => {
        console.log(`${entry.name} was added to the database.`)
        response.json(savedPerson.toJSON())
    })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})