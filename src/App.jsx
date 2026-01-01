import React, { useState, useMemo } from 'react';
import {
    User,
    Activity,
    Info,
    Ear,
    BarChart3,
    ChevronDown,
    ChevronUp,
    PlusCircle,
    XCircle,
    ClipboardList,
    AlertCircle
} from 'lucide-react';

/**
 * ==========================================
 * UTILITIES & CONSTANTS
 * ==========================================
 */

const FREQUENCIES = [500, 1000, 2000, 3000, 4000, 6000, 8000];

/**
 * Applies the quadratic regression formula: y = c + bx + ax^2
 */
const applyModel = (coeffs, age) => {
    if (!coeffs) return 0;
    return coeffs[0] + (coeffs[1] * age) + (coeffs[2] * Math.pow(age, 2));
};

/**
 * ASHA Degrees of Hearing Loss Scale
 */
const getASHAStatus = (db) => {
    if (db <= 15) return { label: 'Normal', color: 'text-emerald-500', bg: 'bg-emerald-50', darkBg: 'dark:bg-emerald-900/20', border: 'border-emerald-100' };
    if (db <= 25) return { label: 'Slight', color: 'text-teal-500', bg: 'bg-teal-50', darkBg: 'dark:bg-teal-900/20', border: 'border-teal-100' };
    if (db <= 40) return { label: 'Mild', color: 'text-amber-500', bg: 'bg-amber-50', darkBg: 'dark:bg-amber-900/20', border: 'border-amber-100' };
    if (db <= 55) return { label: 'Moderate', color: 'text-orange-500', bg: 'bg-orange-50', darkBg: 'dark:bg-orange-900/20', border: 'border-orange-100' };
    if (db <= 70) return { label: 'Mod-Severe', color: 'text-rose-500', bg: 'bg-rose-50', darkBg: 'dark:bg-rose-900/20', border: 'border-rose-100' };
    if (db <= 90) return { label: 'Severe', color: 'text-red-600', bg: 'bg-red-50', darkBg: 'dark:bg-red-900/20', border: 'border-red-100' };
    return { label: 'Profound', color: 'text-purple-600', bg: 'bg-purple-50', darkBg: 'dark:bg-purple-900/20', border: 'border-purple-100' };
};

/**
 * ==========================================
 * REGRESSION MODELS (DATA)
 * ==========================================
 * Coefficients: [Intercept (c), Linear (b), Quadratic (a)]
 * Formula: y = c + bx + ax^2
 * Derived via Least Squares Quadratic Regression on ARHL.csv / ARHL2.csv data.
 */
const freqModels = {
    male: {
        // Median
        f500: [6.8, -0.09, 0.003],
        f1000: [4.4, -0.17, 0.0044],
        f2000: [4.2, -0.21, 0.0064],
        f3000: [7.2, -0.55, 0.0139],
        f4000: [9.6, -0.63, 0.0171],
        f6000: [11.0, -0.56, 0.0171],
        f8000: [5.2, -0.47, 0.0179],

        // 95th Percentile (Saturation correction applied for high frequencies)
        f500_p95: [18.2, -0.01, 0.0036],
        f1000_p95: [12.6, 0.03, 0.005],
        f2000_p95: [16.6, -0.11, 0.0107],
        f3000_p95: [-15.2, 1.48, -0.0036],
        f4000_p95: [-33.2, 2.76, -0.0164],
        f6000_p95: [-35.0, 3.01, -0.0171],
        f8000_p95: [-36.2, 2.92, -0.0157],
    },
    female: {
        // Median
        f500: [5.2, -0.05, 0.0018],
        f1000: [4.4, -0.06, 0.0025],
        f2000: [1.8, -0.04, 0.0040],
        f3000: [1.2, -0.03, 0.0055],
        f4000: [0.8, 0.02, 0.0065],
        f6000: [2.0, 0.05, 0.0085],
        f8000: [-1.0, 0.15, 0.0110],

        // 95th Percentile
        f500_p95: [12.0, 0.05, 0.0015],
        f1000_p95: [7.5, 0.15, 0.0035],
        // Corrected 2k, 3k, 4k to ensure smooth progression (2k < 3k < 4k)
        f2000_p95: [5.0, 0.05, 0.0085],
        f3000_p95: [6.0, 0.1, 0.0085],
        f4000_p95: [8.0, 0.15, 0.0085],
        // High freq saturation
        f6000_p95: [-8.0, 1.4, -0.003],
        f8000_p95: [-10.0, 1.5, -0.002]
    }
};

