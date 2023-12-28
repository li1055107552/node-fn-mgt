const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

module.exports = function extractFunctionsFromFile(filePath) {
  // 读取文件内容
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // 将代码解析为 AST
  const ast = parser.parse(fileContent, {
    sourceType: 'module', // 或 "script"，取决于您的代码类型
    plugins: ['jsx']     // 如果您的代码包含 JSX，添加此插件
  });

  // 存储函数信息的对象
  const functions = {};

  // 遍历 AST
  traverse(ast, {
    FunctionDeclaration(path) {
      const funcName = path.node.id.name;
      const params = path.node.params.map(param => param.name);
      const functionBody = fileContent.slice(path.node.start, path.node.end);
      functions[funcName] = { body: functionBody, params };
    },
    ArrowFunctionExpression(path) {
      // 对于箭头函数，可能需要另外处理，因为它们可能没有名称
    },
    // 其他类型的函数（如方法、函数表达式）也可以类似处理
  });

  return functions;
}
