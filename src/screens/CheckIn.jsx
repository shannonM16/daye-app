import { useState } from 'react'

const DAY_TYPES = [
  { id: 'deep-work', label: 'Deep work' },
  { id: 'busy', label: 'Busy day' },
  { id: 'low-energy', label: 'Low energy' },
]

const PRESSURE_OPTIONS = [
  { id: 'deadlines', label: 'Deadlines' },
  { id: 'money', label: 'Money' },
  { id: 'exams', label: 'Exams' },
  { id: 'none', label: 'None' },
]

const ENERGY_LABELS = ['', 'Depleted', 'Low', 'Okay', 'Good', 'Charged']

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`chip ${active ? 'chip-active' : ''}`}
    >
      {label}
    </button>
  )
}

export default function CheckIn({ userType, onSubmit }) {
  const [energy, setEnergy] = useState(3)
  const [dayType, setDayType] = useState(null)
  const [pressure, setPressure] = useState([])

  const togglePressure = (id) => {
    if (id === 'none') {
      setPressure(['none'])
      return
    }
    setPressure((prev) => {
      const without = prev.filter((p) => p !== 'none')
      return without.includes(id)
        ? without.filter((p) => p !== id)
        : [...without, id]
    })
  }

  const canSubmit = dayType && pressure.length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({ energy, dayType, pressure })
  }

  const userLabel = {
    corporate: 'Work',
    'self-employed': 'Work',
    student: 'Study',
    'figuring-it-out': 'Today',
  }[userType] || 'Today'

  return (
    <div className="screen justify-between">
      <div className="space-y-8">
        <div>
          <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Daily Focus</p>
          <h1 className="text-2xl font-bold text-stone-900">
            How's today looking?
          </h1>
        </div>

        {/* Energy */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <label className="text-sm font-semibold text-stone-700 uppercase tracking-wide">
              Energy
            </label>
            <span className="text-stone-500 text-sm font-medium">{ENERGY_LABELS[energy]}</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
          />
          <div className="flex justify-between mt-2 text-xs text-stone-300 select-none">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>

        {/* Day type */}
        <div>
          <label className="text-sm font-semibold text-stone-700 uppercase tracking-wide block mb-3">
            {userLabel} type
          </label>
          <div className="flex flex-wrap gap-2">
            {DAY_TYPES.map((dt) => (
              <Chip
                key={dt.id}
                label={dt.label}
                active={dayType === dt.id}
                onClick={() => setDayType(dt.id)}
              />
            ))}
          </div>
        </div>

        {/* Pressure */}
        <div>
          <label className="text-sm font-semibold text-stone-700 uppercase tracking-wide block mb-3">
            Pressure
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESSURE_OPTIONS.map((po) => (
              <Chip
                key={po.id}
                label={po.label}
                active={pressure.includes(po.id)}
                onClick={() => togglePressure(po.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="pt-8">
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          Get my focus plan
        </button>
      </div>
    </div>
  )
}
