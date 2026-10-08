# Kế hoạch triển khai xác thực EarnMart

**Trạng thái:** Đã triển khai phần lõi; chờ cấu hình hạ tầng và kiểm thử tích hợp  
**Ngày lập:** 08/10/2026  
**Phạm vi ban đầu:** Android và iOS  
**Khả năng mở rộng:** Expo Web trong giai đoạn sau

## 1. Mục tiêu

Xây dựng lớp xác thực bắt buộc trước khi người dùng truy cập EarnMart, hỗ trợ:

- Đăng ký và đăng nhập bằng email/mật khẩu.
- Đăng nhập bằng Google.
- Tự động khôi phục phiên bằng access token và refresh token.
- Quên mật khẩu bằng OTP nhập trong ứng dụng.
- Chấp nhận điều khoản sử dụng trước khi đăng ký.
- Chặn toàn bộ ứng dụng khi hệ thống bảo trì.
- Chặn ngay tài khoản bị khóa hoặc vô hiệu hóa.
- Chỉ cho phép một phiên đăng nhập hoạt động trên một tài khoản.
- Logout thu hồi toàn bộ phiên của tài khoản.

## 2. Các quyết định nghiệp vụ đã chốt

| Hạng mục | Quyết định |
|---|---|
| Nền tảng | Android và iOS trước; chuẩn bị kiến trúc để hỗ trợ web sau |
| Backend | REST API, Go, Gin, GORM và MySQL |
| Phương thức xác thực | Email/mật khẩu và Google |
| Xác minh email khi đăng ký | Không bắt buộc |
| Khách chưa đăng nhập | Không được truy cập ứng dụng |
| Khôi phục mật khẩu | OTP nhập trong ứng dụng |
| Điều khoản | Bắt buộc tích đồng ý trước khi đăng ký |
| Bảo trì | Chặn toàn bộ ứng dụng bằng màn hình Maintenance |
| Mất mạng khi mở app | Không cho vào Home; yêu cầu kết nối và thử lại |
| Phiên đồng thời | Không cho phép; lần đăng nhập mới nhất thay thế phiên cũ |
| Logout | Thu hồi tất cả phiên trên mọi thiết bị |
| Google trùng email | Tự động liên kết nếu Google xác nhận email đã được xác minh |
| Role | Chỉ có `user` |

## 3. Luồng khởi động ứng dụng

```text
Mở ứng dụng
  → Bootstrap: kiểm tra kết nối và trạng thái hệ thống
    → Maintenance ON
      → Hiển thị Maintenance
    → Không kết nối được
      → Hiển thị Connection Required + nút Thử lại
    → Hệ thống sẵn sàng
      → Không có refresh token
        → Login
      → Có refresh token
        → Refresh thành công + tài khoản ACTIVE
          → Home
        → Refresh token hết hạn/bị thu hồi/không hợp lệ
          → Xóa token cục bộ → Login
        → Tài khoản LOCKED hoặc DISABLED
          → Account Blocked
```

Không dùng timer cố định cho Splash. Native splash được giữ đến khi hoàn tất bootstrap và đọc session. Các route nghiệp vụ phải được bảo vệ bằng Expo Router Protected Routes.

## 4. Kiến trúc đề xuất

### 4.1 Mobile

```text
apps/mobile/
├── app/
│   ├── _layout.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   ├── verify-otp.tsx
│   │   ├── reset-password.tsx
│   │   └── terms.tsx
│   ├── (app)/
│   │   └── ...các route yêu cầu đăng nhập
│   ├── maintenance.tsx
│   ├── connection-required.tsx
│   └── account-blocked.tsx
└── src/
    ├── auth/
    │   ├── AuthProvider.tsx
    │   ├── auth.types.ts
    │   ├── auth.service.ts
    │   ├── session-manager.ts
    │   ├── token-storage.native.ts
    │   ├── token-storage.web.ts
    │   └── google-auth.native.ts
    └── api/
        ├── client.ts
        ├── errors.ts
        └── endpoints/
```

Nguyên tắc:

