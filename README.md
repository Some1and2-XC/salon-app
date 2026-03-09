# Salon App

This project is a react native project, this project works more-or-less as the front-end. The source for the backend can be found [here](https://github.com/Some1and2-XC/salon-app-backend/).

## Testing & Execution
```sh
# Initialization (getting the deps)
npm i # Incomplete, some deps may need to be installed after this anyway.
# Runs development server (web version)
npx expo start --web
# Checks typescript files
npx tsc --noEmit
```

## Environment Initialization
In this project's root directory, there is a file called `.env.example`. This files acts as a reference as to the required
environment variables needed to make this project function. This template is designed to be copied to `.env` for development.
