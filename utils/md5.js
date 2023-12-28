const fs = require('fs');
const crypto = require('crypto');

// 计算字符串的 MD5
function calculateStringMD5(str) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
}

// 计算文件的 MD5
function calculateFileMD5(filePath, callback) {
  const hash = crypto.createHash('md5');
  const stream = fs.createReadStream(filePath);

  stream.on('data', (data) => {
    hash.update(data);
  });

  stream.on('end', () => {
    const md5 = hash.digest('hex');
    callback(null, md5);
  });

  stream.on('error', (err) => {
    callback(err);
  });
}

// // 例子：计算字符串的 MD5
// const stringToHash = 'Hello, world!';
// const stringMD5 = calculateStringMD5(stringToHash);
// console.log(`MD5 for string: ${stringMD5}`);

// // 例子：计算文件的 MD5
// const fileToHash = 'E://_Project//_git仓库//node-fn-mgt//test//chunk.js';
// calculateFileMD5(fileToHash, (err, fileMD5) => {
//   if (err) {
//     console.error(`Error calculating MD5 for file: ${err.message}`);
//   } else {
//     console.log(`MD5 for file: ${fileMD5}`);
//   }
// });

module.exports = {
    calculateStringMD5, calculateFileMD5
}