var express = require('express');
var router = express.Router();
var multer = require('multer');
const { parse } = require('json2csv');
const validateToken = require('../middleware/validate-token');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

let formData = (x, y) => {
	return {x, y}
}

let storage = multer.diskStorage({
	destination: function (req, file, cb) {
	cb(null, 'data/region/')
  },
  filename: function (req, file, cb) {
	cb(null, file.originalname )
  }
})

var upload = multer({ storage: storage }).single('myFile');

router.post('/data/states', function(req, res) {
	var fs = require('fs');
	var d3 = require('d3');
	var edos_date;

	fs.readFile("data/region/edos_date.csv", "utf8", function(err, data){
		if(err) {
			res.statusMessage = `File doesn't exist or couldn't open`;
			return res.status(409).end();
		}

		edos_date = d3.csvParse(data);
		let values = Object.values(edos_date.columns.slice(1));
		let array =  {
			'data': []
		}

		values.forEach(val => {
			array.data.push({
				id: val,
				data: []
			})
		});

		for(day of edos_date) {
			let date = day.date;
			
			for(i in array.data) {
				let point = formData(date, day[array.data[i].id]);
				array.data[i].data.push(point)
			}			
		}

		//sort 
		var len = array.data[0].data.length
		
		array.data.sort((a,b) => {
			return b.data[len - 1].y - a.data[len - 1].y
		})

		console.log(array.data);
		res.status(200).json(array.data);
	});


	return res;
	
});

router.get('/states/csv', validateToken, function(req, res) {
	var fs = require('fs');
	var d3 = require('d3');
	var edos_date;

	fs.readFile("data/region/edos_date.csv", "utf8", function(err, data){
		if(err) {
			res.statusMessage = `El archivo no existe o no se pudo abrir.`;
			return res.status(409).end();
		}

		edos_date = d3.csvParse(data);
		let csv_data = {
			rows: edos_date,
			columns: edos_date["columns"]
		}
		
		return res.status(200).json(csv_data);
	});

	return res;
});

router.post('/upload/csv', validateToken, function(req, res) {
	upload(req, res, function (err) {
		if (err instanceof multer.MulterError) {
			return res.status(500).json(err)
		} else if (err) {
			return res.status(500).json(err)
		}
		return res.status(200).send(req.file);
	})
});

