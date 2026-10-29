import React, { useState, useMemo } from 'react';
import {
  Dna,
  Search,
  Activity,
  Layers,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  FileText,
  PieChart,
  ArrowRight,
  Database,
  ExternalLink,
} from 'lucide-react';
import { MolecularSample, ASVRecord } from '../types/marine.js';

interface MolecularEdnaSuiteProps {
  samples: MolecularSample[];
  asvs: ASVRecord[];
}

// Preset marine barcode sequences from Arabian Sea CMLRE cruise
const PRESET_SEQUENCES = [
  {
    name: 'Sardinella longiceps (Indian Oil Sardine)',
    gene: '12S rRNA',
    aphiaId: 217694,
    family: 'Clupeidae',
    sequence:
      'ACTTTAATTAACCCCTACCCCTTTCTTTGGCTAAATTATGGTGCAGTGTTTACAGCGGTTTCACCAATACATCAGTCTACGGTCAGTAATCTTTGGTGAATTAGCATCGTTACCCTGTTTTGTTGGGTCACTTTGTTTTAGTCTTATATTTTTTTTTTTTTTTT',
  },
  {
    name: 'Rastrelliger kanagurta (Indian Mackerel)',
    gene: 'COI Barcode',
    aphiaId: 218206,
    family: 'Scombridae',
    sequence:
      'GGTCAACAAATCATAAAGATATTGGAACCCTTTACCTCCTTTTTGGTGCTTGAGCTGGAATAGTAGGCACTGCTCTTAGTCTTTTAATTCGTGCTGAACTTAGCCAACCCGGTTCCCTTCTTGGAGATGATCAAATTTATAATGTTATCGTAACTGCTCACGC',
  },
  {
    name: 'Aurelia aurita (Moon Jellyfish - Hypoxia Indicator)',
    gene: '16S rRNA',
    aphiaId: 135306,
    family: 'Ulmaridae',
    sequence:
      'TAGGTTTGTACCTTTTGCATCATGTTTTTATAGTTTTAATTTTTTTTGGGTTTAGGTTTAAATGTTTACCCGTATATTGTATAGGTTTTTAATTAGGGTATTTTAAGGTAATTTTTAGTATAGGGTTTTAGTTTAGTTTAGTTTTTTTTTTACTTTTTTAAA',
  },
  {
    name: 'Thunnus albacares (Yellowfin Tuna)',
    gene: '12S rRNA',
    aphiaId: 127027,
    family: 'Scombridae',
    sequence:
      'ACTTTAATTAACCCCTACCCCTTTCTTTGGCTAAATTATGGTGCAGTGTTTACAGCGGTTTCACCAATACATCAGTCTACGGTCAGTAATCTTTGGTGAATTAGCATCGTTACCCTGTTTTGTTGGGTCACTTTGTTTTAGTCTTATATTTTTTTTTTTTTTTT',
  },
];

