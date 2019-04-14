# API for HRM authorization

## TODO

- implement permissions guards
- think about nexus-prisma plugin
- add company to token.

## Development

Start docker:

```
docker-compose up -d prisma
```

After start server:

```
yarn prisma:deploy
yarn prisma:generate
yarn start:dev
```

This will first generate code for prisma client, deploy it to prisma, and then start backend.
You can access backend playground at - http://localhost:4000/

## Development notes

### Migrations with example data

First initiate keystore by creating first key.

```
mutation {
  rotateKey
}
```

Then create user

```
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

```
mutation {
  login(
    email: "user.name@example.com"
    password: "yourpass"
  ) {
    token
    user {
      name
    }
  }
}

```

Use received token to authorize and create company. Now you can verify your token here - https://jwt.io/
Go menu Debbuger and post token. For verification it requires your public key. You can get public key from store using
ID, found in second token descripted part. Then you use ID, to request key:

```
query {
  key(id:"your_key_id_here")
}
```

Use received public key, to validate webtoken.

For futher operations within api, replace token and put this in Query variables:

```
{
  "Authorization": "Bearer TOKEN_GOES_HERE"
}
```

Create company now:

```
mutation {
  createCompany(
    name: "My first company"
    homepage: "www.company.com"
  ) {
    name
  }
}
```

And check it is created:

```
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

```
query {
  me {
    name
    email
    groups{
      name
    }
  }
}
```

Also you can login again, and check your token for list of groups you are assigned.
