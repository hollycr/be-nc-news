const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");

beforeEach(() => seed(data));

afterAll(() => db.end());

describe("/api/invalid-end-points", () => {
  test("GET:404 responds with a 404 when passed an invalid path", () => {
    return request(app).get("/api/nonsensefkjashslgh").expect(404);
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
            slug: expect.anything(),
            description: expect.anything(),
          });
        });
      });
  });
});