- Auth state tách khỏi Zustand store demo hiện tại.
- Access token chỉ giữ trong bộ nhớ.
- Refresh token lưu bằng `expo-secure-store` trên Android/iOS.
- API client thực hiện refresh theo cơ chế single-flight: tại một thời điểm chỉ có một request refresh.
- Request nhận `401 TOKEN_EXPIRED` được chờ refresh và retry tối đa một lần.
- Không để màn hình tự điều hướng dựa trên biến `user`; quyền truy cập route do root auth guard quản lý.
- Không giữ chế độ Guest trong bản xác thực chính thức.

### 4.2 Backend

Các module đã triển khai trong repository `EarnMart-BE`:

```text
EarnMart-BE/
├── cmd/api/main.go
├── internal/
│   ├── config/config.go
│   ├── delivery/http/
│   │   ├── auth_handler.go
│   │   ├── middleware.go
│   │   └── router.go
│   ├── domain/auth.go
│   ├── platform/
│   │   ├── email/smtp.go
│   │   └── google/verifier.go
│   ├── repository/mysql/auth_repository.go
│   └── service/
│       ├── auth_service.go
│       └── token_manager.go
└── migrations/000002_add_auth.*.sql
```

Access token phải chứa tối thiểu `sub`, `sessionId`, `role`, `iat` và `exp`. Middleware xác thực phải kiểm tra session cùng trạng thái tài khoản để việc khóa tài khoản có hiệu lực ngay.

## 5. Chính sách token và session

| Thành phần | Chính sách đề xuất |
|---|---|
| Access token | JWT, thời hạn 15 phút, chỉ giữ trong bộ nhớ mobile |
| Refresh token | Chuỗi ngẫu nhiên không đoán được, thời hạn tuyệt đối 30 ngày |
| Lưu refresh token phía server | Chỉ lưu hash, không lưu token gốc |
| Rotation | Cấp refresh token mới sau mỗi lần refresh |
| Reuse detection | Token cũ bị dùng lại sẽ thu hồi toàn bộ token family/session |
| Một thiết bị | Login thành công sẽ thu hồi mọi session cũ trong cùng transaction |
| Logout | Thu hồi toàn bộ session của user rồi xóa token cục bộ |
| Đổi mật khẩu | Thu hồi toàn bộ session |
| Khóa tài khoản | Middleware từ chối ngay, kể cả access token chưa hết hạn |

## 6. Mô hình dữ liệu cần bổ sung

### User

Bổ sung:

- `status`: `ACTIVE | LOCKED | DISABLED`.
- `passwordHash` hoặc tách sang bảng credential.
- `emailVerifiedAt`: nullable.
- `updatedAt`.

### AuthIdentity

- `id`.
- `userId`.
- `provider`: `PASSWORD | GOOGLE | APPLE`.
- `providerSubject`.
- `providerEmail`.
- `createdAt`, `updatedAt`.
- Unique theo `(provider, providerSubject)`.

### AuthSession

- `id`, `userId`.
- `refreshTokenHash`.
- `deviceId`, `deviceName`, `platform`.
- `expiresAt`, `lastUsedAt`.
- `revokedAt`, `revokeReason`.
- `createdAt`.

### PasswordResetOtp

- `id`, `userId` hoặc email chuẩn hóa.
- `otpHash`.
- `expiresAt`.
- `attemptCount`.
- `consumedAt`.
- `createdAt`.

### TermsAcceptance

- `id`, `userId`.
- `termsVersion`.
- `acceptedAt`.
- `ipAddress`, `userAgent` khi có.

### LegalDocument và AppConfig

- Phiên bản điều khoản đang có hiệu lực.
- Nội dung hoặc URL điều khoản.
- Trạng thái maintenance.
- Thông báo maintenance.
- Phiên bản ứng dụng tối thiểu nếu cần ở giai đoạn sau.

## 7. REST API contract dự kiến

### Public/bootstrap

| Method | Endpoint | Mục đích |
|---|---|---|
| `GET` | `/api/v1/app/bootstrap` | Trạng thái maintenance và cấu hình khởi động |
| `GET` | `/api/v1/legal/terms/current` | Điều khoản hiện hành |

### Authentication

| Method | Endpoint | Mục đích |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Đăng ký email/mật khẩu và ghi nhận điều khoản |
| `POST` | `/api/v1/auth/login` | Đăng nhập email/mật khẩu |
| `POST` | `/api/v1/auth/google` | Xác minh Google credential và đăng nhập/liên kết |
| `POST` | `/api/v1/auth/refresh` | Xoay vòng refresh token và cấp access token mới |
| `POST` | `/api/v1/auth/logout` | Thu hồi mọi session của user |
| `GET` | `/api/v1/me` | Lấy user hiện tại và xác nhận session |

