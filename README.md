# Northcoders News API

This API is used to interact with the nc-news SQL database. You can get articles, comments, users and topics, query by topics, post comments and patch articles, and delete comments using different endpoints (see /api endpoint for a json representation of all the available endpoints).

The hosted version of this API can be found here: https://hollycr-nc-news.onrender.com/api

## Getting Started

You can use a local version of this API by doing the following:

1. Make sure you have Node.js (min. v17.0.29) and PostgreSQL (min. v14.10) installed. The following instructions also assume the use of NPM (Node Package Manager) to manage our project dependencies.

2. Clone this repo locally using the command `git clone https://github.com/hollycr/be-nc-news `

3. Install dependencies by navigating to the root directory and running `npm i`.

4. In order to run this project locally, you must create two .env files,`.env.test` and `.env.development` in order to connect to the two databases locally. Within these files, set your `PGDATABASE=nc_news_test` and `PGDATABASE=nc_news` respectively. (Ensure these `.env` files are included in your `.gitignore` file.)

5. To set-up and seed local database, run `npm run setup-dbs` and then `npm run seed`.

Now you're ready to use the API!

To run the server with the development database, use the command `npm start`. To run tests (which will use the test database) use `npm test`. There are two test files located in `__tests__` and you can specify `npm test app` to only run `app.test.js` or `npm test utils` to only run `utils.test.js`.
