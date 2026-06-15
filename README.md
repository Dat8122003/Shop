# Shop

Demo: https://shop-vray.vercel.app/

> Lần truy cập đầu tiên có thể mất 15-60 giây để backend khởi động.

## Cấu trúc

- `backend/` — Node + Express + MongoDB
- `frontend/` — React + Vite + Tailwind CSS

## Chạy local

```bash
# Backend
cd backend
npm install
cp .env.example .env   # sửa MONGO_URL, JWT_SECRET
npm run dev

# Frontend (terminal khác)
cd frontend
npm install
cp .env.example .env   # sửa VITE_API_URL, VITE_FOOTER_INFO_URL
npm run dev
```

## Build production

```bash
cd frontend && npm run build
```

Output: `frontend/dist/` (đã gitignore).

## Biến môi trường

| Biến                  | Bên      | Bắt buộc | Mô tả                                            |
|-----------------------|----------|----------|--------------------------------------------------|
| `MONGO_URL`           | backend  | có       | Connection string MongoDB                        |
| `JWT_SECRET`          | backend  | có       | Secret ký JWT (>= 32 ký tự ngẫu nhiên)           |
| `PORT`                | backend  | không    | Host tự set (Render/Railway)                     |
| `CORS_ORIGIN`         | backend  | không    | Origin được phép, mặc định `http://localhost:5173`|
| `VITE_API_URL`        | frontend | có       | URL backend đã deploy                            |
| `VITE_FOOTER_INFO_URL`| frontend | không    | Link cho 3 nút thông tin ở Footer, mặc định `#`  |

## Deploy

**Backend (Render / Railway / VPS)**
- Build: `npm install`
- Start: `node server.js`
- Env: `MONGO_URL`, `JWT_SECRET` (đặt trong dashboard, đừng dùng secret mặc định)

**Frontend (Vercel / Netlify)**
- Build: `npm run build`
- Output: `dist/`
- Env: `VITE_API_URL` trỏ về URL backend đã deploy

## Tài khoản admin

Hệ thống không tạo tài khoản admin mặc định. Admin đầu tiên cần tạo thủ công
trong MongoDB (collection `users`, `role: "admin"`, mật khẩu hash qua bcrypt).
Các tài khoản đăng ký qua `/register` chỉ có `role: "user"`.