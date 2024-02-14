import {MongoClient} from 'mongodb'

const URI = 'mongodb+srv://tarasfrbslist:qwerty1234@cluster0.qu85lby.mongodb.net/db1'
const options = {}

if(!URI) throw new Error('Please add Mongo URI')

const client = new MongoClient(URI, options)
  const clientPromise = client.connect()
  console.log('connected!!')

export default clientPromise