# Hệ thống Quản lý Gia tộc GTA FiveM RP

## Tổng quan
Hệ thống quản lý gia tộc hoàn chỉnh cho server GTA FiveM RP với giao diện hiện đại và đầy đủ tính năng.

## Tính năng chính
- ✅ Xác thực Discord OAuth2 (mô phỏng)
- ✅ Quản lý gia tộc và thành viên
- ✅ Hệ thống đăng ký và phê duyệt thành viên
- ✅ Bảng xếp hạng gia tộc và cá nhân
- ✅ Hệ thống thông báo
- ✅ Bảng điều khiển admin
- ✅ Giao diện tối phù hợp với game

## Công nghệ sử dụng
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **UI Components**: Radix UI + Shadcn/ui
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Database**: In-memory storage (có thể chuyển sang PostgreSQL)

## Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 20+
- npm hoặc yarn

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Chạy ứng dụng
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:5000

## Cấu trúc dự án
```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Components UI
│   │   ├── pages/         # Các trang chính
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities
│   │   └── types/         # TypeScript types
├── server/                # Backend Express
│   ├── index.ts          # Entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage
│   └── vite.ts           # Vite setup
├── shared/               # Shared types/schemas
└── package.json         # Dependencies
```

## Tài khoản mặc định
- **Admin**: Tự động tạo khi khởi động server
- **Gia tộc mẫu**: Los Santos Family, Grove Street Families, Ballas Gang

## API Endpoints

### Xác thực
- `GET /api/me` - Lấy thông tin user hiện tại
- `POST /api/auth/discord` - Đăng nhập Discord (mô phỏng)
- `POST /api/logout` - Đăng xuất

### Gia tộc
- `GET /api/clans` - Danh sách gia tộc
- `GET /api/clan/:id` - Chi tiết gia tộc
- `POST /api/clans` - Tạo gia tộc mới

### Thành viên
- `GET /api/admin/users` - Danh sách người dùng (admin)
- `POST /api/register` - Đăng ký thành viên mới
- `PUT /api/users/:id` - Cập nhật thông tin user

### Đơn gia nhập
- `GET /api/join-requests` - Danh sách đơn xin gia nhập
- `POST /api/join-requests/:id/approve` - Duyệt đơn
- `POST /api/join-requests/:id/reject` - Từ chối đơn

### Thống kê
- `GET /api/stats` - Thống kê tổng quan
- `GET /api/ranking` - Bảng xếp hạng

### Thông báo
- `GET /api/announcements` - Danh sách thông báo
- `POST /api/announcements` - Tạo thông báo mới

## Tùy chỉnh

### Thay đổi theme
Chỉnh sửa file `client/src/index.css` để thay đổi màu sắc và theme.

### Thêm tính năng mới
1. Thêm route trong `server/routes.ts`
2. Cập nhật storage interface trong `server/storage.ts`
3. Tạo component mới trong `client/src/components/`
4. Thêm page mới trong `client/src/pages/`

### Kết nối database thật
Để sử dụng PostgreSQL thay vì in-memory storage:
1. Cài đặt `@neondatabase/serverless`
2. Cập nhật `drizzle.config.ts`
3. Thay thế MemStorage bằng database implementation

## Triển khai

### Trên Replit
Dự án đã được cấu hình sẵn để chạy trên Replit. Chỉ cần:
1. Import project
2. Chạy `npm run dev`

### Trên server riêng
1. Build project: `npm run build`
2. Cấu hình reverse proxy (nginx)
3. Sử dụng PM2 để quản lý process
4. Cấu hình SSL certificate

## Bảo mật
- Thêm rate limiting
- Cấu hình CORS đúng cách
- Sử dụng HTTPS trong production
- Validate input từ user
- Implement proper session management

## Hỗ trợ
Nếu gặp vấn đề khi triển khai hoặc sử dụng, vui lòng tạo issue hoặc liên hệ qua Discord.

## License
MIT License