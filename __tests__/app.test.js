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
  test("POST: 201 responds with the newly added article after the article has been added to the database, when posted an object with author, title, body, topic and img_url", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "rogersop",
        title: "why queenie is a cutie",
        body: "Even though she is the worst sometimes she is actually very very cute",
        topic: "cats",
        article_img_url: "https://http.cat/images/201.jpg",
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          author: "rogersop",
          title: "why queenie is a cutie",
          body: "Even though she is the worst sometimes she is actually very very cute",
          topic: "cats",
          article_img_url: "https://http.cat/images/201.jpg",
          article_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          comment_count: expect.any(Number),
        });
      });
  });
  test("POST: 201 responds with the newly added article with default article_img_url when after when request body is missing article_img_url", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "rogersop",
        title: "why queenie is a cutie",
        body: "Even though she is the worst sometimes she is actually very very cute",
        topic: "cats",
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          author: "rogersop",
          title: "why queenie is a cutie",
          body: "Even though she is the worst sometimes she is actually very very cute",
          topic: "cats",
          article_img_url:
            "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
          article_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          comment_count: expect.any(Number),
        });
      });
  });
  test("POST: 404 responds with appropriate status code and error message if passed a non-existent topic", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "rogersop",
        title: "why queenie is a cutie",
        body: "Even though she is the worst sometimes she is actually very very cute",
        topic: "queenie",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Couldn't find that topic in the database.");
      });
  });
  test("POST: 404 responds with appropriate status code and error message if passed an unregistered user", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "hollythedev",
        title: "why queenie is a cutie",
        body: "Even though she is the worst sometimes she is actually very very cute",
        topic: "cats",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Username not registered, couldn't post.");
      });
  });
  test("POST: 400 responds with appropriate status code and error message when request body is missing author, title or body", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: "why queenie is a cutie",
        body: "Even though she is the worst sometimes she is actually very very cute",
        topic: "cats",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(
          "Invalid article, couldn't post - must include author, title, body and topic (optional article_img_url)"
        );
      });
  });
  test("POST: 400 responds with appropriate status code and error message when attempting to post article title as an empty string ", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "rogersop",
        title: "",
        body: "Even though she is the worst sometimes she is actually very very cute",
        topic: "cats",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Title cannot be an empty string");
      });
  });
  test("POST: 400 responds with appropriate status code and error message when attempting to post article body as an empty string ", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "rogersop",
        title: "queenie beanie",
        body: "",
        topic: "cats",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Article body cannot be an empty string");
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
  describe("?sort_by", () => {
    test("GET: 200 responds with an array sorted by value specified in the query", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("article_id", {
            descending: true,
          });
        });
    });
    test("GET: 400 responds with appropriate status code and error message when passed an invalid sort_by query", () => {
      return request(app)
        .get("/api/articles?sort_by=bananas")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid sort_by query!");
        });
    });
  });
  describe("?order", () => {
    test("GET: 200 responds with an array ordered by DESC when passed an optional query DESC (default sorted by created_at)", () => {
      return request(app)
        .get("/api/articles?order=DESC")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
    test("GET: 200 responds with an array ordered by ASC when passed an optional query ASC (default sorted by created_at)", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("created_at", {
            descending: false,
          });
        });
    });
    test("GET: 200 responds with array ordered by ASC when passed optional order query on top of a sort_by query", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("article_id", { ascending: true });
        });
    });
    test("GET: 200 order defaults to DESC if not passed a valid order query", () => {
      return request(app)
        .get("/api/articles?order=notanorder")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
  });
  describe("?p & limit", () => {
    test("GET: 200 takes optional limit (limits the number of responses) query, and responds with the articles paginated according to the limit provided", () => {
      return request(app)
        .get("/api/articles?limit=5")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(5);
        });
    });
    test("GET: 200 takes additional p query (specifies the page at which to start) and responds with the array paginated according to the limit and page provided", () => {
      return request(app)
        .get("/api/articles?limit=5&p=3")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(3);
        });
    });
    test("GET: 200 returns paginated array and a total_count property (which displays the total number of articles with any filters applied, discounting the limit)", () => {
      return request(app)
        .get("/api/articles?limit=5&p=3")
        .expect(200)
        .then(({ body }) => {
          expect(body.total_count).toBe(13);
        });
    });
    test("GET: 200 returns paginated array, with limit defaulting to 10 if not provided", () => {
      return request(app)
        .get("/api/articles?p=2")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(3);
        });
    });
    test("GET: 400 responds with appropriate status code and error message if passed an invalid limit (must be an integer)", () => {
      return request(app)
        .get("/api/articles?limit=notalimit")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid input - must be a positive integer!");
        });
    });
    test("GET: 400 responds with appropriate status code and error message if passed an invalid page number (must be an integer)", () => {
      return request(app)
        .get("/api/articles?p=notanumber")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid input - must be a positive integer!");
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
          });
        });
    });
    test("GET: 200 responds with a single article, by article_id, includes comment_count", () => {
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
    test("PATCH: 200 responds with article unchanged if request body is missing inc_votes", () => {
      return request(app)
        .patch("/api/articles/11")
        .send({
          votes: 10,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toMatchObject({
            article_id: 11,
            author: "icellusedkars",
            title: "Am I a cat?",
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: 0,
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
          expect(body.msg).toBe("Username not registered, couldn't post.");
        });
    });
    describe("?p & limit", () => {
      test("GET: 200 takes optional limit (limits the number of responses) query, and responds with the comments paginated according to the limit provided", () => {
        return request(app)
          .get("/api/articles/1/comments?limit=5")
          .expect(200)
          .then(({ body }) => {
            expect(body.comments.length).toBe(5);
          });
      });
      test("GET: 200 takes additional p query (specifies the page at which to start) and responds with the array paginated according to the limit and page provided", () => {
        return request(app)
          .get("/api/articles/1/comments?limit=5&p=3")
          .expect(200)
          .then(({ body }) => {
            expect(body.comments.length).toBe(1);
          });
      });
      test("GET: 200 returns paginated array, with limit defaulting to 10 if not provided", () => {
        return request(app)
          .get("/api/articles/1/comments?p=2")
          .expect(200)
          .then(({ body }) => {
            expect(body.comments.length).toBe(1);
          });
      });
      test("GET: 400 responds with appropriate status code and error message if passed an invalid limit (must be an integer)", () => {
        return request(app)
          .get("/api/articles/1/comments?limit=notalimit")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe(
              "Invalid input - must be a positive integer!"
            );
          });
      });
      test("GET: 400 responds with appropriate status code and error message if passed an invalid page number (must be an integer)", () => {
        return request(app)
          .get("/api/articles/1/comments?p=notanumber")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe(
              "Invalid input - must be a positive integer!"
            );
          });
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
    test("PATCH: 200 responds with updated comment after updating the votes count on comment, given the comment's comment_id", () => {
      return request(app)
        .patch("/api/comments/1")
        .send({
          inc_votes: 10,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.comment).toMatchObject({
            comment_id: 1,
            body: expect.any(String),
            article_id: 9,
            author: "butter_bridge",
            votes: 26,
            created_at: expect.any(String),
          });
        });
    });
    test("PATCH: 200 responds with comment unchanged if request body is missing inc_votes", () => {
      return request(app)
        .patch("/api/comments/1")
        .send({
          votes: 10,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.comment).toMatchObject({
            comment_id: 1,
            body: expect.any(String),
            article_id: 9,
            author: "butter_bridge",
            votes: 16,
            created_at: expect.any(String),
          });
        });
    });
    test("PATCH: 404 responds with appropriate status code and error message when provided with a valid but non-existent comment_id", () => {
      return request(app)
        .patch("/api/comments/11111111")
        .send({
          inc_votes: 10,
        })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Couldn't find comment 11111111");
        });
    });
    test("PATCH: 400 responds with appropriate status code and error message when provided with an invalid comment_id (not an int)", () => {
      return request(app)
        .patch("/api/comments/notanid")
        .send({
          inc_votes: 10,
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request: invalid id (must be an integer)");
        });
    });
    test("PATCH: 400 responds with appropriate status and error message when provided with an invalid request body (inc_votes is not given with an integer value)", () => {
      const votesToUpdate = {
        inc_votes: "twelve",
      };
      return request(app)
        .patch("/api/comments/2")
        .send(votesToUpdate)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "Invalid request - must include inc_votes which must have an integer value"
          );
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
  describe("/:username", () => {
    test("GET: 200 responds with a single user, by username", () => {
      return request(app)
        .get("/api/users/rogersop")
        .expect(200)
        .then(({ body }) => {
          expect(body.user).toMatchObject({
            username: "rogersop",
            name: "paul",
            avatar_url:
              "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
          });
        });
    });
    test("GET: 404 responds with appropriate status and error message when given a valid but non-existent username", () => {
      return request(app)
        .get("/api/users/hollythedev")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("hollythedev does not exist!");
        });
    });
  });
});
