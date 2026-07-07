import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, BookOpen, Brain, ArrowRight, Zap,
  Clock, Rocket, Sun, Building,
  ChevronDown, Moon, Fish, Dice1, Menu, X
} from 'lucide-react'
import wordsData from '../data/words'
import { calculateStreak, getMasteredCount } from '../utils/srs'

/* ─── Static copy ─── */
const NAV_LINKS = [
  { id: 'about', label: '企业介绍' },
  { id: 'history', label: '摸鱼历史' },
  { id: 'culture', label: '文化产品' },
]

const TIMELINE = [
  {
    date: '2024.01',
    title: '起床背单词',
    desc: '创始人决定起床背单词。在闹钟响了三次之后，他得出一个结论：床以外的地方都是远方。',
    icon: Sun,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  {
    date: '2024.03',
    title: '确立核心算法',
    desc: '确立了"能躺着绝不坐着"的核心算法。这是幺家科技历史上第一个、也是唯一一个全票通过的决议。',
    icon: Fish,
    color: 'text-sky-500',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
  },
  {
    date: '2024.06',
    title: '幺家英语 v1.0 上线',
    desc: '幺家英语 v1.0 正式上线，成功修复了"太努力"的 Bug。我们终于可以让用户躺着背单词了。',
    icon: Rocket,
    color: 'text-primary-500',
    bg: 'bg-primary-50',
    border: 'border-primary-200',
  },
]

const PRODUCTS = [
  {
    title: '四级词汇·催眠版',
    desc: '专为睡前 5 分钟设计，保证翻书即睡。再也不用担心失眠了——你的四级词汇书就是最好的安眠药。',
    icon: Moon,
    unsplash: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&q=80',
  },
  {
    title: '真题解析·玄学版',
    desc: '不会做？选 C。不仅教你英语，还教你掷骰子。三短一长选最长，三长一短选最短——我们的方法论。',
    icon: Dice1,
    unsplash: 'https://images.unsplash.com/photo-1591994843349-f415893b1062?w=400&q=80',
  },
  {
    title: '记忆力·金鱼限定',
    desc: '7 秒记忆法，忘掉烦恼，也忘掉单词。专为那些"翻开书马冬梅，合上书马什么梅"的同学量身定制。',
    icon: Brain,
    unsplash: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&q=80',
  },
]

/* ─── Reusable motion variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.25, 0.4, 0.25, 1] },
  }),
}

/* ─── Section wrapper with scroll-reveal ─── */
function Section({ id, className, children }) {
  return (
    <section id={id} className={`relative px-5 sm:px-6 py-20 sm:py-28 ${className || ''}`}>
      <div className="max-w-5xl mx-auto">{children}</div>
    </section>
  )
}

function Reveal({ children, className, delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.4, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ─── Component ─── */
export default function LandingPage() {
  const navigate = useNavigate()
  const [mastered, setMastered] = useState(0)
  const [streak, setStreak] = useState(0)
  const [navSolid, setNavSolid] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMastered(getMasteredCount())
    setStreak(calculateStreak())
  }, [])

  useEffect(() => {
    function onScroll() { setNavSolid(window.scrollY > 40) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-dvh bg-surface-50 text-surface-800 font-body overflow-x-hidden">

      {/* ═══ Sticky Nav ═══ */}
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          navSolid
            ? 'bg-white/80 backdrop-blur-xl border-b border-surface-100/60 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 flex items-center justify-center shadow-soft shrink-0">
              <Sparkles className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="text-sm font-bold text-surface-800 font-display tracking-tight truncate">
              幺家科技<span className="text-surface-400 mx-1.5">|</span>英语事业部
            </span>
          </div>

          {/* Nav links (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="px-3.5 py-2 text-sm text-surface-500 hover:text-surface-800 rounded-lg hover:bg-surface-100/60 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/study')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl shadow-soft hover:shadow-glow transition-all duration-200"
            >
              <Zap className="w-4 h-4" />
              <span>进入背词系统</span>
            </motion.button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/study')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary-500 text-white text-xs font-semibold rounded-lg transition-all duration-200"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>背词</span>
            </motion.button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-surface-500 hover:text-surface-800 rounded-lg hover:bg-surface-100/60 transition-all duration-200"
              aria-label="菜单"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile drawer */}
        <motion.div
          initial={false}
          animate={mobileOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="md:hidden overflow-hidden"
        >
          <div className="px-5 pb-4 pt-1 border-t border-surface-100/60 space-y-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setMobileOpen(false)}
                className="block px-3.5 py-2.5 text-sm text-surface-600 hover:text-surface-800 rounded-lg hover:bg-surface-100/60 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        </motion.div>
      </motion.header>

      {/* ═══ Hero ═══ */}
      <section className="relative min-h-dvh flex items-center justify-center px-5 sm:px-6 pt-24 pb-16 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-160px] right-[-160px] w-96 h-96 bg-primary-200/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-120px] left-[-120px] w-72 h-72 bg-accent-200/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-brand-200/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/70 backdrop-blur-sm text-primary-600 rounded-full text-sm font-medium mb-8 border border-primary-100 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            四级词汇 · {wordsData.length.toLocaleString()} 词
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-surface-900 font-display tracking-tight leading-[1.1] mb-6"
          >
            重新定义四级备考
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500">
              —— 幺家科技
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-lg sm:text-xl text-surface-400 font-light max-w-xl mx-auto leading-relaxed mb-8"
          >
            用 0.01% 的努力，换取 100% 的过级运气。
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center justify-center gap-4 sm:gap-10 mb-10 flex-wrap"
          >
            {[
              { value: wordsData.length.toLocaleString(), label: '总词汇量', color: 'text-surface-800' },
              { value: mastered, label: '已掌握', color: 'text-primary-500' },
              { value: streak, label: '连续打卡', color: 'text-accent-500' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className={`text-2xl sm:text-3xl font-bold ${s.color} font-display`}>{s.value}</div>
                <div className="text-xs text-surface-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/study')}
              className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-lg font-semibold rounded-2xl shadow-soft-lg hover:shadow-glow-lg transition-all duration-300"
            >
              <Zap className="w-5 h-5" />
              <span>立即开始摸鱼式学习</span>
              <ArrowRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1" />
              <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </motion.div>

          {/* Spacer so scroll hint doesn't overlap CTA */}
          <div className="h-20" />
        </div>

        {/* Scroll hint — fixed to viewport bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-surface-300 animate-bounce pointer-events-none z-40"
        >
          <span className="text-xs">往下看看</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </section>

      {/* ═══ Section A: 企业介绍 ═══ */}
      <Section id="about" className="bg-white">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left: text */}
          <Reveal>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-primary-50 text-primary-600 rounded-full text-sm font-medium mb-5 border border-primary-100">
                <Building className="w-3.5 h-3.5" />
                企业介绍
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 font-display tracking-tight mb-5">
                一家<span className="text-primary-500">一本正经</span>
                <br />胡说八道的公司
              </h2>
              <div className="space-y-4 text-surface-500 leading-relaxed">
                <p>
                  幺家科技成立于 2024 年卧室分舵，致力于通过
                  <span className="text-primary-500 font-medium">「量子波动速读」</span>
                  与
                  <span className="text-primary-500 font-medium">「咸鱼心态」</span>
                  的深度耦合，解决大学生「书打开就困」的痛点。
                </p>
                <p>
                  我们的愿景是让每一个单词都感受到被放弃的温暖。
                  我们坚信，真正的学习不是强迫，而是让单词自己觉得不被需要了，主动钻进你的脑子里。
                </p>
                <p className="text-surface-400 text-sm italic">
                  "我们的用户反馈显示，使用幺家科技后，他们的睡眠质量提升了 300%——虽然四级通过率并没有变化。"
                </p>
              </div>
            </div>
          </Reveal>

          {/* Right: Unsplash image */}
          <Reveal delay={0.15}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary-100 via-primary-50 to-accent-50 rounded-3xl blur-2xl opacity-60" />
              <div className="relative bg-white rounded-2xl border border-surface-100 overflow-hidden shadow-soft">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80"
                  alt="幺家科技卧室分舵办公场景"
                  className="w-full h-56 sm:h-64 object-cover"
                  loading="lazy"
                />
                <div className="p-5 sm:p-6">
                  <h3 className="font-bold text-surface-800 text-lg mb-1">幺家科技 · 卧室分舵</h3>
                  <p className="text-surface-400 text-sm mb-3">成立于 2024 年，总部位于创始人卧室的床头柜上</p>
                  <div className="flex items-center gap-2 text-xs text-surface-400">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                    目前正在营业（只要创始人没睡着）
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ═══ Section B: 摸鱼历史 ═══ */}
      <Section id="history" className="bg-gradient-to-b from-surface-50 to-white">
        <Reveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-accent-50 text-accent-600 rounded-full text-sm font-medium mb-5 border border-accent-100">
              <Clock className="w-3.5 h-3.5" />
              摸鱼大事记
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 font-display tracking-tight mb-3">
              摸鱼<span className="text-accent-500">编年史</span>
            </h2>
            <p className="text-surface-400 max-w-lg mx-auto">
              从躺平到躺赢，我们只用了半年时间。以下是幺家科技的历史性时刻。
            </p>
          </div>
        </Reveal>

        {/* Timeline */}
        <div className="relative max-w-2xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-px bg-surface-200 hidden sm:block" />

          <div className="space-y-10 sm:space-y-0">
            {TIMELINE.map((item, i) => {
              const Icon = item.icon
              return (
                <Reveal key={i} delay={i * 0.15}>
                  <div className="relative sm:flex items-start gap-6 pb-10 sm:pb-0 sm:mb-[-10px]">
                    {/* Dot + icon */}
                    <div className="hidden sm:flex shrink-0 relative z-10">
                      <div className={`w-[46px] h-[46px] rounded-xl ${item.bg} ${item.border} border flex items-center justify-center ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Mobile indicator */}
                    <div className={`sm:hidden flex items-center gap-3 mb-3`}>
                      <div className={`w-9 h-9 rounded-lg ${item.bg} ${item.border} border flex items-center justify-center ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs font-bold ${item.color}`}>{item.date}</span>
                    </div>

                    {/* Content card */}
                    <div className="flex-1 sm:pb-10">
                      <div className="bg-white rounded-xl border border-surface-100 p-5 sm:p-6 hover:shadow-soft transition-all duration-200">
                        <span className={`hidden sm:inline-block text-xs font-bold ${item.color} mb-2`}>{item.date}</span>
                        <h3 className="font-bold text-surface-800 text-lg mb-2">{item.title}</h3>
                        <p className="text-sm text-surface-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </Section>

      {/* ═══ Section C: 咸鱼文化产品 ═══ */}
      <Section id="culture" className="bg-gradient-to-b from-white to-surface-50">
        <Reveal>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-brand-50 text-brand-600 rounded-full text-sm font-medium mb-5 border border-brand-100">
              <BookOpen className="w-3.5 h-3.5" />
              咸鱼产品
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 font-display tracking-tight mb-3">
              咸鱼<span className="text-brand-500">文化产品</span>
            </h2>
            <p className="text-surface-400 max-w-lg mx-auto">
              每一款产品都经过精心设计，确保你在最短时间内放弃——然后心安理得地躺平。
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-3 gap-5 sm:gap-6">
          {PRODUCTS.map((product, i) => {
            const Icon = product.icon
            return (
              <Reveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="group bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-soft-lg transition-all duration-300"
                >
                  {/* Image */}
                  <div className="h-40 bg-surface-100 relative overflow-hidden">
                    <img
                      src={product.unsplash}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                        <Icon className="w-4 h-4 text-surface-700" />
                      </div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5 sm:p-6">
                    <h3 className="font-bold text-surface-800 text-lg mb-2">{product.title}</h3>
                    <p className="text-sm text-surface-500 leading-relaxed">{product.desc}</p>
                  </div>
                </motion.div>
              </Reveal>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <Reveal delay={0.3}>
          <div className="text-center mt-12">
            <p className="text-surface-400 text-sm mb-4">以上产品均未上市——但我们相信你也只是看看而已</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/study')}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-soft hover:shadow-glow transition-all duration-200"
            >
              <Rocket className="w-4 h-4" />
              还是先去背单词吧
            </motion.button>
          </div>
        </Reveal>
      </Section>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-surface-100 bg-white px-5 sm:px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-surface-600 font-display">幺家科技 · 英语事业部</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-surface-400 flex-wrap justify-center">
            <span>© 2026 幺家科技 (Yaojia Tech). All rights reserved.</span>
            <span className="hidden sm:inline text-surface-200">|</span>
            <span className="italic">其实并没有版权</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
