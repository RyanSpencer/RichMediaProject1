const crypto = require('crypto');
const stats = require('fire-emblem-heroes-stats');

const teams = {};

const etag = crypto.createHash('sha1').update(JSON.stringify(teams));
const digest = etag.digest('hex');


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

const getHero = (request, response, params) => {
  const heroName = params.name;
  const responseJSON = {
    message: 'Success',
    hero: stats.getHero(heroName),
  };

  respond(request, response, 200, responseJSON);
};

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

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respond(request, response, responseCode, responseJSON);
  }

  return respondMeta(request, response, responseCode);
};

const findTeams = (request, response) => {
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

const grabTeam = (request, response, params) => {
  const responseJSON = {
    message: 'Success',
    team: teams[params.team],
  };

  return respond(request, response, 200, responseJSON);
};

module.exports = {
  notReal,
  notRealMeta,
  heroNames,
  getHero,
  addTeam,
  findTeams,
  grabTeam,
};
