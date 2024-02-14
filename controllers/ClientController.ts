import { RequestHandler } from 'express';
import ClientModel from "../models/client";

type GetClientsRequestQuery = {
  name: string
}

export default class ClientController {

    static getClients: RequestHandler<{},{},{}, GetClientsRequestQuery> = async (req, res) => {
      const {name} = req.query
      try {
        const clients = await ClientModel.find({name : new RegExp(name, "i")}).exec()
        res.json(clients)
      } catch (error) {
        console.log(error)
        res.status(400).send('Bad Request')
      }
    }

    static addClient: RequestHandler = async (req, res) => {
      const data = req.body
      try {
        const client = new ClientModel(data)
        await client.save()
        res.json(client)
      } catch (error) {
        console.log(error)
        res.status(400).send('Bad Request')
      }
    }
}