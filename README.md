# Deploying a Node Express Web Server to Heroku

If you cloned a repository you can [skip straight to deployment](#deploy-to-heroku).

See the deployed application here: https://node-express-heroku-deployment.herokuapp.com/


## App Installation

Install npm packages
```
 npm install
```
Copy .env-sample to .env.
```
If deploying on Heroku, skip .env setup. Instead, enter env variables in the Heroku App Dashboard under Settings -> Config Vars.
Replace client_id and client_secret in .env (from View Client ID in the dev portal).
During the init process you will be prompted to add a GitHub repository. Now would be a good time to make a new project on GitHub. Add the repo link to your `package.json` when prompted.
```
```
 npm run start
```


