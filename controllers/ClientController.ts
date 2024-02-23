import { RequestHandler } from 'express';
import ClientModel,{ type Client, TelegramContact } from "../models/client";

type GetClientsRequestQuery = {
  name: string
}

type GetClientByIdRequestQuery = {
  id: string
}

type ViberContactUpdeteAction = {
  type: 'viber',
  data: {}
}

type TelegramContactUpdeteAction = {
  type: 'telegram',
  data: TelegramContact
}

type ClientContactUpdeteAction = TelegramContactUpdeteAction | ViberContactUpdeteAction

export default class ClientController {

    static createClient =  (name: string) => {
      const client = new ClientModel<Client>({name, notes: [],contacts:{}})
      return client
    }

    static findById = async (id: any) => {
      const client = await ClientModel.findById(id)
      return client
    }

    static getClients: RequestHandler<{},{},{}, GetClientsRequestQuery> = async (req, res) => {
      const {name} = req.query
      try {
        const clients = await ClientModel
        .find({name : new RegExp(name, "i")})
        .populate({path:'notes', options:{sort: {year: -1, month: -1, day: -1}, limit: 5}})
        .exec()
        res.json(clients)
      } catch (error) {
        console.log(error)
        res.status(400).send('Bad Request')
      }
    }

    static getClientById: RequestHandler<{},any,{}, GetClientByIdRequestQuery> = async (req, res) => {
      const {id} = req.query
      try {
        const client = await ClientModel
        .findById(id)
        .populate({path: 'notes',options:{sort: {year: -1, month: -1, day: -1}, limit: 5}})
        .exec()
        if(client){
          res.json(client)
        }
        else res.status(500).send('Cant find client')
      } catch (error) {
        console.log(error)
        res.status(400).send('Bad Request')
      }
    }

    static addClient: RequestHandler<{},{},Omit<Client, 'notes'>,{}> = async (req, res) => {
      const data = req.body
      try {
        const client = new ClientModel<Client>({...data, notes: []})
        await client.save()
        res.json(client)
      } catch (error) {
        console.log(error)
        res.status(400).send('Bad Request')
      }
    }

    static updateClient: RequestHandler<{},any,Client,GetClientByIdRequestQuery> = async (req, res) => {
      const {id} = req.query
      const data = req.body
      try {
        const client = await ClientModel
        .findByIdAndUpdate(id, data, {new: true})
        .populate({path: 'notes',options:{sort: {year: -1, month: -1, day: -1}, limit: 5}})
        res.json(client)
      } catch (error) {
        console.log(error)
        res.status(400).send('Bad Request')
      }
    }

    static deleteClient: RequestHandler<{},any,{}, GetClientByIdRequestQuery> = async (req, res) => {
      const {id} = req.query
      try{
        const client = await ClientModel.findByIdAndDelete(id)
        if(client) res.status(200).end()
        else res.status(500).send('Client is not found')
      }
      catch(error){
        console.log(error)
        res.status(400).send('Bad Request')
      }
    }

    static updateClientContact = async ({type, data}: ClientContactUpdeteAction) => {
      try {
        if(type === 'telegram'){
          const client = await ClientModel.findOne({'contacts.telegram.username': data.username})
          if(client) {
            client.contacts.telegram = data
            await client.save()
            return client
          }
        }
        else {
          return
        }
      } catch (error) {
        console.log(error)
      }
    }
}