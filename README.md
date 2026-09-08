# 拾光 · 可自己布置的个人博客

Hugo + Decap CMS + GitHub Pages。网站不带广告、不使用统计追踪、不需要数据库。示例文字和插画可以直接替换。

## 当前交付状态

网站已发布在 https://eurynn.github.io/blog/ ，源码位于 Eurynn/blog。前台会随 GitHub Pages 自动更新。
在线后台还需要一次性 OAuth 登录设置；在完成前，仍可用本机后台编辑，保存后需同步到 GitHub 才会发布。

## 平时怎样 DIY（不改代码）

打开网站的 /admin/，使用 GitHub 登录。

- **首页布局**：添加模块、拖动排序；关闭“显示这个模块”可隐藏。
- **梦核场景**：打开“梦核场景 → 首页场景与入口”，换电脑/手机背景图，调整图片焦点与入口位置。
- **个性化页面**：创建关于、作品集、旅行页。填写英文网址短名，例如 travel。
- **网站外观与导航**：修改名字、色号、宽度、页脚，给新页面加菜单，例如 /travel/。
- **文章**：使用可视化正文编辑器插入标题、段落、图片、引用、列表、链接。
- 保存/发布会写入 GitHub，Actions 构建成功后网站更新，不是立即更新。
- “暂不展示”默认开启。准备发布时关闭它；未来日期的文章在日期到来后仍需触发一次构建。

页面提供十四类模块：首屏介绍、富文本、单图、链接卡片、画廊、最新文章、醒目提示、视频、留白、图文双栏、大字引用、时间线、数字亮点和折叠问答。
这是模块式页面搭建，不是任意像素拖拽画布。新类型模块仍需修改模板。预览为近似布局；文章列表在实际网站中自动填充。

每个内容模块还可以选择普通、浅色块或主题色深底背景，并填写页内定位名。外观设置可切换标题字体、圆角/直角、页面宽度、分享封面和页脚链接。

## 梦核场景怎样自己调整

进入后台的 **梦核场景 → 首页场景与入口**。

- 先替换电脑版场景图片；有竖图时再单独上传手机版场景图片。
- 图片焦点是裁切中心的位置，0 表示最左/最上，100 表示最右/最下。换图后先调整它，让门、窗等关键物件留在画面内。
- 每个“场景入口”都是一个可点击圆点。电脑与手机各有横向、纵向坐标，数值是图片百分比；改完保存后，在电脑和手机上各看一次。
- “全部文章”“关于页面”“最新文章”会自动指向对应页面；只有选择“自定义链接”时才填写链接地址。
- 首页标题、简介和下方那句收尾文字仍在 **首页布局** 中编辑；场景设置只负责画面与入口。

## 一次性上线

### 1. 建仓库

当前公开仓库是 **Eurynn/blog**，默认分支 main。
将本项目的全部源文件上传到仓库根目录，包括 .github/workflows/pages.yml，别套一层 site 文件夹。
不要上传 D 盘的 tools、cache、downloads、temp、preview，它们不是网站源码。
图形化上传可能漏掉隐藏文件夹，建议由协作者通过 Git 提交完整项目。

### 2. 打开 Pages

仓库 Settings → Pages → Build and deployment → Source 选 **GitHub Actions**。
在 Actions 页面手动运行“发布博客到 GitHub Pages”，等待成功。
网址为 https://eurynn.github.io/blog/ 。

### 3. 设置后台登录（不是 Git Gateway）

GitHub Pages 不能存储 OAuth 密钥，所以使用 Netlify OAuth signer。只用于登录，不托管博客正文。
不要启用已弃用的 Git Gateway，也不需要 Netlify Identity。

1. 创建一个 Netlify Free 项目。可以将单独准备的 netlify-auth 文件夹拖入 https://app.netlify.com/drop ，获得 xxx.netlify.app。
2. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App。
3. Homepage URL 填博客网址；Authorization callback URL 填 **https://api.netlify.com/auth/done**。
4. 复制 Client ID，生成 Client Secret。只在 Netlify 的 Project configuration → Access & security → OAuth → Authentication providers → Install provider → GitHub 中填写。
5. 把 static/admin/config.yml 中 backend.site_domain 改成 xxx.netlify.app。这个字段不是密钥。可以用附带的配置脚本，不必手改 JSON。
6. 发布更新后打开博客 /admin/，登录、修改测试文章并发布，确认 Actions 成功和前台更新。

**不要把 Client Secret 或个人访问令牌放进仓库、聊天或截图。**
Netlify 只是可替换的登录中介；它故障时文章页面仍可访问，仍可在 GitHub 网页中编辑源文件。
后台脚本固定为 Decap 3.16.0。构建时下载并核对 SHA-256，然后随网页一起托管；访问后台不依赖运行时 CDN。源码仓库不包含这份较大的第三方文件，本机初始源码 ZIP 中保留了它。构建下载失败时不会覆盖已发布网站。

## 免费、数据与限制

- 按 GitHub Pages 和 Netlify 当前免费额度使用，不添加付费域名或付费服务；额度和政策可能变化。不要开启自动付费升级。
- 公开仓库中，即使文章暂不展示或之后删除，源文件/历史也可能被他人看到。不写私密日记或敏感资料。
- 每次发布都有 Git 版本记录，但版本记录不是独立备份。重要更新后，下载 ZIP 并保存在另一块磁盘；ZIP 没有历史。
- 更完整的备份方式是 git clone --mirror，定期 git remote update；镜像也要留一份离线副本。恢复时不要盲目强推覆盖线上。
- 图片随源码保存。上传前建议压缩到 1–2 MB 内。大视频不适合 GitHub Pages；视频模块接受 MP4/WebM 直链，外部视频可能失效。
- 没有任何免费托管能承诺永不消失。保留独立源码和图片备份，未来可迁移到其他静态托管或自己的服务器。
- 此版本无评论系统、无任意 HTML 嵌入；避免广告、额外账号和不安全脚本。

## 本地预览

构建工具已放 D:/CodexBlog/tools/hugo。日常上线后使用网页后台，不需要自己安装环境。
本地测试后台仅在电脑上运行代理时可用。请不要把本地 8081 端口暴露到公网。

## 项目结构

- content/_index.md：首页模块
- content/pages/：个性化页面
- content/posts/：文章
- data/settings.json：外观和导航
- static/images/：图片及上传文件
- static/admin/：后台与配置
- layouts/：模块渲染模板
- .github/workflows/pages.yml：自动发布
- static/admin/vendor/decap-cms.js：固定 Decap 3.16.0

## 官方资料

- Decap GitHub 登录：https://decapcms.org/docs/github-backend/
- 页面模块：https://decapcms.org/docs/variable-type-widgets/
- OAuth：https://docs.netlify.com/manage/security/secure-access-to-sites/oauth-provider-tokens/
- GitHub Pages：https://docs.github.com/en/pages
