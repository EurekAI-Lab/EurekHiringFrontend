# AI 面试页调试路径

## App 模拟器路径

1. 启动 App，进入底部 Tab `我的`
2. 点击常用功能里的 `AI面试`
3. 在弹窗里选择 `个人AI模拟面试`
4. 进入 `record-simulate` 页面后，点击头图 `查看详情` 进入 `process-simulation`
5. 在 `record-simulate` 列表点击任一已生成记录，进入 `mspj` 面试报告页
6. 如需验证企业流程，在同一个弹窗里选择 `企业AI面试应用`，进入 `process`

## 回归检查点

- `record-simulate` 顶部白色导航栏完整显示，返回按钮和标题不与状态栏重叠，头图从导航栏下方开始
- `process-simulation` 返回按钮和标题覆盖在头图上方，滚动后顶部渐变到白底，不出现额外白边
- `mspj` 顶部蓝色区域紧贴状态栏下方，返回按钮垂直居中，无额外白边
- `process` 从 App 入口进入后，点击左上返回一次即退出当前 H5 并回到原生 App，不出现需要多次点击的情况
- `record-simulate -> mspj` 点击左上返回时，必须回到 `record-simulate` 列表页，不能直接退出到原生 App
- `camera -> mspj-loading -> mspj` 完成面试后进入报告页，点击左上返回时，必须仍按 `camera-flow` 语义回到原生 App，不能误回 `record-simulate`

## 调试辅助

- H5 测试站可追加 `vconsole=1` 或 `debug=1`
- `src/main.ts` 已支持通过 URL 打开 `vConsole`，并把调试开关持久化到 `localStorage.__DEBUG__`

## 2026-03-29 返回链路专项路径

1. 企业流程返回 App
2. 启动 App，进入底部 Tab `我的`
3. 点击常用功能里的 `AI面试`
4. 在弹窗里选择 `企业AI面试应用`
5. 进入 `process` 页面后点击左上返回
6. 预期：一次返回原生 App，不停留在 H5 内部历史页

1. 模拟面试报告返回列表
2. 启动 App，进入底部 Tab `我的`
3. 点击常用功能里的 `AI面试`
4. 在弹窗里选择 `个人AI模拟面试`
5. 在 `record-simulate` 列表点击任一已完成记录进入 `mspj`
6. 点击左上返回
7. 预期：返回 `record-simulate` 列表页，不直接退出原生 App

1. 完成面试后的报告返回 App
2. 从 `record-simulate` 或 `process-simulation` 进入实际模拟面试流程
3. 完成答题并等待跳转到 `mspj-loading` / `mspj`
4. 在报告页点击左上返回
5. 预期：按 `camera-flow` 入口回到原生 App，不回 `record-simulate`

## 2026-03-29 头部安全区专项路径

1. 模拟面试列表头部
2. 启动 App，进入底部 Tab `我的`
3. 点击常用功能里的 `AI面试`
4. 在弹窗里选择 `个人AI模拟面试`
5. 预期：白色导航栏与状态栏只保留一段顶部安全区，不出现额外白条；返回按钮、标题与头图衔接正常

1. 正式面试记录头部
2. 启动 App，进入底部 Tab `我的`
3. 点击 `动态数据 -> AI面试记录`
4. 预期：白色导航栏与状态栏只保留一段顶部安全区，不出现额外白条；搜索框和头图从导航栏下方开始

## 2026-03-29 iOS 头部安全区专项路径

1. iOS 模拟面试列表头部
2. 在 iPhone 真机打开 `个人AI模拟面试`
3. 预期：顶部标题与返回按钮位于状态栏安全区下方；头图紧跟导航区下沿，视觉效果与 `274e785` 时期一致

1. iOS 正式面试记录头部
2. 在 iPhone 真机打开 `AI面试记录`
3. 预期：白色导航区高度正常，标题不贴顶；头图和搜索框整体位于导航区下方，视觉效果与 `274e785` 时期一致

1. iOS 面试报告头部
2. 在 iPhone 真机从列表进入 `mspj`
3. 预期：蓝色顶部区域与状态栏衔接正常；返回按钮不贴状态栏，页面不出现额外白边

1. iOS 面试摄像头头部
2. 在 iPhone 真机从 `个人AI模拟面试` 或 `process-simulation` 进入 `camera`
3. 预期：顶部企业信息卡和提示卡整体位于状态栏安全区下方，不压住状态栏文字或图标

