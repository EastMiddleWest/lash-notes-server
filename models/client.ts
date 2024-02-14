import mongoose from "mongoose"

const clientSchema = new mongoose.Schema({
  name: {type: String, required: true},
  content: {type: String, required: true}
})

const ClientModel = mongoose.model('client', clientSchema, 'clients')

export default ClientModel