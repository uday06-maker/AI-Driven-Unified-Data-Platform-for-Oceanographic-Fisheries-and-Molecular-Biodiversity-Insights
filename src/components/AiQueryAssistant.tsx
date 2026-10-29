import React, { useState } from 'react';
import {
  Terminal,
  Send,
  Database,
  BarChart2,
  BookOpen,
  Sparkles,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Table,
  LineChart,
  Search,
} from 'lucide-react';
import { AIQueryResponse, RAGDocument } from '../types/marine.js';

interface AiQueryAssistantProps {
  onExecuteQuery?: (query: string) => Promise<AIQueryResponse>;
}

const SAMPLE_QUERIES = [
  'Show sardine CPUE vs SST anomalies off Kerala for the last 5 years',
  'Which coastal stations have extreme flood inundation and surge anomalies?',
  'Analyze clupeid eDNA depletion during the 2023 marine heatwave',
  'What is the correlation between coastal chlorophyll-a upwelling and mackerel landings?',
];

export const AiQueryAssistant: React.FC<AiQueryAssistantProps> = ({
  onExecuteQuery,
}) => {
  const [inputQuery, setInputQuery] = useState<string>(SAMPLE_QUERIES[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<AIQueryResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'sql' | 'rag'>('sql');

  // RAG tab state
  const [ragQuestion, setRagQuestion] = useState<string>(
    'How do SST thermal thresholds over 29.5°C impact pelagic larval survival off Kerala?'
  );
  const [ragLoading, setRagLoading] = useState<boolean>(false);
  const [ragResult, setRagResult] = useState<{
    answer: string;
    sources: RAGDocument[];
  } | null>(null);

  const handleRunQuery = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    setIsLoading(true);
    try {
      if (onExecuteQuery) {
        const res = await onExecuteQuery(q);
        setResponse(res);
      } else {
        const res = await fetch('/api/ai/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q }),
        });
        const data = await res.json();
        setResponse(data);
      }
    } catch (err) {
      console.error('AI query failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunRag = async () => {
    if (!ragQuestion.trim()) return;
    setRagLoading(true);
    try {
      const res = await fetch('/api/ai/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: ragQuestion }),
      });
      const data = await res.json();
      setRagResult(data);
    } catch (err) {
      console.error('RAG search failed:', err);
    } finally {
      setRagLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-800">
                AI CROSS-DOMAIN ENGINE · GEMINI 3.8 FLASH
              </span>
              <span className="text-slate-400 font-mono text-xs">·</span>
              <span className="text-xs font-mono text-slate-500">Safe Text-to-SQL + Grounded RAG</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
              Natural Language Cross-Domain Query & Literature Synthesis
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl mt-1 leading-relaxed">
              Converts plain English scientific questions into verified SQL queries against
              oceanographic, fisheries, and eDNA tables, returning live charts, tables, and academic citations.
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono shrink-0">
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-white text-sky-800 font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Text-to-SQL & Charts
          </button>
          <button
            onClick={() => setActiveTab('rag')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'rag'
                ? 'bg-white text-sky-800 font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Literature RAG Assistant
          </button>
        </div>
      </div>

      {/* Marine Research Informatics Laboratory Visual Card */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        <div className="lg:col-span-7 relative h-64 lg:h-auto min-h-[230px] bg-slate-900 overflow-hidden">
          <img
            src="/src/assets/images/marine_research_lab_1793279312787.jpg"
            alt="Marine scientists in an oceanographic vessel computing laboratory analyzing GIS maps and biological samples"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
          <div className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Dry Lab Telemetry & GIS Informatics Center
          </div>
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-mono">
            <span className="font-semibold text-sm drop-shadow-xs">Oceanographic Computing Workstation</span>
            <span className="text-sky-200 text-xs hidden sm:inline">MoES Vessel Sagar Nidhi</span>
          </div>
        </div>

        <div className="lg:col-span-5 p-5 flex flex-col justify-between bg-gradient-to-br from-white to-sky-50/30">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-800 uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              Grounded AI Engine Architecture
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Cross-Domain Text-to-SQL & Document RAG
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Synthesizes disparate marine data sources through schema grounding and peer-reviewed literature retrieval:
            </p>
            <div className="mt-3 space-y-2 text-xs text-slate-700">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-900">1. Schema-Grounded Text-to-SQL:</span> Safely translates natural queries into validated read-only SQL with PostGIS spatial joins.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-900">2. RAG Citation Engine:</span> Grounded against MoES, CMFRI, and INCOIS technical cruise bulletins with DOI-indexed citations.
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Powered by Gemini 3.8 Flash</span>
            <span className="text-sky-700 font-semibold">Read-Only Safety Guardrails</span>
          </div>
        </div>
      </div>

      {activeTab === 'sql' ? (
        <div className="space-y-6">
          {/* Query Input Box */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunQuery()}
                  placeholder="Ask a question across marine physics, fisheries, or eDNA..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white font-sans"
                />
              </div>
              <button
                onClick={() => handleRunQuery()}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer font-sans whitespace-nowrap"
              >
                {isLoading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Run Query</span>
              </button>
            </div>

            {/* Prompt Suggestions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono text-slate-500">Suggestions:</span>
              {SAMPLE_QUERIES.map((sq) => (
                <button
                  key={sq}
                  onClick={() => {
                    setInputQuery(sq);
                    handleRunQuery(sq);
                  }}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 hover:text-sky-700 hover:border-sky-300 hover:bg-sky-50 transition-colors truncate max-w-xs md:max-w-none cursor-pointer"
                >
                  "{sq}"
                </button>
              ))}
            </div>
          </div>

          {/* Response Box */}
          {response && (
            <div className="space-y-4">
              {/* Top Synthesis Card */}
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-mono font-bold uppercase text-slate-900">
                      SYNTHESIZED SCIENTIFIC INSIGHT
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Confidence: {(response.confidenceScore * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {response.summary}
                </p>

                {/* Generated SQL Section */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-sky-700" />
                      Generated Safe SQL (PostgreSQL / TimescaleDB):
                    </span>
                    <span className="text-emerald-700 text-[10px] font-bold">● READ-ONLY ENFORCED</span>
                  </div>
                  <pre className="p-3.5 rounded-lg bg-sky-50/60 border border-sky-200 text-xs font-mono text-sky-950 font-semibold overflow-x-auto shadow-2xs">
                    {response.sqlQuery}
                  </pre>
                </div>
              </div>

              {/* Data Table Preview */}
              {response.data && response.data.length > 0 && (
                <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-mono font-bold uppercase text-slate-900">
                        QUERY EXECUTION DATASET ({response.data.length} RECORDS RETURNED)
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-64">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-50 text-slate-700 sticky top-0 border-b border-slate-200">
                        <tr>
                          {Object.keys(response.data[0])
                            .slice(0, 6)
                            .map((col) => (
                              <th key={col} className="py-2 px-3 uppercase text-[10px]">
                                {col}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {response.data.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            {Object.values(row)
                              .slice(0, 6)
                              .map((val: any, cIdx) => (
                                <td key={cIdx} className="py-2 px-3 truncate max-w-xs">
                                  {typeof val === 'number'
                                    ? val.toFixed(2)
                                    : typeof val === 'object'
                                    ? JSON.stringify(val)
                                    : String(val)}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Citations Strip */}
              {response.citations && response.citations.length > 0 && (
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="text-xs font-mono font-bold uppercase text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-sky-700" />
                    CMLRE & INCOIS GROUNDING CITATIONS
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {response.citations.map((cite, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono space-y-1"
                      >
                        <div className="font-semibold text-slate-900 truncate">{cite.title}</div>
                        <div className="text-slate-500 text-[11px]">
                          {cite.source} · {cite.year}
                        </div>
                        <p className="text-[11px] text-slate-600 font-sans">{cite.relevance}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* RAG Literature Search Tab */
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={ragQuestion}
                onChange={(e) => setRagQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunRag()}
                placeholder="Ask about research findings, cruise bulletins, or species tolerance..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white font-sans"
              />
              <button
                onClick={handleRunRag}
                disabled={ragLoading}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer font-sans whitespace-nowrap"
              >
                {ragLoading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Search Literature</span>
              </button>
            </div>
          </div>

          {ragResult && (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
                <div className="text-xs font-mono font-bold uppercase text-emerald-800 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  RAG SYNTHESIZED LITERATURE ANSWER
                </div>
                <span className="text-xs font-mono text-slate-500">
                  Grounding: 3 Published Bulletins
                </span>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line">
                {ragResult.answer}
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="text-xs font-mono font-bold uppercase text-slate-700">
                  Referenced Publications & Cruise Data:
                </div>
                <div className="space-y-2">
                  {ragResult.sources.map((src) => (
                    <div
                      key={src.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono"
                    >
                      <div className="text-slate-900 font-semibold">{src.title}</div>
                      <div className="text-slate-500 text-[11px] pt-0.5">
                        {src.authors} ({src.year}) · {src.source} · DOI: {src.doi}
                      </div>
                      <p className="text-[11px] text-slate-600 font-sans pt-1 italic">
                        "{src.excerpt}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
