const express = require('express');
const app = express();
const axios = require('axios');
const useragent = require('express-useragent')
const data = require('./public/all.json');
const fs = require('fs');
require('dotenv').config();

app.disable('x-powered-by');

app.use(express.urlencoded({ extended: false }));

app.use(express.static('public', { maxAge: '1d' }));


app.set('view engine','ejs');
app.set('trust proxy', true);


app.get('/',async(req,res)=>{

 res.set('Content-Type', 'text/html');  
let source = req.headers['user-agent']
let ua,isMobile;
try{
  ua = useragent.parse(source);
  isMobile = ua.isMobile;
if(isMobile==undefined){
throw new Error("oops");
}
}catch(e){
console.log(e); 
  isMobile = false;;

}
// get ip info
let ip;
if(req.ip.length>=6 && !(req.ip.includes('192.168'))){
  ip = req.ip;
}else{
  ip = '1.1.1.1';
}

try{
  
let api = [
`https://ipgeolocation.abstractapi.com/v1/?api_key=${process.env.GEO_API_KEY1}&ip_address=`,
`https://ipgeolocation.abstractapi.com/v1/?api_key=${process.env.GEO_API_KEY2}&ip_address=`,
`https://ipgeolocation.abstractapi.com/v1/?api_key=${process.env.GEO_API_KEY3}&ip_address=`,
`https://ipgeolocation.abstractapi.com/v1/?api_key=${process.env.GEO_API_KEY4}&ip_address=`,
`https://ipgeolocation.abstractapi.com/v1/?api_key=${process.env.GEO_API_KEY5}&ip_address=`
]
let random = Math.floor(Math.random()*api.length);
 let ipinfo = await axios.get(`${api[random]}${ip}`);

if(ipinfo.data.hasOwnProperty('error')){
  res.render('home',{country_code:'unavailable',isMobile:isMobile});
  console.log(ipinfo.data.error);
  throw new Error('ipinfo error');
}

 let country_code = ipinfo.data.country_code;
 res.render('home',{country_code:country_code,isMobile:isMobile});
 try{
// count total views and last view time
  let date = new Date();

  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  
  const istTime = date.toLocaleString("en-IN", options);
  
  
  fs.readFile('views.json', 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }
  
    // Parse JSON data
    const jsonData = JSON.parse(data);
  
    // Modify the data
    if(jsonData.total_views==null){
      jsonData.total_views = 0;
    }
let views1 = jsonData.total_views +1 ;
let lastview = istTime;
    // Write JSON data back to the file
    fs.writeFile('views.json', JSON.stringify({total_views:views1,last_viewed:lastview}, null, 2), 'utf-8', (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return;
      }
    });
  });


  }catch(err){
    console.log(err);
    return;
  }
//main homepage
  
}catch(err){
  res.render('home',{country_code:'Error',isMobile:isMobile});
console.log(err);

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
app.get('/views',async(req,res)=>{
  try{
await fs.readFile('views.json', 'utf-8', (err, data) => {
    if (err) {
      
      res.status(500).json({error:'500 Internal Server Error'})
      return;
    }
  
    // Parse JSON data
    const jsonData = JSON.parse(data);
    res.status(200).json(jsonData);
  });
}catch(err){
res.status(500).json({error:'500 Internal Server Error'})
}
})
app.post('/contactus',(req,res)=>{
 
  res.send('OK');
  // store data 
})
app.get('/contact',(req,res)=>{
  res.render('contactus');
})
app.get('/about',(req,res)=>{

res.render('about');

})

app.use((req, res, next) => {
  res.status(404).render('404');
});



app.listen(9001,(err)=>{
    if(err){
      console.log(err);
      return;
    }
    console.log('Server is Started');
})
