# html-class-sorter

> A GitHub App built with [Probot](https://github.com/probot/probot) that Bot that sorts your CSS classes in HTML.

## Setup

```sh
# Install dependencies
npm install

# build the app
npm run build

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t html-class-sorter .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> html-class-sorter
```

## Contributing

If you have suggestions for how html-class-sorter could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2023 Lygom
