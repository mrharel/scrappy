/**
 * Created by Amir on 02/09/16.
 */

var request = require('request');
var cheerio = require('cheerio');
var Q = require('q');
var scrappers = require('./scrappers');

/**
 * default scrappers object fetch most common open graph stuff.
 */
const defaultScrappers = scrappers.openGraph;


class Scrappy {

  /**
   *
   * @param config - if this is a string it will be used as the url, otherwise:
   *  {
   *    url - the web page we want to scrap
   *    html - html string to scrap
   *    $ - cheerio context or any other object which support the jQuery interface. if this is provided there will be no loading of html from a web page.
   *    loader - if you want to load the web page with external service and just provide the html back.
   *    scrappers -  scrappers to be fetched. you can use the scrappers built in module or use whatever you want. if this is not peovided the open graph scrappers will be used.
   *  }
   * @param cb - callback that will get the json object object with all the keys as defined in the scrappy object and/or in the default scrappy object.
   */
  get(config, cb ){
    if( typeof config === 'string' ){
      config = {url:config};
    }

    this._getContext(config, ($)=>{
      let data = {};

    let scrappers = defaultScrappers;

    if( config.scrappers ){
      scrappers = config.scrappers;
    }

    const self = this;

    Q.async(function* (){
        for( var part in scrappers ){
          data[part] = yield self._getData($,scrappers[part]);
        }

        cb(data);

      })()
      .catch((err)=>{
        cb(null,err);
      });
    });
  }

  /**
   * we are working with cheerio, so we want to make sure we get it, either by loading a webpage html, or the developer can provide us with a cheerio or some other interface that support the jQuery api.
   * developers can also provide cheerio object which is already fitered to a specific element, for example they only want to run query from an article tag.
   * @param config
   * @param cb
   * @private
   */
  _getContext(config,cb){
    if( config.$ ){
      cb(config.$);
      return;
    }

    if( config.loader ){
      config.loader(config.url, (html)=>{
        if( html && typeof html === 'string' ){
        let $ = cheerio.load(html);
        cb($);
        return;
      }
      cb();
      return;
    });
    }
    else if( config.html ){
      let $ = cheerio.load(config.html);
      cb($);
      return;
    }
    else {
      if( !this._validUrl(config.url) ){
        cb( null, {message: "Invalid URL"});
        return;
      }

      let options = this._getOptions(config.url);


      request(options, (error, response, html)=>{
        if( error ){
          cb(null, error);
          return;
        }

        let $ = cheerio.load(html);
      cb($);
    });
    }
  }

  _extractValue($element,option,cb) {
    if( typeof option.valueFn === 'function' ) {
      option.valueFn($element, (value)=>{
        cb(value);
    });
    }
    else {
      let value;
      console.log("option ", option, $element.text());
      switch( option.dataType ){
        case 'text':
          value = $element.text();
          break;

        case 'attr':
          value = $element.attr(option.attrName);
          break;

        default:
          value = $element.html();
          break;
      }
      cb(value);
    }
  }

  _getValuesFromMatch(match, option, cb){
    console.log("_getValuesFromMatch: ", match.length );
    if( !match || !match.length ) {
      cb();
      return;
    }

    var value,matchIndex, self = this;


    //if we only want one element from the match, we need to know which one.
    var i = -1;
    if( option.onlyOne ) {
      matchIndex = 0;
      if( option.whichOne === 'first'){
        matchIndex = 0;
      }
      else if( option.whichOne === 'last' ){
        matchIndex = match.length-1;
      }
      else if( typeof option.whichOne === 'number' ){
        matchIndex = option.whichOne;
      }
      i = matchIndex-1;
    }






    (function next(){
      i++;

      //we reached the end and found nothing...
      if( i === match.length ){
        cb(value);
        return;
      }

      if( option.onlyOne && i !== matchIndex ){
        cb(value);
        return;
      }

      console.log("inside next ", i, value);
      self._extractValue(match.eq(i), option, (extractedValue)=>{
        console.log("_extractValue return ",extractedValue );
      if( typeof extractedValue !== 'string' || !extractedValue.length ){
        next();
        return;
      }

      self._filter(option.filter, extractedValue, match.eq(i),  (pass)=>{
        console.log("_filterValue return ", pass);
      if( pass ){
        if( option.onlyOne ){
          cb(extractedValue);
          return;
        }

        if( !value ){
          value = [extractedValue];
        }
        else{
          value.push(extractedValue);
        }
      }
      next();
    });
    });
    })();

  }


  /**
   *
   * @param $
   * @param options
   *  {
   *    selector - css selctor to find an element/s
   *    dataType - html, text, attr
   *    attrName - in case data type is attr, this tell us which attribute to get
   *    onlyOne - if true and the selector finds more than one, we only get one.
   *    whichOne - "first","last" or number for the index. if this is not provided, we assume the first.
   *  }
   *
   * @returns {*|promise}
   * @private
   */
  _getData($,options){

    if( typeof options === 'string' ){
      options = [{selector:options, dataType:"text"}];
    }

    if( !(options instanceof Array) ){
      options = [options];
    }

    var retVal = null;
    var deferred = Q.defer();
    var self = this;
    var match;
    //var continueToNext = false;


    var i = -1;
    (function next(){
      i++;
      if( i === options.length ){
        // we reached the end
        deferred.resolve(retVal);
        return;
      }

      const option = options[i];
      if( typeof option.selector !== 'string' || !option.selector.length ){
        next();
        return;
      }

      match = $(option.selector);

      self._getValuesFromMatch(match, option, (res)=>{
        if( res ){
          if( option.next ){
            if( !retVal ){
              retVal = res;
            }
            else{
              if( !(retVal instanceof Array) ){
                retVal = [retVal];
              }
              retVal = retVal.concat(res);
            }
            next();
          }
          else{
            if( retVal ){
              if( !(retVal instanceof Array) ){
                retVal = [retVal];
              }
              retVal = retVal.concat(res);
            }
            else{
              retVal = res;
            }
            deferred.resolve(retVal);
          }
        }
        else{
          next();
    }
    });

    })();

    return deferred.promise;
  }

  _filter(filter, value,$element,  cb){
    if( !filter ){
      cb(true);
      return;
    }

    if( typeof filter.filterValue === 'function' ){
      filter.filterFn(value, cb);
      return;
    }

    if( typeof filter.filterElement === 'function' ){
      filter.filterElement($element, cb);
      return;
    }

    if( filter.regex ){
      for( var i=0; i<filter.regex.length; i++ ){
        try{
          let regex = new RegExp(filter.regex[i]);
          if( !regex.test(value) ){
            //console.log("failed ", value);

            cb(false);
            return;
          }
        }
        catch(err){
          console.log("exception in regex: ", err);
        }
      }
    }
    cb(true);
  }

  _getOptions(url){
    return {
      url: url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language':'en-US,en;q=0.8,de;q=0.6,he;q=0.4',
        'Cache-Control' : 'no-cache',
        'Pragma':'no-cache'
      }
    };
  }


  /**
   * validating the url.
   * @param url
   * @returns {boolean}
   * @private
   */
  _validUrl(url){
    //todo: this is a very simple expression and should be replaced with a more robust one that support non english urls
    return /^(http(s)?:\/\/.)(www\.)?[\S]{2,256}\.[\S]{2,256}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(url);
  }
}


module.exports = new Scrappy();
