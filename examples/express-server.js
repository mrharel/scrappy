var express = require('express');
var app = express();
var scrappy = require('./scrappy/');



var router = express.Router();

router.get('/page', function(req,res){

  //loading the page
  console.log("requesting ",req.query.url);
  scrappy.get({
    url:req.query.url,
    mergeWithDefault: true,
    scrappy: {
      links: {
        selector: "a",
        dataType: "attr",
        attrName: "href",
        filter:{
          regex: ["^\/"]
        }
      },

      text: {
        selector: "article p",
        dataType: "text"
      }
    }
  }, (response, error)=>{
    if( error ){
      console.log("error: ", error);
    }
    res.json(response);

    res.end();
  });

});

app.use(router);


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