### Password recovery

| Method | Endpoint | Mục đích |
|---|---|---|
| `POST` | `/api/v1/auth/password/forgot` | Gửi OTP; luôn trả phản hồi chung |
| `POST` | `/api/v1/auth/password/verify-otp` | Xác minh OTP và cấp reset ticket dùng một lần |
| `POST` | `/api/v1/auth/password/reset` | Đặt mật khẩu mới và thu hồi session |

Các error code tối thiểu:

- `INVALID_CREDENTIALS`.
- `ACCOUNT_LOCKED`.
- `ACCOUNT_DISABLED`.
- `SESSION_EXPIRED`.
- `SESSION_REVOKED`.
- `TOKEN_REUSE_DETECTED`.
- `MAINTENANCE_MODE`.
- `TERMS_REQUIRED`.
- `OTP_INVALID`.
- `OTP_EXPIRED`.
- `OTP_ATTEMPTS_EXCEEDED`.
- `RATE_LIMITED`.

## 8. Luồng Google và liên kết tài khoản

1. Mobile nhận Google credential từ SDK native.
2. Mobile gửi credential về `/auth/google`.
3. Backend xác minh chữ ký, issuer, audience, thời hạn và `email_verified`.
4. Backend tìm identity bằng Google `sub`.
5. Nếu chưa có identity nhưng email đã tồn tại và Google xác nhận email:
   - Liên kết identity Google vào user hiện có.
   - Thu hồi session cũ.
   - Ghi audit log.
6. Nếu email chưa tồn tại, tạo user và identity mới.
7. Tạo session duy nhất và trả token.

Không dùng email làm định danh Google lâu dài. Dùng `sub` của Google.

Google Sign-In native cần development build và không nên phụ thuộc vào Expo Go. Trước khi phát hành iOS cần bổ sung Sign in with Apple để tránh rủi ro bị từ chối khi ứng dụng cung cấp đăng nhập bên thứ ba.

## 9. Luồng quên mật khẩu

1. Người dùng nhập email.
2. Server luôn trả cùng một thông báo, bất kể email có tồn tại hay không.
3. Nếu hợp lệ, gửi OTP 6 số qua email.
4. OTP hết hạn sau 10 phút.
5. Cho phép tối đa 5 lần nhập sai.
6. Chỉ cho gửi lại sau tối thiểu 60 giây và áp dụng rate limit theo email/IP.
7. OTP đúng tạo reset ticket dùng một lần với thời hạn ngắn.
8. Đặt mật khẩu mới bằng reset ticket.
9. Thu hồi toàn bộ session của user.

OTP phải được hash khi lưu, không ghi OTP vào log và phải hỗ trợ paste/autofill trên mobile.

## 10. Danh sách màn hình và trạng thái UI

| Màn hình | Trạng thái chính |
|---|---|
| Splash/bootstrap | Đang kiểm tra, maintenance, offline, lỗi server |
| Login | Mặc định, validation, loading, sai thông tin, session bị thu hồi |
| Register | Validation, terms chưa chấp nhận, email đã tồn tại, loading |
| Terms | Loading, nội dung, lỗi tải, quay lại form đăng ký |
| Forgot Password | Mặc định, gửi thành công, rate limit |
| Verify OTP | Nhập OTP, sai, hết hạn, gửi lại, quá số lần thử |
| Reset Password | Validation, thành công, reset ticket hết hạn |
| Maintenance | Thông báo, thử lại |
| Connection Required | Offline/server unavailable, thử lại |
| Account Blocked | Locked/disabled, hướng dẫn liên hệ hỗ trợ |

Yêu cầu UX/accessibility:

- Cho phép password manager, paste và autofill.
- Validate field khi blur và khi submit.
- Không xóa dữ liệu hợp lệ khi API trả lỗi.
- Hiển thị lỗi bằng nội dung chữ, không chỉ bằng màu.
- Nút submit có trạng thái loading và chống bấm lặp.
- Touch target tối thiểu 44pt trên iOS và 48dp trên Android.
- OTP dùng bàn phím số và hỗ trợ autofill hệ thống.
- Nội dung không bị bàn phím che.
- Icon-only control phải có accessibility label.

