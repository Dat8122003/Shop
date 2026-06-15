// Test suite - kiem tra API backend
process.env.JWT_SECRET = "test_secret_for_unit_tests_only";
process.env.MONGO_URL = "mongodb://placeholder-not-used";

const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");

let mongo, app, adminToken, userToken;
let buildApp;

const log = (k, v) => console.log(`  ${k.padEnd(28)} ${v}`);

const setup = async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  delete require.cache[require.resolve("./app")];
  ({ buildApp } = require("./app"));
  app = buildApp();
};

const teardown = async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
};

let pass = 0, fail = 0;
const assert = (cond, msg) => {
  if (cond) { console.log("  PASS:", msg); pass++; }
  else { console.error("  FAIL:", msg); fail++; }
};

const setupAccounts = async () => {
  await request(app).post("/register").send({
    name: "admin1", passWord: "pw123456", email: "a@a.com", role: "admin",
  });
  await request(app).post("/register").send({
    name: "user1", passWord: "pw123456", email: "u@u.com", role: "user",
  });
  const a = await request(app).post("/login").send({ name: "admin1", passWord: "pw123456" });
  const u = await request(app).post("/login").send({ name: "user1", passWord: "pw123456" });
  adminToken = a.body.token;
  userToken = u.body.token;
};

const auth = (t) => ({ Authorization: `Bearer ${t}` });

const createProduct = async (token, body) => {
  const r = await request(app)
    .post("/admin/products")
    .set("Authorization", `Bearer ${token}`)
    .send({ p_category: "b", p_img: "https://example.com/x.jpg", ...body });
  return r.body.product?.p_id;
};

const testAdminAuth = async () => {
  console.log("\n[1] Admin auth");
  await setupAccounts();
  const r1 = await request(app).post("/admin/products").send({ p_name: "X" });
  assert(r1.status === 401, "POST /admin/products khong token -> 401");
  const r2 = await request(app).get("/admin/products").set(auth(adminToken));
  assert(r2.status === 200 && Array.isArray(r2.body.products), "GET /admin/products tra array");
  const r3 = await request(app).get("/admin/products").set(auth(userToken));
  assert(r3.status === 403, "user thuong vao /admin -> 403");
};

const testAdminCRUD = async () => {
  console.log("\n[2] Admin CRUD product");
  const pid = await createProduct(adminToken, {
    p_name: "Ferrari", p_price: 500000, p_discountPrice: 450000, p_stock: 10,
  });
  assert(pid, "create product OK");

  const list1 = await request(app).get("/products");
  const p1 = list1.body.products.find((p) => p.p_id === pid);
  const r1 = await request(app)
    .put(`/admin/products/${p1._id}`)
    .set(auth(adminToken))
    .send({ p_price: 600000 });
  assert(r1.status === 200 && r1.body.product.p_price === 600000, "PUT cap nhat price");

  const r2 = await request(app)
    .delete(`/admin/products/${p1._id}`)
    .set(auth(adminToken));
  assert(r2.status === 200, "DELETE product OK");
  const list2 = await request(app).get("/products");
  assert(!list2.body.products.find((p) => p.p_id === pid), "product da bi xoa");
};

const testGuestCheckout = async () => {
  console.log("\n[3] Guest checkout KHONG can dang nhap");
  const pid = await createProduct(adminToken, {
    p_name: "Yamaha", p_price: 300000, p_stock: 5, p_category: "c",
  });
  const r = await request(app).post("/create-order").send({
    products: [{ p_id: pid, quantity: 2 }],
    totalPrice: 600000,
    customerName: "Khach Vang Lai",
    phoneNumber: "0912345678",
    shippingAddress: "123 abc",
  });
  assert(r.status === 200, "guest tao don thanh cong");
  assert(r.body.order?.userId === null, "guest order co userId = null");

  const list = await request(app).get("/products");
  const p = list.body.products.find((x) => x.p_id === pid);
  assert(p.p_stock === 3, `stock 5 -> 3 (con ${p.p_stock})`);

  const r2 = await request(app).post("/create-order").send({
    products: [{ p_id: pid, quantity: 1 }],
    totalPrice: 300000,
    customerName: "X", phoneNumber: "abc", shippingAddress: "y",
  });
  assert(r2.status === 400, "phone sai -> 400");
};

