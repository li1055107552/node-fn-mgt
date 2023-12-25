const fs = require('fs')
const path = require('path')

const globalData = {
    archiveDir: path.join("..", "archive")
}

/**
 * @description 检查路径是否存在，如果不存在，则创建它。
 * @param {string} dirPath - 需要检查或创建的路径。
 */
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`创建目录：${dirPath}`);
    } else {

    }
  }


function init() {
    const defaultConfig = require(path.join(__dirname, "../", "archive", "default.config.js"))
    const customConfig = require(defaultConfig.customConfig)

    // TODO: 这一部分后续需要改为Object的递归处理
    for (const defkey in defaultConfig) {
        if (Object.hasOwnProperty.call(customConfig, defkey)) {
            const cusVal = customConfig[defkey];
            globalData[defkey] = cusVal == "" ? defaultConfig[defkey] : cusVal
        } else {
            globalData[defkey] = defaultConfig[defkey]
        }
    }

    for (const key in globalData) {
        if (Object.hasOwnProperty.call(globalData, key)) {
            const value = globalData[key];
            ensureDirectoryExists(value)
        }
    }

    console.log(globalData);

}

/**
 * @description 查找是否存在这个函数
 * @param {String} fncName 函数名
 * @param {"js"|"wasm"} type
 * @returns {Boolean}  
 */
function hasFile(fncName = "", type = "js") {
    const archiveDir = ""
    const sourceResponseDir = ""
    const wasmResponseDir = ""

    switch (type) {
        case "js": {
            return fs.existsSync(path.join(sourceResponseDir, `${fncName}.js`));
            break;
        }
        case "wasm": {

            break;
        }
        default: break
    }

    return false
}


function test() {
    init()
}
test()