## 11. Các phase thực hiện

### Trạng thái hiện tại

| Phase | Trạng thái | Ghi chú |
|---|---|---|
| 0 | Hoàn thành phần contract | DTO và error code đã được dùng chung trong mobile/BE; wireframe chi tiết vẫn có thể bổ sung |
| 1 | Hoàn thành phần lõi | Migration, hashing, token, middleware, maintenance gate và rate limit đã có; audit event chuyên biệt chưa triển khai |
| 2 | Hoàn thành phần lõi | Register/login/refresh/logout/`/me`, rotation, reuse detection và single-session đã có |
| 3 | Hoàn thành | SecureStore, API client, bootstrap và protected routes đã có |
| 4 | Hoàn thành | Login, Register, Terms và validation/accessibility cơ bản đã có |
| 5 | Hoàn thành phần mã | API và UI OTP đã có; cần SMTP thật để kiểm thử gửi email end-to-end |
| 6 | Hoàn thành phần mã | Native Google Sign-In và backend verification/linking đã có; cần OAuth credentials và development build |
| 7 | Hoàn thành | Maintenance, mất kết nối và account blocked đã có |
| 8 | Chưa triển khai | Sign in with Apple là phase phát hành iOS tiếp theo |
| 9 | Đang thực hiện | Unit test token, Go test/vet, mobile typecheck/lint và Expo Doctor đã chạy; còn DB integration, E2E và thiết bị thật |

### Phase 0 — Chốt contract và thiết kế kỹ thuật

**Mục tiêu:** Tạo nền tảng thống nhất giữa mobile và backend trước khi viết logic.

**Đầu việc:**

- Chốt request/response DTO cho toàn bộ auth endpoint.
- Chốt error code và mapping sang trạng thái UI.
- Chốt state machine bootstrap/auth.
- Chốt chính sách mật khẩu, OTP, rate limit và session.
- Tạo wireframe cho các màn hình auth và trạng thái lỗi.
- Chọn email provider và chuẩn bị môi trường dev/staging.
- Chuẩn bị Google Cloud/Firebase project, bundle ID và Android package name.

**Đầu ra:**

- Auth API specification.
- Auth state diagram.
- Wireframe màn hình.
- Danh sách environment variables và secret cần cấp.

**Definition of Done:** Mobile và backend dùng cùng DTO/error code; không còn quyết định nghiệp vụ chưa chốt ảnh hưởng đến implementation.

**Ước lượng:** 1–2 ngày.

### Phase 1 — Database và nền tảng bảo mật backend

**Mục tiêu:** Có mô hình dữ liệu và primitive bảo mật để triển khai session.

**Đầu việc:**

- Migrate `User` và thêm các bảng auth.
- Xây password hashing/verification.
- Xây token generation, hashing và verification.
- Xây middleware auth, account-status check và maintenance gate.
- Thiết lập validation, rate limit và redaction cho log.
- Bổ sung audit event cho login, revoke, link provider và reset password.

**Đầu ra:** Migration, auth utilities và middleware có test.

**Definition of Done:** Không lưu mật khẩu, OTP hoặc refresh token dạng rõ; account/session bị revoke được middleware từ chối.

**Ước lượng:** 2–3 ngày.

### Phase 2 — Email registration, login và session lifecycle

**Mục tiêu:** Hoàn thiện xác thực email/mật khẩu và một phiên duy nhất.

**Đầu việc:**

- Implement register, login, refresh, logout và `/me`.
- Ghi nhận phiên bản điều khoản khi đăng ký.
- Thu hồi session cũ trong transaction khi login mới.
- Implement refresh rotation và reuse detection.
- Chuẩn hóa error response.
- Viết integration test cho lifecycle của session.

**Đầu ra:** Email auth API hoạt động hoàn chỉnh.

**Definition of Done:** Register/login/refresh/logout chạy được; thiết bị mới làm thiết bị cũ mất quyền; token reuse thu hồi session.

**Ước lượng:** 2–3 ngày.

### Phase 3 — Auth shell và protected navigation trên mobile

**Mục tiêu:** Không route nghiệp vụ nào có thể truy cập khi chưa xác thực.

