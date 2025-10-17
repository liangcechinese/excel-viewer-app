# Excel查看工具

一个基于React + TypeScript的现代化Excel文件查看和分析工具，支持多种查看模式、数据分析和导出功能。

## ✨ 功能特性

### 📊 数据展示
- **多行视图**: 传统表格展示，支持分页和虚拟滚动
- **单行视图**: 表单式逐行查看，便于详细分析
- **工作表切换**: 支持多工作表Excel文件
- **单元格详情**: 全屏弹窗显示单元格详细信息

### 🔍 数据分析
- **数据质量评估**: 自动分析数据质量并给出评分
- **行分析**: 数值统计、趋势分析、异常检测
- **列分析**: 数据类型识别、分布分析、质量报告
- **统计图表**: 数据可视化展示

### 📤 导出功能
- **多格式支持**: Excel (.xlsx)、CSV、JSON
- **灵活导出**: 全表、当前视图、选中区域
- **自定义选项**: 选择列、包含表头
- **预览功能**: 导出前预览确认

### 🎨 用户体验
- **拖拽上传**: 支持拖拽和点击上传
- **响应式设计**: 适配不同屏幕尺寸
- **键盘导航**: 支持方向键、ESC等快捷键
- **实时反馈**: 加载状态和错误提示

## 🛠 技术栈

- **前端框架**: React 18 + TypeScript
- **UI组件库**: Ant Design
- **状态管理**: Zustand
- **Excel解析**: SheetJS (xlsx)
- **图表库**: ECharts
- **构建工具**: Create React App

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
cd excel-viewer
npm install
```

### 启动开发服务器
```bash
npm start
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用

### 构建生产版本
```bash
npm run build
```

### 运行测试
```bash
npm test
```

## 📁 项目结构

```
src/
├── components/          # React组件
│   ├── ExcelViewer/    # 主查看器组件
│   ├── CellDetail/     # 单元格详情弹窗
│   ├── DataAnalysis/   # 数据分析组件
│   ├── ExportPanel/    # 导出面板
│   └── common/         # 通用组件
│       ├── FileUpload/ # 文件上传
│       ├── ViewToggle/ # 视图切换
│       └── Toolbar/    # 工具栏
├── utils/              # 工具函数
│   ├── excelParser.ts  # Excel解析
│   ├── dataAnalyzer.ts # 数据分析
│   └── exportHelper.ts # 导出功能
├── types/              # TypeScript类型
│   ├── excel.ts        # Excel相关类型
│   ├── analysis.ts     # 分析相关类型
│   └── common.ts      # 通用类型
├── stores/             # 状态管理
│   └── excelStore.ts   # Excel数据状态
└── styles/             # 样式文件
```

## 📖 使用指南

### 1. 上传文件
- 拖拽Excel文件到上传区域
- 或点击上传区域选择文件
- 支持格式：.xlsx, .xls, .csv
- 文件大小限制：50MB

### 2. 查看数据
- **多行视图**: 点击"多行视图"查看完整表格
- **单行视图**: 点击"单行视图"逐行查看
- **单元格详情**: 双击单元格查看详细信息

### 3. 数据分析
- 点击"数据分析"按钮开始分析
- 查看数据质量评分和问题报告
- 分析行列统计信息和趋势

### 4. 导出数据
- 点击"导出"按钮打开导出面板
- 选择导出格式和范围
- 预览数据后确认导出

## 🔧 配置说明

### 文件大小限制
默认限制为50MB，可在 `src/utils/excelParser.ts` 中修改：
```typescript
private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
```

### 支持的文件格式
在 `src/utils/excelParser.ts` 中配置：
```typescript
private static readonly SUPPORTED_FORMATS = ['.xlsx', '.xls', '.csv'];
```

### 分页大小
默认分页大小为50行，可在组件中调整：
```typescript
const [viewMode, setViewMode] = useState({ 
  type: 'multiple', 
  pageSize: 50, 
  currentPage: 1 
});
```

## 🎯 核心功能详解

### Excel文件解析
- 使用SheetJS库解析Excel文件
- 支持多工作表
- 自动识别数据类型（数值、文本、日期、布尔值、公式）
- 保留单元格格式和样式信息

### 数据分析算法
- **数据质量评估**: 基于空值率、重复率、一致性计算质量分数
- **趋势分析**: 使用移动平均和变化率检测数据趋势
- **异常检测**: 基于IQR方法识别异常值
- **相关性分析**: 计算数值列间的皮尔逊相关系数

### 导出功能
- **Excel格式**: 保持原始格式和样式
- **CSV格式**: 标准逗号分隔值格式
- **JSON格式**: 结构化JSON数据
- **文件大小估算**: 导出前预估文件大小

## 🐛 常见问题

### Q: 上传大文件时卡顿怎么办？
A: 大文件解析需要时间，请耐心等待。建议文件大小控制在50MB以内。

### Q: 某些Excel格式无法解析？
A: 目前支持标准Excel格式(.xlsx, .xls)和CSV。复杂格式可能需要转换。

### Q: 数据分析结果不准确？
A: 数据分析基于统计方法，结果仅供参考。建议结合业务场景判断。

### Q: 导出功能异常？
A: 检查浏览器是否支持文件下载，尝试使用Chrome或Firefox浏览器。

## 🔮 未来规划

### 短期优化
- [ ] 虚拟滚动优化大数据量性能
- [ ] 图表功能完善
- [ ] 编辑功能支持
- [ ] 深色模式主题

### 中期功能
- [ ] 高级筛选和排序
- [ ] Excel公式重新计算
- [ ] 数据透视表
- [ ] 协作功能

### 长期规划
- [ ] 在线编辑功能
- [ ] 云存储集成
- [ ] API数据源
- [ ] 移动端适配

## 📄 许可证

MIT License

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交Issue
- 发送邮件
- 项目讨论区

---

**版本**: v1.0.0  
**最后更新**: 2025年10月17日  
**开发者**: Mi Code AI Assistant