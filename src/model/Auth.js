const db = require("../helper/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  register: (email, password, fullName) => {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (err, newPassword) => {
        const body = { email, newPassword, fullName, roleId: 100 };
        db.query("INSERT INTO user VALUE ?", body, (err, res) => {
          if (!err) {
            resolve(res);
          } else {
            reject(err);
          }
        });
      });
    });
  },

  login: (email, password) => {
    console.log(email, password, "model");
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM user WHERE email= ?", email, (err, res) => {
        if (!err) {
          let data = [];
          if (res.length > 0) {
            data = res;
          } else {
            data = [
              {
                id: 0,
                name: "kosong",
                email: "kosong",
                roles: "kosong",
                password:
                  "$2y$10$4W/5o6dcvCIjm9ym/dkXQ.l6C/p8rCh0swxh8NlvwvAWfYG0gLSUO ",
              },
            ];
          }

          const { password: hashedPassword, roleId, email, id, name } = data[0];
          console.log(hashedPassword);
          bcrypt.compare(password, hashedPassword, (error, result) => {
            console.log(result);
            if (result) {
              const tokenJWT = jwt.sign(
                { email, id, name, roleId },
                process.env.SECRET_KEY,
                { expiresIn: "36000s" }
              );
              const token = `Bearer ${tokenJWT}`;
              resolve(token);
            } else {
              return reject(error);
            }
          });
        }
      });
    });
  },

  createPin: (pin, email) => {
    return new Promise((resolve, reject) => {
      bcrypt.hash(pin, 10, (err, hashedPin) => {
        if (err) {
          return reject(err);
        }
        console.log(hashedPin);
        db.query(
          `UPDATE user SET pin='${hashedPin}' WHERE email=?`,
          email,
          (err, result) => {
            if (!err) {
              resolve(result);
            } else {
              return reject(err);
            }
          }
        );
      });
    });
  },
  resetPassword: (password, email) => {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          const errMessage = "password failed";
          return reject(errMessage);
        }
        console.log(hashedPassword, "hash pw model");

        db.query(
          `UPDATE user SET password='${hashedPassword}' WHERE email=?`,
          email,
          (err, result) => {
            if (!err) {
              resolve(result);
            } else {
              return reject(err);
            }
          }
        );
      });
    });
  },
};
