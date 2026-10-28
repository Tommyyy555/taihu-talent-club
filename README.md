# 太湖人才生涯俱乐部｜平台 MVP

这是一个不依赖构建工具的静态前端原型，入口为 `index.html`。它用于先验证品牌表达、企业服务结构、AI专家入口和合作伙伴入口，暂时不承载真实账号或真实模型调用。

## 已包含

- 面向无锡制造业、科技型和成长型企业的定位与首页展示
- 企业人才成长 90 天方案、管理者 AI 陪练、专家/服务合作网络三条服务线
- AI 专家入口交互样板
- 企业诊断、合作申请、登录/控制台预览弹窗
- 多租户、角色权限、Token 用量和模型适配层的产品底座展示
- 线索暂存到当前浏览器 `localStorage`，便于演示，不代表生产数据方案

## 后续建议的真实系统边界

前端不保存模型密钥。正式版建议由后端提供以下接口：

```text
POST /v1/auth/login
POST /v1/auth/refresh
GET  /v1/me
GET  /v1/tenants/:tenantId/members
POST /v1/tenants/:tenantId/invitations
GET  /v1/experts
POST /v1/conversations
GET  /v1/conversations/:id/messages
GET  /v1/usage?tenantId=&period=
POST /v1/leads
```

推荐的核心实体：

```text
User       用户
Tenant     企业/机构空间
Membership 用户-空间关系及角色
Expert     专家档案与知识空间
Knowledge  课件、书籍、案例、授权范围
Conversation 会话与模型调用记录
UsageLedger Token/模型/项目用量账本
Lead       企业线索
Partner    伙伴与分成规则
AuditLog   登录、授权、导出、删除等审计事件
```

## 权限建议

`OWNER` 管理企业、成员、账单和授权；`ADMIN` 管理项目、知识空间和成员；`EXPERT` 管理自己的专家资料与内容授权；`MEMBER` 使用被授权的AI入口和项目；`PARTNER` 只查看被分配的客户和联合交付项目；平台侧另设 `PLATFORM_ADMIN` 和 `CONTENT_REVIEWER`。

## Token 与模型接入建议

- 每次模型调用记录 `tenantId / userId / expertId / model / inputTokens / outputTokens / latency / status`。
- 企业、项目、成员三级都可设置额度；达到 80% 预警，达到 100% 限流或转人工。
- 模型供应商通过服务端 adapter 接入，前端只调用统一的 `/v1/conversations`。
- 企业知识库与专家内容必须按授权范围检索，不能用一个公共知识库混合返回。
- 企业版建议默认不使用客户对话训练公共模型，并提供数据保留、导出和删除策略。

## 本地预览

在项目根目录执行：

```bash
python3 -m http.server 4173 --directory platform
```

然后打开 `http://localhost:4173`。