## 2026-03-29 安卓系统返回专项路径

1. 模拟面试列表系统返回
2. 启动 App，进入底部 Tab `我的`
3. 点击常用功能里的 `AI面试`
4. 在弹窗里选择 `个人AI模拟面试`
5. 按安卓底部系统返回键，不点击左上角返回
6. 预期：第一次直接回原生 App；不允许先闪回到错误头部的 H5 页面

1. 正式面试记录系统返回
2. 启动 App，进入底部 Tab `我的`
3. 点击 `动态数据 -> AI面试记录`
4. 按安卓底部系统返回键，不点击左上角返回
5. 预期：第一次直接回原生 App；不允许停留在当前 H5 页面，也不需要连续快速点击

## 2026-03-29 安卓模拟面试创建专项路径

1. 模拟面试创建后进入摄像头
2. 启动 App，进入底部 Tab `我的`
3. 点击常用功能里的 `AI面试`
4. 在弹窗里选择 `个人AI模拟面试`
5. 在 `record-simulate` 页面点击底部 `开始模拟`
6. 在职位弹层里选中一个职位后点击 `确定`
7. 等待题目生成完成
8. 预期：继续停留在 H5 容器并进入 `camera` 页面；不允许直接退回原生 App

1. 流程页创建后进入摄像头
2. 在 `record-simulate` 页面点击头图 `查看详情` 进入 `process-simulation`
3. 点击底部 `开始模拟`
4. 在职位弹层里选中一个职位后点击 `确定`
5. 等待题目生成完成
6. 预期：继续停留在 H5 容器并进入 `camera` 页面；不允许直接退回原生 App

## 2026-03-29 报告页录屏全屏专项路径

1. 报告页打开录屏全屏查看
2. 启动 App，进入任一可查看 `mspj` 报告的路径
3. 在 `风险评价 -> 面试录屏` 区域点击任一题目的录屏缩略图
4. 预期：录屏以黑底全屏媒体层打开，不出现居中小窗、大边距或卡片圆角
5. 预期：右上关闭按钮位于顶部安全区内，尺寸正常，不出现超大圆形或漂移
6. 点击关闭按钮
7. 预期：返回原报告页，不丢失当前页面状态和返回链路

## 2026-03-30 Android/Harmony 桥接后退出专项路径

1. 企业 AI 面试应用创建题目
2. 启动 App，进入底部 Tab `我的`
3. 点击右上角 `我要招聘`，切换到招聘端
4. 进入招聘端后的 `AI面试`
5. 点击 `创建AI面试题`
6. 预期：H5 先发送 `openAiJobList`；Harmony 原生处理完成后回调 `window.onOpenAiJobListHandled`，再由 H5 发送 `pagerFinish`
7. 备注：若 Harmony 原生仍未回调 `window.onOpenAiJobListHandled`，则 H5 不应主动发送 `pagerFinish` 抢先关闭页面

1. 保存 AI 面试题后退出
2. 进入 `question` 页面并完成题目保存
3. 预期：Android/Harmony 先收到 `aiInterviewSaved`；Harmony 若未触发 `window.onAiInterviewSavedHandled`，H5 仍会兜底发送一次 `pagerFinish`
4. 备注：该兜底只适用于保存面试题，不适用于 `openAiJobList`

1. 切换身份后退出
2. 进入 `process-copy` 页面点击 `切换企业身份`
3. 预期：Android/Harmony 先收到 `userIdentityChange`；如原生实现确认回调，则触发 `window.onUserIdentityChangeHandled` 后再收到 `pagerFinish`

## 2026-05-22 Android/Harmony 企业 AI 面试回归路径

1. 企业 AI 面试应用安全区
2. 使用 Redmi Note 13 Pro / Android 13 或 Harmony WebView 打开 `https://interview.ycjp-work.com/test/#/pages/interviews/process/?token=<有效token>&debug=1`
3. 预期：返回按钮和标题不与系统状态栏重叠；头图顶部与当前设计一致，不出现整体上移或额外白边

1. AI 面试记录安全区
2. Android/Harmony 打开 `https://interview.ycjp-work.com/test/#/pages/interviews/record/?token=<有效token>&debug=1`
3. 预期：白色导航区只包含系统状态栏和标题栏；`AI面试记录` 标题垂直居中；搜索框和头图不被额外下推

