import { useEffect, useRef, useState } from 'react'
import { availabilityStatus, projects, projectCategories, type Project } from './data/projects'
import './App.css'

const principles = [
  ['01', 'STORY FIRST', 'Every cut should contribute to the message, narrative, or feeling of a video.'],
  ['02', 'RHYTHM & PACING', 'Timing is a tool. Find the pulse that keeps a viewer with the story.'],
  ['03', 'MOTION WITH PURPOSE', 'Text, movement, and effects belong when they make the message clearer.'],
  ['04', 'SOUND MATTERS', 'Music, sound design, and sync bring the whole picture into focus.'],
]
const workflow = [
  ['01', 'UNDERSTAND', 'The brief, audience, platform, and reason for the video.'],
  ['02', 'ASSEMBLE', 'Review the footage. Find the moments worth keeping.'],
  ['03', 'EDIT', 'Shape the story with pace, cuts, sound, and motion.'],
  ['04', 'POLISH', 'Refine timing, color, audio, subtitles, and details.'],
  ['05', 'DELIVER', 'Export for the right platform, aspect ratio, and format.'],
]
const editingSkills = ['Video editing', 'Short-form content editing', 'Social media video editing', 'Promotional video editing', 'Visual storytelling', 'Pacing and sound synchronization']
const software = ['Adobe Family', 'CapCut', 'Figma']

function getVideoEmbedUrl(videoUrl: string) {
  try {
    const url = new URL(videoUrl)
    const host = url.hostname.replace(/^www\./, '')
    let videoId = ''
    if (host === 'youtu.be') videoId = url.pathname.slice(1)
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      videoId = url.searchParams.get('v') ?? url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ?? ''
    }
    if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`
    if (host === 'vimeo.com') {
      const vimeoId = url.pathname.match(/\/(\d+)/)?.[1]
      if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`
    }
    if (host === 'player.vimeo.com' && url.pathname.startsWith('/video/')) return videoUrl
  } catch {
    return null
  }
  return null
}

function getYouTubeThumbnail(videoUrl: string) {
  const embedUrl = getVideoEmbedUrl(videoUrl)
  const videoId = embedUrl?.match(/youtube-nocookie\.com\/embed\/([^?]+)/)?.[1]
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null
}

function formatViews(views: number) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(views)
}

function ProjectArtwork({ project }: { project: Project }) {
  const aspectRatio = project.aspectRatio ?? '9 / 16'
  if (project.thumbnail) return <img className="project-image" src={project.thumbnail} alt={`${project.title} thumbnail`} loading="lazy" style={{ aspectRatio }} />
  return (
    <div className="project-artwork" role="img" aria-label="Project thumbnail not available" style={{ aspectRatio }}>
      <span className="artwork-corner artwork-corner--tl" /><span className="artwork-corner artwork-corner--br" />
      <span className="artwork-kicker">{project.externalUrl ? 'INSTAGRAM / REEL' : 'PROJECT / VIDEO'}</span><span className="artwork-title">{project.externalUrl ? 'REEL' : 'PLAY'}<span>.</span></span>
      <span className="artwork-caption">{project.externalUrl ? 'OPEN ORIGINAL REEL' : <>ADD A THUMBNAIL<br />OR VIDEO LINK</>}</span><span className="artwork-cross" aria-hidden="true">+</span>
      <span className="artwork-orbit" aria-hidden="true" /><span className="artwork-index">S / 01</span>
    </div>
  )
}

function YouTubeThumbnail({ project, videoUrl }: { project: Project; videoUrl: string }) {
  const [failed, setFailed] = useState(false)
  const thumbnailUrl = getYouTubeThumbnail(videoUrl)
  if (!thumbnailUrl || failed) return <ProjectArtwork project={project} />
  return <img className="project-image" src={thumbnailUrl} alt={`${project.title} video thumbnail`} loading="lazy" style={{ aspectRatio: project.aspectRatio ?? '9 / 16' }} onError={() => setFailed(true)} />
}

