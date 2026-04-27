import { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Brain,
  CircleCheck as CheckCircle2,
  ChevronDown,
  ChevronRight,
  Dice5,
  GraduationCap,
  Lightbulb,
  Search,
  Sparkles,
  Circle as XCircle,
} from 'lucide-react'

import { chapters } from './chapters'

function normalise(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function Feedback({ correct, shown }) {
  if (!shown) return null
  return (
    <div
      className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
        correct
          ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'
          : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      }`}
    >
      {correct ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <XCircle className="h-4 w-4" />
      )}
      {correct
        ? 'Nice — that works.'
        : 'Not quite. Try using the example or hint above.'}
    </div>
  )
}

function MiniInput({ label, answer, placeholder = 'Your answer' }) {
  const [value, setValue] = useState('')
  const [checked, setChecked] = useState(false)
  const expected = Array.isArray(answer) ? answer.map(String) : [String(answer)]
  const correct = expected.some((x) => normalise(x) === normalise(value))
  return (
    <form className="rounded-2xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800" onSubmit={(e) => { e.preventDefault(); setChecked(true) }}>
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div className="mt-3 flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:ring-slate-600"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setChecked(false)
          }}
          placeholder={placeholder}
        />
        <button
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
          onClick={() => setChecked(true)}
        >
          Check
        </button>
      </div>
      <Feedback correct={correct} shown={checked} />
    </form>
  )
}

function NumberTrick() {
  const [n, setN] = useState(7)
  const [show, setShow] = useState(false)
  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Number trick explorer
      </label>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="number"
          className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:ring-slate-600"
          value={n}
          onChange={(e) => {
            setN(Number(e.target.value))
            setShow(false)
          }}
        />
        <button
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
          onClick={() => setShow(true)}
        >
          Run trick
        </button>
      </div>
      {show && (
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-700 dark:text-slate-300">
          Double {n} = {n * 2}; add 10 = {n * 2 + 10}; divide by 2 = {n + 5};
          subtract {n} = <strong>5</strong>.
        </div>
      )}
    </div>
  )
}

function ActivityItem({ activity }) {
  if (activity.type === 'trick') return <NumberTrick />
  return (
    <MiniInput
      label={activity.label}
      answer={activity.answer}
      placeholder={activity.placeholder}
    />
  )
}

function KeyPoint({ item }) {
  const [expanded, setExpanded] = useState(false)
  const text = typeof item === 'string' ? item : item.point
  const detail = typeof item === 'string' ? null : item.detail
  return (
    <li className="overflow-hidden rounded-xl border border-slate-300 bg-white text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
      <div
        className={`flex items-start justify-between gap-2 px-3 py-2 ${detail ? 'cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-700' : ''}`}
        onClick={detail ? () => setExpanded((v) => !v) : undefined}
      >
        <span>{text}</span>
        {detail && (
          <ChevronDown
            className={`mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        )}
      </div>
      {expanded && detail && (
        <p className="border-t border-slate-300 px-3 pb-2 pt-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {detail}
        </p>
      )}
    </li>
  )
}