1. 个人 AI 模拟面试记录安全区
2. Android/Harmony 打开 `https://interview.ycjp-work.com/test/#/pages/interviews/record-simulate/?token=<有效token>&debug=1`
3. 预期：白色导航区只包含系统状态栏和标题栏；`个人AI模拟面试` 标题垂直居中；banner 不被额外下推

1. 创建 AI 面试题桥接
2. 在同一页面点击 `创建AI面试题`
3. 预期：Android/Harmony 走 `openAiJobList` 原生桥接，不生成或打开 `#/requirManner`
4. 预期：Harmony 等待原生触发 `window.onOpenAiJobListHandled` 后，H5 才发送 `pagerFinish`

1. iOS 不受影响
2. iPhone 真机打开 `https://interview.ycjp-work.com/#/pages/interviews/process/?token=<有效token>`
3. 点击 `创建AI面试题`
4. 预期：仍走 iOS `webkit.messageHandlers.openAiJobList.postMessage(null)`，H5 不主动关闭当前页

1. 面试题提交链路
2. Android/Harmony 使用有效 `token` 和有效 `interviewId` 进入 `camera`
3. 完成至少 2 道题
4. 预期：每题 `submit_single_question` 使用当前 H5 session token；失败时日志包含 statusCode、后端 body、questionId 和 auth 诊断，不再只显示 `[object Object]`

## 2026-05-22 Android/Harmony 顶部安全区彻底修复路径

1. 企业 AI 面试应用顶部
2. Android/Harmony 打开 `https://interview.ycjp-work.com/test/#/pages/interviews/process/?token=<有效token>&debug=1`
3. 预期：返回按钮和标题由共享 `AiPageNavBar` 渲染，位于系统状态栏下方的标题行内；头图从页面顶部开始，不出现大块白色区域
4. 预期：诊断面板里 `safeSrc` 为 `android-css-status-bar-height`、`android-css-safe-area`、`android-status-bar-height-normalized` 或 `android-status-bar-height`，不应出现把 `safeTop` 放大到 60px 以上的情况

1. AI 面试记录顶部
2. Android/Harmony 打开 `https://interview.ycjp-work.com/test/#/pages/interviews/record/?token=<有效token>&debug=1`
3. 预期：白色导航区高度为归一化 `safeAreaTop + 48px`，banner 和搜索框只从导航栏下方开始，不出现截图中的额外白色空白

1. 个人 AI 模拟面试顶部
2. Android/Harmony 打开 `https://interview.ycjp-work.com/test/#/pages/interviews/record-simulate/?token=<有效token>&debug=1`
3. 预期：白色导航区高度为归一化 `safeAreaTop + 48px`，头图不被原始 `statusBarHeight` 物理像素下推

1. 个人 AI 模拟面试流程页顶部
2. Android/Harmony 打开 `https://interview.ycjp-work.com/test/#/pages/interviews/process-simulation/?token=<有效token>&debug=1`
3. 预期：返回按钮和标题覆盖在 banner 上方，滚动后渐变到白底；不出现额外白色顶部区域

## 2026-05-22 求职端 AI 顶部安全区真机回归路径

1. 动态数据进入 AI 面试记录
2. 使用已登录 Android 真机进入底部 Tab `我的`
3. 点击 `动态数据` 里的 `AI面试记录`
4. 预期：白色导航区高度为动态归一化后的 `safeAreaTop + 48px`；如果宿主返回 `--status-bar-height=84` 且 `devicePixelRatio=3`，页面应按 `28px` 布局，不能出现约 250px 的额外白色顶部空白
5. 预期：`AI面试记录` 标题和返回按钮位于系统状态栏下方的标题行内，banner 顶部紧贴导航栏下沿

1. 常用功能进入个人 AI 模拟面试
2. 使用已登录 Android 真机进入底部 Tab `我的`
3. 点击 `常用功能` 里的 `AI面试`
4. 在弹层中点击 `个人AI模拟面试`
5. 预期：`个人AI模拟面试` 页面白色导航区只包含系统状态栏和标题栏；banner 不被原始物理像素高度下推
6. 预期：滚动流程页 `process-simulation` 时，返回按钮和标题使用同一套共享 `AiPageNavBar` 计算，不按机型写死顶部高度

