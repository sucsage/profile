"use client";
import "client-only";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Img from "next/image";

/** ---- Types: กำจัด any ---- **/
type SqlJsQueryResult = {
  columns: string[];
  values: (string | number | null)[][];
};
type SqlJsDatabase = {
  exec: (sql: string) => SqlJsQueryResult[];
};
type SqlJsModule = {
  Database: new (data?: Uint8Array) => SqlJsDatabase;
};

declare global {
  interface Window {
    initSqlJs?: (cfg: { locateFile: (f: string) => string }) => Promise<SqlJsModule>;
  }
}

async function loadSqlJsScript(): Promise<void> {
  const id = "sqljs-cdn";
  if (document.getElementById(id)) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://sql.js.org/dist/sql-wasm.js";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load sql.js"));
    document.head.appendChild(s);
  });
}

interface ProjectImage {
  id: number;
  caption: string;
  image_base64: string;
}
interface Project {
  id: number;
  header: string;
  desciption: string;
  link?: string;
  created_at?: string;
  images: ProjectImage[];
}

export default function ProjectsClient() {
  const [rows, setRows] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  // คงชื่อ loding ตามที่คุณใช้
  const [loding, setloding] = useState(true);
  const [dataReady, setDataReady] = useState(false);

  // popup
  const [showPopup, setShowPopup] = useState(false);
  const [popupImg, setPopupImg] = useState<{ src: string; caption: string }>({ src: "", caption: "" });

  useEffect(() => {
    (async () => {
      try {
        setloding(true);

        // 1) โหลดสคริปต์ SQL.js
        await loadSqlJsScript();

        // 2) init wasm
        const SQL = await window.initSqlJs({
          locateFile: (f) => `https://sql.js.org/dist/${f}`,
        });

        // 3) โหลดฐานข้อมูล (ensure no cache)
        const res = await fetch("/profile/data.sqlite", { cache: "no-store" });
        if (!res.ok) throw new Error(`โหลด DB ไม่สำเร็จ: HTTP ${res.status}`);
        const buf = await res.arrayBuffer();
        const db = new SQL.Database(new Uint8Array(buf));

        // 4) JOIN + รวมรูปเป็น JSON
        const q = `
          SELECT
            p.id, p.header, p.desciption, p.link, p.created_at,
            COALESCE(
              json_group_array(
                json_object(
                  'id', i.id,
                  'caption', i.caption,
                  'image_base64', i.image_base64
                )
              ), '[]'
            ) AS images
          FROM Project p
          LEFT JOIN ProjectImage i ON i.project_id = p.id
          GROUP BY p.id
          ORDER BY p.id DESC
        `;
        const result = db.exec(q);
        const cols = result[0]?.columns ?? [];
        const vals = result[0]?.values ?? [];
        const projects: Project[] = vals.map((row: (string | number | null)[]) => {
          const record: Partial<Project> & Record<string, unknown> = {};
          row.forEach((v, i) => {
            record[cols[i]] = v;
          });
          record.images = JSON.parse((record.images as unknown as string) || "[]") as ProjectImage[];
          return record as Project;
        });

        // 5) preload/decode รูปทั้งหมดก่อนแสดง
        await preloadAllImages(projects);

        setRows(projects);
        setDataReady(true);
      } catch (e) {
        if (e instanceof Error) setError(e.message);
        else setError(String(e));
      } finally {
        setloding(false);
      }
    })();
  }, []);

  function openPopup(src: string, caption: string) {
    setPopupImg({ src, caption });
    setShowPopup(true);
  }
  function closePopup() {
    setShowPopup(false);
  }

  if (error) return <pre className="text-red-600">{error}</pre>;

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h2 style={{ fontSize: "1.8rem", color: "#167754", marginBottom: "1rem" }}>Projects</h2>

      {/* Loading overlay */}
      <AnimatePresence>
        {loding && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(255,255,255,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
              backdropFilter: "blur(2px)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <Spinner />
              <div style={{ color: "#167754", fontWeight: 600 }}>Loading...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skeleton ก่อน dataReady */}
      {!dataReady && <SkeletonGrid />}

      {/* Grid การ์ด (หลัง data พร้อมแล้ว) */}
      <AnimatePresence>
        {dataReady && (
          <motion.div
            layout
            initial="hidden"
            animate="show"
            variants={{
              hidden: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
              show: { transition: { staggerChildren: 0.06 } },
            }}
            style={{
              display: "grid",
              gap: "20px",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            {rows.map((p) => (
              <motion.div
                key={p.id}
                layout
                variants={{
                  hidden: { opacity: 0, y: 8, scale: 0.98 },
                  show: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ type: "spring", stiffness: 120, damping: 16 }}
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem" }}>{p.header}</h3>
                <p style={{ fontSize: "0.9rem", color: "#555", marginBottom: "6px" }}>{p.desciption}</p>
                {p.link && (
                  <a href={p.link} target="_blank" style={{ color: "#167754", fontSize: "0.9rem" }}>
                    🔗 {p.link}
                  </a>
                )}
                <small style={{ color: "#777" }}>Created: {p.created_at}</small>

                {p.images.length > 0 && (
                  <div
                    style={{
                      marginTop: "10px",
                      display: "flex",
                      gap: "10px",
                      overflowX: "auto",
                      paddingBottom: "6px",
                      scrollSnapType: "x mandatory",
                    }}
                  >
                    {p.images.map((img) => (
                      <motion.div
                        key={img.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          width: 140,
                          height: 100,
                          borderRadius: 8,
                          cursor: "pointer",
                          flex: "0 0 auto",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                          scrollSnapAlign: "start",
                          overflow: "hidden",
                          position: "relative",
                        }}
                        onClick={() => openPopup(img.image_base64, img.caption)}
                      >
                        <Img
                          src={img.image_base64}
                          alt={img.caption}
                          width={140}
                          height={100}
                          style={{ objectFit: "cover" }}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            key="popup"
            onClick={closePopup}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 18 }}
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                maxWidth: "94%",
                maxHeight: "92%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
              role="dialog"
              aria-modal="true"
            >
              <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "80vh" }}>
                <Img
                  src={popupImg.src}
                  alt={popupImg.caption}
                  width={700}
                  height={600}
                  style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", objectFit: "cover" }}
                />
              </div>
              <p style={{ fontSize: "0.95rem", color: "#444" }}>{popupImg.caption}</p>
              <button
                onClick={closePopup}
                style={{
                  padding: "8px 14px",
                  background: "#167754",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                ปิด
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** ===== Helpers ===== **/

async function preloadAllImages(projects: Project[]) {
  const allSrc = projects.flatMap((p) => p.images?.map((i) => i.image_base64) ?? []);
  await Promise.all(
    allSrc.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = async () => {
          try {
            if (img.decode) await img.decode();
          } catch {}
          resolve();
        };
        img.onerror = () => resolve();
        img.src = src;
      });
    })
  );
}

function SkeletonGrid() {
  const items = Array.from({ length: 6 });
  return (
    <div
      style={{
        display: "grid",
        gap: "20px",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      }}
    >
      {items.map((_, i) => (
        <div
          key={i}
          style={{
            background: "#fff",
            borderRadius: "14px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            padding: "16px",
          }}
        >
          <div className="shimmer" style={sk(180)} />
          <div className="shimmer" style={sk(14, "60%", 10)} />
          <div className="shimmer" style={sk(12, "80%", 8)} />
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <div className="shimmer" style={sk(70, 100)} />
            <div className="shimmer" style={sk(70, 100)} />
            <div className="shimmer" style={sk(70, 100)} />
          </div>
          <style jsx>{`
            .shimmer {
              background: linear-gradient(90deg, #eee 25%, #f6f6f6 37%, #eee 63%);
              background-size: 400% 100%;
              animation: shimmer 1.2s ease-in-out infinite;
              border-radius: 8px;
            }
            @keyframes shimmer {
              0% { background-position: 100% 0; }
              100% { background-position: 0 0; }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
}

function sk(h = 12, w: number | string = "100%", mt = 6): React.CSSProperties {
  return { height: h, width: typeof w === "number" ? `${w}px` : w, marginTop: mt };
}

function Spinner() {
  return (
    <div
      style={{
        width: 34,
        height: 34,
        border: "3px solid #cde8dc",
        borderTopColor: "#167754",
        borderRadius: "50%",
        animation: "spin 0.9s linear infinite",
      }}
    >
      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
