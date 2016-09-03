/**
 * Created by Amir on 02/09/16.
 */

var request = require('request');
var cheerio = require('cheerio');
var Q = require('q');

/**
 * default scrappy object fetch most common open graph stuff.
 */
const defaultScrappy = {
  title: [
    {
      selector: "meta[property='og:title']",
      dataType: 'attr',
      attrName: "content",
      onlyOne: true
    },
    {
      selector: "title",
      dataType: "html",
      onlyOne: true
    }
  ],

  type : {
    selector: "meta[property='og:type']",
    dataType: 'attr',
    attrName: "content",
    onlyOne: true
  },


  image: {
    selector: "meta[property='og:image']",
    dataType: 'attr',
    attrName: "content",
    onlyOne: true
  },

  video: {
    selector: "meta[property='og:video']",
    dataType: 'attr',
    attrName: "content",
    onlyOne: true
  },

  description: {
    selector: "meta[property='og:description']",
    dataType: 'attr',
    attrName: "content",
    onlyOne: true
  },

  url: {
    selector: "meta[property='og:url']",
    dataType: 'attr',
    attrName: "content",
    onlyOne: true
  },

  type: {
    selector: "meta[property='og:type']",
    dataType: 'attr',
    attrName: "content",
    onlyOne: true
  }
};


class Scrappy {

  /**
   *
   * @param config - if this is a string it will be used as the url, otherwise:
   *  {
   *    url - the web page we want to scrap
   *    $ - cheerio context or any other object which support the jQuery interface. if this is provided there will be no loading of html from a web page.
   *    loader - if you want to load the web page with external service and just provide the html back.
   *    scrappy - optional object for setting the scrap function
   *    mergeWithDefault - if true the scrappy will be merged with the default scrappy settings.
   *
   *  }
   * @param cb - callback that will get the json object object with all the keys as defined in the scrappy object and/or in the default scrappy object.
   */
  get(config, cb ){
    if( typeof config === 'string' ){
      config = {url:config};
    }

    this._getContext(config, ($)=>{
      let data = {};

    let scrappy = defaultScrappy;

    if( config.scrappy ){
      if( config.mergeWithDefault ){
        scrappy = Object.assign(config.scrappy,defaultScrappy );
      }
      else{
        scrappy = config.scrappy;
      }
    }

    const self = this;

    Q.async(function* (){

        for( var part in scrappy ){
          data[part] = yield self._getData($,scrappy[part]);
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

    var retVal = [];
    var matchIndex = -1;
    var deferred = Q.defer();
    var self = this;

    //althout everything now is stil sync, i want to support a way which we might fetch stuff async.
    setTimeout( function(){

      //iterating over all option array, first one which has data is used and the rest is ignored.
      for( var i=0; i<options.length; i++ ){
        const selector = options[i].selector;

        if( typeof selector !== 'string' || !selector.length ){
          continue;
        }

        let match = $(selector);

        if( match && match.length ){
          let value;
          if( options[i].onlyOne ) {
            matchIndex = 0;
            if( options[i].whichOne === 'first'){
              matchIndex = 0;
            }
            else if( options[i].whichOne === 'last' ){
              matchIndex = match.length-1;
            }
            else if( typeof options[i].whichOne === 'number' ){
              matchIndex = options[i].whichOne;
            }
          }

          for( var j=0; j<match.length ; j++ ){
            if( options[i].onlyOne && j != matchIndex ){
              continue;
            }
            switch( options[i].dataType ){
              case 'text':
                value = match.eq(j).text();
                break;

              case 'attr':
                value = match.eq(j).attr(options[i].attrName);
                break;

              default:
                value = match.eq(j).html();
                break;

            }

            if( value && value.length ){

              if( options[i].filter && !self._passFilter(value,options[i].filter)){
                console.log("failed ", value);
                continue;
              }

              if( options[i].onlyOne ){
                deferred.resolve(value);
                return;
              }
              retVal.push(value);
            }
          }
          deferred.resolve(retVal);
          return;
        }
      }
      deferred.resolve(null);

    }, 0);



    return deferred.promise;
  }

  _passFilter(value,filter){
    if( !filter ) return true;
    if( filter.regex ){
      for( var i=0; i<filter.regex.length; i++ ){
        try{
          let regex = new RegExp(filter.regex[i]);
          if( !regex.test(value) ){
            //console.log("failed ", value);

            return false;
          }
        }
        catch(err){
          console.log("exception in regex: ", err);
        }
      }
    }
    return true;
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
