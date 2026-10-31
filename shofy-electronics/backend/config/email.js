require('dotenv').config();
const nodemailer = require('nodemailer');
const { secret } = require('./secret');

// إعداد خيارات الاتصال بمرونة (تدعم Gmail وأي مزود SMTP آخر)
const transporterConfig = {
  host: secret.email_host || 'smtp.gmail.com',
  port: Number(secret.email_port) || 465,
  secure: Number(secret.email_port) === 465 || !secret.email_port, // true للبورت 465
  auth: {
    user: secret.email_user || process.env.EMAIL_USER,
    pass: secret.email_pass || process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
};

// استخدام service فقط إذا تم تحديدها صراحة في الإعدادات
if (secret.email_service) {
  transporterConfig.service = secret.email_service;
}

const transporter = nodemailer.createTransport(transporterConfig);

// التحقق من صحة الاتصال بالسيرفر عند بدء التشغيل
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️ Mail transporter warning (check EMAIL_USER and EMAIL_PASS):', error.message);
  } else {
    console.log(' Mail server is ready to send activation emails.');
  }
});

/**
 * دالة إرسال الإيميل مع دعم الـ Promise وحماية الترويسات (Safe Headers)
 * @param {Object} body - كائن البريد (to, subject, html, text...)
 * @param {Object} [res] - كائن الاستجابة الخاص بـ Express (اختياري)
 * @param {string} [message] - رسالة النجاح
 */
module.exports.sendEmail = async (body, res, message) => {
  return new Promise((resolve, reject) => {
    // التأكد من وجود عنوان الراسل الرسمي لمتجر معيار
    const mailOptions = {
      from: body.from || `"Meyar Electronics" <${secret.email_user || process.env.EMAIL_USER}>`,
      ...body,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('❌ Email sending failed:', err.message);

        // إرسال الرد فقط إذا تم تمرير res ولم يتم إرسال رد مسبق
        if (res && typeof res.status === 'function' && !res.headersSent) {
          return res.status(500).json({
            success: false,
            message: `Failed to send email: ${err.message}`,
          });
        }
        return reject(err);
      }

      console.log('✅ Email delivered successfully to:', mailOptions.to);

      // إرسال رد النجاح بأمان
      if (res && typeof res.status === 'function' && !res.headersSent) {
        return res.status(200).json({
          success: true,
          message: message || 'Email sent successfully!',
          data: info,
        });
      }

      return resolve(info);
    });
  });
};