import { CronJob } from 'cron';
import type { Note } from '../models/note'
import ClientModel, { type Client } from '../models/client';
import TgBot from '../bots/TelegramBot';

type JobType = {
  id: string;
  job: CronJob<()=>void,null>
}

class Cron {

  static jobs:JobType[] = []

  public static createJob = (id: string,note: Note, clientId: string) =>{
    const {year, month, day, time} = note
    const [hours, minutes] = time.from.split(':')
    const date = new Date(`${year}-${month}-${day}`);
    date.setHours(Number(hours))
    date.setMinutes(Number(minutes) -1);
    try {
      const job = CronJob.from({
        cronTime: date,
        onTick: async () => {
          const client = await ClientModel.findById(clientId)
          if(client){
            const id = client.contacts.telegram?.chatId
            if(id){
              const msg = 'Напоминание о ресницах'
              await TgBot.sendMessage(id,msg)
            }
          }
        },
        start: true,
        onComplete: () => {
          this.jobs = this.jobs.filter(el => el.id !== id)
        }
        });
      this.jobs.push({id, job})
    } catch (error) {
      console.log(error)
    }
  }

  public static cancelJob = (id: string) => {
    const startedJob = this.jobs.find(j => j.id === id)
    if(startedJob){
      startedJob.job.stop()
    }
  }

  // static start = (numb: string) => {
  //   const job = CronJob.from({
  //     cronTime:'* * * * * *',
  //     onTick: function Start() {
  //       console.log(`job ${numb}`)
  //     },
  //     start: true,
  //     onComplete: () => {
  //       this.jobs = this.jobs.filter(el => el.id !== numb)
  //       console.log('JOBS: ',this.jobs)
  //     }
  //     });
  //   this.jobs.push({id: numb, job})
  // }

  // static stop = (numb: string) => {
  //   console.log(`Job ${numb} stop`)
  //   const job = this.jobs.find(j => j.id === numb)
  //   if(job){
  //     job?.job.stop()
  //     console.log('STOPPED  ', this.jobs)
  //     //console.log('CTX: ',job.job.context)
  //     //console.log(`Job ${numb} is stopped`)
  //     //this.jobs = this.jobs.filter(el => el.number !== numb)
  //   }
  // }
}

export default Cron