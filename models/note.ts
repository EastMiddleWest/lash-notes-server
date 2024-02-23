import mongoose, { Schema, Types, InferSchemaType, HydratedDocument } from "mongoose"

export type Note = {
  year: string,
  day: string,
  month: string,
  client: Types.ObjectId,
  time: {
    from: string,
    to: string,
  },
  master: string,
  content: string
}

const noteSchema = new mongoose.Schema<Note>({
  year: {type: String, required: true},
  day: {type: String, required: true},
  month: {type: String, required: true},
  client: {type: Schema.Types.ObjectId, required: false, ref: 'Client'},
  time: {
    from: {type: String, required: true},
    to: {type: String, required: true},
  },
  master: {type: String, required: true},
  content: {type: String, required: true}
})

export type NoteModelReturnType =  HydratedDocument<InferSchemaType<typeof noteSchema>>

const NoteModel = mongoose.model('Note', noteSchema, 'notes')

export default NoteModel