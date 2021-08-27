const { promisify } = require('util');
const fs = require('fs')
const convert = require('heic-convert');
const mongoose = require('mongoose');

const HeicToChange = require('./models/heicToChange');

mongoose.connect('mongodb://localhost:27017/prof', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

function convertHeic (){
  HeicToChange.findOne().orFail(() => new Error('NotFound'))
  .then((heic)=>{
    (async () => {
    const inputBuffer = await promisify(fs.readFile)(`./uploads/heic/${heic.name}.heic`);
    const outputBuffer = await convert({
      buffer: inputBuffer, // the HEIC file buffer
      format: 'JPEG',      // output format
      quality: 1           // the jpeg compression quality, between 0 and 1
    });
  
    await promisify(fs.writeFile)(`./uploads/${heic.name}.jpg`, outputBuffer);
  })()
    HeicToChange.findByIdAndRemove(heic._id).orFail(() => new Error('NotFound'))
    .then(setTimeout(convertHeic, 1000))
    .catch((err)=>{
      console.log(err)
    })
  })
  .catch(()=>{
    setTimeout(convertHeic, 1000)
  })
}

convertHeic()
 

