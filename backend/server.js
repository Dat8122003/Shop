require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./model/User");
const Products = require("./model/Products");
const Order = require("./model/Order");
const auth = require("./model/auth");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {})
  .catch(() => {});

// Đăng ký tài khoản
app.post("/register", async (req, res) => {
  try {
    if (!req.body.name || !req.body.passWord || !req.body.email)
      return res.json({ error: "Thieu thong tin" });
    const existing = await User.findOne({
      $or: [{ email: req.body.email }, { name: req.body.name }],
    });
    if (existing) return res.json({ error: "Tai khoan da ton tai" });
    const hashedPassWord = await bcrypt.hash(req.body.passWord, 10);
    const user = new User({
      name: req.body.name,
      passWord: hashedPassWord,
      email: req.body.email,
      role: req.body.role || "user",
    });
    await user.save();
    res.json({ message: "dang ki thanh cong" });
  } catch (err) {
    res.json({ message: "dang ki that bai" });
  }
});

// Đăng nhập tài khoản
app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ name: req.body.name });
    if (!user) return res.json({ error: "Tai khoan khong ton tai" });
    const isLogin = await bcrypt.compare(req.body.passWord, user.passWord);
    if (!isLogin) return res.json({ error: "Sai mat khau" });
    const token = jwt.sign(
      { _id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET
    );
    res.json({ token });
  } catch (err) {
    res.json({ error: "Dang nhap that bai" });
  }
});

app.get("/search", async (req, res) => {
  try {
    const keyword = req.query.q || "";
    const products = await Products.find({
      p_name: { $regex: keyword, $options: "i" },
    });
    res.json({ products });
  } catch (e) {
    res.json({ e: "Lỗi tìm kiếm" });
  }
});

// Lấy tất cả sản phẩm
app.get("/products", async (req, res) => {
  const products = await Products.find();
  res.json(products);
});

// Xem thông tin tài khoản
app.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.json({ error: "Không tìm thấy tài khoản" });
    }
    res.json({ message: "Xác thực thành công", user });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Cập nhật thông tin tài khoản
app.put("/update-profile", auth, async (req, res) => {
  try {
    const { name, email, phone, address, img } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone, address, img },
      { new: true }
    );
    res.json({ user });
  } catch (err) {
    res.json({ error: "Loi chinh sua" });
  }
});

// Cập nhật giỏ hàng
app.put("/update-cart", async (req, res) => {
  try {
    const { p_id } = req.body;
    const product = await Products.findOne({ p_id });
    if (!product) {
      return res.json({ error: "Khong thay san pham nay" });
    }
    let user = null;
    const authHeaders = req.headers.authorization;
    if (authHeaders) {
      const token = authHeaders.split(" ")[1];
      try {
        const decoded = jwt.verify(token, "key");
        user = await User.findById(decoded._id);
      } catch (err) {
        user = null;
      }
    }
    if (!user) {
      return res.json({
        p_id: product.p_id,
        guest: true,
      });
    }
    const item = user.cart.find((i) => i.p_id === p_id);
    if (item) {
      item.quantity += 1;
    } else {
      user.cart.push({
        p_id: p_id,
        quantity: 1,
      });
    }
    await user.save();
    res.json({ user });
  } catch (err) {
    res.json({ error: "Có lỗi cập nhật giỏ hàng" });
  }
});

// Xóa sản phẩm khỏi giỏ hàng
app.put("/remove-cart", auth, async (req, res) => {
  try {
    const { p_id } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.json({ error: "không tìm thấy người dùng" });
    }
    user.cart = user.cart.filter((i) => i.p_id !== p_id);
    await user.save();
    res.json({ user });
  } catch (err) {
    res.json({ error: "Lỗi xóa sản phẩm" });
  }
});

// Tăng giảm số lượng hàng trong giỏ
app.put("/plus-minus-cart", auth, async (req, res) => {
  try {
    const { state, p_id } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.json({ error: "Người dùng không hợp lệ" });
    }
    const item = user.cart.find((i) => i.p_id === p_id);
    if (!item) return res.json({ error: "Không tìm thấy sản phẩm này" });
    if (!state) {
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        user.cart = user.cart.filter((i) => i.p_id !== p_id);
      }
    } else {
      item.quantity += 1;
    }
    await user.save();
    res.json({ user });
  } catch (err) {
    res.json({ error: "Lỗi xóa sản phẩm" });
  }
});