const PTA_MODELS = {
    male: {
        pta5123_median: [3.65, -0.053, 0.0044],
        pta5123_95th: [4.55, 0.22, 0.0064],
        pta234_median: [6.2, -0.38, 0.0114],
        pta234_95th: [-26.3, 2.06, -0.0096]
    },
    female: {
        pta5123_median: [6.2, -0.22, 0.0053],
        pta5123_95th: [11.5, 0.05, 0.0045],
        pta234_median: [3.5, -0.2, 0.0065],
        pta234_95th: [5.0, 0.1, 0.01]
    }
};

/**
 * ==========================================
 * COMPONENTS
 * ==========================================
 */

const MetricCard = ({ title, median, p95, actual }) => {
    const status = actual !== null ? getASHAStatus(actual) : null;
    const medianStatus = getASHAStatus(median);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
        <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-4 flex justify-between items-center">
        {title}
        {actual !== null && (
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${status.bg} ${status.darkBg} ${status.color} border ${status.border}`}>
            ASHA: {status.label}
            </span>
        )}
        </h3>

        <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
        <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Median</span>
        <div className="flex items-baseline gap-0.5">
        <span className="text-lg font-bold">{median.toFixed(1)}</span>
        <span className="text-[9px] opacity-50 uppercase font-bold ml-1">dB</span>
        </div>
        <span className={`text-[8px] font-bold uppercase ${medianStatus.color} mt-1 block opacity-80`}>
        {medianStatus.label}
        </span>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950/10 p-3 rounded-xl">
        <span className="text-[9px] font-bold text-orange-600 uppercase block mb-1">95th %ile</span>
        <div className="flex items-baseline gap-0.5">
        <span className="text-lg font-bold text-orange-700 dark:text-orange-400">{p95.toFixed(1)}</span>
        <span className="text-[9px] opacity-50 uppercase font-bold ml-1">dB</span>
        </div>
        </div>
        <div className={`p-3 rounded-xl border-2 transition-colors ${actual !== null ? `${status.bg} ${status.darkBg} border-current opacity-100` : 'bg-slate-50/50 dark:bg-slate-900/50 border-dashed border-slate-200 dark:border-slate-800 opacity-60'}`} style={{ borderColor: actual !== null ? 'currentColor' : '' }}>
        <span className={`text-[9px] font-bold uppercase block mb-1 ${actual !== null ? status.color : 'text-slate-400'}`}>Patient</span>
        <div className="flex items-baseline gap-0.5">
        <span className={`text-lg font-bold ${actual !== null ? status.color : 'text-slate-300'}`}>
        {actual !== null ? actual.toFixed(1) : "--"}
        </span>
        <span className={`text-[9px] font-bold uppercase ml-1 ${actual !== null ? status.color : 'text-slate-300'}`}>dB</span>
        </div>
        </div>
        </div>
        </div>
    );
};

const FrequencyGraph = ({ sex, age, patientThresholds }) => {
    const data = useMemo(() => {
        const m = freqModels[sex];
        return FREQUENCIES.map(f => ({
            freq: f,
            median: Math.max(0, applyModel(m[`f${f}`], age)),
                                     p95: Math.max(0, applyModel(m[`f${f}_p95`], age)),
                                     patient: patientThresholds[f] !== "" ? parseFloat(patientThresholds[f]) : null
        }));
    }, [sex, age, patientThresholds]);

    const width = 600;
    const height = 300;
    // Adjusted margins to fit axis labels
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const xScale = (i) => margin.left + (i / (FREQUENCIES.length - 1)) * (width - margin.left - margin.right);
    // Y-Scale to handle up to 120 dB for clinical standards (0 at top)
    const yScale = (val) => margin.top + (val / 120) * (height - margin.top - margin.bottom);

    const medPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.median)}`).join(' ');
    const p95Path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.p95)}`).join(' ');

    const patientPoints = data.filter(d => d.patient !== null);
    const patientPath = patientPoints.length > 1
    ? patientPoints.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(FREQUENCIES.indexOf(d.freq))} ${yScale(d.patient)}`).join(' ')
    : null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <BarChart3 size={18} className="text-indigo-500" />
        Comparison Audiogram
        </h3>
        <p className="text-xs text-slate-500 mt-1">Population norms vs. patient input</p>
        </div>
        <div className="flex flex-wrap gap-3 text-[9px] font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1"><div className="w-3 h-1 bg-indigo-500 rounded-full" /> Median</span>
        <span className="flex items-center gap-1"><div className="w-3 h-1 bg-orange-400 rounded-full" /> 95th %ile</span>
        <span className="flex items-center gap-1"><div className="w-3 h-1 bg-rose-500 rounded-full" /> Patient</span>
        </div>
        </div>

        <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Y-Axis Label */}
        <text
        transform="rotate(-90)"
        x={-(height / 2)}
        y={20}
        textAnchor="middle"
        className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest"
        >
        Hearing Thresholds (dB HL)
        </text>

        {/* X-Axis Label */}
        <text
        x={width / 2}
        y={height - 10}
        textAnchor="middle"
        className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest"
        >
        Frequency (Hz)
        </text>

        {[0, 20, 40, 60, 80, 100, 120].map(v => (
            <g key={v}>
            <line x1={margin.left} y1={yScale(v)} x2={width - margin.right} y2={yScale(v)} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
            <text x={margin.left - 10} y={yScale(v)} textAnchor="end" alignmentBaseline="middle" className="text-[12px] fill-slate-400 font-medium">{v}</text>
            </g>
        ))}
        {FREQUENCIES.map((f, i) => (
            <g key={f}>
            <line x1={xScale(i)} y1={margin.top} x2={xScale(i)} y2={height - margin.bottom} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
            <text x={xScale(i)} y={height - 30} textAnchor="middle" className="text-[11px] fill-slate-500 font-bold">{f < 1000 ? f : f/1000 + 'k'}</text>
            </g>
        ))}
        <path d={p95Path} fill="none" className="stroke-orange-400/30" strokeWidth="2" strokeDasharray="4" />
        <path d={medPath} fill="none" className="stroke-indigo-500/30" strokeWidth="2" />
        {patientPath && <path d={patientPath} fill="none" className="stroke-rose-500" strokeWidth="3" strokeLinecap="round" />}
        {data.map((d, i) => (
            <React.Fragment key={i}>
            <circle cx={xScale(i)} cy={yScale(d.median)} r="3" className="fill-indigo-300" />
            <circle cx={xScale(i)} cy={yScale(d.p95)} r="3" className="fill-orange-300" />
            {d.patient !== null && <circle cx={xScale(i)} cy={yScale(d.patient)} r="6" className="fill-rose-500 shadow-lg" />}
            </React.Fragment>
        ))}
        </svg>
        </div>
        </div>
    );
};

