import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ExternalLink, Database, ChevronDown, ChevronUp } from 'lucide-react';

const SOURCE_TYPE_CONFIG = {
  official_report:   { label: 'Official Report', color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/25' },
  government_report: { label: 'Govt. Report',    color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/25' },
  research_paper:    { label: 'Research Paper',  color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/25' },
  case_study:        { label: 'Case Study',      color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/25' },
};

const CONFIDENCE_CONFIG = {
  high:   { label: 'High',   color: 'text-emerald-400', dot: 'bg-emerald-500' },
  medium: { label: 'Medium', color: 'text-amber-400',   dot: 'bg-amber-500' },
  low:    { label: 'Low',    color: 'text-red-400',      dot: 'bg-red-500' },
};

function RelevanceBar({ score }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
        />
      </div>
      <span className="text-[9px] text-white/30 w-7 text-right">{Math.round(score * 100)}%</span>
    </div>
  );
}

function SourceCard({ source, index }) {
  const [expanded, setExpanded] = useState(false);
  const typeConfig = SOURCE_TYPE_CONFIG[source.source_type] || SOURCE_TYPE_CONFIG.case_study;
  const confConfig = CONFIDENCE_CONFIG[source.confidence] || CONFIDENCE_CONFIG.medium;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-white/15 transition-colors"
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-6 h-6 rounded-md bg-white/5 flex items-center justify-center mt-0.5">
          <span className="text-[10px] font-bold text-white/40">{index + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${typeConfig.color} ${typeConfig.bg} border ${typeConfig.border}`}>
              {typeConfig.label}
            </span>
            <span className={`inline-flex items-center gap-1 text-[9px] font-semibold ${confConfig.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${confConfig.dot}`} />
              {confConfig.label} Confidence
            </span>
            {source.cached && (
              <span className="inline-flex items-center gap-1 text-[9px] text-white/25">
                <Database className="w-2.5 h-2.5" />
                Cached
              </span>
            )}
          </div>

          {/* Title */}
          <p className="text-xs font-semibold text-white/85 leading-snug mb-1">{source.title}</p>

          {/* Domain */}
          <p className="text-[10px] text-white/30 mb-2">{source.domain}</p>

          {/* Relevance bar */}
          <div className="mb-2">
            <div className="text-[9px] text-white/30 mb-1 uppercase tracking-wide">Relevance</div>
            <RelevanceBar score={source.relevance} />
          </div>

          {/* Expand/collapse summary */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Hide summary' : 'Show summary'}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="text-[11px] text-white/50 leading-relaxed mt-2 pt-2 border-t border-white/5">
                  {source.summary}
                </p>
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-cyan-400/70 hover:text-cyan-400 mt-2 transition-colors"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    View source
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function EvidencePanel({ evidence }) {
  if (!evidence) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-white/5 flex items-center justify-center min-h-[120px]">
        <p className="text-xs text-white/25">Evidence retrieval unavailable</p>
      </div>
    );
  }

  const { sources = [], total_sources = 0, cached = true, query_key = '' } = evidence;

  if (sources.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white/70">Research Support</span>
        </div>
        <p className="text-xs text-white/30">No supporting evidence found for this policy configuration.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-amber-500/15 border-t-2 border-t-amber-500/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white/80">Research Support</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/30 font-mono">{query_key}</span>
          {cached && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <Database className="w-2.5 h-2.5" />
              {total_sources} Cached
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {sources.map((source, i) => (
          <SourceCard key={source.url || i} source={source} index={i} />
        ))}
      </div>

      <p className="text-[10px] text-white/20 text-center mt-4">
        Evidence is pre-curated from BBMP, NIUA, IISc, KSPCB, MoHUA, and World Bank publications.
        Sources are used to support recommendations only — not as model inputs.
      </p>
    </div>
  );
}
