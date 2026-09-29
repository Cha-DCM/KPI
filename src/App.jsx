import React, { useState, useMemo, useEffect } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  INSTANTANÉ DE SECOURS — arrêté à août 2026.                        */
/*  En fonctionnement normal ces valeurs sont remplacées au chargement */
/*  par /api/data, qui lit les fichiers Google Sheets. Elles ne        */
/*  servent que si cet appel échoue, pour que la page reste lisible.   */
/* ------------------------------------------------------------------ */

const RAW = {
  bl1: [
    {y:2022,m:1,ca:119806.65,resto:46155.78,escal:69938.49,shop:2779.05,pass:5171.0},
    {y:2022,m:2,ca:148222.84,resto:59784.12,escal:83839.74,shop:3348.97,pass:5171.0},
    {y:2022,m:3,ca:171912.07,resto:77633.85,escal:89356.1,shop:3518.59,pass:5834.0},
    {y:2022,m:4,ca:182678.43,resto:89454.07,escal:87061.65,shop:4338.48,pass:5580.0},
    {y:2022,m:5,ca:172880.17,resto:93759.11,escal:74267.34,shop:3070.56,pass:5106.0},
    {y:2022,m:6,ca:168683.86,resto:93696.42,escal:69918.34,shop:4069.1,pass:4877.0},
    {y:2022,m:7,ca:171014.26,resto:94310.36,escal:71502.49,shop:4526.85,pass:4609.0},
    {y:2022,m:8,ca:189000.79,resto:93570.67,escal:90229.59,shop:3939.7,pass:5132.0},
    {y:2022,m:9,ca:193603.65,resto:92354.26,escal:96338.91,shop:3614.54,pass:9322.0},
    {y:2022,m:10,ca:184125.08,resto:81571.09,escal:98279.94,shop:3959.86,pass:10305.0},
    {y:2022,m:11,ca:178794.13,resto:74089.72,escal:100389.59,shop:3939.82,pass:10491.0},
    {y:2022,m:12,ca:167422.9,resto:60056.69,escal:100389.59,shop:3293.69,pass:8620.0},
    {y:2023,m:1,ca:176207.95,resto:70645.59,escal:102132.08,shop:2994.13,pass:10414.0},
    {y:2023,m:2,ca:176226.02,resto:74367.77,escal:98268.17,shop:3261.71,pass:9530.0},
    {y:2023,m:3,ca:173046.52,resto:73394.41,escal:95704.17,shop:3324.67,pass:9860.0},
    {y:2023,m:4,ca:175322.48,resto:71640.73,escal:99946.25,shop:3540.96,pass:9431.0},
    {y:2023,m:5,ca:172300.71,resto:70519.55,escal:98196.58,shop:3449.16,pass:9121.0},
    {y:2023,m:6,ca:177099.89,resto:83481.92,escal:89589.34,shop:3812.63,pass:8571.0},
    {y:2023,m:7,ca:167665.45,resto:78992.57,escal:84725.17,shop:3947.71,pass:7862.0},
    {y:2023,m:8,ca:165163.58,resto:71418.49,escal:89279.5,shop:3517.59,pass:8047.0},
    {y:2023,m:9,ca:169179.11,resto:67229.33,escal:97639.0,shop:3525.15,pass:8765.0},
    {y:2023,m:10,ca:180192.36,resto:79923.0,escal:95759.0,shop:3872.0,pass:9705.0},
    {y:2023,m:11,ca:173691.0,resto:68687.0,escal:98769.0,shop:3568.0,pass:9955.0},
    {y:2023,m:12,ca:160538.0,resto:58022.0,escal:98914.0,shop:3602.0,pass:8220.0},
    {y:2024,m:1,ca:162433.0,resto:62987.0,escal:95983.0,shop:3463.0,pass:9564.0},
    {y:2024,m:2,ca:165385.0,resto:71303.0,escal:90991.0,shop:3091.0,pass:8783.0},
    {y:2024,m:3,ca:164313.1,resto:70487.47,escal:90797.81,shop:3027.82,pass:9340.0},
    {y:2024,m:4,ca:177411.63,resto:77232.5,escal:96390.31,shop:3788.82,pass:9079.0},
    {y:2024,m:5,ca:162402.83,resto:68727.91,escal:91074.0,shop:2600.92,pass:8999.0},
    {y:2024,m:6,ca:158001.28,resto:69320.7,escal:86132.91,shop:2547.67,pass:7982.0},
    {y:2024,m:7,ca:153484.17,resto:69607.0,escal:80799.74,shop:3077.43,pass:7089.0},
    {y:2024,m:8,ca:155378.91,resto:65508.37,escal:87412.38,shop:2458.16,pass:7565.0},
    {y:2024,m:9,ca:183210.81,resto:62976.94,escal:117917.78,shop:2316.09,pass:8480.0},
    {y:2024,m:10,ca:182273.84,resto:62368.51,escal:117828.78,shop:2076.55,pass:8831.0},
    {y:2024,m:11,ca:141210.27,resto:56057.73,escal:82191.4,shop:2961.14,pass:8237.0},
    {y:2024,m:12,ca:132913.97,resto:47926.15,escal:82276.61,shop:2711.21,pass:7407.0},
    {y:2025,m:1,ca:153420.16,resto:55208.65,escal:95434.1,shop:2777.41,pass:8930.0},
    {y:2025,m:2,ca:137047.95,resto:49783.32,escal:84614.45,shop:2650.18,pass:7978.0},
    {y:2025,m:3,ca:143757.51,resto:55683.02,escal:84882.39,shop:3192.1,pass:9097.0},
    {y:2025,m:4,ca:148958.93,resto:57637.97,escal:88417.39,shop:2903.57,pass:8405.0},
    {y:2025,m:5,ca:157069.36,resto:54810.99,escal:99849.07,shop:2409.3,pass:7815.0},
    {y:2025,m:6,ca:202247.74,resto:50305.04,escal:149715.89,shop:2226.81,pass:7066.0},
    {y:2025,m:7,ca:131397.15,resto:55217.85,escal:73331.14,shop:2848.16,pass:6827.0},
    {y:2025,m:8,ca:128142.88,resto:49253.79,escal:76398.09,shop:2491.0,pass:6750.0},
    {y:2025,m:9,ca:130169.16,resto:45220.05,escal:82250.87,shop:2698.24,pass:7673.0},
    {y:2025,m:10,ca:130320.4,resto:44359.48,escal:83410.35,shop:2550.57,pass:8570.0},
    {y:2025,m:11,ca:111189.1,resto:36911.25,escal:72535.85,shop:1742.0,pass:6891.0},
    {y:2025,m:12,ca:102350.77,resto:32686.71,escal:67167.11,shop:2496.95,pass:6407.0},
    {y:2026,m:1,ca:119724.14,resto:36005.71,escal:81258.43,shop:2460.0,pass:8128.0},
    {y:2026,m:2,ca:114786.09,resto:39743.23,escal:73213.95,shop:1828.91,pass:7972.0},
    {y:2026,m:3,ca:123738.06,resto:45531.63,escal:75805.71,shop:2400.72,pass:8651.0},
    {y:2026,m:4,ca:126772.43,resto:48218.82,escal:76080.23,shop:2473.38,pass:8678.0},
    {y:2026,m:5,ca:120935.58,resto:39945.78,escal:78826.35,shop:2163.45,pass:7443.0},
    {y:2026,m:6,ca:109162.89,resto:38899.8,escal:68666.33,shop:1596.76,pass:6698.0},
    {y:2026,m:7,ca:100587.67,resto:36100.31,escal:62659.75,shop:1827.61,pass:6354.0},
    {y:2026,m:8,ca:109336.62,resto:36804.96,escal:70683.33,shop:1848.33,pass:6928.0},
  ],
  bl3: [
    {y:2025,m:7,ca:8981.82,resto:994.3,escal:7495.21,shop:492.31,pass:1229.0},
    {y:2025,m:8,ca:14483.69,resto:1488.33,escal:12496.39,shop:498.97,pass:1594.0},
    {y:2025,m:9,ca:25545.33,resto:2074.08,escal:22523.24,shop:948.01,pass:2431.0},
    {y:2025,m:10,ca:21580.08,resto:1489.16,escal:19547.39,shop:543.53,pass:2561.0},
    {y:2025,m:11,ca:19753.45,resto:1581.52,escal:17660.09,shop:511.84,pass:2220.0},
    {y:2025,m:12,ca:15141.1,resto:1490.78,escal:13179.62,shop:470.7,pass:1983.0},
    {y:2026,m:1,ca:22713.77,resto:1965.31,escal:20140.67,shop:607.79,pass:2976.0},
    {y:2026,m:2,ca:18550.74,resto:1496.74,escal:16562.66,shop:491.34,pass:2258.0},
    {y:2026,m:3,ca:20215.79,resto:1680.41,escal:17808.62,shop:726.76,pass:2958.0},
    {y:2026,m:4,ca:20089.33,resto:1479.92,escal:17942.67,shop:666.74,pass:2963.0},
    {y:2026,m:5,ca:32108.03,resto:1364.82,escal:30123.0,shop:620.21,pass:2802.0},
    {y:2026,m:6,ca:30739.94,resto:1167.06,escal:28904.85,shop:668.03,pass:2681.0},
    {y:2026,m:7,ca:25297.18,resto:983.2,escal:23771.32,shop:542.66,pass:2355.0},
    {y:2026,m:8,ca:20649.66,resto:1055.28,escal:19036.37,shop:558.01,pass:2283.0},
  ],
};

