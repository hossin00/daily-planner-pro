import { useState, useEffect } from 'react'
import { Plus, Check, Trash2, ChevronLeft, ChevronRight, Target, Sun, Coffee, Moon, Star, X, Clock } from 'lucide-react'

const ACCENT = '#3B82F6'

interface TimeBlock {
  id: string
  hour: number
  title: string
  category: string
  color: string
  done: boolean
  duration: number
}

interface DayData {
  date: string
  blocks: TimeBlock[]
  intention: string
  highlight: string
  mood: number
  tasks: Task[]
}

interface Task {
  id: string
  text: string
  done: boolean
  priority: 'high' | 'medium' | 'low'
}

const CATEGORIES = [
  { name: 'Work', color: '#60A5FA' },
  { name: 'Health', color: '#4ADE80' },
  { name: 'Learning', color: '#FBBF24' },
  { name: 'Personal', color: '#F472B6' },
  { name: 'Social', color: '#A78BFA' },
  { name: 'Break', color: '#94A3B8' },
]

const PRIORITY_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#6B7280' }
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 6 AM to 11 PM

function dateStr(d: Date) { return d.toISOString().slice(0, 10) }
function todayStr() { return dateStr(new Date()) }

function formatDate(d: string) {
  const date = new Date(d + 'T00:00:00')
  const today = todayStr()
  const yesterday = dateStr(new Date(Date.now() - 86400000))
  const tomorrow = dateStr(new Date(Date.now() + 86400000))
  if (d === today) return 'Today'
  if (d === yesterday) return 'Yesterday'
  if (d === tomorrow) return 'Tomorrow'
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

function formatHour(h: number) {
  if (h === 0) return '12 AM'
  if (h < 12) return h + ' AM'
  if (h === 12) return '12 PM'
  return (h - 12) + ' PM'
}

export default function App() {
  const [data, setData] = useState<Record<string, DayData>>(() => {
    try { return JSON.parse(localStorage.getItem('daily_planner') || '{}') } catch { return {} }
  })
  const [currentDate, setCurrentDate] = useState(todayStr())
  const [tab, setTab] = useState<'planner' | 'tasks' | 'review'>('planner')
  const [showAddBlock, setShowAddBlock] = useState<number | null>(null)
  const [blockForm, setBlockForm] = useState({ title: '', category: 'Work', duration: 1 })
  const [showAddTask, setShowAddTask] = useState(false)
  const [taskForm, setTaskForm] = useState({ text: '', priority: 'medium' as Task['priority'] })

  useEffect(() => {
    localStorage.setItem('daily_planner', JSON.stringify(data))
  }, [data])

  function getDay(date: string): DayData {
    return data[date] || { date, blocks: [], intention: '', highlight: '', mood: 0, tasks: [] }
  }

  function updateDay(date: string, updates: Partial<DayData>) {
    setData(prev => ({ ...prev, [date]: { ...getDay(date), ...updates } }))
  }

  const day = getDay(currentDate)

  function addBlock(hour: number) {
    if (!blockForm.title.trim()) return
    const cat = CATEGORIES.find(c => c.name === blockForm.category)!
    const block: TimeBlock = {
      id: Date.now().toString(),
      hour,
      title: blockForm.title.trim(),
      category: blockForm.category,
      color: cat.color,
      done: false,
      duration: blockForm.duration,
    }
    updateDay(currentDate, { blocks: [...day.blocks, block] })
    setBlockForm({ title: '', category: 'Work', duration: 1 })
    setShowAddBlock(null)
  }

  function toggleBlock(id: string) {
    updateDay(currentDate, { blocks: day.blocks.map(b => b.id === id ? { ...b, done: !b.done } : b) })
  }

  function deleteBlock(id: string) {
    updateDay(currentDate, { blocks: day.blocks.filter(b => b.id !== id) })
  }

  function addTask() {
    if (!taskForm.text.trim()) return
    const task: Task = { id: Date.now().toString(), text: taskForm.text.trim(), done: false, priority: taskForm.priority }
    updateDay(currentDate, { tasks: [...day.tasks, task] })
    setTaskForm({ text: '', priority: 'medium' })
    setShowAddTask(false)
  }

  function toggleTask(id: string) {
    updateDay(currentDate, { tasks: day.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) })
  }

  function deleteTask(id: string) {
    updateDay(currentDate, { tasks: day.tasks.filter(t => t.id !== id) })
  }

  function navigateDay(dir: number) {
    const d = new Date(currentDate + 'T00:00:00')
    d.setDate(d.getDate() + dir)
    setCurrentDate(dateStr(d))
  }

  const blocksDone = day.blocks.filter(b => b.done).length
  const tasksDone = day.tasks.filter(t => t.done).length
  const productivity = day.blocks.length + day.tasks.length > 0
    ? Math.round(((blocksDone + tasksDone) / (day.blocks.length + day.tasks.length)) * 100)
    : 0

  // Group blocks by hour for timeline
  const blocksByHour: Record<number, TimeBlock[]> = {}
  day.blocks.forEach(b => {
    if (!blocksByHour[b.hour]) blocksByHour[b.hour] = []
    blocksByHour[b.hour].push(b)
  })

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#070C14', minHeight: '100vh', color: '#F5F5F5' }}>
      {/* Header */}
      <div style={{ background: '#0D1520', padding: '20px 20px 0', borderBottom: '1px solid #152030' }}>
        {/* Date navigator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={() => navigateDay(-1)}
            style={{ background: '#152030', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#888' }}><ChevronLeft size={18} /></button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{formatDate(currentDate)}</div>
            {currentDate !== todayStr() && (
              <button onClick={() => setCurrentDate(todayStr())}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: ACCENT, fontSize: 12, marginTop: 2 }}>
                Go to Today
              </button>
            )}
          </div>
          <button onClick={() => navigateDay(1)}
            style={{ background: '#152030', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#888' }}><ChevronRight size={18} /></button>
        </div>

        {/* Progress */}
        {(day.blocks.length + day.tasks.length) > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 4 }}>
              <span>Daily Progress</span>
              <span style={{ color: ACCENT }}>{productivity}%</span>
            </div>
            <div style={{ height: 4, background: '#152030', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: productivity + '%', background: ACCENT, borderRadius: 2, transition: 'width .3s' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 0 }}>
          {(['planner', 'tasks', 'review'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, background: 'none', border: 'none', padding: '10px 0', cursor: 'pointer', color: tab === t ? ACCENT : '#555', fontWeight: tab === t ? 600 : 400, fontSize: 14, borderBottom: `2px solid ${tab === t ? ACCENT : 'transparent'}` }}>
              {t === 'planner' ? 'Schedule' : t === 'tasks' ? 'Tasks' : 'Review'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16, maxWidth: 500, margin: '0 auto' }}>
        {tab === 'planner' && (
          <>
            {/* Intention */}
            <div style={{ background: '#0D1520', borderRadius: 12, padding: '12px 16px', marginBottom: 16, border: '1px solid #152030' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Sun size={14} color={ACCENT} />
                <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>DAILY INTENTION</span>
              </div>
              <input placeholder="What's your intention for today?"
                value={day.intention}
                onChange={e => updateDay(currentDate, { intention: e.target.value })}
                style={{ width: '100%', background: 'none', border: 'none', color: '#F5F5F5', fontSize: 14, outline: 'none', lineHeight: 1.5, boxSizing: 'border-box' }} />
            </div>

            {/* Timeline */}
            <div style={{ fontSize: 12, color: '#555', fontWeight: 600, marginBottom: 10 }}>TIME BLOCKS</div>
            {HOURS.map(hour => {
              const blocks = blocksByHour[hour] || []
              const isNow = new Date().getHours() === hour && currentDate === todayStr()
              return (
                <div key={hour} style={{ display: 'flex', gap: 10, marginBottom: blocks.length > 0 ? 6 : 2, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, flexShrink: 0, textAlign: 'right', paddingTop: 8 }}>
                    <span style={{ fontSize: 11, color: isNow ? ACCENT : '#444', fontWeight: isNow ? 700 : 400 }}>
                      {formatHour(hour)}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    {blocks.length > 0 ? (
                      blocks.map(block => (
                        <div key={block.id}
                          style={{ background: block.done ? '#0D1520' : block.color + '22', border: `1px solid ${block.color}${block.done ? '44' : '88'}`, borderRadius: 10, padding: '8px 12px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10, opacity: block.done ? 0.6 : 1 }}>
                          <button onClick={() => toggleBlock(block.id)}
                            style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${block.color}`, background: block.done ? block.color : 'none', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {block.done && <Check size={11} color="#000" />}
                          </button>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, color: block.done ? '#555' : '#F5F5F5', textDecoration: block.done ? 'line-through' : 'none' }}>{block.title}</div>
                            <div style={{ fontSize: 11, color: block.color + 'AA', marginTop: 2 }}>{block.category} · {block.duration}h</div>
                          </div>
                          <button onClick={() => deleteBlock(block.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444' }}><X size={13} /></button>
                        </div>
                      ))
                    ) : (
                      <div style={{ height: 28, borderLeft: `1px solid ${isNow ? ACCENT + '44' : '#152030'}`, marginLeft: 2 }}>
                        <button onClick={() => setShowAddBlock(hour)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2A3A4A', fontSize: 11, paddingLeft: 8, height: '100%' }}>
                          + add
                        </button>
                      </div>
                    )}
                    {blocks.length > 0 && (
                      <button onClick={() => setShowAddBlock(hour)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2A3A4A', fontSize: 11, paddingLeft: 4 }}>
                        + add
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Add block form */}
            {showAddBlock !== null && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'flex-end', zIndex: 100 }}>
                <div style={{ background: '#0D1520', borderRadius: '20px 20px 0 0', padding: 22, width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ fontWeight: 700 }}>Add Block at {formatHour(showAddBlock)}</span>
                    <button onClick={() => setShowAddBlock(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={18} /></button>
                  </div>
                  <input placeholder="What are you doing? *" value={blockForm.title} onChange={e => setBlockForm(p => ({ ...p, title: e.target.value }))}
                    style={{ width: '100%', background: '#152030', border: 'none', borderRadius: 10, padding: '11px 12px', color: '#F5F5F5', fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {CATEGORIES.map(cat => (
                      <button key={cat.name} onClick={() => setBlockForm(p => ({ ...p, category: cat.name }))}
                        style={{ background: blockForm.category === cat.name ? cat.color + '33' : '#152030', border: blockForm.category === cat.name ? `1px solid ${cat.color}` : '1px solid transparent', borderRadius: 8, padding: '5px 12px', color: blockForm.category === cat.name ? cat.color : '#888', fontSize: 12, cursor: 'pointer' }}>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <Clock size={14} color="#888" />
                    <span style={{ fontSize: 13, color: '#888' }}>Duration</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[0.5, 1, 1.5, 2, 3, 4].map(d => (
                        <button key={d} onClick={() => setBlockForm(p => ({ ...p, duration: d }))}
                          style={{ background: blockForm.duration === d ? ACCENT + '33' : '#152030', border: blockForm.duration === d ? `1px solid ${ACCENT}` : '1px solid transparent', borderRadius: 8, padding: '4px 10px', color: blockForm.duration === d ? ACCENT : '#888', fontSize: 12, cursor: 'pointer' }}>
                          {d}h
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setShowAddBlock(null)}
                      style={{ flex: 1, background: '#152030', border: 'none', borderRadius: 12, padding: '12px', color: '#888', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={() => addBlock(showAddBlock!)}
                      style={{ flex: 2, background: ACCENT, border: 'none', borderRadius: 12, padding: '12px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Add Block</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'tasks' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>TODAY'S TASKS ({tasksDone}/{day.tasks.length})</span>
              <button onClick={() => setShowAddTask(true)}
                style={{ background: ACCENT, border: 'none', borderRadius: 8, padding: '6px 12px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Plus size={14} /> Add
              </button>
            </div>

            {showAddTask && (
              <div style={{ background: '#0D1520', borderRadius: 14, padding: 16, marginBottom: 14, border: '1px solid #152030' }}>
                <input placeholder="Task description *" value={taskForm.text} onChange={e => setTaskForm(p => ({ ...p, text: e.target.value }))}
                  style={{ width: '100%', background: '#152030', border: 'none', borderRadius: 10, padding: '11px 12px', color: '#F5F5F5', fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  {(['high', 'medium', 'low'] as const).map(p => (
                    <button key={p} onClick={() => setTaskForm(prev => ({ ...prev, priority: p }))}
                      style={{ flex: 1, background: taskForm.priority === p ? PRIORITY_COLORS[p] + '33' : '#152030', border: taskForm.priority === p ? `1px solid ${PRIORITY_COLORS[p]}` : '1px solid transparent', borderRadius: 8, padding: '7px', color: taskForm.priority === p ? PRIORITY_COLORS[p] : '#888', fontSize: 12, cursor: 'pointer', textTransform: 'capitalize' }}>
                      {p}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowAddTask(false)}
                    style={{ flex: 1, background: '#152030', border: 'none', borderRadius: 10, padding: '10px', color: '#888', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={addTask}
                    style={{ flex: 2, background: ACCENT, border: 'none', borderRadius: 10, padding: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Add Task</button>
                </div>
              </div>
            )}

            {day.tasks.length === 0 && !showAddTask && (
              <div style={{ textAlign: 'center', color: '#444', padding: '40px 0', fontSize: 14 }}>No tasks yet for today</div>
            )}

            {['high', 'medium', 'low'].map(priority => {
              const tasks = day.tasks.filter(t => t.priority === priority)
              if (tasks.length === 0) return null
              return (
                <div key={priority} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: PRIORITY_COLORS[priority as Task['priority']], fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>
                    {priority} priority
                  </div>
                  {tasks.map(task => (
                    <div key={task.id} style={{ background: '#0D1520', borderRadius: 10, padding: '12px 14px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${PRIORITY_COLORS[task.priority]}22`, opacity: task.done ? 0.6 : 1 }}>
                      <button onClick={() => toggleTask(task.id)}
                        style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${PRIORITY_COLORS[task.priority]}`, background: task.done ? PRIORITY_COLORS[task.priority] : 'none', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {task.done && <Check size={12} color="#000" />}
                      </button>
                      <span style={{ flex: 1, fontSize: 14, textDecoration: task.done ? 'line-through' : 'none', color: task.done ? '#555' : '#F5F5F5' }}>{task.text}</span>
                      <button onClick={() => deleteTask(task.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444' }}><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
              )
            })}
          </>
        )}

        {tab === 'review' && (
          <>
            <div style={{ background: '#0D1520', borderRadius: 14, padding: 18, marginBottom: 16, border: '1px solid #152030' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Star size={14} color={ACCENT} />
                <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>DAY HIGHLIGHT</span>
              </div>
              <textarea placeholder="What was the best thing about today?"
                value={day.highlight}
                onChange={e => updateDay(currentDate, { highlight: e.target.value })}
                rows={3}
                style={{ width: '100%', background: 'none', border: 'none', color: '#F5F5F5', fontSize: 14, outline: 'none', resize: 'none', lineHeight: 1.6, boxSizing: 'border-box' }} />
            </div>

            <div style={{ background: '#0D1520', borderRadius: 14, padding: 18, marginBottom: 16, border: '1px solid #152030' }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 12, fontWeight: 600 }}>HOW WAS YOUR DAY?</div>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {['😢', '😔', '😐', '😊', '😄'].map((emoji, i) => (
                  <button key={i} onClick={() => updateDay(currentDate, { mood: i + 1 })}
                    style={{ background: day.mood === i + 1 ? ACCENT + '33' : 'none', border: day.mood === i + 1 ? `2px solid ${ACCENT}` : '2px solid transparent', borderRadius: 12, padding: '10px 12px', cursor: 'pointer', fontSize: 24, transition: 'all .2s' }}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                ['Productivity', productivity + '%', ACCENT],
                ['Blocks Done', `${blocksDone}/${day.blocks.length}`, '#4ADE80'],
                ['Tasks Done', `${tasksDone}/${day.tasks.length}`, '#FBBF24'],
              ].map(([label, val, color]) => (
                <div key={label} style={{ background: '#0D1520', borderRadius: 12, padding: '14px 10px', textAlign: 'center', border: '1px solid #152030' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: color as string }}>{val}</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
