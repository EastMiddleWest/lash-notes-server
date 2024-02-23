import mongoose,{Schema, Types, HydratedDocumentFromSchema } from "mongoose"

export type TelegramContact = {
  chatId: number;
  firstName: string;
  username: string;
}

type ClientContacts = {
  telegram?: TelegramContact;
  phone?: string;
}

export type Client = {
  name: string;
  contacts: ClientContacts
  notes: Types.ObjectId[]
}

const ClientSchema = new mongoose.Schema<Client>({
  name: {type: String, required: true},
  contacts: {
    telegram :{
      type:{
        chatId:  Number,
        firstName:  String,
        username: String
      },
      required: false,
      _id: false
    },
    phone: {type: String, required: false}
  },
  notes: [{type: Schema.Types.ObjectId, required: true, ref: 'Note'}]
})

export type ClientSchemaReturnType = HydratedDocumentFromSchema<typeof ClientSchema>


const ClientModel = mongoose.model('Client', ClientSchema, 'clients')

export default ClientModel