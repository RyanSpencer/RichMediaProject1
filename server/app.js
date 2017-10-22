const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
  console.dir(request.url);

  const parsedUrl = url.parse(request.url);

  const params = query.parse(parsedUrl.query);
  // swithc based on the type of method used
  switch (request.method) {
    case 'GET':
      // go to the correct get json function
      switch (parsedUrl.pathname) {
        case '/':
          htmlHandler.getClient(request, response);
          break;
        case '/style.css':
          htmlHandler.getStyle(request, response);
          break;
        case '/getHeroes':
          jsonHandler.heroNames(request, response);
          break;
        case '/getName':
          jsonHandler.getHero(request, response, params);
          break;
        default:
          jsonHandler.notReal(request, response);
          break;
      }
      break;
    case 'HEAD':
      jsonHandler.notRealMeta(request, response);
      break;
    case 'POST':
      const res = response;
      
      const body = [];
      
      request.on('error', (err) => {
        console.log(err);
        res.statusCode =400;
        res.end();
      });
      
      request.on('data', (chunk) => {
        body.push(chunk);        
      });
  
      request.on('end', () => {
        const bodyString = Buffer.concat(body).toString();
        
        
        jsonHandler.addTeam(request, res, bodyString);
      });
      break;
    default:
      jsonHandler.notReal(request, response);
      break;
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on Localhost: ${port}`);
