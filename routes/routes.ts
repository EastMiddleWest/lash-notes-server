
import {Router} from 'express'
import ClientController from '../controllers/ClientController'
import NoteController from '../controllers/NoteController'


const router = Router()

router.get('/notesByMonth', NoteController.getNotesByMonth)

router.post('/addNote', NoteController.addNote)

router.delete('/deleteNote', NoteController.deleteNote)

router.put('/updateNote', NoteController.updateNote)

router.get('/getClients', ClientController.getClients)

router.post('/addClient', ClientController.addClient)

export default router