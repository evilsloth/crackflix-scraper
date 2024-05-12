# Crackflix scraper

## Configuration

All Debrid agent and api key must be provided. There are two ways that can be done:

1. Add config file `config/.env.local`
```
ALL_DEBRID_AGENT=agent
ALL_DEBRID_API_KEY=api_key
```
2. Define environment variables at runtime:
```
export ALL_DEBRID_AGENT=agent
export ALL_DEBRID_API_KEY=api_key
```

You may also wish to configure API_KEY property to secure api access.
```
export API_KEY=some_random_key
```
This value should be then passed in "apiKey" request header.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
## OpenAPI (Swagger)

API documentation in OpenAPI format can be accessed after running the app:

- UI: http://localhost:3000/spec
- JSON file: http://localhost:3000/spec-json
- YAML file: http://localhost:3000/spec-yaml