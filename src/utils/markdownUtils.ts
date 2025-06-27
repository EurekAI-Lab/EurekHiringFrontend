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
  
  // 处理可能的列表项（有时LLM会在列表项前加数字）
  text = text.replace(/^\d+\.\s*"(.+?)"/gm, '• $1')
  text = text.replace(/^•\s*"(.+?)"/gm, '• $1')
  
  // 移除Markdown标记但保留文本
  text = text.replace(/#{1,6} /g, '') // 移除标题标记
  text = text.replace(/\*\*(.*?)\*\*/g, '$1') // 移除加粗标记
  text = text.replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
  
  // 清理引号（如果整行都被引号包围）
  text = text.replace(/^"(.+?)"$/gm, '$1')
  
  // 清理可能残留的特殊字符
  text = text.replace(/\[/g, '')
  text = text.replace(/\]/g, '')
  text = text.replace(/\+{2,}/g, '') // 移除连续的加号
  
  return text.trim()
}

/**
 * 清理Markdown文本中的代码块标记
 * 专门用于处理LLM返回的带有```标记的文本
 */
export function cleanMarkdownCodeBlocks(text: string): string {
  if (!text) return ''
  
  // 移除 ```json 或 ``` 代码块标记
  let cleaned = text.replace(/```(?:json|markdown|md|text)?\s*\n?/gi, '')
  cleaned = cleaned.replace(/```\s*$/gm, '')
  
  // 处理可能的JSON数组格式（LLM有时返回JSON数组）
  // 例如: ["建议1", "建议2", "建议3"]
  const jsonArrayMatch = cleaned.match(/^\s*\[([\s\S]*)\]\s*$/)
  if (jsonArrayMatch) {
    try {
      // 尝试解析为JSON数组
      const parsed = JSON.parse(cleaned)
      if (Array.isArray(parsed)) {
        // 如果是数组，转换为列表格式
        cleaned = parsed.map((item, index) => `${index + 1}. ${item}`).join('\n')
      }
    } catch (e) {
      // 如果解析失败，继续使用原始清理逻辑
    }
  }
  
  // 清理多余的引号和加号组合
  cleaned = cleaned.replace(/"\+"/g, '')
  cleaned = cleaned.replace(/\+"/g, '')
  cleaned = cleaned.replace(/"\+/g, '')
  
  // 清理方括号和多余的引号
  cleaned = cleaned.replace(/\["\]/g, '')
  cleaned = cleaned.replace(/"\]/g, '')
  cleaned = cleaned.replace(/\["/g, '')
  cleaned = cleaned.replace(/\\"/g, '"') // 处理转义的引号
  
  // 清理连续的引号
  cleaned = cleaned.replace(/"{2,}/g, '"')
  
  // 清理末尾的特殊字符组合
  cleaned = cleaned.replace(/["\]]+$/g, '')
  
  // 清理开头的特殊字符
  cleaned = cleaned.replace(/^["\[]+/g, '')
  
  // 如果文本以**开头和结尾，保留markdown格式
  // 否则返回清理后的文本
  return cleaned.trim()
}

/**
 * 专门处理能力提升建议的格式化
 * 处理LLM返回的建议列表，确保格式清晰
 */
export function formatImprovementSuggestions(text: string): string {
  if (!text) return ''
  
  // 先处理转义的换行符
  let cleaned = text.replace(/\\n/g, '\n')
  
  // 再进行基本清理
  cleaned = cleanMarkdownCodeBlocks(cleaned)
  
  // 分割成行，处理以 - 开头的列表项
  const lines = cleaned.split('\n').filter(line => line.trim())
  
  // 处理每一行
  const formattedLines = lines.map((line, index) => {
    let processedLine = line.trim()
    
    // 如果以 - 开头，移除 - 并添加数字编号
    if (processedLine.startsWith('- ')) {
      processedLine = processedLine.substring(2).trim()
    } else if (processedLine.startsWith('-')) {
      processedLine = processedLine.substring(1).trim()
    }
    
    // 移除行首的数字编号（如果有）
    processedLine = processedLine.replace(/^\d+\.\s*/, '')
    
    // 移除行首行尾的引号
    processedLine = processedLine.replace(/^["']|["']$/g, '')
    
    // 移除特殊字符
    processedLine = processedLine.replace(/[+\[\]]/g, '')
    
    // 如果行不为空，添加编号
    if (processedLine) {
      return `${index + 1}. ${processedLine}`
    }
    return ''
  }).filter(line => line)
  
  // 重新组合
  return formattedLines.join('\n')
}