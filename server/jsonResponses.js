const crypto = require('crypto');
const stats = require('fire-emblem-heroes-stats');

let teams = {};

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

// Grabs all the names of heroes and sends them to the server
const heroNames = (request, response) => {
  const keys = Object.keys(stats.getReleasedHeroes());
  const names = {};

  for (let i = 0; i < keys.length; i++) {
    names[i] = stats.getReleasedHeroes()[i].name;
  }

  const responseJSON = {
    message: 'Success',
    names,
    skills: stats.getAllSkills(),
  };

  respond(request, response, 200, responseJSON);
};

// Grabs a hero based on the name based in
const getHero = (request, response, params) => {
  const heroName = params.name;
  const responseJSON = {
    message: 'Success',
    hero: stats.getHero(heroName),
  };

  respond(request, response, 200, responseJSON);
};

// Post method to add the team
const addTeam = (request, response, body) => {
  console.dir(body);

  const responseJSON = {
    message: 'Need team name and at least one hero.',
  };

  // Check if there is at least 1 hero and if there is a team name
  if (body.num < 1 || !body.teamName) {
    responseJSON.id = 'missingParams';
    return respond(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  if (teams[body.teamName]) {
    responseCode = 204;
  }
  teams[body.teamName] = {};

  // Populates the object but doesn't iterate if there is only one hero on the team
  if (body.num === '1') {
    teams[body.teamName][body.Name] = {};
    teams[body.teamName][body.Name] = { Weapon: body.Weapon,
      Assist: body.Assist,
      Special: body.Special,
      ASkill: body.ASkill,
      BSkill: body.BSkill,
      CSkill: body.CSkill,
      Seal: body.SacredSeal };
  } else {
    for (let i = 0; i < body.num; i++) {
      teams[body.teamName][body.Name[i]] = {};
      teams[body.teamName][body.Name[i]] = { Weapon: body.Weapon[i],
        Assist: body.Assist[i],
        Special: body.Special[i],
        ASkill: body.ASkill[i],
        BSkill: body.BSkill[i],
        CSkill: body.CSkill[i],
        Seal: body.SacredSeal[i] };
    }
  }
  console.log(teams);

  etag = crypto.createHash('sha1').update(JSON.stringify(teams));

  digest = etag.digest('hex');


  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respond(request, response, responseCode, responseJSON);
  }

  return respondMeta(request, response, responseCode);
};

// Searches through all the stored team names and then sends them back as a object
const findTeams = (request, response) => {
  if (request.headers['if-none-match'] === digest) {
    return respondMeta(request, response, 304);
  }

  const teamNames = {};
  const keys = Object.keys(teams);
  for (let i = 0; i < keys.length; i++) {
    teamNames[i] = keys[i];
  }
  const responseJSON = {
    message: 'Success',
    teamNames,
  };
  if (keys.length === 0) {
    responseJSON.message = 'There is no data on the server';
    responseJSON.id = 'notFound';
    return respond(request, response, 404, responseJSON);
  }
  return respond(request, response, 200, responseJSON);
};

// Grabs the team based on selection of the dropdown
const grabTeam = (request, response, params) => {
  const responseJSON = {
    message: 'Success',
    team: teams[params.team],
  };

  return respond(request, response, 200, responseJSON);
};

// Clears database
const clearMeta = (request, response) => {
  teams = {};
  etag = crypto.createHash('sha1').update(JSON.stringify(teams));
  digest = etag.digest('hex');

  return respondMeta(request, response, 200);
};

module.exports = {
  notReal,
  notRealMeta,
  heroNames,
  getHero,
  addTeam,
  findTeams,
  grabTeam,
  clearMeta,
};