/* ------------------------------------------------------------------ */

const C = {
  bg: "#E8EAED",
  card: "#FFFFFF",
  ink: "#141C25",
  line: "#D2D7DE",
  muted: "#6C7684",
  ca: "#141C25",
  escal: "#1F6F78",
  resto: "#D0692C",
  shop: "#7E57A6",
  bl1: "#2C4A6E",
  bl3: "#1F6F78",
};

const MOIS = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];

/* Séparateur de milliers : espace insécable, rendu de façon identique
   quelle que soit la locale du navigateur. */
const SEP = "\u00A0";
const group = (n, dec = 0) => {
  const v = Number(n).toFixed(dec);
  const [i, d] = v.split(".");
  const neg = i.startsWith("-");
  const body = (neg ? i.slice(1) : i).replace(/\B(?=(\d{3})+(?!\d))/g, SEP);
  return (neg ? "−" + body : body) + (d ? "," + d : "");
};

const n0 = (n) => (n == null ? "—" : group(n));
const eur = (n) => (n == null ? "—" : group(n) + SEP + "€");
const num = (n) => (n == null ? "—" : group(n));
const pct = (n) =>
  n == null || !isFinite(n) ? "—" : (n >= 0 ? "+" : "−") + Math.abs(n * 100).toFixed(1) + SEP + "%";
