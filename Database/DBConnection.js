import mongoose from "mongoose";
import schedule from 'node-schedule';
import { depositModel } from "./models/Deposit.model.js";

const dbConnection = () => {
    mongoose.connect("mongodb+srv://backbenchersteam23:cZMciniOgAaEU45q@cluster0.q4aihf4.mongodb.net/mentoracademy?retryWrites=true&w=majority")// DB Link

        .then(conn => {console.log(`Database connected on ${process.env.DB}`)
         // Schedule a task to run every minute
                schedule.scheduleJob('*/1 * * * *', async function(){
                let date = Math.floor(Date.now() / 1000);

                let deposits = await depositModel.find({ expires_at: { $lt: date }, status: "pending" });

                for(let i=0;i<deposits.length;i++){
                    let deposit = deposits[i];
                    deposit.status = "failed";
                    await deposit.save();
                }
                });
         
})
        .catch(err => console.log(` Database Error ${err}`))
}

export default dbConnection