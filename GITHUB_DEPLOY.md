# GitHub Pages 发布与 iPhone 安装

## 首次发布

1. 登录自己的 GitHub 账户，建立一个新仓库，例如 `chuangxun`。
2. 将本文件夹中的全部文件上传到仓库根目录。
3. 打开仓库的 `Settings`，进入 `Pages`。
4. 在 `Build and deployment` 中选择 `Deploy from a branch`。
5. 选择发布分支和根目录 `/ (root)`，保存。
6. 等待 GitHub 显示发布地址，例如 `https://用户名.github.io/chuangxun/`。

## 安装到 iPhone

1. 使用 Safari 打开 GitHub Pages 地址。
2. 等待网站完整打开一次。
3. 点击分享按钮，选择“添加到主屏幕”。
4. 保持“作为 Web App 打开”开启，然后添加。
5. 从主屏幕打开“传讯”，完成初始设置或导入备份。

## 数据安全

- GitHub 只保存网站程序，不保存聊天记录。
- 删除 Web App、清理 Safari 网站数据或更换网址，可能使设备内记录丢失。
- 定期导出完整 ZIP，并至少在 iPhone“文件”和电脑各保存一份。

## 后续更新

只有手动上传新文件才会更新。更新离线文件时，同时修改 `service-worker.js` 中的缓存版本号，确保设备取得新版本。