function ChapterCard({ chapter, open, onToggle }) {
  const sectionRef = useRef(null)
  const [year, setYear] = useState(chapter.yearGroups?.[0]?.name || '')
  const [showAllExamples, setShowAllExamples] = useState(false)
  const selectedYear = chapter.yearGroups?.find((y) => y.name === year)

  const visibleExamples = showAllExamples
    ? chapter.examples
    : chapter.examples?.slice(0, 2)
  const hiddenCount = (chapter.examples?.length ?? 0) - 2

  return (
    <section
      ref={sectionRef}
      id={chapter.id}
      className="overflow-hidden rounded-2xl border border-slate-300 bg-white scroll-m-6 dark:border-slate-700 dark:bg-slate-900"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">{chapter.title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{chapter.theme}</p>
        </div>
        {open ? (
          <ChevronDown className="h-5 w-5 shrink-0 text-slate-700 dark:text-slate-300" />
        ) : (
          <ChevronRight className="h-5 w-5 shrink-0 text-slate-700 dark:text-slate-300" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onAnimationComplete={() => {
              if (open) {
                sectionRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
              }
            }}
          >
            <div className="grid gap-5 border-t border-slate-300 p-5 dark:border-slate-700 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <BookOpen className="h-4 w-4" /> Summary
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{chapter.summary}</p>
                </div>

                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                    <Brain className="h-4 w-4" /> Key points
                  </h3>
                  <ul className="space-y-2">
                    {chapter.keyPoints.map((point, i) => (
                      <KeyPoint key={i} item={point} />
                    ))}
                  </ul>
                </div>

                {chapter.yearGroups && (
                  <div className="rounded-2xl border border-slate-300 bg-gradient-to-br from-slate-50 to-white p-4 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                      <GraduationCap className="h-4 w-4" /> Year-by-year guide
                    </h3>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {chapter.yearGroups.map((y) => (
                        <button
                          key={y.name}
                          onClick={() => setYear(y.name)}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                            year === y.name
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                              : 'bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600'
                          }`}
                        >
                          {y.name}
                        </button>
                      ))}
                    </div>
                    {selectedYear && (
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {selectedYear.focus}
                        </p>
                        <ul className="mt-3 grid gap-2 md:grid-cols-2">
                          {selectedYear.learns.map((item) => (
                            <li
                              className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
                              key={item}
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
                          <strong>Example:</strong> {selectedYear.example}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {visibleExamples?.length ? (
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                      <Lightbulb className="h-4 w-4" /> Examples
                    </h3>
                    <div className="space-y-2">
                      {visibleExamples?.map((example) => (
                        <div
                          key={example}
                          className="rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-950 dark:bg-indigo-900/20 dark:text-indigo-200"
                        >
                          {example}
                        </div>
                      ))}
                    </div>
                    {!showAllExamples && hiddenCount > 0 && (
                      <button
                        onClick={() => setShowAllExamples(true)}
                        className="mt-2 text-sm font-medium text-indigo-700 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                      >
                        Show {hiddenCount} more example
                        {hiddenCount !== 1 ? 's' : ''}
                      </button>
                    )}
                  </div>
                ) : null}
              </div>

              <aside className="space-y-5">
                <div className="rounded-2xl bg-slate-200 p-4 dark:bg-slate-700">
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                    <Sparkles className="h-4 w-4" /> Teaching idea
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {chapter.teachingIdea}
                  </p>
                </div>
                {chapter.activities?.length ? (<div>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                    <Dice5 className="h-4 w-4" /> Try it
                  </h3>
                  <div className="space-y-3">
                    {chapter.activities?.map((activity, i) => (
                      <ActivityItem key={i} activity={activity} />
                    ))}
                  </div>
                </div>) : null}
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default function App() {
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState('ch3')
  const [filter, setFilter] = useState('all')

  const groups = [
    { id: 'all', label: 'All' },
    { id: 'year', label: 'Year groups' },
    { id: 'number', label: 'Number' },
    { id: 'beyond', label: 'Beyond arithmetic' },
  ]

  const filtered = useMemo(() => {
    const q = normalise(query)
    return chapters.filter((chapter) => {
      const text = normalise(JSON.stringify(chapter))
      const matchesQuery = !q || text.includes(q)
      const num = ['ch5', 'ch6', 'ch7', 'ch8', 'ch9', 'ch10'].includes(
        chapter.id,
      )
      const beyond = ['ch11', 'ch12', 'ch13', 'ch14', 'ch15', 'ch16'].includes(
        chapter.id,
      )
      const matchesFilter =
        filter === 'all' ||
        (filter === 'year' && chapter.id === 'ch3') ||
        (filter === 'number' && num) ||
        (filter === 'beyond' && beyond)
      return matchesQuery && matchesFilter
    })
  }, [query, filter])

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-300 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                UK Primary School Maths Guide
              </h1>
              <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-400">
                Explore key maths concepts year by year, understand the ideas
                behind each topic, and practise with checkable activities.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Find a topic
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:focus-within:ring-slate-600">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="fractions, Year 4, division, perimeter…"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setFilter(g.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      filter === g.id
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <nav className="h-fit rounded-2xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 lg:sticky lg:top-6">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Chapters
          </p>
          <div className="space-y-1">
            {filtered.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => setOpenId(chapter.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  openId === chapter.id
                    ? 'bg-slate-900 font-semibold text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {chapter.title}
              </button>
            ))}
          </div>
        </nav>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="font-semibold">No matching chapters</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Try a broader search, such as "fractions", "Year 5" or "time".
              </p>
            </div>
          ) : (
            filtered.map((chapter) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                open={openId === chapter.id}
                onToggle={() =>
                  setOpenId(openId === chapter.id ? '' : chapter.id)
                }
              />
            ))
          )}
        </div>
      </main>
    </div>
  )
}
