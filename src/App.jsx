import React, { useMemo, useState, useEffect } from 'react'

const ENDPOINT = import.meta.env.VITE_GAS_ENDPOINT

// ── 多言語辞書 ──
const t = {
  ja: {
    title: '白川郷アンケート（テスト版）',
    langLabel: '言語',
    nationality: '国籍（任意）',
    ageGroup: '年齢層（必須）',
    discovery: '白川郷を知ったきっかけ（任意）',
    snsUsed: '白川郷を調べるために使ったSNS（任意・複数選択可）',
    submit: '送信する',
    sending: '送信中……',
    success: 'ご協力ありがとうございました．',
    error: '送信に失敗しました．時間をおいて再度お試しください．',
    required: '必須',
    select: '選択してください',
    none: '未選択',
    backToLang: '言語を選び直す',
    gateTitle: '言語を選んでください / Please select your language',
    ja: '日本語',
    en: 'English',
    es: 'Español（スペイン語）',
  },
  en: {
    title: 'Shirakawa-go Survey (Test)',
    langLabel: 'Language',
    nationality: 'Nationality (optional)',
    ageGroup: 'Age Group (required)',
    discovery: 'How did you first learn about Shirakawa-go? (optional)',
    snsUsed: 'Which SNS did you use to research Shirakawa-go? (optional, multiple)',
    submit: 'Submit',
    sending: 'Submitting…',
    success: 'Thank you for your cooperation.',
    error: 'Submission failed. Please try again later.',
    required: 'Required',
    select: 'Select…',
    none: 'None',
    backToLang: 'Change language',
    gateTitle: 'Please select your language',
    ja: '日本語',
    en: 'English',
    es: 'Español',
  },
  es: {
    title: 'Encuesta de Shirakawa-go (Prueba)',
    langLabel: 'Idioma',
    nationality: 'Nacionalidad (opcional)',
    ageGroup: 'Grupo de edad (obligatorio)',
    discovery: '¿Cómo conoció Shirakawa-go? (opcional)',
    snsUsed: '¿Qué redes usó para investigar Shirakawa-go? (opcional, múltiples)',
    submit: 'Enviar',
    sending: 'Enviando…',
    success: 'Gracias por su cooperación.',
    error: 'Error al enviar. Inténtelo de nuevo más tarde.',
    required: 'Obligatorio',
    select: 'Seleccione…',
    none: 'Ninguno',
    backToLang: 'Cambiar idioma',
    gateTitle: 'Seleccione su idioma',
    ja: '日本語',
    en: 'English',
    es: 'Español',
  },
}

// ── 選択肢 ──
const AGE = {
  ja: ['18歳未満', '18–24', '25–34', '35–44', '45–54', '55–64', '65歳以上'],
  en: ['Under 18', '18–24', '25–34', '35–44', '45–54', '55–64', '65+'],
  es: ['Menos de 18', '18–24', '25–34', '35–44', '45–54', '55–64', '65+'],
}

const DISCOVERY = {
  ja: ['家族・友人', '旅行ブログ／記事', 'ガイドブック', 'テレビ・ニュース', '学校・職場', 'SNS', 'その他'],
  en: ['Family/Friends', 'Travel blog/article', 'Guidebook', 'TV/News', 'School/Work', 'SNS', 'Other'],
  es: ['Familia/Amigos', 'Blog/Artículo de viajes', 'Guía', 'TV/Noticias', 'Escuela/Trabajo', 'Redes sociales', 'Otro'],
}

const SNS = {
  ja: ['Instagram', 'TikTok', 'YouTube', 'X（Twitter）', 'Facebook'],
  en: ['Instagram', 'TikTok', 'YouTube', 'X (Twitter)', 'Facebook'],
  es: ['Instagram', 'TikTok', 'YouTube', 'X (Twitter)', 'Facebook'],
}

// ── 言語選択ゲート ──
function LanguageGate({ onSelect }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#000', display: 'grid',
      placeItems: 'center', padding: 24
    }}>
      <div style={{
        width: 520, maxWidth: '92vw', background: '#111', color: '#fff',
        borderRadius: 24, padding: '32px 28px', boxShadow: '0 8px 30px rgba(0,0,0,.6)',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: '6px 0 22px', lineHeight: 1.4 }}>
          言語を選んでください / Please select<br/>your language
        </h2>
        <div style={{ display: 'grid', gap: 12 }}>
          <button onClick={() => onSelect('ja')} style={gateBtn}>日本語</button>
          <button onClick={() => onSelect('en')} style={gateBtn}>English</button>
          <button onClick={() => onSelect('es')} style={gateBtn}>Español</button>
        </div>
        <div style={{ marginTop: 18, opacity: .6, fontSize: 12 }}>Demo mode</div>
      </div>
    </div>
  )
}
const gateBtn = {
  width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid #2a2a2a',
  background: '#1e1e1e', color: '#fff', fontWeight: 700, cursor: 'pointer',
  boxShadow: '0 6px 12px rgba(0,0,0,.35)'
}

