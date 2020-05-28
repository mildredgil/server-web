var municipioService = require('../service/municipios');

/**
 * Function to create the user in user collection.
 */
exports.create = function (req, res) {
    var body = new Municipio(req.body);
    if ( (!body.cve_ent_mun || !body.cve_ent && !body.cve_mun) && !body.nombre ) {
        res.statusMessage = 'CVE_ENT or CVE_MUN or name is missing';
        res.status(400).end();
        return;
    }

    municipioService.createMunicipio(body, function (error, response) {
        if (response) {
            res.status(201).send(response);
        } else if (error) {
            res.statusMessage = 'duplicated data';
            return res.status(400).end();
        }
    });
}

/**
 * Function to find user from user collection.
 */
exports.findByEnt = function (req, res) {
    var params = req.params || {};
    var query = {
        cve_ent: params.cve_ent
    };
    
    if (!query) {
        res.statusMessage = 'cve_ent is missing';
        res.status(400).end();
        return;
    }

    municipioService.findMunicipioByEnt(query, function (error, response) {
        if (error) {
            res.status(404).send(error);
            return;
        }
        if (response) {
            console.log(response.length)
            res.status(200).send(response);
            return;
        }
        if (!response) {
            res.status(204).send('No Data Found');
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
    
    fs.readFile("data/mun/municipios_updated.csv", "utf8", async function(err, data) {
		let mun = d3.csvParse(data);
		let poblacion_csv = await fs.promises.readFile('data/mun/poblacion.csv', 'binary')
		let poblacion = d3.csvParse( poblacion_csv ).map(l=>({ 
			cve_ent_mun: l.Cve_Ent.toString().padStart(2, 0)+l.Cve_Mun.toString().padEnd(3, 0), 
			poblacion: l.Pob_Total 
		}))
		let mun_grouped = mun.reduce((r, a)=>{
			key = a.cve_ent_mun.padStart(5, 0);
			r[key] = r[key] || [];
			r[key].push(a);
			return r;
		}, Object.create(null))
		let mun_arr = []
		for (const municipio in mun_grouped) {
			query = { cve_ent_mun: municipio }
			let mun_indice_vulnerabilidad;
			switch (mun_grouped[municipio][0].indice_vulnerabilidad) {
				case "No Disponible":
					mun_indice_vulnerabilidad = -1;
					break;
				case "sin vulnerabilidad": 
					mun_indice_vulnerabilidad = 0;
					break;
				case "vulnerabilidad baja":
					mun_indice_vulnerabilidad = 1;
					break;
				case "vulnerabilidad media":
					mun_indice_vulnerabilidad = 2;
					break;
				case "vulnerabilidad alta":
					mun_indice_vulnerabilidad = 3;
					break;
				case "vulnerabilidad muy alta":
					mun_indice_vulnerabilidad = 4;
					break;
				default:
					mun_indice_vulnerabilidad = -1;
					break;
			}
			let mun_poblacion = poblacion.find(l=>l.cve_ent_mun == municipio).poblacion;
			let mun_confirmados = mun_grouped[municipio].map(l=>({
				date: dateToString(l.fecha),
				count: l.confirmados
			}))
			let mun_decesos = mun_grouped[municipio].map(l=>({
				date: dateToString(l.fecha),
				count: l.decesos
			}))
			let mun_pruebas = mun_grouped[municipio].map(l=>({
				date: dateToString(l.fecha),
				count: l.decesos
			}))
			let mun_data = {
				decesos: mun_decesos,
				confirmados: mun_confirmados,
				pruebas: mun_pruebas,
				indice_vulnerabilidad: Number(mun_indice_vulnerabilidad),
				poblacion: mun_poblacion
			}
			Municipios
			.updateMunicipio(query, mun_data ) 
			.then( result => {
				if( !result ) {
					return errorResponse(res, 404, `The municipality does not exist`);
				}
				console.log("RESULT", result)
			})
			.catch( _ => {
				return errorResponse(res, 500, "Something is wrong with the Database. Try again later.");
			})
			mun_arr.push({cve_ent_mun: municipio, ...mun_data})
		}
		return res.status(200).json(mun_arr);
	})

    municipioService.updateMunicipio(query, data, options, (err, response) => {
        if (response) {
            res.status(200).send(response);
        } else if (err) {
            res.status(400).send(err);
        }
    });
}

class Municipio {
    constructor(munData) {
        this.cve_ent_mun = munData.cve_ent_mun || ( munData.cve_ent.toString()+munData.cve_mun.toString() || '');
        this.cve_ent = munData.cve_ent || '';
        this.cve_mun = munData.cve_mun || '';
        this.nombre = munData.nombre || '';
        this.poblacion = munData.poblacion || 0;
        this.decesos = munData.decesos || [];
        this.confirmados = munData.confirmados || [];
        this.pruebas = munData.pruebas || [];
        this.indice_vulnerabilidad = munData.indice_vulnerabilidad || -1;
    }
}