const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");

beforeEach(() => seed(data));

afterAll(() => db.end());

describe("/api/invalid-end-points", () => {
  test("GET:404 responds with a 404 when passed an invalid path", () => {
    return request(app)
      .get("/api/nonsensefkjashslgh")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Endpoint not found!");
      });
  });
});

describe("/api/topics", () => {
  test("GET: 200 sends an array of topic objects, each with a slug and description property", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics.length).toBe(3);
        body.topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("/api", () => {
  const endpoints = require("../endpoints.json");
  test("GET: 200 should respond with an object describing all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endPoints).toEqual(endpoints);
      });
  });
});

describe("/api/articles", () => {
  test("GET: 200 responds with an array of articles objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(13);
        body.articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
          expect(article).not.toHaveProperty("body");
        });
      });
  });
  test("GET: 200 responds with an array of articles sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  describe("/:article_id", () => {
    test("GET: 200 responds with a single article, by article_id", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toMatchObject({
            article_id: expect.any(Number),
            author: expect.any(String),
            title: expect.any(String),
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          });
        });
    });
    test("GET: 404 responds with appropriate status and error message when given a valid but non-existent id", () => {
      return request(app)
        .get("/api/articles/50")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Article does not exist");
        });
    });
    test("GET: 400 responds with appropriate status and error message when given an invalid id", () => {
      return request(app)
        .get("/api/articles/squirrels")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request: invalid id (must be an integer)");
        });
    });
  });
  describe("/:article_id/comments", () => {
    test("GET: 200 responds with an array of comments for the given article_id", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments.length).toBe(11);
          body.comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: expect.any(Number),
            });
          });
        });
    });
    test("GET: 200 responds with an array of comments, sorted by date (most recent first - descending)", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
    test("GET: 200 responds with an empty array for an article_id that exists but has no comments", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toEqual([]);
        });
    });
    test("GET: 404 responds with appropriate status and error message when given a valid but non-existent id", () => {
      return request(app)
        .get("/api/articles/50/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Article does not exist");
        });
    });
    test("GET: 400 responds with appropriate status and error message when given an invalid id", () => {
      return request(app)
        .get("/api/articles/squirrels/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request: invalid id (must be an integer)");
        });
    });
  });
});