// Tạo đơn hàng
app.post("/create-order", async (req, res) => {
  try {
    const {
      products,
      totalPrice,
      customerName,
      phoneNumber,
      shippingAddress,
      mode,
    } = req.body;

    if (!products?.length) {
      return res.json({ error: "Giỏ hàng trống" });
    }

    const productsData = await Promise.all(
      products.map(async (item) => {
        const product = await Products.findOne({ p_id: item.p_id });
        if (!product) return null;
        return {
          productId: product.p_id,
          productName: product.p_name,
          price: product.p_discountPrice || product.p_price,
          quantity: item.quantity,
        };
      })
    );
    let user_id = null;
    try {
      const authHeaders = req.headers.authorization;
      if (authHeaders) {
        const token = authHeaders.split(" ")[1];
        const decoded = jwt.verify(token, "key");
        user_id = decoded?._id;
      }
    } catch (e) {}
    const order = new Order({
      userId: user_id,
      products: productsData,
      totalPrice,
      customerName,
      phoneNumber,
      shippingAddress,
      status: "pending",
    });

    await order.save();
    for (const item of productsData) {
      await Products.findOneAndUpdate(
        { p_id: item.productId },
        {
          $inc: { p_stock: -item.quantity },
        }
      );
    }
    if (mode === "cart" && user_id) {
      const DeleteId = productsData.map((item) => item.productId);
      await User.findByIdAndUpdate(user_id, {
        $pull: { cart: { p_id: { $in: DeleteId } } },
      });
    }
    res.json({ message: "Tạo đơn hàng thành công", order });
  } catch (err) {
    res.json({ error: "Lỗi tạo đơn hàng: " + err.message });
  }
});

// Lấy danh sách đơn hàng của user
app.get("/orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ orders });
  } catch (err) {
    res.json({ error: "Lỗi lấy đơn hàng" });
  }
});

// Kiểm tra quyền admin
const checkAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.json({ error: "Chỉ admin mới có quyền" });
  }
  next();
};

// Lấy danh sách tài khoản
app.get("/admin/users", auth, checkAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-passWord");
    res.json({ users });
  } catch (err) {
    res.json({ error: "Lỗi lấy danh sách user" });
  }
});

// Lấy danh sách sản phẩm
app.get("/admin/products", auth, checkAdmin, async (req, res) => {
  try {
    const products = await Products.find();
    res.json({ products });
  } catch (err) {
    res.json({ error: "Lỗi lấy danh sách sản phẩm" });
  }
});

// Thêm danh sách sản phẩm
app.post("/admin/products", auth, checkAdmin, async (req, res) => {
  try {
    const product = new Products(req.body);
    await product.save();
    res.json({ message: "Thêm sản phẩm thành công", product });
  } catch (err) {
    res.json({ error: "Lỗi thêm sản phẩm: " + err.message });
  }
});

// Sửa thông tin sản phẩm
app.put("/admin/products/:id", auth, checkAdmin, async (req, res) => {
  try {
    const product = await Products.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) return res.json({ error: "Sản phẩm không tìm thấy" });
    res.json({ message: "Sửa sản phẩm thành công", product });
  } catch (err) {
    res.json({ error: "Lỗi sửa sản phẩm: " + err.message });
  }
});

// Xóa sản phẩm
app.delete("/admin/products/:id", auth, checkAdmin, async (req, res) => {
  try {
    const product = await Products.findByIdAndDelete(req.params.id);
    if (!product) return res.json({ error: "Sản phẩm không tìm thấy" });
    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (err) {
    res.json({ error: "Lỗi xóa sản phẩm: " + err.message });
  }
});

// Lấy tất cả đơn hàng
app.get("/admin/orders", auth, checkAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.json({ error: "Lỗi lấy đơn hàng" });
  }
});

// Cập nhật trạng thái đơn hàng
app.put("/admin/orders/:id", auth, checkAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.json({ error: "không tìm thấy đơn hàng" });
    res.json({ message: "Đã cập nhật", order });
  } catch (err) {
    res.json({ error: "Lỗi cập nhật: " + err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {});