router.put('/update/csv/:date',validateToken, function(req, res) {
	var date = (req.params.date).replace(/-/g, '/');
	var body = req.body;
	
	if (!body || !body.data.date || !body.data.AGS || !body.data.BC || !body.data.BCS || !body.data.CAMP || !body.data.CDMX || !body.data.CHIH || !body.data.CHIS || !body.data.COAH || !body.data.COL || !body.data.DGO || !body.data.GRO || !body.data.GTO || !body.data.HGO || !body.data.JAL || !body.data.MEX || !body.data.MICH || !body.data.MOR || !body.data.NAY || !body.data.NL || !body.data.OAX || !body.data.PUE || !body.data.QRO || !body.data.QROO || !body.data.SIN || !body.data.SLP || !body.data.SON || !body.data.TAB || !body.data.TAMP || !body.data.TLAX || !body.data.VER || !body.data.YUC || !body.data.ZAC ||!body.data.NACIONAL) {
        return res.status(400).send('Se esperan 32 estados y un dato nacional en el body.');
	}

	var fs = require('fs');
	var d3 = require('d3');
	
	fs.readFile("data/region/edos_date.csv", "utf8", function(err, data) {
		if(err) {
			res.statusMessage = `El archivo no existe o no se pudo abrir.`;
			return res.status(409).end();
		}

		edos_date = d3.csvParse(data);
		let columns= edos_date["columns"];
		console.log(columns)
		let exist = false;
		let newRow = {};
		for(row in edos_date) {
			if( edos_date[row].date == date) {
				console.log(edos_date[row]);
				edos_date[row] = {
					...body.data,
					date
				};
				newRow = edos_date[row];
				exist = true;
			}
		}

		if(!exist) {
			res.statusMessage = "La fecha no es válida o no existe.";
			return res.status(406).end();
		}

		const csvWriter = createCsvWriter({
			path: 'data/region/edos_date.csv',
			header: [
				{id: 'date', title: 'date'},
				{id: 'AGS', title: 'AGS'},
				{id: 'BC', title: 'BC'},
				{id: 'BCS', title: 'BCS'},
				{id: 'CAMP', title: 'CAMP'},
				{id: 'CDMX', title: 'CDMX'},
				{id: 'CHIH', title: 'CHIH'},
				{id: 'CHIS', title: 'CHIS'},
				{id: 'COAH', title: 'COAH'},
				{id: 'COL', title: 'COL'},
				{id: 'DGO', title: 'DGO'},
				{id: 'GRO', title: 'GRO'},
				{id: 'GTO', title: 'GTO'},
				{id: 'HGO', title: 'HGO'},
				{id: 'JAL', title: 'JAL'},
				{id: 'MEX', title: 'MEX'},
				{id: 'MICH', title: 'MICH'},
				{id: 'MOR', title: 'MOR'},
				{id: 'NAY', title: 'NAY'},
				{id: 'NL', title: 'NL'},
				{id: 'OAX', title: 'OAX'},
				{id: 'PUE', title: 'PUE'},
				{id: 'QRO', title: 'QRO'},
				{id: 'QROO', title: 'QROO'},
				{id: 'SIN', title: 'SIN'},
				{id: 'SLP', title: 'SLP'},
				{id: 'SON', title: 'SON'},
				{id: 'TAB', title: 'TAB'},
				{id: 'TAMP', title: 'TAMP'},
				{id: 'TLAX', title: 'TLAX'},
				{id: 'VER', title: 'VER'},
				{id: 'YUC', title: 'YUC'},
				{id: 'ZAC', title: 'ZAC'},
				{id: 'NACIONAL', title: 'NACIONAL'}
			]
		});

		csvWriter
		.writeRecords(edos_date)
		.then((result) => {
			return res.status(200).json(newRow);
		}).catch((err) => {
			res.statusMessage = "No se pudo convertir a csv.";
			res.status(409).end();
		});
	})
});

router.delete('/delete/csv/:date',validateToken, function(req, res) {
	var date = (req.params.date).replace(/-/g, '/');
	
	var fs = require('fs');
	var d3 = require('d3');
	
	fs.readFile("data/region/edos_date.csv", "utf8", function(err, data) {
		if(err) {
			res.statusMessage = `El archivo no existe o no se pudo abrir.`;
			return res.status(409).end();
		}

		edos_date = d3.csvParse(data);
		let exist = false;

		for(row in edos_date) {
			if( edos_date[row].date == date) {
				edos_date.splice(row, 1)
				exist = true;
			}
		}

		if(!exist) {
			res.statusMessage = "La fecha no es válida o no existe.";
			return res.status(406).end();
		}

		const csvWriter = createCsvWriter({
			path: 'data/region/edos_date.csv',
			header: [
				{id: 'date', title: 'date'},
				{id: 'AGS', title: 'AGS'},
				{id: 'BC', title: 'BC'},
				{id: 'BCS', title: 'BCS'},
				{id: 'CAMP', title: 'CAMP'},
				{id: 'CDMX', title: 'CDMX'},
				{id: 'CHIH', title: 'CHIH'},
				{id: 'CHIS', title: 'CHIS'},
				{id: 'COAH', title: 'COAH'},
				{id: 'COL', title: 'COL'},
				{id: 'DGO', title: 'DGO'},
				{id: 'GRO', title: 'GRO'},
				{id: 'GTO', title: 'GTO'},
				{id: 'HGO', title: 'HGO'},
				{id: 'JAL', title: 'JAL'},
				{id: 'MEX', title: 'MEX'},
				{id: 'MICH', title: 'MICH'},
				{id: 'MOR', title: 'MOR'},
				{id: 'NAY', title: 'NAY'},
				{id: 'NL', title: 'NL'},
				{id: 'OAX', title: 'OAX'},
				{id: 'PUE', title: 'PUE'},
				{id: 'QRO', title: 'QRO'},
				{id: 'QROO', title: 'QROO'},
				{id: 'SIN', title: 'SIN'},
				{id: 'SLP', title: 'SLP'},
				{id: 'SON', title: 'SON'},
				{id: 'TAB', title: 'TAB'},
				{id: 'TAMP', title: 'TAMP'},
				{id: 'TLAX', title: 'TLAX'},
				{id: 'VER', title: 'VER'},
				{id: 'YUC', title: 'YUC'},
				{id: 'ZAC', title: 'ZAC'},
				{id: 'NACIONAL', title: 'NACIONAL'}
			]
		});

		csvWriter
		.writeRecords(edos_date)
		.then((result) => {
			return res.status(200).end();
		}).catch((err) => {
			res.statusMessage = "No se pudo convertir a csv.";
			res.status(409).end();
		});
	})
});

