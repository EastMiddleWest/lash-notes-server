require('dotenv').config()
import express = require('express')
import mongoose = require('mongoose')
import Routes from './routes/routes'
import cors from 'cors'
import TgBot from './bots/TelegramBot'
import ClientController from './controllers/ClientController'
import type { TelegramContact } from './models/client'

TgBot.onText(/(.*)/,async (msg)=>{
  if(msg.from?.first_name && msg.from?.username){
    const data: TelegramContact = {
      chatId: msg.chat.id,
      firstName: msg.from?.first_name || '',
      username: msg.from.username
    }
    const result = await ClientController.updateClientContact({type: 'telegram', data})
    const reply = result ? 'Success' : 'Error'
    TgBot.sendMessage(msg.chat.id, reply)
  }
})

//TgBot.setMyCommands([{command: 'test', description: 'test'}])

const PORT = process.env.PORT || 5001

const app = express()
app.use(express.json())
app.use(cors())
app.use(Routes)


mongoose.connect(process.env.DB_URL!)
.then(()=> console.log('Connected to DB'))
.catch((error) => console.log(error))

// mongoose.connect('mongodb+srv://tarasfrbslist:qwerty1234@cluster0.qu85lby.mongodb.net/db1')
// .then(()=> console.log('Connected to DB'))
// .catch((error) => console.log(error))


app.listen(PORT,() => console.log(`Server started on ${PORT} at ${(new Date()).toLocaleTimeString()}`))