export default function App() {
  // URLに ?lang=en などがあれば初期選択に反映
  const initialLang = new URLSearchParams(location.search).get('lang') || ''
  const [lang, setLang] = useState(initialLang || '')
  const [showGate, setShowGate] = useState(!initialLang) // 初回はゲート表示
  const dict = useMemo(() => t[lang || 'ja'], [lang])

  // フォーム状態
  const [nationality, setNationality] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [discovery, setDiscovery] = useState('')
  const [snsUsed, setSnsUsed] = useState([])
  const [status, setStatus] = useState('idle')
  const [err, setErr] = useState('')

  const onToggleSns = (label) => {
    setSnsUsed((prev) => prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label])
  }

  const handleSelectLang = (l) => {
    setLang(l)
    setShowGate(false)
    // URLを /?lang=xx にして共有時の既定言語を固定
    const url = new URL(location.href)
    url.searchParams.set('lang', l)
    history.replaceState(null, '', url.toString())
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    if (!ageGroup) { setErr(dict.required); return }
    setStatus('sending')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // プリフライト回避
        body: JSON.stringify({ lang, nationality, age_group: ageGroup, discovery, sns_used: snsUsed }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.ok) setStatus('ok')
      else { setStatus('ng'); setErr(json?.error || 'error') }
    } catch (e) {
      setStatus('ng'); setErr(String(e))
    }
  }

  if (showGate || !lang) return <LanguageGate onSelect={handleSelectLang} />

  if (status === 'ok') {
    return (
      <div style={{ maxWidth: 680, margin: '24px auto', fontFamily: 'system-ui, sans-serif' }}>
        <h1>{dict.title}</h1>
        <p>{dict.success}</p>
        <button onClick={() => setShowGate(true)} style={{ marginTop: 12 }}>{dict.backToLang}</button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680, margin: '24px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>{dict.title}</h1>

      {/* 言語を選び直すボタン（任意） */}
      <button onClick={() => setShowGate(true)} style={{ marginBottom: 12 }}>
        {dict.backToLang}
      </button>

      <form onSubmit={onSubmit} style={{ marginTop: 8 }}>
        {/* 国籍（任意） */}
        <label style={{ display: 'block', margin: '12px 0 4px' }}>{dict.nationality}</label>
        <input
          type="text"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          placeholder={lang === 'ja' ? '例：Japan' : lang === 'en' ? 'e.g., Japan' : 'p.ej., Japón'}
          style={{ width: '100%', padding: 8 }}
        />

        {/* 年齢層（必須） */}
        <label style={{ display: 'block', margin: '12px 0 4px' }}>
          {dict.ageGroup} <span style={{ color: 'crimson' }}>*</span>
        </label>
        <select required value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} style={{ width: '100%', padding: 8 }}>
          <option value="">{dict.select}</option>
          {AGE[lang].map((a) => <option key={a} value={a}>{a}</option>)}
        </select>

        {/* 知ったきっかけ（任意） */}
        <label style={{ display: 'block', margin: '12px 0 4px' }}>{dict.discovery}</label>
        <select value={discovery} onChange={(e) => setDiscovery(e.target.value)} style={{ width: '100%', padding: 8 }}>
          <option value="">{dict.none}</option>
          {DISCOVERY[lang].map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* SNS（複数） */}
        <label style={{ display: 'block', margin: '12px 0 4px' }}>{dict.snsUsed}</label>
        <div>
          {SNS[lang].map((s) => (
            <label key={s} style={{ display: 'inline-flex', alignItems: 'center', marginRight: 12 }}>
              <input type="checkbox" checked={snsUsed.includes(s)} onChange={() => onToggleSns(s)} style={{ marginRight: 6 }} />
              {s}
            </label>
          ))}
        </div>

        {err && <p style={{ color: 'crimson', marginTop: 8 }}>{err}</p>}

        <button type="submit" disabled={status === 'sending'} style={{ marginTop: 16, padding: '10px 16px', fontWeight: 600, cursor: 'pointer' }}>
          {status === 'sending' ? t[lang].sending : t[lang].submit}
        </button>
      </form>
    </div>
  )
}
