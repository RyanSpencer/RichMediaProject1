const http = require('http');
const url = require('url');
const query = require('querystring');
const stats = require('fire-emblem-heroes-stats');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
  console.dir(request.url);

  const parsedUrl = url.parse(request.url);
  // swithc based on the type of method used
  switch (request.method) {
    case 'GET':
      // go to the correct get json function
      switch (parsedUrl.pathname) {
        case '/':
          htmlHandler.getClient(request, response);
          jsonHandler.heroNames(request, response, stats);
          break;
        case '/style.css':
          htmlHandler.getStyle(request, response);
          break;
        default:
          jsonHandler.notReal(request, response);
          break;
      }
      break;
    case 'HEAD':
      jsonHandler.notRealMeta(request, response);
      break;
    default:
      jsonHandler.notReal(request, response);
      break;
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on Localhost: ${port}`);
console.log(stats.default);