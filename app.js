const express = require('express');
const app = express();
const mongoose =require('mongoose');
const axios = require('axios');
const useragent = require('express-useragent')
const data = require('./public/all.json');

//mongodb+srv://nurmd:nur123@cluster0.oexanhi.mongodb.net/?retryWrites=true&w=majority

mongoose.set("strictQuery",false);
mongoose.connect('mongodb://127.0.0.1:27017',{dbName:'msr'})
.then(()=>{console.log('connected to db')})
.catch((err)=>{console.log('err')});

let msip = new mongoose.Schema({
ip:String,
country:String,
country_code:String,
region:String,
city:String,
current_time:String,
time:{type:Date,default:Date.now()}
})

let Ipad = mongoose.model('ip',msip);

app.set('view engine','ejs');
app.set('trust proxy', true);
app.use(express.static('public'));

app.get('/',async(req,res)=>{
  let source = req.headers['user-agent']
  let ua = useragent.parse(source);
  let isMobile = ua.isMobile;

// get ip info
let ip;
if(req.ip.length>=6 && !(req.ip.includes('192.168'))){
  ip = req.ip;
}else{
  ip = '1.1.1.1';
}

try{

 let ipinfo = await axios.get(`https://ipgeolocation.abstractapi.com/v1/?api_key=9d1d3a341770466e8556b777b9e97d53&ip_address=${ip}`);

if(ipinfo.data.hasOwnProperty('error')){
  res.render('home',{country_code:'unavailable',isMobile:isMobile});
  throw new Error('ipinfo error');
}
 // ipinfo data varibales
 let country = ipinfo.data.country;
 let country_code = ipinfo.data.country_code;
 let region = ipinfo.data.region;
 let city = ipinfo.data.city;
 let current_time = ipinfo.data.timezone.current_time;
 res.render('home',{country_code:country_code,isMobile:isMobile});
 try{
  // save data to db
     let info= new Ipad({
      ip:req.ip,
      country:country,
      country_code:country_code,
      region:region,
      city:city,
      current_time:current_time
  });
  
  info.save().catch((err)=>{console.log(err)});
  }catch(err){
    console.log(err);
    return;
  }
//main homepage
  
}catch(err){
  res.render('home',{country_code:'Error',isMobile:isMobile});
// console.log(err);
return;
}


})

app.get('/word',(req,res)=>{
 try{
  if(req.query.hasOwnProperty('number')&& !isNaN(req.query.number)){
    let number = Math.floor(Math.abs(req.query.number));
  let array = [];

   if(number>0 && number<=100){
    while(number>0){
      let random = Math.floor(Math.random()*data.length);
      array.push(data[random]);
    number--;
    }
    res.status(200).json(array);
   }else{
    res.status(400).json('number is not in range');
   }
   }else{
    res.status(400).json('400 Bad Request');
  }
}catch(err){
  console.log(err);
  res.status(500).send('500 Internal Server Error');
}
})

app.listen(9001,(err)=>{
    if(err){
      console.log(err);
      return;
    }
    console.log('Server is Started');
})
