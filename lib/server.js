import express from 'express'
import ejs from 'ejs'
import bodyParser from 'body-parser'
import cfg from '../config.js'
import MAIN_LOGGER from './logger.js'
import boom from '@hapi/boom'
const logger = MAIN_LOGGER.child({})

const app = express()

export default async (conn) => {
  app.use(bodyParser.urlencoded({ extended: true }));
  app.set('view engine', 'ejs');
  
  app.get('/', (req, res) => {
		res.render('dash')
  })

	app.get('/qr', (req, res) => {
/*		conn.ev.on('connection.update', (update) => {
			const { qr } = update
			res.render('qr', { qr: qr })
		})*/
		res.end('Not finished')
	})

	app.get('/pairing', (req, res) => {
		res.render('pairing')
	})
  app.get('/stop', (req, res) => {
		process.exit()
  }) 
  app.post('/save', async (req, res) => {
  	const data = req.body
  	if(data.hp === '' || data.hp === null || data.hp === undefined){
  		res.render('pairing', { error: 'Please enter your phone number.' })
  	} else /*if(!data.hp.startsWith('64')) {
  		res.render('pairing', { error: 'Invalid phone number format.' })
  	} else*/ {
  		if(!conn.authState.creds.registered) {
  			setTimeout(async function(){
      		const code = await conn.requestPairingCode(data.hp)
      		res.render('pairing', { code: code })
  		  }, 3000)
  		} else {
  			res.render('pairing', { error: 'Phone number registered' })
  		}
  	}
  })
  
  app.listen(cfg.port, () => {
      logger.info(`Server running at http://localhost:${cfg.port}`);
      console.log(`Server running at http://localhost:${cfg.port}`)
  })
}
