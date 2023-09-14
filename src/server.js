const express = require('express');
const app = express();

app.get('/', (req,res)=>{
     res.send("Testing Docker build, deploy with Github actions! Add Watchtower"); 
 });

app.listen(3000, function () {
    console.log("app listening on port 3000");
});