export const MolecularEdnaSuite: React.FC<MolecularEdnaSuiteProps> = ({
  samples,
  asvs,
}) => {
  const [activeSampleId, setActiveSampleId] = useState<string>(samples[0]?.id || 'sam-01');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [customSequence, setCustomSequence] = useState<string>(
    PRESET_SEQUENCES[0].sequence
  );
  const [searchFilter, setSearchFilter] = useState<string>('');

  const activeSample = samples.find((s) => s.id === activeSampleId) || samples[0];

  // Sequence Composition Analytics
  const seqStats = useMemo(() => {
    const cleanSeq = customSequence.toUpperCase().replace(/[^ATGC]/g, '');
    const len = cleanSeq.length || 1;
    let countA = 0, countT = 0, countG = 0, countC = 0;

    for (let i = 0; i < cleanSeq.length; i++) {
      const char = cleanSeq[i];
      if (char === 'A') countA++;
      else if (char === 'T') countT++;
      else if (char === 'G') countG++;
      else if (char === 'C') countC++;
    }

    const gcContent = +(((countG + countC) / len) * 100).toFixed(1);
    const atRatio = +((countA + countT) / (countG + countC || 1)).toFixed(2);

    // Compute simple 3-mer frequency
    const kmerMap: Record<string, number> = {};
    for (let i = 0; i <= cleanSeq.length - 3; i++) {
      const kmer = cleanSeq.substring(i, i + 3);
      kmerMap[kmer] = (kmerMap[kmer] || 0) + 1;
    }

    const topKmers = Object.entries(kmerMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      length: cleanSeq.length,
      gcContent,
      atRatio,
      bases: {
        A: { count: countA, pct: +((countA / len) * 100).toFixed(1) },
        T: { count: countT, pct: +((countT / len) * 100).toFixed(1) },
        G: { count: countG, pct: +((countG / len) * 100).toFixed(1) },
        C: { count: countC, pct: +((countC / len) * 100).toFixed(1) },
      },
      topKmers,
    };
  }, [customSequence]);

  // Filter ASVs
  const filteredAsvs = useMemo(() => {
    return asvs.filter(
      (a) =>
        a.taxonScientific.toLowerCase().includes(searchFilter.toLowerCase()) ||
        a.commonName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        a.family.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [asvs, searchFilter]);

  // Beta Diversity Matrix (Bray-Curtis dissimilarity between 4 sample sites)
  const brayCurtisMatrix = [
    { siteA: 'Kochi Shelf (SAM-01)', siteB: 'Alappuzha Inundation (SAM-02)', dist: 0.68 },
    { siteA: 'Kochi Shelf (SAM-01)', siteB: 'Kollam Deep Trench (SAM-03)', dist: 0.84 },
    { siteA: 'Kochi Shelf (SAM-01)', siteB: 'Calicut Transect (SAM-04)', dist: 0.32 },
    { siteA: 'Alappuzha (SAM-02)', siteB: 'Kollam Deep Trench (SAM-03)', dist: 0.79 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">
                MOLECULAR BIODIVERSITY & eDNA PIPELINE
              </span>
              <span className="text-slate-400 font-mono text-xs">·</span>
              <span className="text-xs font-mono text-slate-500">
                Standard: MIxS-eDNA / WoRMS AphiaID Taxon Matching
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
              High-Throughput Metabarcoding & Taxon Classification (12S rRNA / COI)
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl mt-1 leading-relaxed">
              Detects community shifts, hypoxia-tolerant blooms (jellyfish), and clupeid collapse from
              seawater environmental DNA without physical capture.
            </p>
          </div>
        </div>

        {/* Selected Sample Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200 shrink-0">
          <span className="text-[11px] font-mono text-slate-600 font-medium">Station:</span>
          {samples.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSampleId(s.id)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                activeSampleId === s.id
                  ? 'bg-white text-emerald-900 font-bold shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s.sampleCode}
            </button>
          ))}
        </div>
      </div>

      {/* Real Oceanographic eDNA Niskin Rosette Sampling Graphic Card */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        <div className="lg:col-span-7 relative h-64 lg:h-auto min-h-[240px] bg-slate-900 overflow-hidden">
          <img
            src="/src/assets/images/edna_marine_sampling_1793279267636.jpg"
            alt="Marine scientists deploying a CTD Niskin water sampling rosette on an oceanographic vessel deck for environmental DNA collection"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
          <div className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Field In-Situ Protocol · CTD Niskin Carousel
          </div>
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-mono">
            <span className="font-semibold text-sm drop-shadow-xs">Niskin Seawater Sampling · Sterivex 0.22 μm</span>
            <span className="text-emerald-300 text-xs hidden sm:inline">CMLRE Sagar Sampada Expedition</span>
          </div>
        </div>

        <div className="lg:col-span-5 p-5 flex flex-col justify-between bg-gradient-to-br from-white to-emerald-50/30">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Molecular Sampling & Taxonomic Resolution
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Metabarcoding Biomass & Cryptic Biodiversity
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Environmental DNA detects species shed via scales, mucus, and metabolic waste from 5-liter seawater replicates across depths:
            </p>
            <div className="mt-3 space-y-2 text-xs text-slate-700">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-900">12S Teleost Barcode:</span> Target locus for clupeid fisheries, confirming the presence or sudden absence of schooling pelagic species.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-900">COI & 16S rRNA:</span> Broad-spectrum invertebrate barcode detecting gelatinous zooplankton blooms (<em className="italic">Aurelia aurita</em>) and hypoxia bio-indicators.
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>WoRMS AphiaID Resolved</span>
            <span className="text-emerald-700 font-semibold">MIxS-eDNA Compliant</span>
          </div>
        </div>
      </div>

      {/* Alpha Diversity Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Shannon Index */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-1">
            SHANNON DIVERSITY (H')
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-700">
            {activeSample.shannonIndex.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            High community equitability across 42 pelagic taxa.
          </p>
        </div>

        {/* Metric 2: Simpson Index */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-1">
            SIMPSON INDEX (1 - D)
          </div>
          <div className="text-2xl font-mono font-bold text-sky-700">
            {activeSample.simpsonIndex.toFixed(3)}
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Low dominance probability, resilient ecosystem state.
          </p>
        </div>

        {/* Metric 3: Chao1 Richness */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-1">
            CHAO1 ASV RICHNESS
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900">
            {activeSample.chao1Richness}
            <span className="text-xs font-mono text-slate-500 font-normal ml-1">ASVs</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Observed 12S amplicon variants in library.
          </p>
        </div>

        {/* Metric 4: Dominant Taxon */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-1">
            DOMINANT TAXON
          </div>
          <div className="text-base font-semibold text-slate-900 italic truncate">
            {activeSample.dominantTaxon}
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            33.8% of total sequencing depth reads.
          </p>
        </div>
      </div>

      {/* Sequence Analysis & BLAST Taxonomic Classifier */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-emerald-800">
                FASTA SEQUENCE ANALYZER & K-MER PROFILER
              </span>
              <span className="text-slate-400 font-mono text-xs">·</span>
              <span className="text-xs font-mono text-slate-500">Target Gene: 12S rRNA / COI</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
              Molecular Sequence Characteristics & Taxonomic Alignment
            </h3>
          </div>

          {/* Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-600 font-medium">Preset:</span>
            <select
              value={selectedPresetIndex}
              onChange={(e) => {
                const idx = Number(e.target.value);
                setSelectedPresetIndex(idx);
                setCustomSequence(PRESET_SEQUENCES[idx].sequence);
              }}
              className="bg-white border border-slate-200 text-xs font-mono text-slate-800 px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
            >
              {PRESET_SEQUENCES.map((p, idx) => (
                <option key={p.name} value={idx}>
                  {p.name} ({p.gene})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sequence Input / Textarea */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-slate-600">
            <span>Raw Nucleotide Sequence (FASTA/IUPAC):</span>
            <span>
              Length: <strong className="text-emerald-700">{seqStats.length} bp</strong> | GC: <strong className="text-sky-700">{seqStats.gcContent}%</strong> | AT/GC:{' '}
              <strong className="text-amber-700">{seqStats.atRatio}</strong>
            </span>
          </div>
          <textarea
            value={customSequence}
            onChange={(e) => setCustomSequence(e.target.value)}
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white leading-relaxed tracking-wider break-all resize-none"
            placeholder="Paste FASTA nucleotide sequence here..."
          />
        </div>

        {/* Nucleotide Base Breakdown & Top K-mers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
            <span className="text-slate-500">Adenine (A):</span>
            <div className="text-sm font-bold text-slate-900">
              {seqStats.bases.A.count} <span className="text-[10px] text-slate-500 font-normal">({seqStats.bases.A.pct}%)</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
            <span className="text-slate-500">Thymine (T):</span>
            <div className="text-sm font-bold text-slate-900">
              {seqStats.bases.T.count} <span className="text-[10px] text-slate-500 font-normal">({seqStats.bases.T.pct}%)</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
            <span className="text-slate-500">Guanine (G):</span>
            <div className="text-sm font-bold text-sky-700">
              {seqStats.bases.G.count} <span className="text-[10px] text-slate-500 font-normal">({seqStats.bases.G.pct}%)</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
            <span className="text-slate-500">Cytosine (C):</span>
            <div className="text-sm font-bold text-sky-700">
              {seqStats.bases.C.count} <span className="text-[10px] text-slate-500 font-normal">({seqStats.bases.C.pct}%)</span>
            </div>
          </div>
          <div className="col-span-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
            <span className="text-slate-500">Top 3-mer Signatures:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {seqStats.topKmers.map(([kmer, cnt]) => (
                <span key={kmer} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[11px] text-emerald-800 font-semibold shadow-2xs">
                  {kmer}: <strong className="text-slate-900">{cnt}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ASV Abundance Table & Beta Diversity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ASV Table (2 Columns) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="text-xs font-mono font-bold uppercase text-emerald-800">
                AMPLICON SEQUENCE VARIANTS (ASV)
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                Taxonomic Read Abundance & Confidence Scores
              </h3>
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter taxon or family..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white w-48"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Taxon Scientific Name</th>
                  <th className="py-2.5 px-3">Common Name</th>
                  <th className="py-2.5 px-3">Family</th>
                  <th className="py-2.5 px-3 text-right">Reads</th>
                  <th className="py-2.5 px-3 text-right">Abundance</th>
                  <th className="py-2.5 px-3 text-right">WoRMS ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredAsvs.map((asv) => (
                  <tr key={asv.asvId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold italic text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      {asv.taxonScientific}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-sans">{asv.commonName}</td>
                    <td className="py-2.5 px-3 text-slate-500">{asv.family}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {asv.abundanceReads.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, asv.relativeAbundancePct * 2.8)}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-emerald-800">
                          {asv.relativeAbundancePct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right text-sky-700 font-bold">
                      <a
                        href={`https://www.marinespecies.org/aphia.php?p=taxdetails&id=${asv.aphiaId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center justify-end gap-1"
                      >
                        {asv.aphiaId}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Beta Diversity & Bray-Curtis Dissimilarity (1 Column) */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-200">
            <div className="text-xs font-mono font-bold uppercase text-sky-800">
              BETA DIVERSITY DISSIMILARITY
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
              Bray-Curtis Distance Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Quantifies community turnover between coastal stations. A distance closer to 1.0 indicates
            complete taxonomic divergence due to thermal or hypoxia stress.
          </p>

          <div className="space-y-2.5 pt-1">
            {brayCurtisMatrix.map((pair, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-900 font-semibold truncate">{pair.siteA}</span>
                  <span className="text-slate-400 font-bold">vs</span>
                </div>
                <div className="text-xs font-mono text-slate-600 truncate">{pair.siteB}</div>
                <div className="flex items-center justify-between text-xs font-mono pt-1">
                  <span className="text-slate-500">Bray-Curtis Dist:</span>
                  <strong className={pair.dist > 0.75 ? 'text-rose-700 font-bold' : 'text-sky-800 font-bold'}>
                    {pair.dist.toFixed(2)}
                  </strong>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            <strong>Molecular Finding:</strong> Thermal upwelling suppression creates a 0.68 distance
            divergence between Kochi and Alappuzha, driven by the replacement of Clupeidae with
            Cnidarian reads.
          </div>
        </div>
      </div>
    </div>
  );
};
