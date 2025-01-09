
/**
 * 将横线命名转换为大驼峰命名
 * @param input - 输入的横线命名字符串，例如 "hello-world"
 * @returns 转换后的大驼峰命名字符串，例如 "HelloWorld"
 */
function toPascalCase(input: string): string {
  return input
    .split('-') // 按横线分割
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // 首字母大写，其他字母小写
    .join('') // 合并成一个字符串
}
