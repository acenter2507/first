'use strict';

var path = require('path'),
  nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport'),
  EmailTemplate = require('email-templates').EmailTemplate;

const SYSTEM_EMAIL_TEMPLATE_PATH = 'modules/users/server/templates';

exports.send = function (config, mailContent, mailOptions, template) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport(smtpTransport(config));
    var mailTemplate = new EmailTemplate(path.join(SYSTEM_EMAIL_TEMPLATE_PATH, template));
    mailTemplate.render(mailContent, function (err, result) {
      if (err) {
        return reject(new Error('MS_USERS_SEND_FAIL'));
      }
      mailOptions.html = result.html;
      transporter.sendMail(mailOptions, function (err) {
        if (err) {
          return reject(new Error('MS_USERS_SEND_FAIL'));
        }
        return resolve();
      });
    });
  });
};