const App = () => {
    const [age, setAge] = useState(50);
    const [sex, setSex] = useState('male');
    const [showInfo, setShowInfo] = useState(false);
    const [showEntry, setShowEntry] = useState(false);

    const [patientThresholds, setPatientThresholds] = useState({
        500: "", 1000: "", 2000: "", 3000: "", 4000: "", 6000: "", 8000: ""
    });

    const handleInput = (freq, val) => {
        setPatientThresholds(prev => ({ ...prev, [freq]: val === "" ? "" : val }));
    };

    const patientPTAs = useMemo(() => {
        const getVal = (f) => patientThresholds[f] !== "" ? parseFloat(patientThresholds[f]) : null;
        const f500 = getVal(500), f1000 = getVal(1000), f2000 = getVal(2000), f3000 = getVal(3000), f4000 = getVal(4000);

        const pta5123 = (f500 !== null && f1000 !== null && f2000 !== null && f3000 !== null)
        ? (f500 + f1000 + f2000 + f3000) / 4 : null;
        const pta234 = (f2000 !== null && f3000 !== null && f4000 !== null)
        ? (f2000 + f3000 + f4000) / 3 : null;

        return { pta5123, pta234 };
    }, [patientThresholds]);

    const results = useMemo(() => {
        const m = PTA_MODELS[sex];
        return {
            pta5123: { median: Math.max(0, applyModel(m.pta5123_median, age)), p95: applyModel(m.pta5123_95th, age) },
                            pta234: { median: Math.max(0, applyModel(m.pta234_median, age)), p95: applyModel(m.pta234_95th, age) }
        };
    }, [sex, age]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
        <Ear className="text-white" size={20} />
        </div>
        <div>
        <h1 className="text-lg font-black tracking-tighter uppercase">ARHL Clinical Engine</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ASHA & Hoffman-NHANES Integrated</p>
        </div>
        </div>
        <div className="flex gap-2">
        <button onClick={() => setShowEntry(!showEntry)} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all border ${showEntry ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-300'}`}>
        {showEntry ? <XCircle size={14} /> : <PlusCircle size={14} />}
        {showEntry ? "Hide Patient Entry" : "Patient Data"}
        </button>
        <button onClick={() => setShowInfo(!showInfo)} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-400">
        <Info size={16} />
        </button>
        </div>
        </header>

        {showInfo && (
            <div className="mb-6 p-5 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-2xl animate-in fade-in duration-300">
            <div className="flex items-start gap-4">
            <AlertCircle className="text-indigo-600 mt-1 shrink-0" size={18} />
            <div>
            <h2 className="text-[11px] font-black uppercase text-indigo-900 dark:text-indigo-300 mb-2">Source Acknowledgment & Methodology</h2>
            <div className="text-xs text-indigo-800 dark:text-indigo-300 space-y-2 mb-4">
            <p>
            This application is a web-based adaptation of the <strong>ARHL age-related hearing loss Calculator</strong> spreadsheet developed by <strong>Robert Dobie, MD</strong>.
            </p>
            <p>
            The data is derived from the National Health and Nutrition Examination Survey (NHANES) as analyzed by Hoffman et al. (Ear & Hearing 2010; 31: 725-734 and 2012; 33: 437-440).
            </p>
            </div>

            <h2 className="text-[11px] font-black uppercase text-indigo-900 dark:text-indigo-300 mb-2">ASHA Degree of Hearing Loss Scale</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {[
                { l: 'Normal', r: '0-15', c: 'text-emerald-500' },
                { l: 'Slight', r: '16-25', c: 'text-teal-500' },
                { l: 'Mild', r: '26-40', c: 'text-amber-500' },
                { l: 'Moderate', r: '41-55', c: 'text-orange-500' },
                { l: 'Mod-Severe', r: '56-70', c: 'text-rose-500' },
                { l: 'Severe', r: '71-90', c: 'text-red-600' },
                { l: 'Profound', r: '91+', c: 'text-purple-600' }
            ].map(scale => (
                <div key={scale.l} className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <div className={`text-[9px] font-black uppercase mb-1 ${scale.c}`}>{scale.l}</div>
                <div className="text-[10px] font-bold opacity-50">{scale.r} dB</div>
                </div>
            ))}
            </div>
            </div>
            </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3 space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">Baseline Parameters</label>
        <div className="space-y-6">
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        {['male', 'female'].map(s => (
            <button key={s} onClick={() => setSex(s)} className={`py-2 text-[10px] font-black uppercase rounded-lg transition-all ${sex === s ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>{s}</button>
        ))}
        </div>
        <div>
        <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Age</span>
        <span className="text-xl font-black text-indigo-600">{age}</span>
        </div>
        <input type="range" min="20" max="80" value={age} onChange={e => setAge(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none accent-indigo-600 cursor-pointer" />
        </div>
        </div>
        </div>

        {showEntry && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-rose-100 dark:border-rose-900/30 animate-in slide-in-from-left-4 duration-300 shadow-xl shadow-rose-500/5">
            <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ClipboardList size={14} />
            Patient Entry (dB HL)
            </h3>
            <div className="space-y-3">
            {FREQUENCIES.map(f => (
                <div key={f} className="flex items-center gap-3">
                <label className="text-[10px] font-bold text-slate-400 w-10">{f < 1000 ? f : f/1000 + 'k'}</label>
                <input
                type="number"
                value={patientThresholds[f]}
                onChange={e => handleInput(f, e.target.value)}
                placeholder="--"
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold focus:ring-2 focus:ring-rose-500 outline-none"
                />
                </div>
            ))}
            <button onClick={() => setPatientThresholds({500:"", 1000:"", 2000:"", 3000:"", 4000:"", 6000:"", 8000:""})} className="w-full py-2 text-[9px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors">Clear Input</button>
            </div>
            </div>
        )}
        </aside>

        <main className="lg:col-span-9 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard title="PTA 5123 (Speech)" median={results.pta5123.median} p95={results.pta5123.p95} actual={patientPTAs.pta5123} />
        <MetricCard title="PTA 234 (OSHA STS)" median={results.pta234.median} p95={results.pta234.p95} actual={patientPTAs.pta234} />
        </div>

        <FrequencyGraph sex={sex} age={age} patientThresholds={patientThresholds} />

        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
        {FREQUENCIES.map(f => {
            const med = Math.max(0, applyModel(freqModels[sex][`f${f}`], age));
            const p95 = Math.max(0, applyModel(freqModels[sex][`f${f}_p95`], age));
            const pat = patientThresholds[f] !== "" ? parseFloat(patientThresholds[f]) : null;
            const status = pat !== null ? getASHAStatus(pat) : null;

            return (
                <div key={f} className={`bg-white dark:bg-slate-900 p-2.5 rounded-xl border transition-all ${pat !== null ? `${status.border} shadow-sm ring-1 ring-inset ${status.color.replace('text-', 'ring-').replace('600', '100').replace('500', '100')}` : 'border-slate-100 dark:border-slate-800'}`}>
                <div className="text-[10px] font-black text-slate-400 uppercase mb-2 text-center border-b border-slate-50 dark:border-slate-800 pb-1">
                {f < 1000 ? f : f/1000 + 'k'} <span className="text-[8px] font-normal opacity-50">Hz</span>
                </div>

                <div className="space-y-1">
                {/* Median Row */}
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-wider">Med</span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{med.toFixed(0)}</span>
                </div>

                {/* 95th Percentile Row */}
                <div className="flex justify-between items-center bg-orange-50/50 dark:bg-orange-900/10 px-2 py-1 rounded">
                <span className="text-[8px] font-bold text-orange-400 uppercase tracking-wider">95%</span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{p95.toFixed(0)}</span>
                </div>

                {/* Patient Row - Only shows if data entered */}
                {pat !== null ? (
                    <div className={`mt-2 pt-1 border-t border-dashed ${status.border.replace('border', 'border-slate-200 dark:border-slate-700')}`}>
                    <div className="flex justify-between items-center px-1 mb-1">
                    <span className={`text-[8px] font-black uppercase ${status.color}`}>User</span>
                    <span className={`text-[11px] font-black ${status.color}`}>{pat}</span>
                    </div>
                    <div className={`text-[7px] font-bold uppercase text-center py-0.5 rounded ${status.bg} ${status.darkBg} ${status.color}`}>
                    {status.label}
                    </div>
                    </div>
                ) : (
                    <div className="pt-2 text-[8px] text-center text-slate-300 dark:text-slate-700 italic font-medium">
                    --
                    </div>
                )}
                </div>
                </div>
            );
        })}
        </div>
        </main>
        </div>

        <footer className="mt-12 py-8 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Based on the ARHL Calculator by Robert Dobie, MD • NHANES 2010/2012</p>
        </footer>
        </div>
        </div>
    );
};

export default App;
