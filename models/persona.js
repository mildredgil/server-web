const mongoose = require( 'mongoose' );

const personasSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    rol: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

const personas = mongoose.model( 'personas', personasSchema );

module.exports = { personas };