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
// 2. Sửa các progressbar trong màn hình detail.
// 3. Tạo tooltip
// 3. Lọc notif
// 4. Infinity scroll
// 5. Chức năng bookmark
// 6. Thêm tùy chọn vote multiple
// 7. Chức năng private và share link