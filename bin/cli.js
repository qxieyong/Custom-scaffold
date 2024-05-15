#! /usr/bin/env node
const path = require("path");

const program = require("commander"); //创建项目模版交互
const inquirer = require("inquirer"); //需要能处理用户在命令行的输入
const downloadGitRepo = require("download-git-repo"); //下载模板
const ora = require("ora"); // 引入ora  loading动画库
const fs = require("fs-extra"); // 引入fs-extra  //文件操作

const package = require("../package.json");

const { getGitReposList } = require('./api.js') // 新增
// const templates = require("./templates.js"); //所有目标list

// 定义当前版本
program.version(`v${package.version}`);

program
  .command("create [projectName]") // [projectName]是可选 <projectName>是必填
  .description("创建模板")
  .option("-t,--template <template>", "模板名称") // 配置项 --template xxx
  .action(async (projectName, options) => {
    // 1. 从模版列表中找到对应的模版
    const getRepoLoading = ora('获取模版列表...');
    getRepoLoading.start();
    // const templates = await getGitReposList('guojiongwei');
    const templates = await getGitReposList('qxieyong');
    getRepoLoading.succeed('获取模版列表成功!');
    console.log('templates',templates)
    let project = templates.find(
      (template) => template.name === options.template
    );
    // 2. 如果匹配到模版就赋值，没有匹配到就是undefined
    let projectTemplate = project ? project.value : undefined;
    console.log("命令行参数：", projectName, projectTemplate);
    if (!projectName) {
      const { name } = await inquirer.prompt({
        type: "input",
        name: "name",
        message: "请输入项目名称:",
      });
      projectName = name; // 赋值输入的项目名称
    }
    console.log("项目名称:", projectName);
    // 4. 如果用户没有传入模版就交互式输入
    if (!projectTemplate) {
      // 新增选择模版代码
      const { template } = await inquirer.prompt({
        type: "list",
        name: "template",
        message: "请选择模版：",
        choices: templates, // 模版列表
      });
      projectTemplate = template; // 赋值选择的项目名称
    }
    console.log("模版：", projectTemplate);

    const dest = path.join(process.cwd(), projectName);
    // 判断文件夹是否存在，存在就交互询问用户是否覆盖
    if (fs.existsSync(dest)) {
      const { force } = await inquirer.prompt({
        type: "confirm",
        name: "force",
        message: "目录已存在，是否覆盖？",
      });
      // 如果覆盖就删除文件夹继续往下执行，否的话就退出进程
      force ? fs.removeSync(dest) : process.exit(1);
    }
    const loading = ora("正在下载模版...");
    loading.start();
    // 开心下载模版
    downloadGitRepo(projectTemplate, dest, (err) => {
      if (err) {
        loading.fail("创建模版失败：" + err.message); // 失败loading
      } else {
        loading.succeed("创建模版成功!"); // 成功loading
        console.log(`\ncd ${projectName}`);
        console.log("npm i");
        console.log("npm start\n");
      }
    });
  });

// 解析用户执行命令传入参数
program.parse(process.argv);
program.on("--help", () => {});
console.log("wuyou-cli~~~~");
