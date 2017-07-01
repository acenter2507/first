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
  - Lỗi chuyển state không được.
  - Sửa option không được. => done
  - Các thao tác: unfollow, follow, bookmark, 

*/
// 1. Khi người vote là guest thì không push socket được. => done
// 2. Sửa các progressbar trong màn hình detail. => done
// 3. Tạo tooltip => done
// 3. Lọc notif
// 4. Infinity scroll => done
// 5. Chức năng bookmark
// 6. Thêm tùy chọn vote multiple => done
// 7. Chức năng private và share link
// 8. Thêm nút bấm đổi kiểu biểu đồ tròn
// 9. Danh sách các poll nổi bật
// 10. Việc lưu và type post
// 11. Hang doi cac request tu socket