/**
 * Markdown文本格式化工具
 * 用于将Markdown格式的文本转换为适合展示的格式
 */

/**
 * 将Markdown文本转换为格式化的HTML
 * @param markdown - Markdown格式的文本
 * @returns 格式化后的HTML字符串
 */
export function formatMarkdown(markdown: string): string {
  if (!markdown) return ''
  
  let html = markdown
  
  // 转换标题
  html = html.replace(/### (.*?)$/gm, '<div class="text-base font-bold mt-3 mb-2">$1</div>')
  html = html.replace(/## (.*?)$/gm, '<div class="text-lg font-bold mt-4 mb-2">$1</div>')
  html = html.replace(/# (.*?)$/gm, '<div class="text-xl font-bold mt-4 mb-3">$1</div>')
  
  // 转换加粗
  html = html.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>')
  
  // 转换斜体
  html = html.replace(/\*(.*?)\*/g, '<span class="italic">$1</span>')
  
  // 转换无序列表
  html = html.replace(/^- (.*?)$/gm, '<div class="flex mt-1"><span class="mr-2">•</span><span>$1</span></div>')
  
  // 转换有序列表
  html = html.replace(/^(\d+)\. (.*?)$/gm, '<div class="flex mt-1"><span class="mr-2">$1.</span><span>$2</span></div>')
  
  // 转换段落（连续两个换行）
  html = html.replace(/\n\n/g, '</div><div class="mt-3">')
  
  // 转换单个换行为<br>
  html = html.replace(/\n/g, '<br>')
  
  // 包装在div中
  html = `<div class="text-xs text-#a1a1aa leading-relaxed">${html}</div>`
  
  return html
}

/**
 * 简化版Markdown渲染（适用于uni-app）
 * 返回处理后的纯文本，保留基本格式
 */
export function renderMarkdownText(markdown: string): string {
  if (!markdown) return ''
  
  let text = markdown
  
  // 保留换行但移除多余空行
  text = text.replace(/\n{3,}/g, '\n\n')
  
  // 转换列表项为更清晰的格式
  text = text.replace(/^- /gm, '• ')
  text = text.replace(/^\* /gm, '• ')
  text = text.replace(/^(\d+)\. /gm, '$1. ')
  
  // 移除Markdown标记但保留文本
  text = text.replace(/#{1,6} /g, '') // 移除标题标记
  text = text.replace(/\*\*(.*?)\*\*/g, '$1') // 移除加粗标记
  text = text.replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
  
  return text.trim()
}

/**
 * 清理Markdown文本中的代码块标记
 * 专门用于处理LLM返回的带有```标记的文本
 */
export function cleanMarkdownCodeBlocks(text: string): string {
  if (!text) return ''
  
  // 移除 ```json 或 ``` 代码块标记
  let cleaned = text.replace(/```(?:json|markdown|md)?\s*\n?/gi, '')
  cleaned = cleaned.replace(/```\s*$/g, '')
  
  // 如果文本以**开头和结尾，保留markdown格式
  // 否则返回清理后的文本
  return cleaned.trim()
}