**Đầu việc:**

- Cài và cấu hình SecureStore tương thích Expo SDK hiện tại.
- Tạo `AuthProvider`, `SessionManager` và typed API client.
- Implement bootstrap và single-flight refresh.
- Tổ chức route thành `(auth)` và `(app)`.
- Áp dụng `Stack.Protected` ở root layout.
- Thay Splash timer hiện tại bằng splash controller theo auth state.
- Loại bỏ Guest khỏi luồng production.
- Chuyển logout ở Profile sang server-driven logout.

**Đầu ra:** Auth shell mobile và route guard.

**Definition of Done:** Deep link hoặc thao tác back không thể vượt qua auth guard; restart app khôi phục đúng session; lỗi refresh đưa về Login.

**Ước lượng:** 2–3 ngày.

### Phase 4 — UI email auth và điều khoản

**Mục tiêu:** Có giao diện hoàn chỉnh cho đăng ký và đăng nhập.

**Đầu việc:**

- Thiết kế/implement Login và Register theo design system EarnMart.
- Tạo component form dùng chung: field, password field, error summary và submit button.
- Tạo Terms screen và checkbox bắt buộc.
- Mapping validation client/server.
- Thêm loading, disabled, keyboard và accessibility states.
- Kiểm tra trên điện thoại nhỏ, điện thoại lớn và landscape.

**Đầu ra:** Luồng email auth hoàn chỉnh trên Android/iOS.

**Definition of Done:** Người dùng đăng ký, đăng nhập và chấp nhận điều khoản; form đáp ứng accessibility và không mất dữ liệu khi request lỗi.

**Ước lượng:** 2 ngày.

### Phase 5 — OTP quên và đặt lại mật khẩu

**Mục tiêu:** Người dùng tự khôi phục tài khoản an toàn.

**Đầu việc:**

- Tích hợp email provider và template OTP.
- Implement forgot, verify OTP và reset endpoint.
- Implement Forgot Password, Verify OTP và Reset Password screens.
- Hỗ trợ OTP paste/autofill.
- Xử lý resend cooldown, expiry và attempt limit.
- Thu hồi session sau khi đổi mật khẩu.

**Đầu ra:** Luồng password recovery end-to-end.

**Definition of Done:** Không dò được email tồn tại; OTP hết hạn/đã dùng không thể tái sử dụng; reset thành công làm mọi session cũ mất hiệu lực.

**Ước lượng:** 2–3 ngày.

### Phase 6 — Google Sign-In và liên kết tài khoản

**Mục tiêu:** Đăng nhập Google native trên Android/iOS.

**Đầu việc:**

- Cấu hình Google project và OAuth client cho từng nền tảng.
- Chọn/tích hợp SDK Google Sign-In native hiện hành.
- Tạo development build vì Google native không chạy đầy đủ trong Expo Go.
- Implement backend verification và `AuthIdentity` linking.
- Tự động liên kết khi email Google đã được xác minh.
- Kiểm thử login mới, login lại, email trùng và session replacement.

**Đầu ra:** Google Sign-In production-ready trên Android/iOS.

**Definition of Done:** Backend không tin dữ liệu profile từ client; chỉ phát session sau khi credential được xác minh; liên kết không tạo user trùng.

**Ước lượng:** 2 ngày, chưa tính thời gian cấu hình console.

### Phase 7 — Maintenance, offline và account blocked

**Mục tiêu:** Hoàn chỉnh các trạng thái chặn truy cập ở cấp ứng dụng.

**Đầu việc:**

- Implement `/app/bootstrap` và AppConfig.
- Tạo Maintenance screen.
- Tạo Connection Required screen, không gộp lỗi mạng thành maintenance.
- Tạo Account Blocked screen cho `LOCKED` và `DISABLED`.
- Thêm retry/backoff hợp lý.
- Kiểm thử trạng thái thay đổi trong khi app đang chạy.

**Đầu ra:** Toàn bộ global blocking states hoạt động nhất quán.

**Definition of Done:** Maintenance chặn mọi route; mất mạng lúc mở app không vào Home; khóa tài khoản có hiệu lực ở request kế tiếp.

**Ước lượng:** 1–2 ngày.

### Phase 8 — Sign in with Apple cho bản iOS

