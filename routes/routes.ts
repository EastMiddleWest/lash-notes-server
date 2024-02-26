
import {Router} from 'express'
import ClientController from '../controllers/ClientController'
import NoteController from '../controllers/NoteController'
import ClientModel from '../models/client'

import TgBot from '../bots/TelegramBot'

import Cron from '../controllers/Cron';

const router = Router()


router.get('/notesByMonth', NoteController.getNotesByMonth)
router.get('/searchNotes', NoteController.searchNotes)
router.post('/addNote', NoteController.addNote)
router.delete('/deleteNote', NoteController.deleteNote)
router.put('/updateNote', NoteController.updateNote)

router.get('/getClients', ClientController.getClients)
router.get('/getClientById', ClientController.getClientById)
router.post('/addClient', ClientController.addClient)
router.put('/updateClient', ClientController.updateClient)
router.delete('/deleteClient', ClientController.deleteClient)

router.get('/test1', async (req, res) =>{
  Cron.test(() =>{
    console.log('cd started')
    TgBot.sendMessage(465076362,'hello from cron')
  })
  res.status(200).json('Run!')
})

// router.get('/test2', async (req, res) =>{
//   Cron.start('2')
//   res.status(200).json('Run!')
// })

// router.get('/test3', async (req, res) =>{
//   Cron.start('3')
//   res.status(200).json('Run!')
// })

// router.get('/testStop', async (req, res) =>{
//   Cron.stop('2')
//   res.status(200).json('Run!')
// })



export default router