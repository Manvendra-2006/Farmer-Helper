import 'dotenv/config'
import app from "./app.js";
app.listen(process.env.PORT,()=>{
    console.log(` Utilis Server is running on port ${process.env.PORT}`)
})