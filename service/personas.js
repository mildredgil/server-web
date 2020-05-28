(function () {
    var mongoose = require('mongoose');
    var persona = mongoose.model('personas');
    /**
     * Function to execute the create query to create the person.
     * @param {*} data person data
     * @param {*} callback callback function.
     */
    exports.createPersona = function (data, callback) {
        persona.create(data).then((response) => {
            callback(null, response);
        }, (error) => {
            callback(error, null);
        });
    };

    /**
     * Funtion to find the person from collections.
     * @param {*} query condition or expression to find the person from collection.
     * @param {*} callback callback function
     */
    exports.findPersona = function (query, callback) {
        persona.findOne(query, callback);
    }

    /**
     * Funtion to find the person from collections.
     * @param {*} query condition or expression to find the person from collection.
     * @param {*} callback callback function
     */
    exports.findPersonas = function (query, callback) {
        persona.find(query, callback).select('-password').sort({ 'rol': 1 });
    }

    /**
     * Function to execute the update query by user ID
     * @param {*} id person id
     * @param {*} data person data which we need to update.
     */
    exports.updatePersonaById = function (id, data, callback) {
        persona.findByIdAndUpdate({
            _id: id
        }, data, (err, response) => {
            callback(err, response);
        });
    }

    /**
     * Function to execute the update query.
     * @param {*} query Condition or filter to find the person.
     * @param {*} data data which we need to update.
     * @param {*} options 
     */
    exports.updatePersona = function (query, data, options, callback) {
        persona.findOneAndUpdate(query, data, options, (err, response) => {
            callback(err, response);
        });
    }

    exports.deletePersona = function (query, callback) {
        persona.deleteOne(query, callback);
    }

})()