const testRaceCondition = async () => {
  console.log("\n[4] Race condition: stock=1, 5 request dong thoi -> khong am");
  const pid = await createProduct(adminToken, { p_name: "SP hiem", p_price: 1000, p_stock: 1 });
  const order = {
    products: [{ p_id: pid, quantity: 1 }],
    totalPrice: 1000,
    customerName: "N", phoneNumber: "0912345678", shippingAddress: "a",
  };
  const results = await Promise.all(
    Array.from({ length: 5 }, () => request(app).post("/create-order").send(order)),
  );
  const success = results.filter((x) => x.status === 200).length;
  const conflict = results.filter((x) => x.status === 409).length;
  assert(success === 1, `chi 1 request thanh cong (thuc te: ${success})`);
  assert(conflict === 4, `4 request con lai 409 (thuc te: ${conflict})`);
  const list = await request(app).get("/products");
  const p = list.body.products.find((x) => x.p_id === pid);
  log("stock cuoi", p.p_stock);
  assert(p.p_stock === 0, "stock cuoi = 0, KHONG am");
};

const testPagination = async () => {
  console.log("\n[5] Pagination /products");
  for (let i = 0; i < 30; i++) {
    await createProduct(adminToken, { p_name: `Bulk ${i}`, p_price: 1000, p_stock: 1 });
  }
  const r1 = await request(app).get("/products?page=1&limit=10");
  assert(r1.body.products.length === 10, "trang 1 co 10 sp");
  assert(typeof r1.body.total === "number" && r1.body.total >= 30, "co field total");
  assert(r1.body.totalPages >= 3, "co field totalPages");
  log("total", r1.body.total);

  const r2 = await request(app).get("/products?page=999&limit=10");
  assert(r2.body.products.length === 0, "trang vuot qua tra mang rong");

  const r3 = await request(app).get("/products?limit=99999");
  assert(r3.body.products.length <= 100, "limit bi clamp <= 100");
};

const testReviews = async () => {
  console.log("\n[6] Reviews CRUD + rating aggregate");
  const pid = await createProduct(adminToken, { p_name: "Test Review", p_price: 100, p_stock: 10 });
  log("p_id", pid);

  const r1 = await request(app).post(`/products/${pid}/reviews`).send({ rating: 5 });
  assert(r1.status === 401, "guest review -> 401");

  const r2 = await request(app)
    .post(`/products/${pid}/reviews`)
    .set(auth(userToken))
    .send({ rating: 5, comment: "Sieu dep" });
  assert(r2.status === 200 && r2.body.review.rating === 5, "user review 5 sao OK");
  const user1ReviewId = r2.body.review._id;

  const r3 = await request(app)
    .post(`/products/${pid}/reviews`)
    .set(auth(userToken))
    .send({ rating: 3 });
  assert(r3.status === 409, "review trung user/product -> 409");

  const r4 = await request(app)
    .post(`/products/${pid}/reviews`)
    .set(auth(adminToken))
    .send({ rating: 10 });
  assert(r4.status === 400, "rating=10 -> 400");

  const r5 = await request(app)
    .post(`/products/${pid}/reviews`)
    .set(auth(adminToken))
    .send({ rating: 4, comment: "OK" });
  assert(r5.status === 200, "admin review OK");

  const r6 = await request(app).get(`/products/${pid}/reviews`);
  assert(r6.body.reviews.length === 2, `GET reviews tra 2 (thuc te: ${r6.body.reviews.length})`);

  const list = await request(app).get("/products");
  const p = list.body.products.find((x) => x.p_id === pid);
  log("ratingAvg", p.p_ratingAvg);
  log("ratingCount", p.p_ratingCount);
  assert(p.p_ratingCount === 2, "ratingCount = 2");
  assert(p.p_ratingAvg === 4.5, "ratingAvg = 4.5");

  const adminReviewId = r6.body.reviews.find((x) => x.userName === "admin1")._id;
  const r7 = await request(app).delete(`/reviews/${adminReviewId}`).set(auth(userToken));
  assert(r7.status === 403, "user xoa review cua nguoi khac -> 403");

  const r8 = await request(app).delete(`/reviews/${user1ReviewId}`).set(auth(userToken));
  assert(r8.status === 200, "user xoa review cua minh OK");

  const remaining = (await request(app).get(`/products/${pid}/reviews`)).body.reviews[0];
  const r9 = await request(app).delete(`/reviews/${remaining._id}`).set(auth(adminToken));
  assert(r9.status === 200, "admin xoa review OK");

  const p2 = (await request(app).get("/products")).body.products.find((x) => x.p_id === pid);
  assert(p2.p_ratingCount === 0, "ratingCount = 0 sau khi xoa het");
  assert(p2.p_ratingAvg === 0, "ratingAvg = 0 khi khong co review");
};

