import { RequestHandler } from 'express';
import NoteModel from '../models/note';

type GetNotesRequestQuery = {
  month: string;
  year: string;
}

type DeleteNoteRequestQuery = {
  id: string;
}

export default class NoteController {

    static getNotesByMonth: RequestHandler<{},{},{}, GetNotesRequestQuery> = async (req, res) => {
      const {month, year} = req.query
      try {
        const notes = await NoteModel.find({year,month}).exec()
        res.json(notes)
      } catch (e) {
          console.error(e);
          res.status(400).send('Bad Request')
      }
    }

    static addNote: RequestHandler = async (req, res) => {
      const data = req.body
      try {
        const note = new NoteModel(data)
        await note.save()
        res.json(note)
      } catch (error) {
        console.error(error);
        res.status(400).send('Bad Request')
      }
    }

    static deleteNote: RequestHandler<{},{},{}, DeleteNoteRequestQuery> = async (req, res) => {
      const {id} = req.query
      try {
        await NoteModel.deleteOne({_id: id})
        res.status(200).end()
      } catch (error) {
        console.error(error);
        res.status(400).send('Bad Request')
      }
    }

    static updateNote: RequestHandler = async (req, res) => {
      const {id,data} = req.body
      try {
        const note = await NoteModel.findOneAndUpdate({_id:id}, data,{ new: true})
        res.json(note)
      } catch (error) {
        console.error(error);
        res.status(400).send('Bad Request')
      }
    }
}