'use strict';

/**
 * Module dependencies.
 */
var app;

var path = require('path');
var app = require(path.resolve('./config/lib/app'));

app.init(function () {
  console.log('Initialized test automation');
});

/*
 Ưu tiên:
1. Màn hình create poll
  - Thêm xóa sửa option => done
  - Hạn vote => done
  - Test các trường hợp socket => done
  - Lỗi chuyển state không được. => done
  - Sửa option không được. => done
  - Các thao tác: unfollow, follow, bookmark => done
2. Tổng thể
  - Edit profile => done
  - Upload ảnh + chèn vào editor poll, options => done
  - Message thông báo => done
  - Đếm view poll, poll user đã view => done
  - Đếm view profile -> done
  - Trigger khi xóa: poll, option, vote, comment => done
  - Test lại all case socket

  - Chức năng activity: những hoạt động đang diễn ra

  - Chức năng nhập lý do khi report
  - Đếm và quản lý số lần bị report của user
  - Chức năng report comment
  
  - Share mạng xã hội
  - Chức năng private và share link
*/
// 1. Khi người vote là guest thì không push socket được. => done
// 2. Sửa các progressbar trong màn hình detail. => done
// 3. Tạo tooltip => done
// 3. Lọc notif
// 4. Infinity scroll => done
// 5. Chức năng bookmark => done
// 6. Thêm tùy chọn vote multiple => done
// 7. Chức năng private và share link
// 8. Thêm nút bấm đổi kiểu biểu đồ tròn => done
// 9. Danh sách các poll nổi bật => done
// 10. Việc lưu và type post
// 11. Hang doi cac request tu socket

/* Bổ sung
1. Chức năng nhập lý do khi report
2. Đếm view poll, poll user đã view
3. Đếm view profile
*/