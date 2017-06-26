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


// 1. Khi người vote là guest thì không push socket được.
// 2. Sửa các progressbar trong màn hình detail. => Đã sửa xong
// 3. Tạo tooltip
// 3. Lọc notif
// 4. Infinity scroll => Đã xong màn hình list poll và màn hình view poll (cần nghiên cứu sort)
// 5. Chức năng bookmark
// 6. Thêm tùy chọn vote multiple
// 7. Chức năng private và share link
// 8. Thêm nút bấm đổi kiểu biểu đồ tròn