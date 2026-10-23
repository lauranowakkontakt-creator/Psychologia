import {
  Baby, BookOpen, Brain, ChartColumn, ClipboardCheck, FileText, Folder, Headphones, Heart, Highlighter, Layers,
  LifeBuoy, ListTree, LogOut, Network, NotebookPen, Pause, Play, Printer, Scale, Square, Trash2, Users,
} from 'lucide-react'

// Cienkie liniowe ikony (stroke 1.6–1.8), jak w szablonie design/reference.
// Kilka narysowanych tu wprost, bo makieta ma własne kształty (biret, półka).

function Svg({ size = 20, strokeWidth = 1.8, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const BackIcon = (p) => <Svg {...p}><path d="m15 5-7 7 7 7" /></Svg>
export const SearchIcon = (p) => <Svg size={18} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>
export const ChevronIcon = (p) => <Svg size={16} strokeWidth={2} {...p}><path d="m9 6 6 6-6 6" /></Svg>
export const ArrowLeftIcon = (p) => <Svg {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Svg>
export const ArrowRightIcon = (p) => <Svg size={16} strokeWidth={2} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
export const BookmarkIcon = ({ filled, ...p }) => (
  <Svg size={18} {...p}><path d="M6 3h12v18l-6-4-6 4z" fill={filled ? 'currentColor' : 'none'} /></Svg>
)
export const CloseIcon = (p) => <Svg size={18} {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>
export const SunIcon = (p) => (
  <Svg size={17} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Svg>
)
export const MoonIcon = (p) => <Svg size={17} {...p}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></Svg>

const CapIcon = (p) => <Svg strokeWidth={1.6} {...p}><path d="m2 9 10-5 10 5-10 5z" /><path d="M6 11v5c2 2 10 2 12 0v-5" /></Svg>
const ShelfIcon = (p) => <Svg strokeWidth={1.6} {...p}><path d="M5 4v16M9 4v16M13 4v16M17 4l3 16" /></Svg>

const lucide = (C, size) => {
  const Wrapped = (p) => <C strokeWidth={1.6} aria-hidden="true" size={size} {...p} />
  return Wrapped
}

// Ikony akcji i ekranów nauki.
export const HeadphonesIcon = lucide(Headphones, 19)
export const PrinterIcon = lucide(Printer, 19)
export const PlayIcon = lucide(Play, 18)
export const PauseIcon = lucide(Pause, 18)
export const StopIcon = lucide(Square, 16)
export const HighlighterIcon = lucide(Highlighter, 18)
export const TrashIcon = lucide(Trash2, 18)
export const TocIcon = lucide(ListTree, 18)
export const LogOutIcon = lucide(LogOut, 18)
export const CardsIcon = lucide(Layers, 22)
export const ExamIcon = lucide(ClipboardCheck, 22)
export const ProgressIcon = lucide(ChartColumn, 22)
export const MapIcon = lucide(Network, 22)
export const NotesIcon = lucide(NotebookPen, 22)

// Ikony sekcji, wybierane w `_sekcja.md` polem `ikona:`.
// Żeby dodać nową: znajdź ją na lucide.dev/icons, dopisz import i nazwę tutaj.
const SECTION_ICONS = {
  'baby': lucide(Baby),
  'book-open': lucide(BookOpen),
  'brain': lucide(Brain),
  'file-text': lucide(FileText),
  'folder': lucide(Folder),
  'graduation-cap': CapIcon,
  'heart': lucide(Heart),
  'library': ShelfIcon,
  'life-buoy': lucide(LifeBuoy),
  'scale': lucide(Scale),
  'users': lucide(Users),
}

export function Icon({ name, fallback = 'folder', size = 22, ...rest }) {
  const Component = SECTION_ICONS[name] || SECTION_ICONS[fallback]
  return <Component size={size} {...rest} />
}
