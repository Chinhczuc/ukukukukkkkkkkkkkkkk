# Hướng dẫn Cài đặt Hệ thống Quản lý Gia tộc GTA FiveM RP

## Tệp tin tải về
File: `gta-family-manager-complete.zip`

## Cách cài đặt

### Bước 1: Giải nén
```bash
unzip gta-family-manager-complete.zip
cd gta-family-manager
```

### Bước 2: Cài đặt Node.js dependencies
```bash
npm install
```

### Bước 3: Chạy ứng dụng
```bash
npm run dev
```

Ứng dụng sẽ khởi động tại: http://localhost:5000

## Tính năng đã hoàn thành

✅ **Backend hoàn chỉnh**
- Express server với TypeScript
- API routes đầy đủ cho tất cả chức năng
- In-memory database với dữ liệu mẫu
- Session management

✅ **Frontend hiện đại**
- React 18 + TypeScript
- Tailwind CSS + Shadcn UI
- Responsive design
- Dark theme phù hợp game

✅ **Hệ thống xác thực**
- Discord OAuth simulation
- Role-based access (admin, clan_owner, member)
- Session persistence

✅ **Quản lý gia tộc**
- Tạo và quản lý clan
- Xem danh sách clan với thống kê
- Chi tiết clan với thành viên

✅ **Hệ thống thành viên**
- Đăng ký thành viên mới
- Phê duyệt/từ chối đơn gia nhập
- Quản lý thông tin thành viên

✅ **Bảng xếp hạng**
- Ranking clan theo điểm
- Ranking cá nhân
- Thống kê chi tiết

✅ **Thông báo**
- Tạo và quản lý announcements
- Phân loại theo mức độ ưu tiên
- Hiển thị theo clan

✅ **Admin Panel**
- Quản lý toàn bộ users
- Thống kê hệ thống
- Điều khiển clan và members

## Cấu trúc dự án
```
gta-family-manager/
├── client/src/
│   ├── components/     # UI components
│   ├── pages/         # Các trang chính
│   ├── hooks/         # Custom React hooks
│   └── types/         # TypeScript definitions
├── server/
│   ├── index.ts       # Server entry point
│   ├── routes.ts      # API endpoints
│   ├── storage.ts     # Database layer
│   └── vite.ts        # Development setup
├── shared/
│   └── schema.ts      # Shared types và database schema
└── package.json       # Dependencies
```

## Chạy trong môi trường production

### 1. Build ứng dụng
```bash
npm run build
```

### 2. Sử dụng PM2 (khuyến nghị)
```bash
npm install -g pm2
pm2 start npm --name "gta-family" -- run dev
```

### 3. Cấu hình Nginx (optional)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Tùy chỉnh

### Thay đổi cổng
Sửa file `server/index.ts`, dòng:
```typescript
const PORT = process.env.PORT || 5000;
```

### Kết nối database thật
1. Cài thêm PostgreSQL driver
2. Cập nhật `drizzle.config.ts`
3. Thay thế `MemStorage` trong `server/storage.ts`

### Tích hợp Discord OAuth thật
1. Tạo Discord application tại https://discord.com/developers/applications
2. Lấy Client ID và Client Secret
3. Cập nhật authentication logic trong `server/routes.ts`

## Hỗ trợ kỹ thuật
- Kiểm tra logs trong console nếu có lỗi
- Đảm bảo Node.js version 18+ 
- Port 5000 phải trống
- Tất cả dependencies được cài đầy đủ

## Demo data có sẵn
- 3 clan mẫu: Los Santos Family, Grove Street Families, Ballas Gang
- 1 admin user tự động
- Sample announcements và join requests

Hệ thống đã sẵn sàng sử dụng ngay sau khi cài đặt!