module.exports = {
  openGraph: {
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
  },
  images: {
    relative: {
      selector: 'img',
      dataType: "attr",
      attrName: "src",
      filter: {
        regex: ["^\/[^\/]"]
      }
    },
    base64: {
      selector: 'img',
      dataType: "attr",
      attrName: "src",
      filter: {
        regex: ["^data\:image"]
      }
    }
  },

  video: {
    youtube: [{
      selector: "iframe",
      valueFn: function($element, cb){
        var src = $element.attr("src") || "";
        var youtubeId = src.match(/youtube\.com\/(embed|v)\/([a-zA-Z0-9-_]+)/);
        if( youtubeId && youtubeId[2] ){
          cb( {
            id: youtubeId[2],
            type: "youtube"

          } );
        }
        else{
          cb( null );
        }
      },
      next: true
    },
      {
        selector: "object",
        valueFn: function( $element, cb ){
          var html = $element.html() || "";
          var youtubeId = html.match(/youtube\.com\/(embed|v)\/([a-zA-Z0-9-_]+)/);
          if( youtubeId && youtubeId[2] ){
            cb( {
              id: youtubeId[2],
              type: "youtube"

            } );
          }
          else{
            cb( null );
          }
        }
      }],
    vimeo: {
      selector: "iframe",
      valueFn: function( $element, cb ){
        var src = $element.attr("src") || "";
        var vimeoId = src.match(/player\.vimeo\.com\/video\/([^\/?#"' ]+)/);
        if( vimeoId && vimeoId[1] ){
          cb( {
            id: vimeoId[1],
            type: "vimeo"

          } );
        }
        else{
          cb( null );
        }

      }
    }
  }
}