const axisK = (v) => group(v / 1000) + SEP + "k";

const key = (r) => r.y * 100 + r.m;
const label = (r) => `${MOIS[r.m - 1]} ${String(r.y).slice(2)}`;

/* ------------------------------------------------------------------ */

function Kpi({ label: l, value, sub, tone }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.line}`, borderRadius: 4,
      padding: "14px 16px", flex: "1 1 150px", minWidth: 140,
      borderTop: `3px solid ${tone || C.ink}`,
    }}>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{l}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: C.ink, letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Panel({ title, right, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 4, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.ink }}>{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function Toggle({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)} style={{
          padding: "5px 11px", fontSize: 12, borderRadius: 3, cursor: "pointer",
          border: `1px solid ${value === o.v ? C.ink : C.line}`,
          background: value === o.v ? C.ink : "transparent",
          color: value === o.v ? "#fff" : C.muted, fontWeight: value === o.v ? 600 : 400,
        }}>{o.l}</button>
      ))}
    </div>
  );
}

const tipStyle = {
  contentStyle: { background: C.card, border: `1px solid ${C.line}`, borderRadius: 3, fontSize: 12 },
  formatter: (v, n) => [eur(v), n],
};

/* ------------------------------------------------------------------ */
/*  Vue établissement                                                  */
/* ------------------------------------------------------------------ */

function SiteView({ rows, name, accent }) {
  const years = useMemo(() => [...new Set(rows.map((r) => r.y))].sort(), [rows]);
  const [choix, setYear] = useState(null);
  const [mode, setMode] = useState("mensuel");

  /* Si les données arrivent après le premier rendu, ou si l'exercice choisi
     disparaît, on retombe sur le dernier exercice disponible. */
  const year = choix !== null && years.includes(choix) ? choix : years[years.length - 1];

  const cur = rows.filter((r) => r.y === year).sort((a, b) => a.m - b.m);
  const prev = rows.filter((r) => r.y === year - 1);

  const chart = useMemo(() => {
    let c = { ca: 0, escal: 0, resto: 0, shop: 0 };
    return cur.map((r) => {
      c = { ca: c.ca + r.ca, escal: c.escal + (r.escal || 0),
            resto: c.resto + (r.resto || 0), shop: c.shop + (r.shop || 0) };
      const n1 = prev.find((p) => p.m === r.m);
      return {
        mois: MOIS[r.m - 1],
        "CA exploitation": mode === "cumul" ? c.ca : r.ca,
        "Escalade": mode === "cumul" ? c.escal : r.escal,
        "Restauration": mode === "cumul" ? c.resto : r.resto,
        "Shop": mode === "cumul" ? c.shop : r.shop,
        prevCa: n1 ? n1.ca : null,
      };
    });
  }, [cur, prev, mode]);

  const tot = cur.reduce((a, r) => ({
    ca: a.ca + r.ca, resto: a.resto + (r.resto || 0), escal: a.escal + (r.escal || 0),
    shop: a.shop + (r.shop || 0), pass: a.pass + (r.pass || 0),
  }), { ca: 0, resto: 0, escal: 0, shop: 0, pass: 0 });

  const lastM = cur.length ? cur[cur.length - 1].m : 0;
  const prevYtd = prev.filter((r) => r.m <= lastM).reduce((a, r) => a + r.ca, 0);
  const evo = prevYtd ? tot.ca / prevYtd - 1 : null;

  const mix = [
    { name: "Escalade", value: tot.escal, fill: C.escal },
    { name: "Restauration", value: tot.resto, fill: C.resto },
    { name: "Shop", value: tot.shop, fill: C.shop },
  ].filter((d) => d.value > 0);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: C.ink }}>{name}</div>
          <div style={{ fontSize: 12, color: C.muted }}>
            Exercice {year} · {cur.length} mois enregistrés
          </div>
        </div>
        <Toggle options={years.map((y) => ({ v: y, l: String(y) }))} value={year} onChange={setYear} />
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Kpi label={`CA cumulé ${year}`} value={eur(tot.ca)}
             sub={evo == null ? `${lastM} mois` : `${pct(evo)} vs ${year - 1} (à fin ${MOIS[lastM-1]})`}
             tone={accent} />
        <Kpi label="Escalade" value={eur(tot.escal)}
             sub={`${group((tot.escal / tot.ca) * 100, 1)} % du CA`} tone={C.escal} />
        <Kpi label="Restauration" value={eur(tot.resto)}
             sub={`${group((tot.resto / tot.ca) * 100, 1)} % du CA`} tone={C.resto} />
        <Kpi label="Shop" value={eur(tot.shop)}
             sub={`${group((tot.shop / tot.ca) * 100, 1)} % du CA`} tone={C.shop} />
        <Kpi label="Passages" value={num(tot.pass)}
             sub={cur.length ? `${num(tot.pass / cur.length)} par mois en moyenne` : "—"} tone={C.muted} />
      </div>

      <Panel title="Évolution du CA par activité"
             right={<Toggle options={[{ v: "mensuel", l: "Mensuel" }, { v: "cumul", l: "Cumulé" }]}
                            value={mode} onChange={setMode} />}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chart} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={C.line} strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.muted }} axisLine={{ stroke: C.line }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: C.muted }} tickFormatter={axisK}
                   axisLine={false} tickLine={false} width={42} />
            <Tooltip {...tipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="CA exploitation" stroke={C.ca} strokeWidth={2.4} dot={{ r: 2.5 }} />
            <Line type="monotone" dataKey="Escalade" stroke={C.escal} strokeWidth={1.8} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="Restauration" stroke={C.resto} strokeWidth={1.8} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="Shop" stroke={C.shop} strokeWidth={1.8} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
        <Panel title={`Répartition du CA ${year}`}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={mix} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={2}>
                {mix.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip {...tipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title={`Comparaison mensuelle ${year} / ${year - 1}`}>
          {prev.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chart.map((d) => ({ mois: d.mois, [String(year)]: d["CA exploitation"],
                                                  [String(year - 1)]: d.prevCa }))}>
                <CartesianGrid stroke={C.line} strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.muted }} axisLine={{ stroke: C.line }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} tickFormatter={axisK}
                       axisLine={false} tickLine={false} width={42} />
                <Tooltip {...tipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey={String(year - 1)} fill={C.line} />
                <Bar dataKey={String(year)} fill={accent} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ fontSize: 13, color: C.muted, padding: "70px 0", textAlign: "center" }}>
              Première année d'exploitation — pas d'exercice précédent à comparer.
            </div>
          )}
        </Panel>
      </div>

      <Panel title={`Détail mensuel ${year}`}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12,
                          fontVariantNumeric: "tabular-nums" }}>
            <thead>
              <tr style={{ color: C.muted, textAlign: "right" }}>
                <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Mois</th>
                {["CA exploitation", "Escalade", "Restauration", "Shop", "Passages", "Var. m-1"].map((h) => (
                  <th key={h} style={{ padding: "6px 8px", fontWeight: 500 }}>{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {cur.map((r, i) => {
                const v = i > 0 ? r.ca / cur[i - 1].ca - 1 : null;
                return (
                  <tr key={r.m} style={{ borderTop: `1px solid ${C.line}`, textAlign: "right" }}>
                    <td style={{ textAlign: "left", padding: "6px 8px", color: C.ink }}>{MOIS[r.m - 1]}</td>
                    <td style={{ padding: "6px 8px", fontWeight: 600 }}>{eur(r.ca)}</td>
                    <td style={{ padding: "6px 8px" }}>{eur(r.escal)}</td>
                    <td style={{ padding: "6px 8px" }}>{eur(r.resto)}</td>
                    <td style={{ padding: "6px 8px" }}>{eur(r.shop)}</td>
                    <td style={{ padding: "6px 8px" }}>{num(r.pass)}</td>
                    <td style={{ padding: "6px 8px", color: v == null ? C.muted : v >= 0 ? C.escal : C.resto }}>
                      {pct(v)}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ borderTop: `2px solid ${C.ink}`, textAlign: "right", fontWeight: 600 }}>
                <td style={{ textAlign: "left", padding: "8px" }}>Total</td>
                <td style={{ padding: "8px" }}>{eur(tot.ca)}</td>
                <td style={{ padding: "8px" }}>{eur(tot.escal)}</td>
                <td style={{ padding: "8px" }}>{eur(tot.resto)}</td>
                <td style={{ padding: "8px" }}>{eur(tot.shop)}</td>
                <td style={{ padding: "8px" }}>{num(tot.pass)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Vue consolidée                                                     */
/* ------------------------------------------------------------------ */

function ConsoView({ bl1, bl3 }) {
  const [mode, setMode] = useState("mensuel");
  const [choix, setYear] = useState(null);

  const months = useMemo(() => {
    const ks = [...new Set([...bl1, ...bl3].map(key))].sort();
    const start = Math.min(...bl3.map(key));
    return ks.filter((k) => k >= start);
  }, [bl1, bl3]);

  const allRows = months.map((k) => {
    const a = bl1.find((r) => key(r) === k) || {};
    const b = bl3.find((r) => key(r) === k) || {};
    const s = (x, y) => (x || 0) + (y || 0);
    return {
      k, y: Math.floor(k / 100), mois: label({ y: Math.floor(k / 100), m: k % 100 }),
      a1: a.ca || 0, r1: a.resto || 0, e1: a.escal || 0, s1: a.shop || 0, p1: a.pass || 0,
      a3: b.ca || 0, r3: b.resto || 0, e3: b.escal || 0, s3: b.shop || 0, p3: b.pass || 0,
      ca: s(a.ca, b.ca), resto: s(a.resto, b.resto),
      escal: s(a.escal, b.escal), shop: s(a.shop, b.shop),
      pass: s(a.pass, b.pass),
    };
  });

  const years = [...new Set(allRows.map((r) => r.y))].sort();
  const year = choix === "all" || (choix !== null && years.includes(choix))
    ? choix
    : years[years.length - 1];
  const rows = year === "all" ? allRows : allRows.filter((r) => r.y === year);

  const chart = useMemo(() => {
    let c = { ca: 0, escal: 0, resto: 0, shop: 0 };
    return rows.map((r) => {
      c = { ca: c.ca + r.ca, escal: c.escal + r.escal, resto: c.resto + r.resto, shop: c.shop + r.shop };
      return {
        mois: r.mois,
        "CA exploitation": mode === "cumul" ? c.ca : r.ca,
        "Escalade": mode === "cumul" ? c.escal : r.escal,
        "Restauration": mode === "cumul" ? c.resto : r.resto,
        "Shop": mode === "cumul" ? c.shop : r.shop,
        BL1: r.a1, BL3: r.a3,
      };
    });
  }, [rows, mode]);

  const sum = (list) => list.reduce((a, r) => ({
    ca: a.ca + r.ca, resto: a.resto + r.resto, escal: a.escal + r.escal,
    shop: a.shop + r.shop, pass: a.pass + r.pass,
    a1: a.a1 + r.a1, a3: a.a3 + r.a3, p1: a.p1 + r.p1, p3: a.p3 + r.p3,
    r1: a.r1 + r.r1, e1: a.e1 + r.e1, s1: a.s1 + r.s1,
    r3: a.r3 + r.r3, e3: a.e3 + r.e3, s3: a.s3 + r.s3,
  }), { ca:0,resto:0,escal:0,shop:0,pass:0,a1:0,a3:0,p1:0,p3:0,r1:0,e1:0,s1:0,r3:0,e3:0,s3:0 });

  const T = sum(rows);

  /* CA de l'année précédente, limité aux mêmes mois, pour la comparaison */
  const lastM = rows.length ? rows[rows.length - 1].k % 100 : 0;
  const prevY = year === "all" ? [] : allRows.filter((r) => r.y === year - 1 && r.k % 100 <= lastM);
  const evoY = prevY.length ? T.ca / sum(prevY).ca - 1 : null;

  const donut = [
    { name: "Boulder Line 1", value: T.a1, fill: C.bl1 },
    { name: "Boulder Line 3", value: T.a3, fill: C.bl3 },
  ];

  const last = rows[rows.length - 1];
  const prevMonth = rows[rows.length - 2];
  const periode = year === "all" ? "la période" : String(year);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: C.ink }}>Groupe Boulder Line</div>
          <div style={{ fontSize: 12, color: C.muted }}>
            {year === "all"
              ? `Depuis l'ouverture de BL3 · ${rows.length} mois`
              : `Exercice ${year} · ${rows.length} mois enregistrés`}
          </div>
        </div>
        <Toggle
          options={[...years.map((y) => ({ v: y, l: String(y) })), { v: "all", l: "Tout" }]}
          value={year} onChange={setYear} />
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Kpi label={`CA groupe ${periode}`} value={eur(T.ca)}
             sub={evoY == null
               ? `BL1 ${eur(T.a1)} · BL3 ${eur(T.a3)}`
               : `${pct(evoY)} vs ${year - 1} à fin ${MOIS[lastM - 1]}`} tone={C.ink} />
        <Kpi label={`Escalade ${periode}`} value={eur(T.escal)}
             sub={`${group((T.escal / T.ca) * 100, 1)} % du CA`} tone={C.escal} />
        <Kpi label={`Restauration ${periode}`} value={eur(T.resto)}
             sub={`${group((T.resto / T.ca) * 100, 1)} % du CA`} tone={C.resto} />
        <Kpi label={`Shop ${periode}`} value={eur(T.shop)}
             sub={`${group((T.shop / T.ca) * 100, 1)} % du CA`} tone={C.shop} />
        <Kpi label={`Passages ${periode}`} value={num(T.pass)}
             sub={T.pass
               ? `BL1 ${group((T.p1 / T.pass) * 100, 1)} % · BL3 ${group((T.p3 / T.pass) * 100, 1)} %`
               : "—"} tone={C.muted} />
      </div>

      <Panel title={`Dernier mois clôturé · ${last.mois}`}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Kpi label="CA groupe du mois" value={eur(last.ca)}
               sub={prevMonth ? `${pct(last.ca / prevMonth.ca - 1)} vs ${prevMonth.mois}` :
                    `BL1 ${eur(last.a1)} · BL3 ${eur(last.a3)}`} tone={C.ink} />
          <Kpi label="Escalade" value={eur(last.escal)}
               sub={`BL1 ${eur(last.e1)} · BL3 ${eur(last.e3)}`} tone={C.escal} />
          <Kpi label="Restauration" value={eur(last.resto)}
               sub={`BL1 ${eur(last.r1)} · BL3 ${eur(last.r3)}`} tone={C.resto} />
          <Kpi label="Shop" value={eur(last.shop)}
               sub={`BL1 ${eur(last.s1)} · BL3 ${eur(last.s3)}`} tone={C.shop} />
        </div>
      </Panel>

      <Panel title="CA du groupe par activité"
             right={<Toggle options={[{ v: "mensuel", l: "Mensuel" }, { v: "cumul", l: "Cumulé" }]}
                            value={mode} onChange={setMode} />}>
        <ResponsiveContainer width="100%" height={310}>
          <LineChart data={chart} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={C.line} strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.muted }} axisLine={{ stroke: C.line }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: C.muted }} tickFormatter={axisK}
                   axisLine={false} tickLine={false} width={46} />
            <Tooltip {...tipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="CA exploitation" stroke={C.ca} strokeWidth={2.4} dot={{ r: 2.5 }} />
            <Line type="monotone" dataKey="Escalade" stroke={C.escal} strokeWidth={1.8} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="Restauration" stroke={C.resto} strokeWidth={1.8} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="Shop" stroke={C.shop} strokeWidth={1.8} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
        <Panel title="CA mensuel par établissement">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chart}>
              <CartesianGrid stroke={C.line} strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 10, fill: C.muted }} axisLine={{ stroke: C.line }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.muted }} tickFormatter={axisK}
                     axisLine={false} tickLine={false} width={46} />
              <Tooltip {...tipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="BL1" stackId="a" fill={C.bl1} />
              <Bar dataKey="BL3" stackId="a" fill={C.bl3} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Contribution au CA du groupe">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={donut} dataKey="value" nameKey="name" innerRadius={60} outerRadius={92} paddingAngle={2}>
                {donut.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip {...tipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="Récapitulatif du CA par mois">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5,
                          fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
            <thead>
              <tr style={{ color: C.muted }}>
                <th rowSpan={2} style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500,
                                         borderBottom: `1px solid ${C.line}` }}>Mois</th>
                <th colSpan={4} style={{ padding: "4px 8px", fontWeight: 600, color: C.bl1,
                                         borderBottom: `1px solid ${C.line}` }}>Boulder Line 1</th>
                <th colSpan={4} style={{ padding: "4px 8px", fontWeight: 600, color: C.bl3,
                                         borderBottom: `1px solid ${C.line}`, borderLeft: `1px solid ${C.line}` }}>Boulder Line 3</th>
                <th colSpan={4} style={{ padding: "4px 8px", fontWeight: 600, color: C.ink,
                                         borderBottom: `1px solid ${C.line}`, borderLeft: `1px solid ${C.line}` }}>Groupe</th>
              </tr>
              <tr style={{ color: C.muted, fontSize: 11 }}>
                {[0, 1, 2].map((g) =>
                  ["CA", "Resto", "Escalade", "Shop"].map((h, i) => (
                    <th key={g + "-" + i} style={{ padding: "4px 8px", fontWeight: 500, textAlign: "right",
                                                   borderBottom: `1px solid ${C.line}`,
                                                   borderLeft: i === 0 && g > 0 ? `1px solid ${C.line}` : "none" }}>{h}</th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.k} style={{ borderBottom: `1px solid ${C.line}`, textAlign: "right" }}>
                  <td style={{ textAlign: "left", padding: "6px 8px", color: C.ink }}>{r.mois}</td>
                  <td style={{ padding: "6px 8px", fontWeight: 600 }}>{n0(r.a1)}</td>
                  <td style={{ padding: "6px 8px" }}>{n0(r.r1)}</td>
                  <td style={{ padding: "6px 8px" }}>{n0(r.e1)}</td>
                  <td style={{ padding: "6px 8px" }}>{n0(r.s1)}</td>
                  <td style={{ padding: "6px 8px", fontWeight: 600, borderLeft: `1px solid ${C.line}` }}>{n0(r.a3)}</td>
                  <td style={{ padding: "6px 8px" }}>{n0(r.r3)}</td>
                  <td style={{ padding: "6px 8px" }}>{n0(r.e3)}</td>
                  <td style={{ padding: "6px 8px" }}>{n0(r.s3)}</td>
                  <td style={{ padding: "6px 8px", fontWeight: 600, borderLeft: `1px solid ${C.line}` }}>{n0(r.ca)}</td>
                  <td style={{ padding: "6px 8px" }}>{n0(r.resto)}</td>
                  <td style={{ padding: "6px 8px" }}>{n0(r.escal)}</td>
                  <td style={{ padding: "6px 8px" }}>{n0(r.shop)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: `2px solid ${C.ink}`, textAlign: "right", fontWeight: 600 }}>
                <td style={{ textAlign: "left", padding: "8px" }}>Total</td>
                <td style={{ padding: "8px" }}>{n0(T.a1)}</td>
                <td style={{ padding: "8px" }}>{n0(T.r1)}</td>
                <td style={{ padding: "8px" }}>{n0(T.e1)}</td>
                <td style={{ padding: "8px" }}>{n0(T.s1)}</td>
                <td style={{ padding: "8px", borderLeft: `1px solid ${C.line}` }}>{n0(T.a3)}</td>
                <td style={{ padding: "8px" }}>{n0(T.r3)}</td>
                <td style={{ padding: "8px" }}>{n0(T.e3)}</td>
                <td style={{ padding: "8px" }}>{n0(T.s3)}</td>
                <td style={{ padding: "8px", borderLeft: `1px solid ${C.line}` }}>{n0(T.ca)}</td>
                <td style={{ padding: "8px" }}>{n0(T.resto)}</td>
                <td style={{ padding: "8px" }}>{n0(T.escal)}</td>
                <td style={{ padding: "8px" }}>{n0(T.shop)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
          Montants en euros. Période démarrant à l'ouverture de BL3 en juillet 2025.
        </div>
      </Panel>

      <Panel title="Passages par mois et par établissement">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12,
                          fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
            <thead>
              <tr style={{ color: C.muted }}>
                <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500,
                             borderBottom: `1px solid ${C.line}` }}>Mois</th>
                {["Boulder Line 1", "Boulder Line 3", "Total groupe", "Part BL3", "Var. m-1"].map((h) => (
                  <th key={h} style={{ padding: "6px 8px", fontWeight: 500, textAlign: "right",
                                       borderBottom: `1px solid ${C.line}` }}>{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const v = i > 0 && rows[i - 1].pass ? r.pass / rows[i - 1].pass - 1 : null;
                return (
                  <tr key={r.k} style={{ borderBottom: `1px solid ${C.line}`, textAlign: "right" }}>
                    <td style={{ textAlign: "left", padding: "6px 8px", color: C.ink }}>{r.mois}</td>
                    <td style={{ padding: "6px 8px" }}>{num(r.p1)}</td>
                    <td style={{ padding: "6px 8px" }}>{num(r.p3)}</td>
                    <td style={{ padding: "6px 8px", fontWeight: 600 }}>{num(r.pass)}</td>
                    <td style={{ padding: "6px 8px", color: C.muted }}>
                      {r.pass ? group((r.p3 / r.pass) * 100, 1) + " %" : "—"}
                    </td>
                    <td style={{ padding: "6px 8px", color: v == null ? C.muted : v >= 0 ? C.escal : C.resto }}>
                      {pct(v)}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ borderTop: `2px solid ${C.ink}`, textAlign: "right", fontWeight: 600 }}>
                <td style={{ textAlign: "left", padding: "8px" }}>Total</td>
                <td style={{ padding: "8px" }}>{num(T.p1)}</td>
                <td style={{ padding: "8px" }}>{num(T.p3)}</td>
                <td style={{ padding: "8px" }}>{num(T.pass)}</td>
                <td style={{ padding: "8px", color: C.muted }}>
                  {T.pass ? group((T.p3 / T.pass) * 100, 1) + " %" : "—"}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const dateFR = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d) ? null
    : d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) +
      " à " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

export default function App() {
  const [tab, setTab] = useState("conso");
  const [data, setData] = useState(RAW);
  const [src, setSrc] = useState({ etat: "chargement" });

  async function charger() {
    setSrc({ etat: "chargement" });
    try {
      const r = await fetch("/api/data", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok || j.error) throw new Error(j.error || `Erreur ${r.status}`);
      setData({ bl1: j.bl1, bl3: j.bl3 });
      setSrc({ etat: "sheets", le: dateFR(j.generated) });
    } catch (e) {
      setData(RAW);
      setSrc({ etat: "secours", msg: String(e.message || e) });
    }
  }

  useEffect(() => { charger(); }, []);

  const last = data.bl1[data.bl1.length - 1];

  const tabs = [
    { v: "conso", l: "Consolidé" },
    { v: "bl1", l: "Boulder Line 1" },
    { v: "bl3", l: "Boulder Line 3" },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100%", padding: 18,
                  fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif", color: C.ink }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end",
                         gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 650, letterSpacing: "-0.03em" }}>
              Suivi du chiffre d'affaires
            </h1>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>
              Boulder Line · dernier mois clôturé : {MOIS[last.m - 1]} {last.y}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, color: src.etat === "secours" ? C.resto : C.muted,
                          textAlign: "right", lineHeight: 1.5, maxWidth: 320 }}>
              {src.etat === "chargement" && "Lecture des fichiers Google Sheets…"}
              {src.etat === "sheets" && (
                <>Données lues dans Google Sheets<br />{src.le ? "Le " + src.le : ""}</>
              )}
              {src.etat === "secours" && (
                <>Sheets injoignable, affichage de l'instantané d'août 2026<br />{src.msg}</>
              )}
            </div>
            <button onClick={charger} disabled={src.etat === "chargement"} style={{
              padding: "8px 14px", fontSize: 12.5, borderRadius: 3,
              cursor: src.etat === "chargement" ? "default" : "pointer",
              border: `1px solid ${C.ink}`, background: C.ink, color: "#fff", fontWeight: 500,
              opacity: src.etat === "chargement" ? 0.5 : 1,
            }}>Actualiser</button>
          </div>
        </header>

        <div style={{ display: "flex", gap: 2, marginBottom: 16, borderBottom: `1px solid ${C.line}` }}>
          {tabs.map((t) => (
            <button key={t.v} onClick={() => setTab(t.v)} style={{
              padding: "9px 16px", fontSize: 13.5, cursor: "pointer", background: "none",
              border: "none", borderBottom: `2px solid ${tab === t.v ? C.ink : "transparent"}`,
              color: tab === t.v ? C.ink : C.muted, fontWeight: tab === t.v ? 600 : 400,
              marginBottom: -1,
            }}>{t.l}</button>
          ))}
        </div>

        {tab === "conso" && <ConsoView bl1={data.bl1} bl3={data.bl3} />}
        {tab === "bl1" && <SiteView rows={data.bl1} name="Boulder Line 1" accent={C.bl1} />}
        {tab === "bl3" && <SiteView rows={data.bl3} name="Boulder Line 3" accent={C.bl3} />}

        <footer style={{ fontSize: 11, color: C.muted, marginTop: 20, paddingTop: 12,
                         borderTop: `1px solid ${C.line}` }}>
          Source : fichiers Google Sheets BL1_Suivi CA et BL3_Suivi CA, relus à chaque chargement.
          Les mois dont le CA n'est pas encore saisi sont exclus automatiquement.
        </footer>
      </div>
    </div>
  );
}
