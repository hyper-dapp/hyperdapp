# Hyperdapp Monorepo


## Running the Hyperdapp REPL

```
$ yarn global add http-server
$ http-server packages/hyperdapp-dev
```

Now visit [localhost:8080/repl](http://localhost:8080/repl)

## Development

```
corepack enable  # Only need to run once; requires node v16.10.0+

yarn install
yarn workspace hyperdapp test
```
