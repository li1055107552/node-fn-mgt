
# fnmgt

## 项目简介

Function Management - 基于node，打造用户自己的函数库

例如，您已编写好了一个 `util.js`

```js
// util.js

function add(a, b){
    return a + b
}

function mult(a,b){
    return a * b
}
```

当前，您想在其他工程调用 `util.js` 中的函数，您需要将该文件或是函数复制到新的工程中

现在，您可以通过 `fnmgt` 直接在其他工程中调用，如：

```js
const fnmgt = require('fnmgt')

// 这样
fnmgt.add(1, 2)

// 亦或是这样
let mult = fnmgt("mult")
mult(1, 2)
```

---

## 安装说明

- 通过 npm 安装：
    > `npm install fnmgt -g`

### Wasm 支持

1. 安装 [Rust](https://www.rust-lang.org/)

2. 安装 npm 包
    > `npm install wasm-pack`

---

## 使用说明

### JavaScript

0. 成功安装 `fnmgt`

1. 编写好一个 js 文件，如 `test.js`:

    ```js
    function add(a, b){
        return a + b
    }

    function mult(a,b){
        return a * b
    }
    ```

2. 上传这个文件

    ``` shell
    fnmgt upload ./test.js
    ```

3. 在其他工程引入 `fnmgt`

    ```js
    const fnmgt = require('fnmgt')
    ```

4. 调用写过的 **函数**

    ```js
    // 通过属性的方式调用
    fnmgt.add(1, 2)

    // 通过传参的形式调用
    let mult = fnmgt("mult")
    mult(1, 2)
    ```

5. 获取可用的函数列表

    ```js
    console.log(fnmgt.__getlist__())
    // {
    //     add:  {js: true, wasm: false},
    //     mult: {js: true, wasm: false},
    // }
    ```

### Wasm（暂不支持）

1. 打包好一个 `test.wasm` 文件后，同样可以通过 `fnmgt` 上传

    ``` shell
    fnmgt upload ./test.wasm
    ```

2. 在其他工程引入 `fnmgt`

    ```js
    const fnmgt = require('fnmgt')
    ```

3. 获取 wasm 文件

    ```js
    // 通过传参的形式调用
    let testWasm = fnmgt("test", "wasm")
    ```

4. 调用 wasm 文件中的函数

    ```js
    const buffer = await testWasm.arrayBuffer();
    const { instance } = await WebAssembly.instantiate(buffer);

    // 调用 Wasm 模块中的函数
    const result = instance.exports.add(1, 2);
    ```