## 2026-07-27 个人 AI 模拟面试默认职位 mobile-mcp 回归路径

1. 首项默认选中并直接确认
2. 使用已登录账号进入 `我的 -> AI面试 -> 个人AI模拟面试`
3. 点击底部 `开始模拟`，等待求职意向加载完成
4. 预期：接口返回的第一条求职意向自动显示选中标记，“确定”按钮为蓝色可用态
5. 不手动选择职位，直接点击 `确定`
6. 预期：只发起一次创建模拟面试 POST；HTTP 200 且响应包含 `redirect_url` 后进入 `camera`

1. 多职位单选切换
2. 使用至少包含两条求职意向的账号打开职位弹层
3. 预期：初始仅第一项选中
4. 点击第二项
5. 预期：第一项取消选中、第二项选中，始终只有一个选中项；点击 `确定` 时请求使用第二项 id

1. 职位加载竞态
2. 在 mobile-mcp 中延迟 `jobseekers/by-user` 响应后立即打开职位弹层
3. 预期：加载完成前“确定”显示灰色禁用态；连续点击不发起创建模拟面试 POST，也不关闭弹层
4. 接口成功返回非空数组后，预期第一项自动选中，“确定”恢复蓝色可用态

1. 无求职意向
2. 使用 `jobseekers/by-user` 返回空数组的账号打开职位弹层
3. 预期：没有默认选中项，“确定”保持灰色禁用态
4. 连续点击“确定”
5. 预期：不发起创建模拟面试 POST，职位弹层保持打开

1. 防止重复提交
2. 在已有默认选中职位时快速连续点击“确定”
3. 预期：请求进行期间按钮显示“生成中...”并保持禁用，只发起一次创建模拟面试 POST
4. 请求完成后提交锁释放；成功响应按 `redirect_url` 进入 `camera`，失败时允许再次点击重试

### process-simulation 流程页同合同路径

1. 使用已登录账号进入 `我的 -> AI面试 -> 个人AI模拟面试`
2. 点击顶部操作流程 banner，进入 `process-simulation`
3. 点击底部 `开始模拟`，等待求职意向加载完成
4. 预期：第一条求职意向自动选中，“确定”为蓝色可用态；不手动切换直接确认时只发起一次 POST，并按有效 `redirect_url` 进入 `camera`
5. 返回流程页并再次打开弹层，切换到第二条求职意向
6. 预期：始终单选，创建请求使用第二条求职意向 id
7. 延迟 `jobseekers/by-user` 响应并重新进入流程页
8. 预期：加载期间“确定”为灰色禁用态，连续点击不关闭弹层、不发起 POST；加载完成后首项自动选中并恢复可用
9. 使用求职意向接口返回空数组的账号重新进入流程页
10. 预期：无默认选中项，“确定”保持灰色禁用态，点击不关闭弹层、不发起 POST
11. 恢复非空求职意向后快速连续点击“确定”
12. 预期：按钮立即显示“生成中...”并禁用，只产生一次 POST；请求完成后提交锁释放，失败时弹层保持打开并允许重试

## 2026-07-27 模拟面试职位卡片窄屏 mobile-mcp 回归路径

1. 准备包含超长中文职位名、无空格超长英文职位名、长行业名、薪资和城市的求职意向数据
2. 分别将 mobile-mcp 视口设为 `320px`、`375px`、`430px`
3. 进入 `我的 -> AI面试 -> 个人AI模拟面试`，在 `record-simulate` 点击 `开始模拟`
4. 预期：职位标题最多显示两行，超长中英文均可断行并在超出时省略；行业始终单行省略
5. 预期：右侧薪资、城市和到岗时间固定在独立列，不被标题挤压、不换列、不与右上选中角标重叠
6. 预期：空薪资仍保留首行高度，城市为空时显示“全国”，各职位卡片的右侧信息保持对齐
7. 关闭弹层后点击顶部操作流程 banner 进入 `process-simulation`，再次点击 `开始模拟`
8. 在三个视口宽度下重复检查同一批职位
9. 预期：标题、行业、薪资和城市布局与 `record-simulate` 一致；流程页不显示到岗时间
10. 在两页分别切换选中项并点击“确定”
11. 预期：角标和边框随单选项正确切换，共享卡片改造不影响默认选中、单选或创建模拟面试流程