router.post('/add/csv/:date', function(req, res) {
	var date = (req.params.date).replace(/-/g, '/');
	var body = req.body;
	
	if (!body || !body.date || !body.AGS || !body.BC || !body.BCS || !body.CAMP || !body.CDMX || !body.CHIH || !body.CHIS || !body.COAH || !body.COL || !body.DGO || !body.GRO || !body.GTO || !body.HGO || !body.JAL || !body.MEX || !body.MICH || !body.MOR || !body.NAY || !body.NL || !body.OAX || !body.PUE || !body.QRO || !body.QROO || !body.SIN || !body.SLP || !body.SON || !body.TAB || !body.TAMP || !body.TLAX || !body.VER || !body.YUC || !body.ZAC ||!body.NACIONAL) {
        return res.status(400).send('Se esperan 32 estados y un dato nacional en el body.');
	}

	var fs = require('fs');
	var d3 = require('d3');
	
	fs.readFile("data/region/edos_date.csv", "utf8", function(err, data) {
		if(err) {
			res.statusMessage = `El archivo no existe o no se pudo abrir.`;
			return res.status(409).end();
		}

		edos_date = d3.csvParse(data);
		let newRow = {...body,date};
		let exist = edos_date.filter(d => d.date == date);
		
		if(!exist) {
			res.statusMessage = "La fecha no es válida o no existe.";
			return res.status(406).end();
		}

		edos_date.push(newRow);

		const csvWriter = createCsvWriter({
			path: 'data/region/edos_date.csv',
			header: [
				{id: 'date', title: 'date'},
				{id: 'AGS', title: 'AGS'},
				{id: 'BC', title: 'BC'},
				{id: 'BCS', title: 'BCS'},
				{id: 'CAMP', title: 'CAMP'},
				{id: 'CDMX', title: 'CDMX'},
				{id: 'CHIH', title: 'CHIH'},
				{id: 'CHIS', title: 'CHIS'},
				{id: 'COAH', title: 'COAH'},
				{id: 'COL', title: 'COL'},
				{id: 'DGO', title: 'DGO'},
				{id: 'GRO', title: 'GRO'},
				{id: 'GTO', title: 'GTO'},
				{id: 'HGO', title: 'HGO'},
				{id: 'JAL', title: 'JAL'},
				{id: 'MEX', title: 'MEX'},
				{id: 'MICH', title: 'MICH'},
				{id: 'MOR', title: 'MOR'},
				{id: 'NAY', title: 'NAY'},
				{id: 'NL', title: 'NL'},
				{id: 'OAX', title: 'OAX'},
				{id: 'PUE', title: 'PUE'},
				{id: 'QRO', title: 'QRO'},
				{id: 'QROO', title: 'QROO'},
				{id: 'SIN', title: 'SIN'},
				{id: 'SLP', title: 'SLP'},
				{id: 'SON', title: 'SON'},
				{id: 'TAB', title: 'TAB'},
				{id: 'TAMP', title: 'TAMP'},
				{id: 'TLAX', title: 'TLAX'},
				{id: 'VER', title: 'VER'},
				{id: 'YUC', title: 'YUC'},
				{id: 'ZAC', title: 'ZAC'},
				{id: 'NACIONAL', title: 'NACIONAL'}
			]
		});

		csvWriter
		.writeRecords(edos_date)
		.then((result) => {
			return res.status(200).json(newRow);
		}).catch((err) => {
			res.statusMessage = "No se pudo convertir a csv.";
			res.status(409).end();
		});
	})
});

module.exports = router;