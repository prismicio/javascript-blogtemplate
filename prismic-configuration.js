exports.Configuration = {

  apiEndpoint: 'https://blogtemplate.prismic.io/api',

  // -- Access token if the Master is not open
  // accessToken: 'xxx',

  // -- What to do in the event of an error from prismic.io
  onPrismicError: function(err, req, res) {
    console.log(err.stack);
    res.send(500, "Error 500: " + err.message);
  }

};
