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
  }
}