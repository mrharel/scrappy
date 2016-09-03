# scrappy
Scrappy is a utility module that helps you scrap web pages using NodeJS without needing to write any logic code.

Scrappy is using scrappers, which are config objects that tells scrappy what to fetch and how to fetch it. Usually most web page scrapping is based on the same code just setting different configuration.

Scrappy was built with that in mind and allows you just to define scrappers objects and get whatever you want.

## installation
`npm install @mrharel/scrappy --save`

## usage

```
var scrappy = require('@mrharel/scrappy');

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

So this webpage:
![alt tag](https://raw.githubusercontent.com/mrharel/scrappy/master/yahoo.png)

should return something like this:
![alt tag](https://raw.githubusercontent.com/mrharel/scrappy/master/yahoo-result.png)

## api
### get
`scrappy.get(config,callback)`
main function to get scrap parts from a web page. 

**config** either string or an object. 

if this is a string it is used as the url to fetch and execute the scrap on. 

if this is an object here are the options:
- url: (optional) the url of the webpage to fetch and scrap
- $: (optional) cheerio context. if this is provided scrappy will not fetch anything and will execute the scrap on the cheerio object. this could actually be any other object which support the jQuery (cheerio) interface. 
- loader: function which will get the url provided, and a callback method to be invoke when the html was loaded. use this option if you want to load the webpage yourself. 
- scrappy: (option) this is the scrappy object which define what to scrap from the webpage. see **scrappy object** below from more info.
- mergeWithDefault: scrappy has some defualts to fetch some standard open graph stuff. if this is true, then the scrappy object you provided will be merged with the default one. 


## scrappy object
this object defines scrap parts to be fetched from a webpage. it contains keys, which are the name of the parts, and values which are config options for the scrapping function. 

The value voulf either be an object, or an array. in cease of an array, only the first in the array which was found will be used. you can use it as fallback options; if the first option was not found in the webpage, you can provide another option. 
the object looks like this:
- selector: css selector to find element/s within the webpage (the cheerio context). 
- dataType: "html","text","attr"; this control what do you want to take from the element. 
- attrName: (optional) if dataType is "attr" then this should be the name of the attribute you want.
- onlyOne: if this is true, only one element will be used for getting it's data value. 
- whichOne: "first","last", or any index number. use this to control which element you want in case you specified onlyOne=true. 
- filter: this is a way to filter out values from the result. it supports an array of regex string. 
 

Lets see some examples:

### fetching links from a page which only starts with "/"
```
scrappy.get({
    url: "http:.....",
    scrappy: {
        links: {
            selector: "a",
            dataType: "attr",
            attrName: "href",
            filter:{
                regex: ["^\/"]
            }
      }
    }
},cb);
```

### fetching text of a web page
```
scrappy.get({
    url: "http:.....",
    scrappy: {
        text: {
            selector: "article p",
            dataType: "text"
      }
    }
},cb);
```
