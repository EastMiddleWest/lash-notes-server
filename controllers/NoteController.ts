import { RequestHandler } from 'express';
import NoteModel, {type Note} from '../models/note';
import ClientController from './ClientController';
import type { ClientSchemaReturnType } from './../models/client';
import Cron from './Cron';

type GetNotesRequestQuery = {
  month: string;
  year: string;
}

type SearchNotesRequestQuery = {
  content: string;
}

type DeleteNoteRequestQuery = {
  id: string;
}

type UpdateNoteRequestQuery = {
  id: string;
}

type ClientWithName = {
  name: string
}

type NoteData = {
  year:  string;
  day: string;
  month: string;
  client: string | ClientWithName;
  time: {
    from: string;
    to: string;
  },
  master: string;
  content: string;
}



export default class NoteController {

    static isExistedClient = (data: {name: string} | string): data is string => {
      return typeof data === 'string'
    }

    static addNote: RequestHandler<{},{},NoteData, {}> = async (req, res) => {
      const noteData =  req.body
      let result
      try {
        if(this.isExistedClient(noteData.client)){
          const note = new NoteModel<NoteData>({...noteData, client: noteData.client})
          await note.save()
          await note.populate({path:'client', select: ['_id', 'name']})
          const client = await ClientController.findById(noteData.client)
          if(client){
            const clientNotes = client.get('notes')
            clientNotes.push(note._id)
            client.set('notes', clientNotes)
            await client.save()
            Cron.createJob(note.id,note, client.id)
            result = note
          }
          else res.status(500).send('Cant find client')
        }
        else {
          const client = ClientController.createClient(noteData.client.name)
          const note = new NoteModel<Note>({...noteData, client: client._id})
          await note.save()
          client.notes.push(note._id)
          await client.save()
          await note.populate({path:'client', select: ['_id', 'name']})
          Cron.createJob(note.id,note, client.id)
          result = note
        }
        res.json(result)
      } catch (error) {
        console.error(error);
        res.status(400).send('Bad Request')
      }
    }

    static getNotesByMonth: RequestHandler<{},{},{}, GetNotesRequestQuery> = async (req, res) => {
      const {month, year} = req.query
      try {
        const notes = await NoteModel.find({year,month}).populate({path:'client', select: ['_id', 'name']}).exec()
        res.json(notes)
      } catch (e) {
          console.error(e);
          res.status(400).send('Bad Request')
      }
    }

    static searchNotes: RequestHandler<{},{},{}, SearchNotesRequestQuery> = async (req, res) => {
      const {content} = req.query
      try {
        const notes = await NoteModel.find({content : new RegExp(content, "i")}).populate({path: 'client', select: 'name'}).exec()
        res.status(200).json(notes)
      } catch (e) {
          console.error(e);
          res.status(400).send('Bad Request')
      }
    }

    static deleteNote: RequestHandler<{},any,{}, DeleteNoteRequestQuery> = async (req, res) => {
      const {id} = req.query
      try {
        const note = await NoteModel.findById(id)
        if(note) {
          Cron.cancelJob(note.id)
          const client = await ClientController.findById(note.client)
          if(client){
            const notes = client.get('notes')
            const filtered = notes.filter(noteId => !noteId.equals(id))
            client.set('notes', filtered)
            await client.save()
            //const res = await NoteModel.findByIdAndDelete(note._id)
            await note.deleteOne()
            res.status(200).end()
          }
          else res.status(500).send('Cant find client of this note')
        }
        else res.status(500).send('Cant find the note')
      } catch (error) {
        console.error(error);
        res.status(400).send('Bad Request')
      }
    }

    static updateNote: RequestHandler<{},any,NoteData, UpdateNoteRequestQuery> = async (req, res) => {
      const {id} = req.query
      const noteData = req.body
      try {
        const existedNote = await NoteModel.findById(id).populate<{client: ClientSchemaReturnType}>({path:'client'})
        if(existedNote){
          Cron.cancelJob(existedNote.id)
          const prevClient = existedNote.client
          if(this.isExistedClient(noteData.client)){
            //existed client
            const isTheSameClient = prevClient.id === noteData.client
            if(isTheSameClient) {
                //same existed client
                const note = await NoteModel.findByIdAndUpdate(id, noteData,{ new: true}).populate({path:'client', select: ['_id', 'name']})
                if(note){
                  //success update
                  Cron.createJob(note.id, note, prevClient.id)
                  res.json(note)
                }
                else res.status(500).send('Cant update the note')
            }
            else {
              //another existed client
              const notes = prevClient.get('notes')
              const filteredNotes = notes.filter(clientId => !clientId.equals(id))
              prevClient.set('notes', filteredNotes)
              await prevClient.save()
              const newExistedCliient = await ClientController.findById(noteData.client)
              if(newExistedCliient){
                const note = await NoteModel
                .findByIdAndUpdate(id,{...noteData, client: newExistedCliient._id}, {new: true})
                .populate({path:'client', select: ['_id', 'name']})
                if(note){
                  //success update
                  const filterdNotes = newExistedCliient.get('notes')
                  filterdNotes.push(note._id)
                  newExistedCliient.set('notes', filterdNotes)
                  await newExistedCliient.save()
                  Cron.createJob(note.id, note, newExistedCliient.id)
                  res.json(note)
                }
                else res.status(500).send('Cant update the note')
              }
              else res.status(500).send('Cant find existed client to change')
            }
          }
          else {
            //new client
            const newClient = ClientController.createClient(noteData.client.name)
            const note = await NoteModel.findByIdAndUpdate(id,{...noteData, client: newClient._id}, {new: true})
            if(note){
              const newClientNotes = newClient.get('notes')
              newClientNotes.push(note._id)
              newClient.set('notes', newClientNotes)
              await newClient.save()
              const notes = prevClient.get('notes')
              const filteredNotes = notes.filter(clientId => !clientId.equals(id))
              prevClient.set('notes', filteredNotes)
              await prevClient.save()
              await note.populate({path:'client', select: ['_id', 'name']})
              Cron.createJob(note.id, note, newClient.id)
              res.json(note)
            }
            else res.status(500).send('Cant update this note')
          }
        }
        else res.status(500).send('Cant find this note')
      } catch (error) {
        console.error(error);
        res.status(400).send('Bad Request')
      }
    }
}