var express = require('express');
var router = express.Router();
var persona = require('../controller/persona');
const validateToken = require('../middleware/validate-token');

/**
 * To get all person objects
 */
//router.get('/', persona.getAll);

/**
 * To create the New person
 */
router.post('/create', validateToken, persona.create);

/**
 * To get the single persona by their username and login
 */
router.post('/login', persona.login);

/**
 * TO get the single persona by their username eg.email
 */
router.post('/find', validateToken, persona.find);

/**
 * TO get all users 
 */
router.get('/all', validateToken, persona.all);

/**
 * TO get all users with rol gt 0
 */
router.get('/team', persona.team);

/**
 * To update persona data(fields) by persona ID
 */
router.put('/updatebyid', validateToken, persona.updateById);

/**
 * To update the persona data by filter condition
 */
router.put('/update', validateToken, persona.update);

/**
 * To delete the persona by condition
 */
router.delete('/delete', validateToken, persona.delete);

module.exports = router;
