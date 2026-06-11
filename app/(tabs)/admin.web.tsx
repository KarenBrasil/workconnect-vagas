import React, { useState, useEffect } from "react";
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie
} from "recharts";
import { collection, query, limit, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../src/services/firebaseConfig';
import { ActivityIndicator } from 'react-native';

/* ── Design tokens (TechConnect system) ───────────────────── */
const T = {
  green:      "#7AE04A",
  greenDark:  "#2B6010",
  greenBg:    "#EDFBE3",
  purple:     "#7C3AED",
  purpleBg:   "#EDE9FE",
  bg:         "#F4F4F7",
  surface:    "#FFFFFF",
  text:       "#111111",
  sub:        "#7A7A8A",
  border:     "#E8E8EE",
  font:       "'DM Sans', 'Segoe UI', sans-serif",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: ${T.font}; background: ${T.bg}; }

.admin-shell {
  width: 100%;
  max-width: 480px;
  min-height: 100vh;
  background: ${T.bg};
  font-family: ${T.font};
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 100px;
  scrollbar-width: none;
  margin: 0 auto;
}
.admin-shell::-webkit-scrollbar { display: none; }

/* Header */
.adm-header {
  background: ${T.surface};
  padding: 52px 20px 16px;
  border-bottom: 1px solid ${T.border};
}
.adm-header-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.adm-title {
  font-size: 20px; font-weight: 800; color: ${T.text};
}
.adm-badge {
  background: ${T.purpleBg}; color: ${T.purple};
  font-size: 11px; font-weight: 700; padding: 4px 10px;
  border-radius: 100px; letter-spacing: .02em;
}

/* Tabs */
.adm-tabs {
  display: flex; background: #EDEDF2; border-radius: 12px;
  padding: 3px; gap: 3px;
}
.adm-tab {
  flex: 1; text-align: center; padding: 9px 0;
  border-radius: 9px; font-size: 12px; font-weight: 700;
  color: ${T.sub}; cursor: pointer; transition: all .18s;
  font-family: ${T.font};
}
.adm-tab.on {
  background: ${T.surface}; color: ${T.purple};
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
}

/* Sections */
.adm-section { padding: 18px 20px 0; }
.adm-section-title {
  font-size: 15px; font-weight: 800; color: ${T.text};
  margin-bottom: 12px; display: flex; align-items: center;
  justify-content: space-between;
}
.adm-section-title span {
  font-size: 11.5px; font-weight: 600; color: ${T.green};
  cursor: pointer;
}

/* Cards */
.card {
  background: ${T.surface}; border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
  padding: 16px; margin-bottom: 12px;
}

/* KPI row */
.kpi-row { display: flex; gap: 10px; margin-bottom: 12px; }
.kpi-card {
  flex: 1; background: ${T.surface}; border-radius: 16px;
  padding: 14px 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
}
.kpi-label {
  font-size: 10.5px; font-weight: 600; color: ${T.sub};
  letter-spacing: .04em; text-transform: uppercase; margin-bottom: 6px;
}
.kpi-value {
  font-size: 28px; font-weight: 800; color: ${T.text};
  line-height: 1; margin-bottom: 4px;
}
.kpi-sub {
  font-size: 10.5px; color: ${T.sub};
}
.kpi-icon {
  width: 32px; height: 32px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; margin-bottom: 8px;
}

/* NPS Card */
.nps-card {
  background: linear-gradient(135deg, #0F0F18 0%, #1A0A3A 100%);
  border-radius: 18px; padding: 18px;
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
  box-shadow: 0 4px 20px rgba(124,58,237,.2);
}
.nps-left {}
.nps-label {
  font-size: 10.5px; font-weight: 600; color: rgba(255,255,255,.45);
  letter-spacing: .06em; text-transform: uppercase; margin-bottom: 4px;
}
.nps-value {
  font-size: 52px; font-weight: 800; color: ${T.green};
  line-height: 1; letter-spacing: -2px;
}
.nps-desc {
  font-size: 10.5px; color: rgba(255,255,255,.35); margin-top: 4px;
}
.nps-ring {
  width: 80px; height: 80px; position: relative;
  display: flex; align-items: center; justify-content: center;
}
.nps-ring-label {
  position: absolute; font-size: 10px; font-weight: 700;
  color: rgba(255,255,255,.6); text-align: center; line-height: 1.2;
}

/* Metric rows */
.metric-item {
  display: flex; flex-direction: column; gap: 6px;
  padding: 10px 0; border-bottom: 1px solid ${T.border};
}
.metric-item:last-child { border-bottom: none; }
.metric-header {
  display: flex; align-items: center; justify-content: space-between;
}
.metric-name { font-size: 12.5px; font-weight: 600; color: ${T.text}; }
.metric-score {
  font-size: 13px; font-weight: 800; color: ${T.text};
}
.metric-bar-bg {
  height: 6px; background: #F0F0F5; border-radius: 3px; overflow: hidden;
}
.metric-bar-fill {
  height: 100%; border-radius: 3px;
  transition: width .6s ease;
}

/* Feedback card */
.feedback-card {
  background: ${T.surface}; border-radius: 16px;
  padding: 14px; margin-bottom: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,.05);
  border-left: 3px solid ${T.green};
}
.feedback-quote {
  font-size: 13px; font-weight: 500; color: ${T.text};
  line-height: 1.55; margin-bottom: 8px;
  font-style: italic;
}
.feedback-meta {
  font-size: 10.5px; color: ${T.sub};
}

/* User table */
.user-row {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 0; border-bottom: 1px solid ${T.border};
}
.user-row:last-child { border-bottom: none; }
.user-av {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, ${T.green}, #3DC43D);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; color: ${T.greenDark};
  flex-shrink: 0;
}
.user-av-p {
  background: linear-gradient(135deg, ${T.purple}, #5B21B6);
  color: #fff;
}
.user-name { font-size: 13px; font-weight: 700; color: ${T.text}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
.user-email { font-size: 11px; color: ${T.sub}; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
.user-badge {
  margin-left: auto; font-size: 10px; font-weight: 700;
  padding: 3px 9px; border-radius: 100px;
}
.user-badge-admin { background: ${T.purpleBg}; color: ${T.purple}; }
.user-badge-user { background: ${T.greenBg}; color: ${T.greenDark}; }

/* Tooltip custom */
.custom-tooltip {
  background: ${T.surface}; border-radius: 10px;
  padding: 8px 12px; box-shadow: 0 4px 16px rgba(0,0,0,.1);
  font-family: ${T.font}; font-size: 12px; font-weight: 600;
  color: ${T.text}; border: 1px solid ${T.border};
}
`;

/* ── Custom Tooltip ───────────────────────────────────────── */
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="custom-tooltip">
        {payload[0].value.toFixed(1)} / 5
      </div>
    );
  }
  return null;
};

/* ── NPS Ring using SVG ───────────────────────────────────── */
function NpsRing({ value }: { value: number }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  // If value is -100 to 100, normalize it to 0-1 for the ring length
  const pct = Math.max(0, (value + 100) / 200); 
  const dash = circ * pct;
  return (
    <div className="nps-ring">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="6"/>
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke="#7AE04A" strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke="#7C3AED" strokeWidth="6"
          strokeDasharray={`${circ * .15} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(${-90 + pct * 360} 40 40)`}
          opacity=".6"
        />
      </svg>
      <div className="nps-ring-label">NPS<br/>Score</div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
export default function AdminScreenWeb() {
  const [tab, setTab] = useState("feedback");
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const qUsers = query(collection(db, 'users'), orderBy('criadoEm', 'desc'), limit(100));
    const qAvaliacoes = query(collection(db, 'avaliacoes'), orderBy('criadoEm', 'desc'));

    let usersLoaded = false;
    let avLoaded = false;

    const checkLoading = () => {
      if (usersLoaded && avLoaded) setLoading(false);
    };

    const unsubUsers = onSnapshot(qUsers, (snap) => {
      setUsuarios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      usersLoaded = true;
      checkLoading();
    }, (error) => {
      console.error("Erro users:", error);
      usersLoaded = true;
      checkLoading();
    });

    const unsubAv = onSnapshot(qAvaliacoes, (snap) => {
      setAvaliacoes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      avLoaded = true;
      checkLoading();
    }, (error) => {
      console.error("Erro avaliacoes:", error);
      avLoaded = true;
      checkLoading();
    });

    return () => {
      unsubUsers();
      unsubAv();
    };
  }, []);

  // Process data
  let validSurveys = avaliacoes.filter(a => a.status === 'completed' || a.respostas);
  const totalSurveys = validSurveys.length;
  
  let designAvg = 0, navAvg = 0, filterAvg = 0, qualityAvg = 0, fluxoAvg = 0, resolucaoAvg = 0;
  let promoters = 0, detractors = 0, npsTotal = 0;
  let writtenFeedbacks: any[] = [];

  validSurveys.forEach(s => {
    const r = s.respostas || {};
    
    // Calcula notas das questões que usam scale (0 a 4 => 1 a 5)
    if (r[2]?.scale !== undefined) designAvg += r[2].scale + 1;
    if (r[3]?.scale !== undefined) navAvg += r[3].scale + 1;
    if (r[4]?.scale !== undefined) filterAvg += r[4].scale + 1;
    if (r[5]?.scale !== undefined) qualityAvg += r[5].scale + 1;
    if (r[7]?.scale !== undefined) fluxoAvg += r[7].scale + 1;
    if (r[9]?.scale !== undefined) resolucaoAvg += r[9].scale + 1;

    // NPS Q10
    if (r[10]?.score !== undefined) {
      npsTotal++;
      if (r[10].score >= 9) promoters++;
      else if (r[10].score <= 6) detractors++;
    }

    // Coletar textos abertos (open) de qualquer questão
    const allOpenTexts = [
      r[10]?.open, r[9]?.open, r[7]?.open, r[5]?.open, r[4]?.open, r[3]?.open, r[2]?.open
    ].filter(txt => txt && txt.trim().length > 3);
    
    if (allOpenTexts.length > 0) {
      // Pega o texto mais longo da pesquisa para exibir como destaque
      const bestText = allOpenTexts.sort((a, b) => b.length - a.length)[0];
      const date = s.criadoEm ? new Date(s.criadoEm).toLocaleDateString() : "Recente";
      writtenFeedbacks.push({ text: bestText, time: date });
    }
  });

  const divisor = totalSurveys || 1;
  const metrics = [
    { name: "Design e Visual",         score: designAvg / divisor, color: "#7C3AED" },
    { name: "Navegação e Usabilidade", score: navAvg / divisor, color: "#7AE04A" },
    { name: "Filtros e Busca",         score: filterAvg / divisor, color: "#06B6D4" },
    { name: "Qualidade das Vagas",     score: qualityAvg / divisor, color: "#F59E0B" },
    { name: "Fluxo de Candidatura",    score: fluxoAvg / divisor, color: "#EF4444" },
    { name: "Resolução de Problemas",  score: resolucaoAvg / divisor, color: "#EC4899" },
  ].map(m => ({ ...m, score: m.score === 0 ? 5.0 : m.score })); // Default 5 se não houver dados ainda

  const avgScore = (metrics.reduce((a, m) => a + m.score, 0) / metrics.length).toFixed(1);

  // Calcula NPS Final (-100 a 100)
  const npsScore = npsTotal > 0 ? Math.round(((promoters - detractors) / npsTotal) * 100) : 50;

  const radarData = metrics.map(m => ({
    subject: m.name.split(" ")[0],
    value: (m.score / 5) * 100,
    fullMark: 100,
  }));

  const barData = metrics.map(m => ({
    name: m.name.split(" e ")[0].split(" ")[0],
    score: m.score,
    color: m.color,
  }));

  const users = usuarios.map((u, i) => {
    const nomeExibido = u.nome || u.email?.split('@')[0] || "Usuário";
    return {
      initials: nomeExibido.substring(0, 2).toUpperCase(),
      name: nomeExibido,
      email: u.email || "",
      role: u.role || "user",
      variant: i % 2 === 0 ? "p" : ""
    };
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: T.bg }}>
        <ActivityIndicator size="large" color={T.purple} />
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="admin-shell">

        {/* Header */}
        <div className="adm-header">
          <div className="adm-header-row">
            <div className="adm-title">Analytics & Admin</div>
            <div className="adm-badge">🔒 Admin</div>
          </div>
          <div className="adm-tabs">
            <div
              className={`adm-tab ${tab === "feedback" ? "on" : ""}`}
              onClick={() => setTab("feedback")}
            >
              Feedbacks
            </div>
            <div
              className={`adm-tab ${tab === "users" ? "on" : ""}`}
              onClick={() => setTab("users")}
            >
              Usuários
            </div>
          </div>
        </div>

        {/* ── TAB: FEEDBACKS ── */}
        {tab === "feedback" && (
          <>
            {/* KPIs */}
            <div className="adm-section">
              <div className="kpi-row">
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: T.greenBg }}>📋</div>
                  <div className="kpi-label">Pesquisas</div>
                  <div className="kpi-value">{avaliacoes.length}</div>
                  <div className="kpi-sub">Iniciadas</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: T.purpleBg }}>⭐</div>
                  <div className="kpi-label">Média geral</div>
                  <div className="kpi-value" style={{ color: T.purple }}>{avgScore}</div>
                  <div className="kpi-sub">de 5.0</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: "#FEF3C7" }}>💬</div>
                  <div className="kpi-label">Feedbacks</div>
                  <div className="kpi-value" style={{ color: "#D97706" }}>{writtenFeedbacks.length}</div>
                  <div className="kpi-sub">Escritos</div>
                </div>
              </div>
            </div>

            {/* NPS */}
            <div className="adm-section">
              <div className="adm-section-title">Net Promoter Score</div>
              <div className="nps-card">
                <div className="nps-left">
                  <div className="nps-label">NPS Score</div>
                  <div className="nps-value">{npsScore}</div>
                  <div className="nps-desc">Baseado em {npsTotal} avaliações NPS</div>
                </div>
                <NpsRing value={npsScore} />
              </div>
            </div>

            {/* Radar Chart */}
            <div className="adm-section">
              <div className="adm-section-title">Visão Geral</div>
              <div className="card" style={{ padding: "16px 8px 8px" }}>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData} margin={{ top: 0, right: 16, bottom: 0, left: 16 }}>
                    <PolarGrid stroke={T.border} />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 10, fill: T.sub, fontFamily: T.font, fontWeight: 600 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke={T.purple}
                      fill={T.purple}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Max"
                      dataKey="fullMark"
                      stroke="transparent"
                      fill="transparent"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="adm-section">
              <div className="adm-section-title">Notas por Categoria</div>
              <div className="card" style={{ padding: "16px 4px 8px" }}>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart
                    data={barData}
                    margin={{ top: 0, right: 8, bottom: 0, left: -16 }}
                    barSize={18}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9.5, fill: T.sub, fontFamily: T.font }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]}
                      tick={{ fontSize: 9, fill: T.sub, fontFamily: T.font }}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,.03)" }}/>
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} opacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Metric detail list */}
            <div className="adm-section">
              <div className="adm-section-title">
                Satisfação (1 a 5)
              </div>
              <div className="card">
                {metrics.map((m, i) => (
                  <div key={i} className="metric-item">
                    <div className="metric-header">
                      <div className="metric-name">{m.name}</div>
                      <div className="metric-score" style={{ color: m.color }}>
                        {m.score.toFixed(1)}
                      </div>
                    </div>
                    <div className="metric-bar-bg">
                      <div
                        className="metric-bar-fill"
                        style={{
                          width: `${(m.score / 5) * 100}%`,
                          background: m.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedbacks escritos */}
            <div className="adm-section">
              <div className="adm-section-title">Feedbacks Escritos</div>
              {writtenFeedbacks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: T.sub, fontSize: 13 }}>
                  Nenhum comentário por escrito ainda.
                </div>
              ) : (
                writtenFeedbacks.map((f, i) => (
                  <div key={i} className="feedback-card">
                    <div style={{
                      fontSize: 20, color: T.green, fontWeight: 800,
                      lineHeight: 1, marginBottom: 6, opacity: .7
                    }}>"</div>
                    <div className="feedback-quote">{f.text}</div>
                    <div className="feedback-meta">{f.time}</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ── TAB: USUÁRIOS ── */}
        {tab === "users" && (
          <>
            {/* Stats */}
            <div className="adm-section">
              <div className="kpi-row">
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: T.greenBg }}>👥</div>
                  <div className="kpi-label">Cadastros</div>
                  <div className="kpi-value">{users.length}</div>
                  <div className="kpi-sub">Total</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: T.purpleBg }}>🔒</div>
                  <div className="kpi-label">Admins</div>
                  <div className="kpi-value" style={{ color: T.purple }}>
                    {users.filter(u => u.role === 'admin').length || 1}
                  </div>
                  <div className="kpi-sub">Conta</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: "#FEF3C7" }}>📅</div>
                  <div className="kpi-label">Novos</div>
                  <div className="kpi-value" style={{ color: "#D97706" }}>{users.length}</div>
                  <div className="kpi-sub">Esta semana</div>
                </div>
              </div>
            </div>

            {/* Pie chart users */}
            <div className="adm-section">
              <div className="adm-section-title">Distribuição de Contas</div>
              <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ResponsiveContainer width={110} height={110}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Usuários", value: users.length },
                        { name: "Admins",   value: 1 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell fill={T.green} />
                      <Cell fill={T.purple} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Usuários", count: users.length, color: T.green },
                    { label: "Admins",   count: 1, color: T.purple },
                  ].map(({ label, count, color }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }}/>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: T.text }}>{label}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color, marginLeft: "auto" }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* User list */}
            <div className="adm-section">
              <div className="adm-section-title">Contas Cadastradas</div>
              <div className="card">
                {users.map((u, i) => (
                  <div key={i} className="user-row">
                    <div className={`user-av ${u.variant === "p" ? "user-av-p" : ""}`}>
                      {u.initials}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div className="user-name">{u.name}</div>
                      <div className="user-email">{u.email}</div>
                    </div>
                    <div className={`user-badge ${u.role === "admin" ? "user-badge-admin" : "user-badge-user"}`}>
                      {u.role === "admin" ? "Admin" : "User"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </>
  );
}
