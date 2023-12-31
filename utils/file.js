const fs = require('fs')
const path = require('path')

// import { calculateFileMD5Snyc } from './md5';
const md5 = require('./md5')

/**
 * @constant {Object} globalData
 * @constant {path} globalData.archiveDir
 * @constant {path} globalData.archiveDB
 * @constant {path} globalData.sourceResponseDir
 * @constant {path} globalData.wasmResponseDir
 * @constant {path} globalData.tempDir
 * @constant {path} globalData.customConfig
 * @constant {Object} globalData.archiveData
 */
const globalData = {
    archiveDir: path.join("..", "archive")
}

/**
 * @description 检查路径是否存在，如果不存在，则创建它。
 * @param {string} dirPath - 需要检查或创建的路径。
 */
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {

        if (path.extname(dirPath)) {
            const dir = path.dirname(dirPath);
            ensureDirectoryExists(dir)

            fs.writeFileSync(dirPath, "")
            console.log(`创建文件：${dirPath}`);
        }
        else {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`创建目录：${dirPath}`);
        }
    } else {
        // console.debug(`已存在：${dirPath}`)
    }
}

/**
 * @description 初始化
 */
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

    if (!fs.existsSync(globalData.archiveDB)) {
        fs.appendFileSync(globalData.archiveDB, JSON.stringify({}))
    }

    for (const key in globalData) {
        if (Object.hasOwnProperty.call(globalData, key)) {
            const value = globalData[key];
            ensureDirectoryExists(value)
        }
    }

    globalData.archiveData = JSON.parse(fs.readFileSync(globalData.archiveDB))

    // console.log(globalData);

}

function filter(arr) {
    let res = {
        js: false,
        wasm: false
    }
    for (let i = 0; i < arr.length && !(res.js && res.wasm); i++) {
        const element = arr[i];
        if (element.hash_js) res.js = true
        if (element.hash_wasm) res.wasm = true
    }
    return res
}

/**
 * 
 * @param {String} fncName 函数名
 * @param {"js"|"wasm"} [type] 文件类型
 * @param {"has"|"get"} [action] 执行动作
 * @returns {Boolean|File} 是否存在文件 | 返回该文件
 */
function searchFile(fncName, type = 'js', action = 'has') {

    const fileTypeDir = globalData[type == 'js' ? 'sourceResponseDir' : 'wasmResponseDir']
    const filePath = path.join(fileTypeDir, `${fncName}.${type}`)

    if (action == 'has') {
        if (!globalData.archiveData[fncName]) return false
        return fs.existsSync(globalData.archiveData[fncName][globalData.archiveData[fncName].length - 1][type == "js" ? "path_js" : "path_wasm"])
    }
    else if (action == 'get') {
        return fs.readFileSync(globalData.archiveData[fncName][globalData.archiveData[fncName].length - 1][type == "js" ? "path_js" : "path_wasm"])
    }
    else {
        console.log(`type: ${type}, fncName: ${fncName}, fileTypeDir: ${fileTypeDir}, filePath: ${filePath}`);
        return null
    }
}

/**
 * @description 查找是否存在这个文件
 * @param {String} fncName 函数名
 * @param {"js"|"wasm"} [type] 文件类型
 * @returns {Boolean} 
 */
function hasFile(fncName = "", type = "js") {
    return searchFile(fncName, type, 'has')
}

/**
 * 
 * @param {String} fncName 函数名
 * @param {"js"|"wasm"} [type] 文件类型
 * @returns {File} 返回该文件
 */
function getFile(fncName, type = 'js') {
    return searchFile(fncName, type, 'get')
}

/**
 * @description 复制文件
 * @param {path} sourcePath 原路径
 * @param {path} destinationPath 目标路径
 */
function copyFile(sourcePath, destinationPath) {
    const readStream = fs.createReadStream(sourcePath);
    const writeStream = fs.createWriteStream(destinationPath);

    readStream.pipe(writeStream);

    readStream.on('error', (error) => {
        console.error('读取源文件错误:', error);
    });

    writeStream.on('error', (error) => {
        console.error('写入目标文件错误:', error);
    });

    writeStream.on('finish', () => {
        console.log('文件复制完成');
    });
}

/**
 * @description 保存文件
 * @param {Object} fncObject 函数对象
 * @param {String} fncObject.name 函数名称
 * @param {String} fncObject.body 函数体
 * @param {Array} fncObject.params 函数参数
 * @param {Object} [fncObject.doc] 函数文档
 * @param {String} fncObject.doc.desc 函数描述
 * @param {String} fncObject.doc.demo 函数实例
 * @param {String} fncObject.originPath 提交的文件的路径
 * @param {"js"|"wasm"} [type] 文件类型
 * @returns {Boolean} 是否保存成功
 */