function ProjectMedia({ project }: { project: Project }) {
  const [videoFailed, setVideoFailed] = useState(false)
  const aspectRatio = project.aspectRatio ?? '9 / 16'
  if (project.thumbnail) return <img className="project-image" src={project.thumbnail} alt={`${project.title} thumbnail`} loading="lazy" style={{ aspectRatio }} />
  if (project.videoUrl && !getVideoEmbedUrl(project.videoUrl) && !videoFailed) {
    return <video className="project-image project-video-thumb" src={project.videoUrl} muted playsInline preload="metadata" aria-label={`${project.title} video thumbnail`} style={{ aspectRatio }} onLoadedData={(event) => { const video = event.currentTarget; if (video.duration > 1) video.currentTime = Math.min(0.4, video.duration / 2) }} onError={() => setVideoFailed(true)} />
  }
  if (project.videoUrl) {
    if (getYouTubeThumbnail(project.videoUrl)) return <YouTubeThumbnail project={project} videoUrl={project.videoUrl} />
  }
  return <ProjectArtwork project={project} />
}

function ProjectModal({ project, onClose, onNavigate }: { project: Project; onClose: () => void; onNavigate: (direction: -1 | 1) => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') onNavigate(-1)
      if (event.key === 'ArrowRight') onNavigate(1)
      if (event.key === 'Tab' && dialogRef.current) {
        const items = dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), video[controls]')
        const first = items[0]
        const last = items[items.length - 1]
        if (!first || !last) return
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [onClose, onNavigate])

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`project-modal${(project.aspectRatio ?? '9 / 16') === '9 / 16' ? ' project-modal--vertical' : ' project-modal--landscape'}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} ref={dialogRef}>
        <div className="modal-topline"><span>PROJECT FILE / {project.id.toUpperCase()}</span><button className="icon-button" type="button" onClick={onClose} aria-label="Close project details">×</button></div>
        <div className={`modal-preview${(project.aspectRatio ?? '9 / 16') === '9 / 16' ? ' modal-preview--vertical' : ''}`}>
          {project.videoUrl && getVideoEmbedUrl(project.videoUrl) ? <iframe src={getVideoEmbedUrl(project.videoUrl) ?? undefined} title={`${project.title} video`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" /> : project.videoUrl ? <video src={project.videoUrl} poster={project.thumbnail ?? undefined} controls playsInline preload="metadata">Your browser does not support video playback.</video> : <><ProjectArtwork project={project} /><span className="preview-unavailable">{project.externalUrl ? 'REEL HOSTED ON INSTAGRAM' : 'VIDEO LINK NOT ADDED YET'}</span></>}
        </div>
        <div className="modal-information"><div><p className="eyebrow">{project.category}</p><h2 id="modal-title">{project.title}</h2><p className="modal-description">{project.description}</p>{(project.duration || project.year) && <p className="modal-tools">{[project.duration, project.year].filter(Boolean).join(' / ')}</p>}{project.tools && <p className="modal-tools"><span>TOOLS</span> {project.tools.join(' / ')}</p>}{project.externalUrl && <a className="external-project-link" href={project.externalUrl} target="_blank" rel="noreferrer">WATCH ON INSTAGRAM <span>↗</span></a>}</div><div className="modal-navigation"><button type="button" onClick={() => onNavigate(-1)} aria-label="Previous project">←</button><button type="button" onClick={() => onNavigate(1)} aria-label="Next project">→</button></div></div>
      </div>
    </div>
  )
}

type ProjectFiltersProps = {
  activeCategory: string
  activeAspectRatio: 'All ratios' | '9 / 16' | '16 / 9'
  ratioProjects: Project[]
  onCategoryChange: (category: string) => void
  onAspectRatioChange: (ratio: 'All ratios' | '9 / 16' | '16 / 9') => void
}

function ProjectFilters({ activeCategory, activeAspectRatio, ratioProjects, onCategoryChange, onAspectRatioChange }: ProjectFiltersProps) {
  const [filterOpen, setFilterOpen] = useState(false)
  const formatOptions = [
    { value: '9 / 16', label: 'Vertical · 9:16' },
    { value: '16 / 9', label: 'Landscape · 16:9' },
    { value: 'All ratios', label: 'All formats' },
  ] as const

  return (
    <div className="category-filter-row">
      <div className="filter-list" aria-label="Project category filters">
        {['All work', ...projectCategories].map((category) => {
          const count = category === 'All work' ? ratioProjects.length : ratioProjects.filter((project) => project.category === category).length
          return <button className={activeCategory === category ? 'filter-button is-active' : 'filter-button'} type="button" aria-pressed={activeCategory === category} key={category} onClick={() => onCategoryChange(category)}>{category}<span>{count}</span></button>
        })}
      </div>
      <div className="format-filter">
        <button className={filterOpen ? 'filter-trigger is-open' : 'filter-trigger'} type="button" aria-label="Open project filters" title="Filter projects" aria-expanded={filterOpen} aria-controls="project-format-options" onClick={() => setFilterOpen(!filterOpen)}>
          <svg className="filter-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></svg>
        </button>
        {filterOpen && <div className="filter-popover" id="project-format-options" aria-label="Project filters">
          <div className="filter-group">
            <span className="filter-group-label">CATEGORY</span>
            {['All work', ...projectCategories].map((category) => { const count = ratioProjects.filter((project) => category === 'All work' || project.category === category).length; return <button className={activeCategory === category ? 'filter-option is-active' : 'filter-option'} type="button" key={category} aria-pressed={activeCategory === category} onClick={() => { onCategoryChange(category); setFilterOpen(false) }}>{category}<span>{count}</span></button> })}
          </div>
          <div className="filter-group filter-group--format">
            <span className="filter-group-label">VIDEO FORMAT</span>
            {formatOptions.map(({ value, label }) => <button className={activeAspectRatio === value ? 'filter-option is-active' : 'filter-option'} type="button" key={value} aria-pressed={activeAspectRatio === value} onClick={() => { onAspectRatioChange(value); setFilterOpen(false) }}>{label}<span>{projects.filter((project) => value === 'All ratios' || (project.aspectRatio ?? '9 / 16') === value).length}</span></button>)}
          </div>
        </div>}
      </div>
    </div>
  )
}

function App() {
  const [activeCategory, setActiveCategory] = useState('All work')
  const [activeAspectRatio, setActiveAspectRatio] = useState<'All ratios' | '9 / 16' | '16 / 9'>('9 / 16')
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 480)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  const ratioProjects = projects.filter((project) => activeAspectRatio === 'All ratios' || (project.aspectRatio ?? '9 / 16') === activeAspectRatio)
  const filteredProjects = [...ratioProjects.filter((project) => activeCategory === 'All work' || project.category === activeCategory)]
    .sort((first, second) => (second.views ?? -1) - (first.views ?? -1))
  const visibleProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, 5)
  const navigateProject = (direction: -1 | 1) => {
    const index = projects.findIndex((project) => project.id === activeProject?.id)
    setActiveProject(projects[(index + direction + projects.length) % projects.length])
  }
  const closeModal = () => setActiveProject(null)

  return <>
    <header className="site-header"><a className="wordmark" href="#top" aria-label="Sera, back to top"><img src="/images/Quesera%20White%20Swirl%20Logo.png" alt="Quesera" /></a><button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'CLOSE −' : 'MENU +'}</button>
      <nav id="main-navigation" className={menuOpen ? 'site-nav site-nav--open' : 'site-nav'} aria-label="Main navigation"><a href="#work" onClick={() => setMenuOpen(false)}>WORK <span>01</span></a><a href="#approach" onClick={() => setMenuOpen(false)}>APPROACH <span>02</span></a><a href="#about" onClick={() => setMenuOpen(false)}>ABOUT <span>03</span></a><a className="nav-contact" href="#contact" onClick={() => setMenuOpen(false)}>LET'S TALK <span>↗</span></a></nav>
    </header>
    <main>
      <section className="hero section-shell" id="top" aria-labelledby="hero-title"><div className="hero-meta"><span>VIDEO EDITOR / INDONESIA</span><span>SHORT-FORM &amp; SOCIAL VIDEO</span></div><div className="hero-layout">
        <a className="hero-frame" href="#reel" aria-label="Jump to Sera's portfolio video"><div className="frame-paper"><img className="frame-photo" src="/images/Sera.png" alt="Sera, video editor" fetchPriority="high" /><span className="frame-label frame-label--top">SECTIO KAUTSAR RAMADHANI</span><span className="frame-label frame-label--bottom">VIDEO EDITOR / SERA</span></div><img className="hero-character" src="/images/Char%201.png" alt="Sera's illustrated character" /></a>
        <div className="hero-copy"><p className="hero-overline"><span className="live-mark" /> VIDEO EDITOR &amp; VISUAL STORYTELLER</p><h1 id="hero-title">HEY, I'M<br /><span>SERA</span><span className="hero-period">.</span></h1><p className="hero-intro">I turn raw footage into engaging visual stories through thoughtful editing, rhythm, sound, and motion.</p><div className="hero-actions"><a className="button-primary" href="#work">VIEW MY WORK <span>↘</span></a><a className="button-text" href="#contact">LET'S WORK TOGETHER <span>↗</span></a></div><p className="availability"><span>●</span> Availability status: {availabilityStatus}</p></div>
      </div><div className="hero-bottom"><span>STORY / RHYTHM / FEELING</span><span>SCROLL TO EXPLORE ↓</span></div><span className="margin-note" aria-hidden="true">EVERY FRAME HAS A PURPOSE</span></section>

      <section className="reel-section section-shell" id="reel" aria-labelledby="reel-title"><div className="section-heading reel-heading"><div><p className="eyebrow">PORTFOLIO REEL / 01:20</p><h2 id="reel-title">LESS TALK.<br /><span>MORE PLAY.</span></h2></div><p className="section-aside">A look at Sera's video work.<br />Play the full portfolio reel.</p></div>
        <div className="reel-stage"><div className="reel-frame-label"><span><i /> REEL 001 / SERA</span><span>H.264 <b>·</b> 1920 × 1080</span></div><div className="reel-canvas"><span className="reel-corner reel-corner--tl" aria-hidden="true" /><span className="reel-corner reel-corner--tr" aria-hidden="true" /><span className="reel-corner reel-corner--bl" aria-hidden="true" /><span className="reel-corner reel-corner--br" aria-hidden="true" /><video className="reel-video" src="/Video/Portofolio%20SkautsarR-web.mp4" poster="/images/portfolio-reel-poster.jpg" controls playsInline preload="metadata" aria-label="Sera's 1 minute 20 second portfolio video reel">Your browser does not support video playback.</video></div><div className="reel-timeline" aria-hidden="true"><span className="timeline-start">00:00</span><div className="timeline-track"><i /><span /><span /><span /><span /><span /></div><span className="timeline-end">01:20</span></div><div className="reel-caption"><span>PORTOFOLIO SKAUTSARR / 16:9</span><a href="#work">VIEW PROJECT DETAILS <span>↘</span></a></div></div>
      </section>

      <section className="work-section section-shell" id="work" aria-labelledby="work-title"><div className="section-heading work-heading"><div><p className="eyebrow">01 / THE EDITS</p><h2 id="work-title">SELECTED<br /><span>EDITS.</span></h2></div><p className="section-aside">A collection of edits, experiments,<br />and visual stories.</p></div>
        <div className="work-toolbar"><ProjectFilters activeCategory={activeCategory} activeAspectRatio={activeAspectRatio} ratioProjects={ratioProjects} onCategoryChange={(category) => { setActiveCategory(category); setShowAllProjects(false) }} onAspectRatioChange={(ratio) => { setActiveAspectRatio(ratio); setShowAllProjects(false) }} /><span className="work-count">{filteredProjects.length.toString().padStart(2, '0')} VIDEO{filteredProjects.length === 1 ? '' : 'S'}</span></div>
        <div className="project-grid">{visibleProjects.map((project) => <button className="project-card" type="button" key={project.id} onClick={() => setActiveProject(project)} aria-label={`View details for ${project.title}`}><span className="project-media"><ProjectMedia project={project} /><span className="project-ratio">{project.aspectRatio ?? '9 / 16'}</span><span className="project-category-badge">{project.category}</span><span className="project-open" aria-hidden="true">↗</span></span><span className="project-card-info"><span className="project-title">{project.title}</span><span className="project-card-meta">{project.views !== undefined && <span className="project-views">{formatViews(project.views)} VIEWS</span>}{[project.duration, project.year].filter(Boolean).length > 0 && <span>{[project.duration, project.year].filter(Boolean).join(' / ')}</span>}<span className="project-view">VIEW ↗</span></span></span></button>)}{filteredProjects.length === 0 && <div className="empty-filter"><span>NO PROJECTS IN THIS CATEGORY YET</span><p>New edits will appear here when you add a project link.</p></div>}</div>
        {filteredProjects.length > 5 && <button className="show-more-button" type="button" aria-expanded={showAllProjects} onClick={() => setShowAllProjects(!showAllProjects)}>{showAllProjects ? 'SHOW LESS' : `LIHAT LAINNYA / ${filteredProjects.length - 5} VIDEO`} <span>{showAllProjects ? '↑' : '↓'}</span></button>}
        <div className="future-categories"><span>MORE FOLDERS / FUTURE WORK</span><p>Short-form · Reels &amp; TikTok · YouTube · Motion graphics · Experiments</p></div>
      </section>

      <section className="approach-section section-shell" id="approach" aria-labelledby="approach-title"><div className="section-heading approach-heading"><p className="eyebrow">02 / THE POINT OF VIEW</p><h2 id="approach-title">IT'S NOT<br />JUST A <span>CUT.</span></h2><span className="approach-scribble" aria-hidden="true">— ✳ —</span></div><div className="principles-list">{principles.map(([number, title, description]) => <article className="principle" key={number}><span className="principle-number">{number}</span><h3>{title}</h3><p>{description}</p><span className="principle-mark" aria-hidden="true">↗</span></article>)}</div><span className="approach-footnote">GOOD EDITS FEEL INEVITABLE.</span></section>

      <section className="workflow-section section-shell" aria-labelledby="workflow-title"><div className="section-heading workflow-heading"><div><p className="eyebrow">03 / HOW IT COMES TOGETHER</p><h2 id="workflow-title">FROM FOOTAGE<br />TO <span>FINAL CUT.</span></h2></div></div><div className="timeline" aria-label="Five-step editing workflow">{workflow.map(([number, title, description]) => <article className="timeline-step" key={number}><span className="timeline-marker"><span>{number}</span></span><h3>{title}</h3><p>{description}</p></article>)}</div><p className="workflow-note">A good process leaves room for a better idea.</p></section>

      <section className="about-section section-shell" id="about" aria-labelledby="about-title"><p className="eyebrow about-eyebrow">04 / THE PERSON BEHIND THE PLAYHEAD</p><div className="about-portrait"><span className="portrait-index">S / 01</span><img className="about-character" src="/images/Char%201.png" alt="Ilustrasi karakter Sera" loading="lazy" /><span className="portrait-caption">VIDEO EDITOR <i>·</i> SERA</span></div><div className="about-copy"><h2 id="about-title">BEHIND THE<br /><span>TIMELINE.</span></h2><p>I'm Sectio Kautsar Ramadhani, usually called Sera. I focus on video editing, especially short-form and social media content.</p><p>I have experience creating promotional videos and digital content. I shape footage into clear, engaging stories through pacing, sound, and editing choices that fit each platform.</p></div><span className="about-aside" aria-hidden="true">CUT / REPEAT / REFINE</span></section>

      <section className="tools-section section-shell" aria-labelledby="tools-title"><div className="section-heading tools-heading"><div><p className="eyebrow">05 / THE KIT</p><h2 id="tools-title">EDITING<br /><span>TOOLKIT.</span></h2></div><p className="section-aside">Tools I use in my<br />video editing workflow.</p></div><div className="tool-groups"><div className="tool-group"><h3>VIDEO EDITING <span>{editingSkills.length.toString().padStart(2, '0')}</span></h3><ul>{editingSkills.map((skill) => <li key={skill}><span>{skill}</span><i aria-hidden="true">+</i></li>)}</ul></div><div className="tool-group software-group"><h3>SOFTWARE <span>{software.length.toString().padStart(2, '0')}</span></h3><ul>{software.map((tool) => <li key={tool}><span>{tool}</span><i aria-hidden="true">↗</i></li>)}</ul><p>Adobe Family, CapCut, Figma, and related tools.</p></div></div></section>

      <section className="contact-section section-shell" id="contact" aria-labelledby="contact-title"><p className="eyebrow">06 / THE NEXT FRAME</p><h2 id="contact-title">LET'S MAKE<br />SOMETHING <span>MOVE.</span></h2><p className="contact-intro">Have footage that needs a story? Have an idea for your next video? Let's make it happen.</p><a className="contact-email" href="mailto:skautsarr@gmail.com"><svg className="email-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m4 7 8 6 8-6" /></svg><span>EMAIL SERA</span><span className="social-arrow" aria-hidden="true">↗</span></a><div className="contact-bottom"><div className="contact-links"><a className="social-button" href="https://www.instagram.com/skautsar.ra/" target="_blank" rel="noreferrer"><svg className="social-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="18" cy="6" r="1" className="social-icon-dot" /></svg><span>INSTAGRAM @SKAUTSAR.RA</span><span className="social-arrow" aria-hidden="true">↗</span></a><a className="social-button" href="https://www.threads.com/@skautsar.ra?hl=en" target="_blank" rel="noreferrer"><span className="social-icon social-icon-at" aria-hidden="true">@</span><span>THREADS @SKAUTSAR.RA</span><span className="social-arrow" aria-hidden="true">↗</span></a><a className="social-button social-button--product" href="https://lynk.id/skautsarr" target="_blank" rel="noreferrer"><svg className="social-icon social-icon-cart" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 4h2l2.2 11h10.9l2-8H6" /><circle cx="9" cy="19" r="1.4" /><circle cx="17" cy="19" r="1.4" /></svg><span>DIGITAL PRODUCTS</span><span className="social-arrow" aria-hidden="true">↗</span></a></div><a className="back-top" href="#top">BACK TO TOP ↑</a></div><span className="contact-mark" aria-hidden="true">✳</span></section>
    </main>
    {showBackToTop && <button className="back-to-top-button" type="button" aria-label="Scroll back to top" title="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg></button>}
    <footer className="site-footer"><a className="footer-mark" href="#top">S<span>.</span></a><span>SECTIO KAUTSAR RAMADHANI / VIDEO EDITOR</span><span>MADE WITH INTENTION © 2026</span></footer>
    {activeProject && <ProjectModal project={activeProject} onClose={closeModal} onNavigate={navigateProject} />}
  </>
}

export default App
