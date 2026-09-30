import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function MarkdownRenderer({ content }) {
  if (!content) return null
  return (
    <div className="ai-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-[16px] sm:text-[17px] font-bold text-foreground mt-5 first:mt-0 mb-2.5 leading-snug tracking-tight">{children}</h1>,
          h2: ({ children }) => <h2 className="text-[14px] sm:text-[15px] font-bold text-foreground mt-5 first:mt-0 mb-2 leading-snug tracking-tight border-b border-border pb-1.5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-[13px] sm:text-[14px] font-semibold text-foreground mt-4 first:mt-0 mb-1.5 leading-snug">{children}</h3>,
          h4: ({ children }) => <h4 className="text-[13px] font-semibold text-foreground-secondary mt-3 first:mt-0 mb-1">{children}</h4>,
          p: ({ children }) => <p className="text-[14px] leading-[1.65] text-foreground-secondary my-2.5 first:mt-0 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic text-foreground-secondary">{children}</em>,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover underline underline-offset-2 break-all">{children}</a>,
          ul: ({ children }) => <ul className="my-2.5 ml-4 list-disc space-y-1.5 marker:text-foreground-muted text-[14px] leading-[1.6] text-foreground-secondary">{children}</ul>,
          ol: ({ children }) => <ol className="my-2.5 ml-4 list-decimal space-y-1.5 marker:text-foreground-muted marker:font-medium text-[14px] leading-[1.6] text-foreground-secondary">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => <blockquote className="my-3 border-l-[3px] border-primary/40 bg-surface-muted/60 rounded-r-lg pl-3.5 pr-3 py-2.5 text-[13px] leading-[1.6] text-foreground-secondary">{children}</blockquote>,
          hr: () => <hr className="my-4 border-border" />,
          code: ({ children, inline }) =>
            inline ? (
              <code className="px-1.5 py-0.5 rounded text-[12.5px] font-mono bg-surface-muted border border-border text-foreground break-words">{children}</code>
            ) : (
              <code className="block text-[12.5px] font-mono leading-relaxed">{children}</code>
            ),
          pre: ({ children }) => <pre className="my-3 rounded-xl border border-border bg-surface-muted p-3.5 overflow-x-auto text-[12.5px] leading-relaxed scrollbar-thin">{children}</pre>,
          table: ({ children }) => (
            <div className="my-3 -mx-1 sm:mx-0 overflow-x-auto rounded-xl border border-border scrollbar-thin">
              <table className="w-full min-w-[520px] text-[13px] sm:text-[13.5px] border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-surface-muted">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-border-subtle">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-surface-muted/50 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-3 sm:px-3.5 py-2.5 text-left font-semibold text-foreground text-[12px] uppercase tracking-wider border-b border-border whitespace-nowrap">{children}</th>,
          td: ({ children }) => <td className="px-3 sm:px-3.5 py-2.5 align-top text-foreground-secondary leading-relaxed break-words max-w-[280px]">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default memo(MarkdownRenderer)