async function saveFile(fncObject, type = 'js') {
    if (type == 'js') {
        const jsTempPath = path.join(globalData.tempDir, `${fncObject.name}.js`)
        fs.writeFileSync(jsTempPath, fncObject.body)
        // const md5_js = await calculateFileMD5Snyc(jsTempPath)
        const md5_js = await md5.calculateFileMD5Snyc(jsTempPath)
        const path_js = path.join(globalData.sourceResponseDir, `${fncObject.name}-${md5_js}.js`)
        copyFile(jsTempPath, path_js)

        // const wasmTempPath = path.join(globalData.tempDir, `${fncObject.name}.wasm`)
        // 生成 wasm
        // makeWasm(jsTempPath, wasmTempPath)
        // 获取 temp/name.wasm 的 md5_wasm
        // const md5_wasm = await calculateFileMD5Snyc(wasmTempPath)
        // const path_wasm = path.join(globalData.wasmResponseDir, `${fncObject.name}-${md5_wasm}.wasm`)
        // 把 temp/name.wasm 保存到 archive/wasm/name-md5_wasm.wasm
        // copyFile(wasmTempPath, path_wasm)

        if (!globalData.archiveData[fncObject.name])
            globalData.archiveData[fncObject.name] = []

        globalData.archiveData[fncObject.name].push({
            originPath: fncObject.originPath,
            commitTime: Date.now(),
            hash_js: md5_js,
            // hash_wasm: md5_wasm,
            path_js: path_js,
            // path_wasm: archive / wasm / name - md5_wasm.wasm,
            doc: fncObject.doc
        })
        fs.writeFileSync(globalData.archiveDB, JSON.stringify(globalData.archiveData, null, 2), "utf-8")
        return true
    }
    else if (type == 'wasm') {
        // const wasmTempPath = path.join(globalData.tempDir, `${fncObject.name}.wasm`)
        // 获取 temp/name.wasm 的 md5_wasm
        // const md5_wasm = await calculateFileMD5Snyc(originPath)
        // const path_wasm = path.join(globalData.wasmResponseDir, `${fncObject.name}-${md5_wasm}.wasm`)
        // 把 temp/name.wasm 保存到 archive/wasm/name-md5_wasm.wasm
        // copyFile(originPath, path_wasm)


        globalData.archiveData[fncObject.name].push({
            originPath: fncObject.originPath,
            commitTime: Date.now(),
            // hash_js: md5_js,
            hash_wasm: md5_wasm,
            // path_js: path_js,
            path_wasm: archive / wasm / name - md5_wasm.wasm,
            doc: fncObject.doc
        })

        return true
    }
    else {
        console.log(`type: ${type} is not supported`)
        return false
    }
    // type == js
    // 将函数(体)写入 temp/name.js
    // 获取 temp/name.js 的 md5_js
    // 生成 wasm
    // 获取 temp/name.wasm 的 md5_wasm
    // 把 temp/name.js 保存到 archive/source/name-md5_js.js
    // 把 temp/name.wasm 保存到 archive/wasm/name-md5_wasm.wasm
    // 更新 globalData.archiveData[name].push({
    //      originPath: fncObject.originPath,
    //      commitTime: Date.now(),
    //      hash_js: md5_js,
    //      hash_wasm: md5_wasm,
    //      path_js: archive/source/name-md5_js.js,
    //      path_wasm: archive/wasm/name-md5_wasm.wasm,
    //      doc: fncObject.doc
    // })


    // type == wasm
    // 获取 path/name.wasm 的 md5_wasm
    // 把 path/name.wasm 保存到 archive/wasm/name-md5_wasm.wasm
    // 更新 globalData.archiveData[name].push({
    //      originPath: fncObject.originPath || path/name.wasm,
    //      commitTime: Date.now(),
    //      hash_js: "",
    //      hash_wasm: md5_wasm,
    //      path_js: "",
    //      path_wasm: path/name.wasm,
    //      doc: fncObject.doc
    // })

    // 保存 globalData.archiveData
}

/**
 * @description 获取函数列表
 * @param {"js"|"wasm"} [type] 文件类型, 不传则返回全部
 * @returns {Array|Object} 返回js类型或wasm类型的列表，或以对象形式返回两者所有
 */
function getListFromResponse(type = "") {

    const jsfiles = fs.readdirSync(globalData.sourceResponseDir)
    const wasmfiles = fs.readdirSync(globalData.wasmResponseDir)

    function handle(files, dirPath) {
        let list = []
        files.forEach(fileName => {
            const filePath = path.join(dirPath, fileName)
            const stats = fs.statSync(filePath)
            if (stats.isFile())
                list.push(path.basename(fileName))
        })
        return list
    }

    if (type == "") {
        return {
            jslist: handle(jsfiles, globalData.sourceResponseDir),
            wasmlist: handle(wasmfiles, globalData.wasmResponseDir)
        }
    }
    else if (type == "js") {
        return handle(jsfiles, globalData.sourceResponseDir)
    }
    else if (type == "wasm") {
        return handle(wasmfiles, globalData.wasmResponseDir)
    }
    else {
        console.error(`type: ${type} is not supported`)
        return []
    }
}

/**
 * @description 获取函数列表
 * @returns {Object}
 */
function getListFromDB() {
    let res = {}
    const keys = Object.keys(globalData.archiveData)
    console.log(keys)
    if (keys.length == 0) return {}
    for (let i = 0; i < keys.length; i++) {
        const fncName = keys[i];
        const fns = globalData.archiveData[fncName]
        res[fncName] = filter(fns)
    }
    return res
}

init()
module.exports = {
    hasFile, getFile, saveFile, getListFromDB
}

function test() {
    init()
    const parse = require('../lib/cli/parse')
    let fns = parse('./source/chunk.js')
    console.log(fns)
    for (const key in fns) {
        if (Object.hasOwnProperty.call(fns, key)) {
            const fnObj = fns[key];
            saveFile({
                name: key,
                body: fnObj.body,
                // params: fnObj.params,
                // doc: fnObj.doc
            })
        }
    }

}
// test()