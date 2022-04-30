require('dotenv').config()
const mongoose = require('mongoose')
const Person = require('./models/person')

if (process.argv.length === 3 || process.argv.length > 4) {
    console.log('Usage: node mongo.js <password> <name> <number>')
    process.exit(1)
}

const name = process.argv[2]
const number = process.argv[3]


const person = new Person({
    name: name,
    number: number
})

if (process.argv.length === 2) {
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
}
else {
    person.save().then(result => {
    console.log(`Added ${name} with number ${number} to the database.`)
    mongoose.connection.close()
    })
}