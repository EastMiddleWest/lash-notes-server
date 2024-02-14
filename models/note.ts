import mongoose from "mongoose"

const noteSchema = new mongoose.Schema({
  year: {type: String, required: true},
  day: {type: String, required: true},
  month: {type: String, required: true},
  time: {
    from: {type: String, required: true},
    to: {type: String, required: true},
  },
  master: {type: String, required: true},
  content: {type: String, required: true}
})

const NoteModel = mongoose.model('note', noteSchema, 'notes')

export default NoteModel