**Mục tiêu:** Đáp ứng yêu cầu phát hành iOS khi có Google Sign-In.

**Đầu việc:**

- Cấu hình Apple capability và service identifier.
- Tạo Apple auth adapter và backend identity verification.
- Hỗ trợ email relay và tên chỉ được trả ở lần đăng nhập đầu.
- Kiểm thử linking và account recovery.

**Đầu ra:** Apple Sign-In hoạt động trên development/TestFlight build.

**Definition of Done:** Người dùng iOS có phương thức đăng nhập Apple tương đương Google và backend định danh bằng provider subject.

**Ước lượng:** 1–2 ngày, chưa tính thời gian cấu hình Apple Developer.

### Phase 9 — Kiểm thử, hardening và phát hành thử nghiệm

**Mục tiêu:** Xác nhận luồng an toàn và ổn định trước khi phát hành.

**Đầu việc:**

- Unit test token storage, auth reducer/state machine và refresh queue.
- Integration test auth API, OTP, linking và revoke.
- E2E trên Android/iOS cho toàn bộ luồng chính.
- Kiểm tra log không chứa password, OTP hoặc token.
- Kiểm tra rate limit, brute-force và token reuse.
- Chạy mobile lint, typecheck, Expo Doctor và API typecheck/build.
- Kiểm thử development/staging build trên thiết bị thật.
- Chuẩn bị monitoring cho login failure, refresh failure và OTP delivery.

**Đầu ra:** Test report, danh sách lỗi đã xử lý và release candidate.

**Definition of Done:** Toàn bộ acceptance criteria bên dưới đạt; không còn lỗi severity cao liên quan đến auth.

**Ước lượng:** 2–3 ngày.

## 12. Acceptance criteria tổng thể

- Không route `(app)` nào truy cập được khi chưa có session hợp lệ.
- Restart ứng dụng tự khôi phục phiên khi refresh token còn hợp lệ.
- Refresh token hết hạn/bị thu hồi đưa người dùng về Login.
- Nhiều request 401 đồng thời chỉ tạo một request refresh.
- Login thiết bị mới làm phiên cũ bị thu hồi.
- Logout làm mọi thiết bị mất phiên.
- Account locked/disabled bị chặn ngay.
- Maintenance chặn toàn bộ ứng dụng.
- Mất mạng khi mở app không được vào Home.
- Google email trùng được liên kết đúng và không tạo user trùng.
- OTP hết hạn, đã dùng hoặc vượt số lần thử không thể sử dụng.
- Token, password và OTP không xuất hiện trong log hoặc analytics.
- Toàn bộ form hỗ trợ keyboard, password manager, paste và accessibility label.

## 13. Ước lượng và thứ tự phụ thuộc

```text
Phase 0
  → Phase 1
    → Phase 2
      → Phase 3
        → Phase 4
        → Phase 5
        → Phase 6
        → Phase 7
        → Phase 8
          → Phase 9
```

Tổng ước lượng cho một lập trình viên: **15–22 ngày làm việc**, chưa tính thời gian chờ cấu hình/xét duyệt Google, Apple và email provider.

Phase 4, 5, 6 và 7 có thể chạy song song một phần sau khi Phase 2 và Phase 3 ổn định.

## 14. Phạm vi web trong tương lai

Repository hiện dùng Expo/React Native nên đích mở rộng phù hợp là Expo Web, không phải Unity WebGL.

Để chuẩn bị:

- Tách `TokenStorage` thành interface theo platform.
- Tách Google auth adapter native/web.
- Không giả định `SecureStore` tồn tại trên web.
- Không lưu refresh token production trong `localStorage`.
- Khi làm web, ưu tiên refresh token trong cookie `HttpOnly`, `Secure`, `SameSite` và bổ sung CSRF protection.
- Expo Router web hiện bảo vệ route bằng client-side guard; backend vẫn phải kiểm tra quyền cho mọi API.

## 15. Tài liệu tham khảo

- [Expo SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/)
- [Authentication in Expo Router](https://docs.expo.dev/router/advanced/authentication/)
- [Expo SecureStore SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/securestore/)
- [Google authentication with Expo](https://docs.expo.dev/guides/google-authentication/)
- [Authentication in Expo and React Native apps](https://docs.expo.dev/develop/authentication/)
