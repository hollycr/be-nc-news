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
  describe("?topic", () => {
    test("GET: 200 responds with an array sorted by topic value specified in the query", () => {
      return request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(1);
          expect(body.articles[0]).toMatchObject({
            author: "rogersop",
            title: "UNCOVERED: catspiracy to bring down democracy",
            article_id: 5,
            topic: "cats",
            created_at: expect.any(String),
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            comment_count: 2,
          });
        });
    });
    test("GET: 200 responds with an empty array when passed a topic that exists but with with no articles", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(0);
        });
    });
    test("GET: 404 responds with an appropriate status code and error message when provided with a non-existent topic", () => {
      return request(app)
        .get("/api/articles?topic=dogs")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Couldn't find topic: dogs in the database.");
        });
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
            comment_count: expect.any(Number),
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
    test("GET: 400 responds with appropriate status and error message when given an invalid article_id", () => {
      return request(app)
        .get("/api/articles/squirrels")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request: invalid id (must be an integer)");
        });
    });
    test("PATCH: 200 responds with the updated article", () => {
      const votesToUpdate = {
        inc_votes: 12,
      };
      return request(app)
        .patch("/api/articles/11")
        .send(votesToUpdate)
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toMatchObject({
            article_id: 11,
            author: "icellusedkars",
            title: "Am I a cat?",
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: 12,
            article_img_url: expect.any(String),
          });
        });
    });
    test("PATCH: 404 responds with appropriate status and error message when given a valid but non-existent id", () => {
      const votesToUpdate = {
        inc_votes: 12,
      };
      return request(app)
        .patch("/api/articles/237")
        .send(votesToUpdate)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Article does not exist");
        });
    });
    test("PATCH: 400 responds with appropriate status and error message when given an invalid article_id (not an integer)", () => {
      const votesToUpdate = {
        inc_votes: 12,
      };
      return request(app)
        .patch("/api/articles/squireels")
        .send(votesToUpdate)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request: invalid id (must be an integer)");
        });
    });
    test("PATCH: 400 responds with appropriate status and error message when provided with an invalid request body (missing inc_votes)", () => {
      const votesToUpdate = {
        wrong_key: 12,
      };
      return request(app)
        .patch("/api/articles/2")
        .send(votesToUpdate)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Invalid request - must include inc_votes which must have an integer value"
          );
        });
    });
    test("PATCH: 400 responds with appropriate status and error message when provided with an invalid request body (inc_votes is not given with an integer value)", () => {
      const votesToUpdate = {
        inc_votes: "twelve",
      };
      return request(app)
        .patch("/api/articles/2")
        .send(votesToUpdate)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Invalid request - must include inc_votes which must have an integer value"
          );
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
          expect(body.msg).toBe("Couldn't find article 50");
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
    test("POST: 201 responds with the newly added comment, after adding comment to database", () => {
      const newComment = {
        username: "butter_bridge",
        body: "wow i love this article oh boy 10/10",
      };
      return request(app)
        .post("/api/articles/11/comments")
        .send(newComment)
        .expect(201)
        .then(({ body }) => {
          expect(body.comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: "butter_bridge",
            body: "wow i love this article oh boy 10/10",
            article_id: 11,
          });
        })
        .then(() => {
          return request(app)
            .get("/api/articles/11/comments")
            .then(({ body }) => {
              expect(body.comments.length).toBe(1);
            });
        });
    });
    test("POST: 400 responds with appropriate status and error message when provided with an invalid comment (missing body or username)", () => {
      const badComment = {
        body: "wow i love this article oh boy 10/10",
      };
      return request(app)
        .post("/api/articles/11/comments")
        .send(badComment)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Invalid comment, couldn't post - make sure you include a body and username"
          );
        });
    });
    test("POST: 400 responds with appropriate status and error message when provided with an invalid article_id (not an integer) to post comment to", () => {
      const newComment = {
        username: "butter_bridge",
        body: "wow i love this article oh boy 10/10",
      };
      return request(app)
        .post("/api/articles/squirell/comments")
        .send(newComment)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request: invalid id (must be an integer)");
        });
    });
    test("POST: 404 responds with appropriate status code and error message when passed a valid article_id that doesn't exist", () => {
      const newComment = {
        username: "butter_bridge",
        body: "wow i love this article oh boy 10/10",
      };
      return request(app)
        .post("/api/articles/103/comments")
        .send(newComment)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Couldn't find article 103");
        });
    });
    test("POST: 404 responds with appropriate status code and error message when passed a valid comment structure but with an unregistered username", () => {
      const newComment = {
        username: "username_not_registered",
        body: "wow i love this article oh boy 10/10",
      };
      return request(app)
        .post("/api/articles/8/comments")
        .send(newComment)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Username not registered, couldn't post comment."
          );
        });
    });
  });
});

describe("/api/comments", () => {
  describe("/:comments_id", () => {
    test("DELETE: 204 sends 204 status after deleting comment from database", () => {
      return request(app)
        .delete("/api/comments/5")
        .expect(204)
        .then(() => {
          return request(app)
            .get("/api/articles/1/comments")
            .then(({ body }) => {
              expect(body.comments.length).toBe(10);
            });
        });
    });
    test("DELETE: 404 responds with appropriate status and message if comment_id is valid (an integer) but not found", () => {
      return request(app)
        .delete("/api/comments/60")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Couldn't find comment 60");
        });
    });
    test("DELETE: 400 responds with appropriate status and message if comment_id is invalid (not an integer)", () => {
      return request(app)
        .delete("/api/comments/nonsnsenotanid")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request: invalid id (must be an integer)");
        });
    });
  });
});

describe("/api/users", () => {
  test("GET: 200 responds with an array of all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users.length).toBe(4);
        body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});
