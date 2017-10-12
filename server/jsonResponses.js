const crypto = require('crypto');

const teams = {};

let etag = crypto.createHash('sha1').update(JSON.stringify(teams));
let digest = etag.digest('hex');


// General response function for get requests
const respond = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

// General response question for head requests and some gets that don't need bodys
const respondMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  response.writeHead(status, headers);
  response.end();
};

// called upon a 404 error
const notReal = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found',
    id: 'notFound',
  };

  respond(request, response, 404, responseJSON);
};

// called upon a 404 error through head
const notRealMeta = (request, response) => {
  respondMeta(request, response, 404);
};

const heroNames = (request,response, stats) => {
  let keys = Object.keys(stats.getAllHeroes());
  names = {};
  
  for (let i = 0; i < keys.length; i++) {
    names[i] = stats.getAllHeroes()[i].name;
  }
};

module.exports = {
  notReal,
  notRealMeta,
  heroNames,
};