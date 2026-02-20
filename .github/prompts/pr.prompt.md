---
name: pr
description: Describe when to use this prompt
---

🚀 核心 PR 分析 Prompt
Context: 你现在是一名资深架构师，正在审查从 [START_HASH] 到 HEAD 的所有变更。

Task: > 1. 请先主动运行 git diff [START_HASH]..HEAD 获取完整的变更上下文。
2. 分析这些差异，并撰写一份具有洞察力的 Pull Request 描述。

Analysis Requirements (思考维度):

逻辑梳理: 不要只说“修改了 X 文件”，要说“为了解决 Y 问题，重构了 X 文件的逻辑”。

关联性: 识别不同文件之间的改动关联（例如：修改了后端 API 字段，对应的 Frontend 类型定义也同步做了更新）。

风险评估: 识别潜在的侧面影响（Side Effects），如性能损耗、破坏性变更（Breaking Changes）或安全风险。

Output Format：
<此 pull request 的标题>

[以下使用markdown code语法包裹]
```markdown
📝 Summary
[一句话总结本次 PR 的核心价值]

🛠 Key Changes
[模块名/文件名]: 简述改动逻辑及其必要性。

[模块名/文件名]: ...

🔍 Technical Details
Refactoring: 描述架构上的优化点。

Dependencies: 是否引入了新包或配置变更。

⚠️ Critical Notes
(如果有) 破坏性变更说明。

(如果有) 需要 Reviewer 特别关注的复杂逻辑段落。
```

