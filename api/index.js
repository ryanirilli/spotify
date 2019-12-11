"use strict";
require("dotenv").config();
const utils = require("./utils/utils");
const express = require("express");
const request = require("request");
const querystring = require("querystring");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const baseUrl =
  process.env.NODE_ENV === "production"
    ? "http://spotworm.com"
    : "http://10.0.0.191:8080";
const port = 8888;
const stateKey = "spotify_auth_state";
const redirect_uri = `${baseUrl}/api/v1/spotify-callback`;
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/v1/spotify-access-token", (req, res) => {
  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        new Buffer(`${client_id}:${client_secret}`).toString("base64")
    },
    form: { grant_type: "client_credentials" },
    json: true
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const token = body.access_token;
      res.status(200).send(JSON.stringify({ token }));
    } else {
      res
        .status(response.statusCode)
        .send(JSON.stringify({ error, status: response.statusCode }));
    }
  });
});

app.get("/api/v1/spotify-login", (req, res) => {
  const state = utils.generateRandomString(16);
  const scope =
    "user-read-private user-read-email playlist-read-private playlist-modify-private playlist-modify-public";
  const params = querystring.stringify({
    response_type: "code",
    client_id,
    scope,
    redirect_uri,
    state
  });
  res.cookie(stateKey, state);
  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

app.get("/api/v1/spotify-callback", (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.status(422).send(JSON.stringify({ err: "state does not match" }));
  } else {
    res.clearCookie(stateKey);
    const opts = {
      url: "https://accounts.spotify.com/api/token",
      json: true,
      form: { code, redirect_uri, grant_type: "authorization_code" },
      headers: {
        Authorization:
          "Basic " +
          new Buffer(`${client_id}:${client_secret}`).toString("base64")
      }
    };

    request.post(opts, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const access_token = body.access_token;
        const refresh_token = body.refresh_token;
        const tokens = querystring.stringify({ access_token, refresh_token });
        res.redirect(`${baseUrl}/spotify-login-success?${tokens}`);
      } else {
        res.status(422).send(JSON.stringify({ err: "invalid token" }));
      }
    });
  }
});

app.post("/api/v1/refresh", (req, res) => {
  const { refresh_token } = req.body;
  const opts = {
    url: "https://accounts.spotify.com/api/token",
    json: true,
    form: { refresh_token, grant_type: "refresh_token" },
    headers: {
      Authorization:
        "Basic " +
        new Buffer(`${client_id}:${client_secret}`).toString("base64")
    }
  };
  request.post(opts, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      res.status(200).send(JSON.stringify({ access_token }));
    } else {
      res.status(422).send(JSON.stringify({ error: body.error }));
    }
  });
});

console.log(`Listening on ${port}`);
app.listen(port);
