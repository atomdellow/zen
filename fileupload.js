const express =  require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const util = require('util');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(fileUpload());

app.post("/upload", (req,res) => {
  try {
    const file = req.files.sampleFile;
    const fileName = file.name;
    const size =  file.data.length;
    const extension = path.extname(fileName);
    const allowedExtensions = /png|jpeg|jpg|gif/;
    if(!allowedExtensions.test(extension))throw "unsupported type!";
    if(size > 5000000)throw "file must be less than 5mb";
    const md5 = file.md5;
    const URL = "/uploads/" + md5 + extension;
    util.promisify(file.mv)("./public" + URL);
    res.json({
       message: "file loaded Successfully!",
    });
  }catch(err){
    console.log(err);
    res.status(500).json({
      message:err
    });
  }
})

app.listen(8000, () =>{
  console.log("Successfully started server on port 8000")
})
