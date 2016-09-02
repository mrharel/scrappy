# scrappy
Scrappy is a utility module to scrap web page easily in NodeJS

## installation
`npm install scrappy --save`

## usage

```
var scrappy = require('scrappy');

scrappy.get({
    url:"http://finance.yahoo.com/news/facebooks-mark-zuckerberg-says-most-130903427.html",
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
    
    console.log(response);
  });

```


![alt tag](https://raw.githubusercontent.com/mrharel/scrappy/master/yahoo.png)
