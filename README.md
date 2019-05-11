# API for HRM authorization

[![CircleCI](https://circleci.com/gh/cloudhrm/auth.svg?style=svg)](https://circleci.com/gh/cloudhrm/auth)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/561a39f4b6f0417d910c4e87f7cca23a)](https://www.codacy.com/app/cloudhrm/auth?utm_source=github.com&utm_medium=referral&utm_content=cloudhrm/auth&utm_campaign=Badge_Grade)
[![Known Vulnerabilities](https://snyk.io/test/github/cloudhrm/auth/badge.svg)](https://snyk.io/test/github/cloudhrm/auth)

## TODO

- implement permissions guards
- think about nexus-prisma plugin
- add company to token.

## Development

Start docker:

```bash
docker-compose up -d prisma
```

After start server:

```bash
yarn prisma:deploy
yarn prisma:generate
yarn start:dev
```

This will first generate code for prisma client, deploy it to prisma, and then start backend.
You can access backend playground at - [http://localhost:4000/](http://localhost:4000/)

## Development notes

### Migrations with example data

First initiate keystore by creating first key.

```graphql
mutation {
  rotateKey
}
```

Then create user

```graphql
mutation {
  signup(
    email: "user.name@example.com"
    name: "User Name"
    password: "yourpass"
  ) {
    token
    user {
      name
    }
  }
}
```

or if you have already craeated user you can do login:

```graphql
mutation {
  login(email: "user.name@example.com", password: "yourpass") {
    token
    user {
      name
    }
  }
}
```

Use received token to authorize and create company. Now you can verify your token [here](https://jwt.io/)
Go menu Debbuger and post token. For verification it requires your public key. You can get public key from store using
ID, found in second token descripted part. Then you use ID, to request key:

```graphql
query {
  key(id: "your_key_id_here")
}
```

Use received public key, to validate webtoken.

For futher operations within api, replace token and put this in Query variables:

```graphql
{
  "Authorization": "Bearer TOKEN_GOES_HERE"
}
```

Create company now:

```graphql
mutation {
  createCompany(name: "My first company", homepage: "www.company.com") {
    name
  }
}
```

And check it is created:

```graphql
query {
  mycompany {
    name
    homepage
    owner {
      name
    }
    groups {
      name
    }
  }
}
```

You are owner of your created company. Also while creating company, admin role is created.
This is role which allows creation of new roles and assigning them to other users (including admin role).

You can check and see, your user has admin role now:

```graphql
query {
  me {
    name
    email
    groups {
      name
    }
  }
}
```

Also you can login again, and check your token for list of groups you are assigned.
