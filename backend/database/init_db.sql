CREATE DATABASE IF NOT EXISTS uttof_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'uttof_user'@'localhost'
  IDENTIFIED BY 'uttof1234';

CREATE USER IF NOT EXISTS 'uttof_user'@'127.0.0.1'
  IDENTIFIED BY 'uttof1234';

ALTER USER 'uttof_user'@'localhost'
  IDENTIFIED BY 'uttof1234';

ALTER USER 'uttof_user'@'127.0.0.1'
  IDENTIFIED BY 'uttof1234';

GRANT ALL PRIVILEGES ON uttof_db.* TO 'uttof_user'@'localhost';
GRANT ALL PRIVILEGES ON uttof_db.* TO 'uttof_user'@'127.0.0.1';

FLUSH PRIVILEGES;
