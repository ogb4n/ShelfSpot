<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">

</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript backend API

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```


## Deployment

You can either deploy this NestJS application to a cloud provider like AWS, or use the Mau CLI for a simplified deployment process. However, this project has been set up to be deployed through docker and docker-compose and the setup is going to be implemented in the near future. For developpement, we'd recommend running the api locally and expose it through a vpn for external use.

You will also need to set up a SQL database server ( we're working here with mariaDB) if you do not use the provided docker setup. The database connection settings should be configured in the `.env` file.

## Environnement

You can set up your environment variables in a `.env` file at the root of the project. The `.env.example` file provides a template for the required variables.
The app runs on port 3001.


## External Features

To get alerts by email, you'll need to register on Resend and set up your API key and your sender email in the `.env` file. Resend is a service that allows you to send emails from your application easily. You can find more information on their [website](https://resend.com/). For more information on how to use Resend, you can refer to their [documentation](https://resend.com/docs).