const testPublicAccess = async () => {
  console.log("\n[7] Public vs Private");
  const r1 = await request(app).get("/products");
  const r2 = await request(app).get("/search").query({ q: "Bulk" });
  assert(r1.status === 200 && Array.isArray(r1.body.products), "GET /products public OK");
  assert(r2.status === 200 && Array.isArray(r2.body.products), "GET /search public OK");

  const r3 = await request(app).get("/profile");
  const r4 = await request(app).get("/orders");
  const r5 = await request(app).get("/admin/users");
  assert(r3.status === 401, "GET /profile private -> 401");
  assert(r4.status === 401, "GET /orders private -> 401");
  assert(r5.status === 401, "GET /admin/users private -> 401");
};

const testCartFlow = async () => {
  console.log("\n[8] Cart flow cho user");
  const pid = await createProduct(adminToken, { p_name: "Cart test", p_price: 100000, p_stock: 5 });

  const r1 = await request(app).put("/update-cart").set(auth(userToken)).send({ p_id: pid, quantity: 2 });
  assert(r1.status === 200 && r1.body.user.cart.length === 1 && r1.body.user.cart[0].quantity === 2, "add cart quantity=2");

  const r2 = await request(app).put("/update-cart").set(auth(userToken)).send({ p_id: pid, quantity: 1 });
  assert(r2.body.user.cart[0].quantity === 3, "add cart -> quantity=3");

  const r3 = await request(app).put("/plus-minus-cart").set(auth(userToken)).send({ state: true, p_id: pid });
  assert(r3.body.user.cart[0].quantity === 4, "plus -> 4");

  const r4 = await request(app).put("/plus-minus-cart").set(auth(userToken)).send({ state: true, p_id: pid });
  assert(r4.body.user.cart[0].quantity === 5, "plus clamp ve stock=5");

  const r5 = await request(app).put("/plus-minus-cart").set(auth(userToken)).send({ state: false, p_id: pid });
  assert(r5.body.user.cart[0].quantity === 4, "minus -> 4");

  const r6 = await request(app).put("/remove-cart").set(auth(userToken)).send({ p_id: pid });
  assert(r6.body.user.cart.length === 0, "remove cart -> rong");
};

const testRegisterValidation = async () => {
  console.log("\n[9] Validate register/login");
  const r1 = await request(app).post("/register").send({ name: "", passWord: "x", email: "a@a.com" });
  assert(r1.status === 400, "register thieu name -> 400");
  const r2 = await request(app).post("/register").send({ name: "u2", passWord: "pw123456", email: "u@u.com" });
  assert(r2.status === 409, "register trung email/name -> 409");
  const r3 = await request(app).post("/login").send({ name: "user1", passWord: "sai" });
  assert(r3.status === 401, "login sai pass -> 401");
};

(async () => {
  try {
    await setup();
    await testAdminAuth();
    await testAdminCRUD();
    await testGuestCheckout();
    await testRaceCondition();
    await testPagination();
    await testReviews();
    await testPublicAccess();
    await testCartFlow();
    await testRegisterValidation();
    console.log(`\n=== KET QUA: ${pass} pass, ${fail} fail ===`);
    if (fail > 0) process.exitCode = 1;
  } catch (e) {
    console.error("\n!!! LOI:", e.message);
    process.exitCode = 1;
  } finally {
    await teardown();
  }
})();

