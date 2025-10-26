'use client'
import { useState } from 'react'
import * as ort from 'onnxruntime-web'
import { Sparkles, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/* =========================================================
   🔹 1. Keyword groups (ต้องตรงกับตอนเทรนใน Python)
========================================================= */
const KEYWORDS = [
  [
    "template", "เทมเพลต", "มีแบบแล้ว", "เว็บต้นแบบ", "เว็บตัวอย่าง", "โครงสร้างเดิม",
    "clone layout", "deploy static site", "upload html", "เว็บเดิม", "convert figma to html", "ตามแบบ"
  ],
  [
    "Visual Design", "Color Palette", "Mood Board", "Brand Identity", "Aesthetic",
    "ออกแบบเว็บใหม่", "ดีไซน์หน้าเว็บ", "สร้างหน้าแรก", "ปรับโทนสี", "landing page design",
    "rebranding", "mockup", "figma ui", "ปรับโครงสร้างหน้าเว็บ", "ความสวยงาม"
  ],
  [
    "UX/UI", "user journey", "flow ผู้ใช้", "wireframe figma", "prototype", "interaction design",
    "responsive website", "Information Architecture", "Usability Testing", "A/B Testing",
    "user test", "usability", "ออกแบบ UX", "ดีไซน์ระบบ"
  ],
  [
    "API", "หลังบ้าน", "backend", "server", "ฐานข้อมูล", "swagger", "JWT", "RESTful API",
    "express", "node.js", "endpoint", "ระบบจัดการข้อมูล", "เชื่อมฐานข้อมูล", "เอกสาร API",
    "GraphQL", "Microservices", "Serverless Function", "งานหลังบ้านอย่างเดียว"
  ],
  [
    "เว็บเต็มระบบ", "ครบ frontend backend", "deploy production", "ครบวงจร", "web + api",
    "ระบบทั้งหมด", "full stack", "maintenance", "security setup", "hosting setup",
    "domain integration", "admin dashboard", "auto backup", "CI/CD Pipeline",
    "DevOps", "End-to-End Solution"
  ],
  [
    "วิเคราะห์ระบบ", "system analysis", "ออกแบบโครงสร้าง", "ผังงาน", "SRS", "requirement gathering",
    "ER diagram", "use case", "UML", "architecture plan", "process mapping", "data model", "functional spec",
    "วิเคราะห์ระบบโรงพยาบาล", "ระบบ ERP", "ระบบโรงเรียน", "system design document"
  ],
  [
    "AI", "machine learning", "data analytics", "dashboard", "data visualization",
    "predictive model", "python analysis", "วิเคราะห์ข้อมูล", "data science",
    "sales forecast", "trend analysis", "model training", "business insight",
    "kpi dashboard", "data mining", "forecast system", "ระบบวิเคราะห์ยอดขาย", "วิเคราะห์ข้อมูลผู้ป่วย"
  ]
]


/* =========================================================
   🔹 2. Package list
========================================================= */
const PACKAGES = [
  { id: 1, name: 'Template Website', price: 7500 },
  { id: 2, name: 'Website Design', price: 10000 },
  { id: 3, name: 'Website + UX/UI', price: 15000 },
  { id: 4, name: 'Server API + Docs', price: 15000 },
  { id: 5, name: 'Full Website + Server', price: 30000 },
  { id: 6, name: 'System Analysis', price: 25000 },
  { id: 7, name: 'AI & Data Analysis', price: 25000 },
]

/* =========================================================
   🔹 3. Utility functions
========================================================= */
// === คำนวณจำนวน keyword ที่ตรงกับข้อความ ===
function keywordScores(text: string): number[] {
  const lower = text.toLowerCase()
  return KEYWORDS.map(words =>
    words.filter(w => lower.includes(w.toLowerCase())).length
  )
}

// === softmax ===
function softmax(arr: number[]): number[] {
  const max = Math.max(...arr)
  const exps = arr.map(x => Math.exp(x - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map(x => x / sum)
}

// === ดึง tensor ของ probability จาก output (auto-detect) ===
function getProbabilityTensor(output: Record<string, ort.Tensor>): Float32Array {
  const candidateKeys = [
    "probabilities",
    "output_probability",
    "variable",
    "prob",
    "output",
  ]

  // หา key ที่เป็น tensor(float) หรือชื่อเข้าข่าย
  const tensorKey =
    Object.keys(output).find(
      (k) =>
        output[k]?.type?.includes("float") ||
        candidateKeys.includes(k)
    ) ?? null;


  if (!tensorKey) {
    console.warn("⚠️ ไม่พบ tensor ของ probability:", Object.keys(output))
    return new Float32Array([])
  }

  const tensor = output[tensorKey] as ort.Tensor
  if (!tensor.data) {
    console.warn("⚠️ Output key ไม่ได้เป็น tensor:", tensorKey)
    return new Float32Array([])
  }

  return new Float32Array(tensor.data as Float32Array)
}

/* =========================================================
   🔹 4. Main Component
========================================================= */
export default function ONNXClassifier() {
  const [text, setText] = useState('อยากได้ระบบ AI วิเคราะห์ข้อมูล')
  const [predictions, setPredictions] = useState<{ label: string; confidence: number }[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const predict = async () => {
    setLoading(true)
    setError(null)
    setPredictions(null)

    try {
      // 1️⃣ โหลดโมเดล
      ort.env.logLevel = 'error' // หรือ 'fatal' เพื่อให้เงียบสุด
      const session = await ort.InferenceSession.create('/logreg_tfidf_keyword_model.onnx', {
        executionProviders: ['wasm'],
      })

      console.log(session)

      // 2️⃣ เตรียม input tensor
      const kws = keywordScores(text)
      const feeds: Record<string, ort.Tensor> = {
        text: new ort.Tensor('string', [text], [1, 1]),
      }
      for (let i = 0; i < 7; i++) {
        feeds[`kw_${i + 1}`] = new ort.Tensor('float32', [kws[i]], [1, 1])
      }

      // 3️⃣ Run inference
      const output = await session.run(feeds)
      console.log("🧠 ONNX Output keys:", Object.keys(output))
      console.log("🔍 Output detail:", output)

      // 4️⃣ ดึง probability tensor อัตโนมัติ
      const probs = getProbabilityTensor(output)
      const probsArr = Array.from(probs)
      const norm = softmax(probsArr)

      // 5️⃣ เรียง top 3
      const indexed = norm.map((p, i) => ({ prob: p, idx: i }))
      indexed.sort((a, b) => b.prob - a.prob)
      const top3 = indexed.slice(0, 3)

      setPredictions(
        top3.map(item => ({
          label: PACKAGES[item.idx]?.name ?? `Package_${item.idx + 1}`,
          confidence: item.prob * 100,
        }))
      )
    } catch (err) {
      console.error('Prediction error:', err)
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const topLabel = predictions?.[0]?.label

  /* =========================================================
     🔹 5. Render
  ========================================================= */
  return (
    <div className="min-h-screen bg-white text-gray-800 p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-emerald-500" />
            <h1 className="text-3xl font-bold text-emerald-600">
              AI Package Classifier
            </h1>
          </div>

          {/* Input */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent mb-4"
            rows={4}
            placeholder="กรุณาใส่ข้อความ..."
          />

          <button
            onClick={predict}
            disabled={loading || !text.trim()}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${loading
              ? 'bg-emerald-600/80 animate-pulse text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
          >
            {loading ? '⚙️ กำลังวิเคราะห์...' : 'ให้ AI วิเคราะห์ข้อความนี้'}
          </button>

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">เกิดข้อผิดพลาด</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Predictions */}
          <AnimatePresence>
            {predictions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-10"
              >
                <h2 className="text-xl font-semibold text-emerald-600 mb-4">
                  🎯 ผลการวิเคราะห์ของ AI
                </h2>
                {predictions.map((pred, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className={`p-4 rounded-lg border-2 mb-3 ${idx === 0
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-gray-50 border-gray-200'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        {pred.label}
                      </span>
                      <span className="text-lg font-semibold text-emerald-600">
                        {pred.confidence.toFixed(2)}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Package list */}
          <div className="mt-10 border-t pt-6">
            <h2 className="text-xl font-semibold text-emerald-600 mb-4">📦 แพ็กเกจทั้งหมด</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {PACKAGES.map(pkg => {
                const selected = topLabel === pkg.name
                return (
                  <motion.div
                    key={pkg.id}
                    animate={selected ? { scale: 1.03, boxShadow: '0 0 20px #6ee7b780' } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 15 }}
                    className={`p-5 rounded-xl border ${selected
                      ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200'
                      : 'border-gray-200 bg-white hover:bg-emerald-50 hover:border-emerald-300'
                      }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-800">{pkg.name}</h3>
                      {selected && <span className="text-sm text-emerald-600 font-semibold">🏆 เลือกโดย AI</span>}
                    </div>
                    <p className="text-gray-700">💰 ขั้นต่ำ {pkg.price.toLocaleString()} บาท</p>
                    <p className="text-xs text-gray-500 mt-1">(ขึ้นอยู่กับความซับซ้อนของงาน)</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
          {/* HireForm */}
          {predictions && predictions.length > 0 && (
            <div className="mt-10 border-t pt-6">
              <h2 className="text-xl font-semibold text-emerald-600 mb-4">
                📋 ต้องการให้เราทำโปรเจกต์นี้ให้ไหม?
              </h2>
              <HireForm
                text={text}
                prediction={predictions[0].label}
                confidence={predictions[0].confidence}
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function HireForm({
  text,
  prediction,
  confidence,
}: {
  text: string
  prediction: string
  confidence: number
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedPackage, setSelectedPackage] = useState(prediction)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)

    try {
      const res = await fetch(
        'https://script.google.com/macros/s/AKfycbwjDt25M_Hyvzxg4kELqi7Hm7Wez_ow0TfKeCR3OIdzMw7cXKuCu490d9WZ-LaBZbf0Fg/exec',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            text,
            ai_prediction: prediction,
            user_selected: selectedPackage,
            confidence,
          }),
        }
      )

      const result = await res.json()
      if (result.status === 'success') {
        setSent(true)
      } else {
        throw new Error(result.message || 'ส่งข้อมูลไม่สำเร็จ')
      }
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-700">
        ✅ ขอบคุณ! ระบบได้บันทึกข้อมูลการจ้างของคุณเรียบร้อยแล้ว
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4"
    >
      <label className="block text-sm text-gray-700 font-medium">
        แพ็กเกจที่คุณต้องการ (AI แนะนำ:{' '}
        <span className="text-emerald-600">{prediction}</span>)
      </label>
      <select
        value={selectedPackage}
        onChange={(e) => setSelectedPackage(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-400"
      >
        {PACKAGES.map((pkg) => (
          <option key={pkg.id} value={pkg.name}>
            {pkg.name} — {pkg.price.toLocaleString()} บาท
          </option>
        ))}
      </select>

      <input
        type="text"
        required
        placeholder="ชื่อของคุณ"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-400"
      />
      <input
        type="email"
        required
        placeholder="อีเมล"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-400"
      />
      <input
        type="tel"
        required
        placeholder="เบอร์โทร"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-400"
      />

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-2">
          ⚠️ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className={`w-full py-3 rounded-lg text-white font-medium ${sending
          ? 'bg-emerald-500/80 animate-pulse'
          : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
      >
        {sending ? '🚀 กำลังส่ง...' : '✅ จ้างเลย'}
      </button>
    </form>
  )
}
