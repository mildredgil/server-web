var personService = require('../service/personas');
const bcrypt = require( 'bcryptjs' );
const jsonwebtoken = require( 'jsonwebtoken' );
const { secretToken } = require('../config');

/**
 * Function to create the user in user collection.
 */
exports.create = function (req, res) {
    var body = new Person(req.body);
    
    if (!body.username || !body.nombre || !body.password) {
        res.statusMessage = 'Username, name or password is missing.';
        return res.status(406).end();
    }

    bcrypt.hash(body.password, 10)
    .then((hashedPassword) => {
        body.password = hashedPassword;
        personService.createPersona(body, function (error, response) {
            if (response) {
                return res.status(201).send(response);
            } else if (error) {
                return res.status(400).send(error);
            }
        }); 
    }).catch((err) => {
        res.statusMessage = err.message;
        return res.status(400).end();
    });
}

/**
 * Function to find user from user collection.
 */
exports.login = function (req, res) {
    var body = req.body;

    if (!body.username || !body.password) {
        res.statusMessage = "El campo de usuario o de contraseña esta vacío.";
        return res.status(406).end();
    }

    personService.findPersona({username: body.username}, function (error, response) {
        if (error) {
            res.statusMessage = error.message;
            return res.status(404).end();
        }
        if (response) {
            bcrypt.compare(body.password, response.password)
            .then((result) => {
                if(result) {
                    let userData = {
                        nombre: response.nombre,
                        username: response.username
                    };
                    
                    jsonwebtoken.sign(userData, secretToken, { expiresIn : '60m' }, (err, token) => {
                        if(err) {
                            res.statusMessage = error.message;
                            return res.status(400).end();
                        } else {
                            let data = new PersonData(response);
                            console.log(response.rol)
                            return res.status(200).json({...data, token});
                        }
                    });
                } else {
                    res.statusMessage = "Las credenciales son incorrectas.";
                    return res.status( 409 ).end();
                }
            }).catch((err) => {
                res.statusMessage = err.message;
                return res.status(400).end();
            });
        }
        if (!response) {
            res.statusMessage = "Las credenciales son incorrectas.";
            return res.status(409).end();
        }
    });
}

/**
 * Function to find user from user collection.
 */
exports.find = function (req, res) {
    var body = req.body || {};
    var query = {
        username: body.username
    };
    if (!query && !body.username) {
        res.status(400).send('Bad Request');
        return;
    }
    
    personService.findPersona(query, function (error, response) {
        if (error) {
            res.status(404).send(error);
            return;
        }
        if (response) {
            let userData = new PersonData(response);
            return res.status(200).send(userData);
            
        }
        if (!response) {
            res.status(204).send('No Data Found');
        }
    });
}

/**
 * Function to get all users from user collection.
 */
exports.all = function (req, res) {
    
    personService.findPersonas({}, function (error, response) {
        if (error) {
            res.status(404).send(error);
            return;
        }
        if (response) {
            res.status(200).send(response);
            return;
        }
        if (!response) {
            res.status(204).send('No Data Found');
        }
    });
}

/**
 * Function to get users from user collection.
 */
exports.team = function (req, res) {
    
    personService.findPersonas({rol: 1}, function (error, response) {
        if (error) {
            res.status(404).send(error);
            return;
        }
        if (response) {
            let investigadores = response;

            personService.findPersonas({rol: 2}, function (error, response) {
                if (error) {
                    res.status(404).send(error);
                    return;
                }
                if (response) {
                    let equipo = response;
        
                    res.status(200).send({investigadores, equipo});
                }
                if (!response) {
                    res.status(204).send('No Data Found');
                }
            });
        }
        if (!response) {
            res.status(204).send('No Data Found');
        }
    });
}

/**
 * Function to update the user data  by their ID.
 */
exports.updateById = function (req, res) {
    var body = req.body;

    if (!body.id) {
        res.status(400).send('Id is missing');
        return;
    }
    var updateData = body.data || {}
    personService.updatePersonaById(body.id, updateData, (err, response) => {
        if (response) {
            res.status(200).send(response);
        } else if (err) {
            res.status(400).send(err);
        }
    });
}

/**
 * Function to uodate the user data by filter condition.
 */
exports.update = function (req, res) {
    var body = req.body;
    var query = body.query;
    var data = body.data;
    var options = body.options;

    if (!query) {
        res.status(400).send('Bad request');
        return;
    }

    personService.updatePersona(query, data, options, (err, response) => {
        if (response) {
            if(response.username) {
                personService.findPersona({username: response.username}, function (error, response) {
                    if (error) {
                        res.status(404).send(error);
                        return;
                    }
                    if (response) {
                        let userData = new PersonData(response);
                        res.status(200).send(userData);
                        return;
                    }
                    if (!response) {
                        res.status(204).send('No Data Found');
                    }
                });
            } else {
                res.status(200).send(response);
            }
        } else if (err) {
            res.status(400).send(err);
        }
    });
}

/**
 * Function to delete the user from collection.
 */
exports.delete = function (req, res) {
    var body = req.body || {};
    var query = body.query;
    if (!query) {
        res.status(400).send('Bad Request');
        return;
    }
    personService.deletePersona(query, function (error, response) {
        if (error) {
            res.status(400).send(error);
            return;
        }
        if (response) {
            if (response.n === 1 && response.ok === 1) {
                res.status(202).send(body);
            }
            if (response.n === 0 && response.ok === 1) {
                res.status(204).send({
                    message: 'No data found'
                });
            }
        }
    });
}

class Person {
    constructor(personData) {
        this.username = personData.username || '';
        this.nombre = personData.nombre || '';
        this.password = personData.password || '';
        this.rol = personData.rol || 1;
        this.image = personData.image || '/img/default.png';
        this.description = personData.description || 'Colaborador de MEXICOVID19 @ ITESM.';
    }
}

class PersonData {
    constructor(personData) {
        this.username = personData.username || '';
        this.nombre = personData.nombre || '';
        this.rol = String(personData.rol) || 1;
        this.image = personData.image || '/img/default.png';
        this.description = personData.description || 'Colaborador de MEXICOVID19 @ ITESM.';
    }
}