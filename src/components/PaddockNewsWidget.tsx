import { useEffect, useState } from 'react'
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  Flame,
  Newspaper,
  Radio,
  RefreshCw,
  Sparkles,
  Tag,
} from 'lucide-react'
import { checkForBreakingNews, fetchF1News, type F1NewsArticle } from '../services/f1NewsService'

const STORAGE_KEY_CATEGORY = 'f1_paddock_news_category'
const STORAGE_KEY_BOOKMARKS = 'f1_paddock_news_bookmarks'

interface PaddockNewsWidgetProps {
  onNotify?: (title: string, message: string, tone?: 'success' | 'warning') => void
}

export function PaddockNewsWidget({ onNotify }: PaddockNewsWidgetProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_CATEGORY) || 'ALL'
    } catch {
      return 'ALL'
    }
  })

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOOKMARKS)
      return saved ? JSON.parse(saved) : ['news-1'] // Default bookmark on top technical article
    } catch {
      return ['news-1']
    }
  })

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasNewBreakingNews, setHasNewBreakingNews] = useState(false)

  const [news, setNews] = useState<F1NewsArticle[]>(() => {
    const initialCategory = (() => {
      try {
        return localStorage.getItem(STORAGE_KEY_CATEGORY) || 'ALL'
      } catch {
        return 'ALL'
      }
    })()
    const all = fetchF1News('ALL')
    if (initialCategory === 'Bookmarked') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_BOOKMARKS)
        const parsed: string[] = saved ? JSON.parse(saved) : ['news-1']
        return all.filter((n) => parsed.includes(n.id))
      } catch {
        return all
      }
    }
    return fetchF1News(initialCategory)
  })

  const categories = ['ALL', 'Bookmarked', 'Technical', 'Paddock', 'Regulations', 'Race Report', 'Driver Market']

  // Persist category changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORY, selectedCategory)
    } catch (e) {
      console.warn('Unable to persist category preference to localStorage', e)
    }
  }, [selectedCategory])

  // Persist bookmark changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarkedIds))
    } catch (e) {
      console.warn('Unable to persist bookmarks to localStorage', e)
    }
  }, [bookmarkedIds])

  // Automated background media sync timer (checks for breaking news every 35s)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const breaking = checkForBreakingNews()
      if (breaking) {
        setHasNewBreakingNews(true)
        if (selectedCategory === 'Bookmarked') {
          // If in bookmarked tab, don't auto-switch, but notify
        } else {
          setNews(fetchF1News(selectedCategory))
        }
        if (onNotify) {
          onNotify(
            `🚨 ${breaking.title}`,
            `[${breaking.source}] ${breaking.summary.slice(0, 95)}...`,
            'warning',
          )
        }
      }
    }, 35000)

    return () => clearInterval(syncInterval)
  }, [selectedCategory, onNotify])

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    if (cat === 'Bookmarked') {
      const all = fetchF1News('ALL')
      setNews(all.filter((item) => bookmarkedIds.includes(item.id)))
    } else {
      setNews(fetchF1News(cat))
    }
  }

  const toggleBookmark = (articleId: string) => {
    setBookmarkedIds((prev) => {
      const isAlready = prev.includes(articleId)
      const next = isAlready ? prev.filter((id) => id !== articleId) : [...prev, articleId]

      if (selectedCategory === 'Bookmarked') {
        const all = fetchF1News('ALL')
        setNews(all.filter((item) => next.includes(item.id)))
      }
      return next
    })
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    const breaking = checkForBreakingNews()
    if (breaking) {
      setHasNewBreakingNews(true)
      if (onNotify) {
        onNotify(
          `🚨 ${breaking.title}`,
          `[${breaking.source}] ${breaking.summary.slice(0, 95)}...`,
          'warning',
        )
      }
    }

    setTimeout(() => {
      if (selectedCategory === 'Bookmarked') {
        const all = fetchF1News('ALL')
        setNews(all.filter((item) => bookmarkedIds.includes(item.id)))
      } else {
        setNews(fetchF1News(selectedCategory))
      }
      setIsRefreshing(false)
      setHasNewBreakingNews(false)
    }, 450)
  }

  return (
    <div className="paddock-news-container">
      {/* Header */}
      <div className="paddock-news-header">
        <div className="news-title-group">
          <Newspaper size={18} className="news-icon-pulse" />
          <h3 className="news-title">FORMULA 1 PADDOCK NEWS & TECH BULLETINS</h3>
          <span className="live-bulletin-tag">
            <Radio size={11} />
            LIVE FEED
          </span>
          {hasNewBreakingNews && <span className="breaking-news-badge">NEW BULLETIN ARRIVED</span>}
        </div>
        <button
          type="button"
          className={`news-refresh-btn ${isRefreshing ? 'spinning' : ''} ${
            hasNewBreakingNews ? 'has-update' : ''
          }`}
          onClick={handleRefresh}
          title="Sync & Refresh Feed"
        >
          <RefreshCw size={14} />
          <span>{hasNewBreakingNews ? 'FETCH NEW' : 'SYNC MEDIA'}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="news-category-pills">
        {categories.map((cat) => {
          const isBookmarkTab = cat === 'Bookmarked'
          const count = isBookmarkTab ? bookmarkedIds.length : null
          return (
            <button
              key={cat}
              type="button"
              className={`news-pill ${selectedCategory === cat ? 'active' : ''} ${
                isBookmarkTab ? 'bookmark-pill' : ''
              }`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat === 'ALL' && <Sparkles size={12} />}
              {cat === 'Bookmarked' && <Bookmark size={12} className="bookmark-pill-icon" />}
              {cat === 'Technical' && <Flame size={12} />}
              {cat === 'Regulations' && <BookOpen size={12} />}
              <span>{cat}</span>
              {count !== null && count > 0 && <span className="pill-badge">{count}</span>}
            </button>
          )
        })}
      </div>

      {/* News Feed Grid */}
      {news.length === 0 ? (
        <div className="news-empty-state">
          <Bookmark size={32} className="empty-bookmark-icon" />
          <h4>No Bookmarked Articles Yet</h4>
          <p>
            Click the bookmark icon on any Technical Bulletin or Paddock news card to save articles for offline reading across sessions.
          </p>
          <button
            type="button"
            className="empty-reset-btn"
            onClick={() => handleCategoryChange('ALL')}
          >
            EXPLORE ALL STORIES
          </button>
        </div>
      ) : (
        <div className="news-articles-grid">
          {news.map((item) => {
            const isBookmarked = bookmarkedIds.includes(item.id)
            return (
              <article
                key={item.id}
                className={`news-card ${item.featured ? 'featured' : ''} ${
                  isBookmarked ? 'bookmarked-card' : ''
                }`}
              >
                <div className="news-card-top-row">
                  <div className="news-card-meta">
                    <span className={`news-category-tag ${item.category.toLowerCase().replace(/\s+/g, '-')}`}>
                      <Tag size={10} />
                      {item.category}
                    </span>
                    <span className="news-source">{item.source}</span>
                  </div>

                  <button
                    type="button"
                    className={`bookmark-toggle-btn ${isBookmarked ? 'bookmarked' : ''}`}
                    onClick={() => toggleBookmark(item.id)}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark technical article'}
                    aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark technical article'}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck size={15} className="bookmark-active-icon" />
                    ) : (
                      <Bookmark size={15} />
                    )}
                  </button>
                </div>

                {item.featured && (
                  <div className="featured-banner">
                    <Flame size={12} />
                    <span>TOP STORY</span>
                  </div>
                )}

                <h4 className="news-card-title">{item.title}</h4>
                <p className="news-card-summary">{item.summary}</p>

                <div className="news-card-footer">
                  <span className="news-author">By {item.author}</span>
                  <div className="news-footer-right">
                    <span className="news-timestamp">
                      <Clock size={11} />
                      {item.timestamp}
                    </span>
                    <span className="news-read-time">
                      <Calendar size={11} />
                      {item.readTimeMin} min
                    </span>
                    <button
                      type="button"
                      className="read-more-link"
                      onClick={() =>
                        alert(
                          `Full article: "${item.title}"\n\n${item.summary}\n\nPublished by ${item.source} (${item.author})`,
                        )
                      }
                    >
                      <span>READ</span>
                      <ExternalLink size={11} />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
