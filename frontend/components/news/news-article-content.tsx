type NewsArticleContentProps = {
  html: string
  className?: string
}

export function NewsArticleContent({ html, className }: NewsArticleContentProps) {
  return (
    <div
      className={className ? `news-article-content ${className}` : "news-article-content"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
