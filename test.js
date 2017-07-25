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

// WebStorage: https://github.com/fredricrylander/angular-webstorage


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
  - Test lại all case socket => done
  - Notifis: Like/dislike poll, comment, reply, suggest => done
  - Chức năng activity: những hoạt động đang diễn ra => done
  - Màn hình category => done
  - Chức năng private và share link => done
  - Chức năng nhập lý do khi report => done
  - Chức năng search => done
  - Đang code màn hình admin user (Mấy cái button xóa trong màn hình view)
  - Rà soát lại toàn bộ các request lấy db, tổng hợp và dọn sạch
  - Chuc nang luu thong tin login cua user

  - Chức năng quản lý toàn bộ thông tin của user
  - Đếm và quản lý số lần bị report của user

  - Hoàn thiện màn hình home
  - Share mạng xã hội

3. Test
  - Test các cài đặt của poll
*/
/*
VERSION 2
1. Tối ưu hóa chức năng tìm kiếm
2. Chức năng report comment
 */

    // vm.themes = [{
    //   name: 'Default Theme',
    //   code: 'default'
    // }, {
    //   name: 'Material Design',
    //   code: 'material'
    // }, {
    //   name: 'Bootstrap 3',
    //   code: 'bootstrap'
    // }];
    // vm.toastyTypes = [{
    //   name: 'Default',
    //   code: 'default',
    // }, {
    //   name: 'Info',
    //   code: 'info'
    // }, {
    //   name: 'Success',
    //   code: 'success'
    // }, {
    //   name: 'Wait',
    //   code: 'wait'
    // }, {
    //   name: 'Error',
    //   code: 'error'
    // }, {
    //   name: 'Warning',
    //   code: 'warning'
    // }];
    // vm.toastyOpts = {
    //   title: 'Toast It!',
    //   msg: 'Mmmm, tasties...',
    //   showClose: false,
    //   clickToClose: true,
    //   timeout: 5000,
    //   sound: true,
    //   html: false,
    //   shake: false,
    //   theme: vm.themes[1].code,
    //   type: vm.toastyTypes[0].code
    // };
    // vm.show_toasty = () => {
    //   toasty[vm.toastyOpts.type]({
    //     title: vm.toastyOpts.title,
    //     msg: vm.toastyOpts.msg,
    //     showClose: vm.toastyOpts.showClose,
    //     clickToClose: vm.toastyOpts.clickToClose,
    //     sound: vm.toastyOpts.sound,
    //     shake: vm.toastyOpts.shake,
    //     timeout: vm.toastyOpts.timeout || false,
    //     html: vm.toastyOpts.html,
    //     theme: vm.toastyOpts.theme
    //   });
    // };
    // vm.show_toastr = () => {
    //   toast.success('Hello world! ' + new Date().getSeconds(), 'Toastr fun!');
    //   toast.error('Hello world! ' + new Date().getSeconds(), 'Toastr fun!');
    //   toast.info('Hello world! ' + new Date().getSeconds(), 'Toastr fun!');
    // };