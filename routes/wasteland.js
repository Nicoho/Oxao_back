import express from 'express';
import path from 'path';
import moment from 'moment';


const router = express.Router();
const connection = require('./config');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../public/images'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}.jpg`);
  }
});

const upload = multer({ storage });

router.get('/map', (req, res) => {
  connection.query('SELECT latitude, longitude, id, state FROM wasteland WHERE state!="val"', (err, results) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(results);
    }
  });
});

router.get('/', (req, res) => {
  const { state } = req.query;
  let sqlQuery = '';
  switch (state) {
    case 'val':
      sqlQuery = 'SELECT id, latitude, longitude, date FROM wasteland WHERE state="val"';
      break;
    case 'ok':
      sqlQuery = 'SELECT id, department, municipality, date FROM wasteland WHERE state="ok"';
      break;
    case 'res':
      sqlQuery = 'SELECT picture1, id, name, rehabPicture, description_rehab FROM wasteland WHERE state="res"';
      break;
    default:
      sqlQuery = 'SELECT * from wasteland';
  }

  connection.query(sqlQuery, (err, results) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(results);
    }
  });
});

router.put('/rehab/:id(\\d+)', upload.single('photo'), (req, res) => {
  const { body, file } = req;
  const { id } = req.params;
  let wasteland = {};
  try {
    wasteland = JSON.parse(body.form);
  } catch (error) {
    res.sendStatus(500);
  }

  const form = {
    ...wasteland,
    state: 'res',
    rehabPicture: file.filename,
  };

  connection.query('UPDATE wasteland SET ? WHERE id=?', [form, id], (err) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.sendStatus(201);
    }
  });
});

router.get('/:id(\\d+)', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM wasteland WHERE id = ?', [id], (err, results) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(results[0]);
    }
  });
});

router.post('/', upload.array('photos[]', 3), (req, res) => {
  const { body, files } = req;
  const form = {
    ...JSON.parse(body.form),
    state: 'val',
    date: moment().format('YYYY-MM-DD'),
  };

  for (let i = 0; i < files.length; i += 1) {
    form[`picture${i + 1}`] = files[i].filename;
  }

  connection.query('INSERT INTO wasteland SET ?', form, (err) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.sendStatus(201);
    }
  });
});

router.put('/:id(\\d+)', (req, res) => {
  const { id } = req.params;
  const { body } = req;
  connection.query('UPDATE wasteland SET ? WHERE id=?', [body, id], (err) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

router.delete('/:id(\\d+)', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM wasteland  WHERE id=?', [id], (err) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

router.get('/search', (req, res) => {
  const { name, state, department, municipality, pollution, rehab, ownerLastname } = req.query;
  const hasCriterion = Object.keys(req.query).includes('criterion');
  if (hasCriterion) {
    res.sendStatus(501);
  } else if (req.query.name) {
    connection.query('SELECT * FROM wasteland where name = ?', name, (err, results) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.json(results);
      }
    });
  } else if (req.query.state) {
    connection.query('SELECT * FROM wasteland where state = ?', state, (err, results) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.json(results);
      }
    });
  } else if (req.query.department) {
    connection.query('SELECT * FROM wasteland where department = ?', department, (err, results) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.json(results);
      }
    });
  } else if (req.query.municipality) {
    connection.query('SELECT * FROM wasteland where municipality = ?', municipality, (err, results) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.json(results);
      }
    });
  } else if (req.query.pollution) {
    connection.query('SELECT * FROM wasteland where pollution = ?', pollution, (err, results) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.json(results);
      }
    });
  } else if (req.query.rehab) {
    connection.query('SELECT * FROM wasteland where rehab = ?', rehab, (err, results) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.json(results);
      }
    });
  } else if (req.query.ownerLastname) {
    connection.query('SELECT * FROM wasteland where owner_lastname = ?', ownerLastname, (err, results) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.json(results);
      }
    });
  }
});

export default router;
