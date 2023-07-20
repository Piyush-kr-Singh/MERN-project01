var cors=require('cors');
const mongoose= require('mongoose');
const express = require('express')

const app = express()
const port = 5000
app.use(cors())

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/employees');
  console.log('Database connected successfully');
}


//middleware
app.use(express.json());


//Available Routes
app.use('/api/auth',require('./routes/auth'));
app.use('/api/notes',require('./routes/notes'));


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
