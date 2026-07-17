// ============================================================================
// KAISH — AboutPage.tsx
// Trang "About" theo bộ nhận diện Concept C (navy #16335C + đỏ #C4151C).
// Component React độc lập, KHÔNG cần thư viện ngoài. Chỉ dùng inline style + 1
// thẻ <style> cho hover/responsive/animation.
//
// CÁCH DÙNG (xem hướng dẫn đầy đủ ở cuối file):
//   1. Copy file này vào src/ của bạn (ví dụ src/pages/AboutPage.tsx)
//   2. Ở component chính, thêm state trang + render có điều kiện (xem cuối file)
//   3. Nút "About" gọi setPage("about")
// ============================================================================

import { useEffect, useState } from "react";

type AboutPageProps = {
  /** Gọi khi bấm "Về trang chủ" hoặc logo — quay lại trang chính của bạn. */
  onBack?: () => void;
};

const NAVY = "#16335C";
const NAVY_DARK = "#0D1F38";
const RED = "#C4151C";
const INK = "#141A22";
const BODY = "#33404F";
const MUTED = "#5E6B7A";
const LINE = "#E4EAF1";
const BG_SOFT = "#F5F7FA";
const BG_BLUE = "#EEF3FA";

const FAQS = [
  { q: "Mình chưa biết gì về tiếng Hàn, có học được không?", a: "Hoàn toàn được. Khóa Sơ cấp 1A bắt đầu từ bảng chữ cái, phù hợp cho người mới. Bạn sẽ được kiểm tra đầu vào miễn phí để xếp đúng lớp." },
  { q: "Học phí và hình thức thanh toán như thế nào?", a: "Khóa tiếng Hàn từ 70.000₫/buổi. Các lộ trình combo và du học có báo giá riêng theo nhu cầu — liên hệ để nhận bảng học phí chi tiết." },
  { q: "Bao lâu thì mình có thể đạt TOPIK 4?", a: "Tùy nền tảng và cường độ học, trung bình 6–9 tháng theo lộ trình được thiết kế riêng. KAISH cam kết lộ trình rõ ràng theo từng mốc." },
  { q: "Lớp học online tổ chức ra sao?", a: "Học 100% online qua Google Meet, sĩ số nhỏ (≤10–15 học viên) để đảm bảo tương tác. Mọi buổi đều có record để bạn xem lại." },
  { q: "Khóa phân tích xã hội Hàn Quốc dành cho ai?", a: "Dành cho sinh viên, nhà nghiên cứu ngành Đông phương học, Hàn Quốc học, Xã hội học muốn ứng dụng GIS/ArcGIS Pro để phân tích dữ liệu xã hội Hàn Quốc." },
  { q: "Có được học thử hoặc tư vấn trước không?", a: "Có. Bạn được tư vấn miễn phí 1-1 để xác định mục tiêu và lộ trình trước khi quyết định ghi danh." },
];

export default function AboutPage({ onBack }: AboutPageProps) {
  const [openFaq, setOpenFaq] = useState<number>(0);

  return (
    <div className="kaish-about">
      <style>{CSS}</style>

      {/* ============ HEADER ============ */}
      <header className="ka-header">
        <div className="ka-wrap ka-headrow">
          <button className="ka-logo" onClick={onBack} aria-label="Về trang chủ">
            <span style={{ color: RED }}>K</span>
            <span style={{ color: NAVY }}>AISH</span>
          </button>
          <nav className="ka-nav">
            <a href="#gioi-thieu">Giới thiệu</a>
            <a href="#khoa-hoc">Khóa học</a>
            <a href="#lo-trinh">Lộ trình</a>
            <a href="#hoc-vien">Học viên</a>
            <a href="#hoc-phi">Học phí</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a href="#dang-ky" className="ka-btn ka-btn-navy">Đăng ký tư vấn</a>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="ka-hero" id="top">
        <div className="ka-wrap ka-herogrid">
          <div>
            <span className="ka-eyebrow-pill">Trung tâm Học thuật &amp; Kỹ năng Tiếng Hàn</span>
            <h1 className="ka-h1">Học tiếng Hàn bài bản.<br /><span style={{ color: NAVY }}>Hiểu xã hội Hàn Quốc</span> chuyên sâu.</h1>
            <p className="ka-lead">KAISH đồng hành cùng bạn từ nền tảng đến chuyên sâu — tiếng Hàn, luyện thi TOPIK và phân tích xã hội Hàn Quốc — trên một lộ trình rõ ràng, thiết kế riêng cho mục tiêu của bạn.</p>
            <div className="ka-hero-cta">
              <a href="#dang-ky" className="ka-btn ka-btn-red">Đăng ký tư vấn miễn phí →</a>
              <a href="#khoa-hoc" className="ka-btn ka-btn-ghost">Xem khóa học</a>
            </div>
            <div className="ka-hero-trust">
              <span><span style={{ color: "#C98A00" }}>★★★★★</span> 4.9/5</span>
              <span className="ka-sep" />
              <span>Giảng viên nghiên cứu sinh tiến sĩ <strong style={{ color: NAVY }}>SNU</strong></span>
              <span className="ka-sep" />
              <span>Sĩ số <strong style={{ color: NAVY }}>≤ 15</strong> HV/lớp</span>
            </div>
          </div>
          <div className="ka-hero-media">
            <div className="ka-hero-imgbg" />
            <div className="ka-hero-img">
  <img src="/hinhnenabout.png" alt="Học viên KAISH" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
</div>
            <div className="ka-hero-badge">
              <div className="ka-hero-badge-ic">🎓</div>
              <div><div style={{ fontWeight: 800, color: NAVY, fontSize: 20, lineHeight: 1 }}>TOPIK 6</div><div style={{ fontSize: 12, color: MUTED }}>Nghiệp vụ sư phạm giảng dạy trường đại học</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST BAR ============ */}
      <section className="ka-trust">
        <div className="ka-wrap ka-trustgrid">
          {[["SNU", NAVY, "Giảng viên nghiên cứu sinh tiến sĩ"], ["7+", RED, "Năm kinh nghiệm giảng dạy"], ["≤ 15", NAVY, "Học viên / lớp"], ["100%", NAVY, "Online, có record xem lại"]].map(([n, c, l], i) => (
            <div key={i} className={i ? "ka-trust-cell ka-trust-bd" : "ka-trust-cell"}>
              <div style={{ fontSize: 34, fontWeight: 800, color: c as string, lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 14, color: MUTED, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PROBLEM ============ */}
      <section id="gioi-thieu" style={{ background: "#fff" }}>
        <div className="ka-wrap ka-sec-head">
          <div className="ka-eyebrow" style={{ color: RED }}>Nỗi trăn trở của người học</div>
          <h2 className="ka-h2">Bạn có đang gặp một trong những vấn đề này?</h2>
          <p className="ka-sub">Hầu hết người học tiếng Hàn đều mắc kẹt ở đây — và đó chính là lý do KAISH ra đời.</p>
        </div>
        <div className="ka-wrap ka-grid3" style={{ paddingBottom: 84 }}>
          {[["📉", "Học mãi không lên trình?", "Học nhiều nơi, nhiều app nhưng không có lộ trình rõ ràng, mất phương hướng và dễ bỏ cuộc giữa chừng."], ["🧭", "Muốn du học nhưng bối rối?", "Không biết bắt đầu từ đâu, hồ sơ & luận học bổng ra sao, ai là người đáng tin để đồng hành."], ["🔍", "Biết tiếng mà chưa hiểu Hàn?", "Học ngôn ngữ nhưng thiếu chiều sâu về xã hội, văn hoá & tư duy học thuật để đi xa hơn."]].map(([ic, t, d], i) => (
            <div key={i} className="ka-card-soft">
              <div className="ka-ic ka-ic-white">{ic}</div>
              <h3 className="ka-h3">{t}</h3>
              <p className="ka-card-p">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ SOLUTION ============ */}
      <section style={{ background: BG_SOFT }}>
        <div className="ka-wrap" style={{ padding: "84px 24px", textAlign: "center" }}>
          <div className="ka-eyebrow" style={{ color: NAVY }}>Cách KAISH giải quyết</div>
          <h2 className="ka-h2" style={{ maxWidth: 700, margin: "0 auto 52px" }}>Không chỉ <span style={{ color: RED }}>biết tiếng Hàn</span> — mà <span style={{ color: NAVY }}>hiểu Hàn Quốc</span></h2>
          <div className="ka-grid3 ka-grid3-left">
            <div className="ka-card">
              <div className="ka-ic ka-ic-blue">🗺️</div>
              <h3 className="ka-h3">Lộ trình rõ ràng</h3>
              <p className="ka-card-p">Từ Sơ cấp → Trung cấp → luyện thi TOPIK, mỗi bước có mục tiêu & sản phẩm đầu ra cụ thể, không mơ hồ.</p>
            </div>
            <div className="ka-card ka-card-feat">
              <div className="ka-feat-tag">ĐIỂM KHÁC BIỆT</div>
              <div className="ka-ic ka-ic-red">📊</div>
              <h3 className="ka-h3">Chiều sâu học thuật</h3>
              <p className="ka-card-p">Phân tích xã hội Hàn Quốc bằng dữ liệu & GIS (ArcGIS Pro) — năng lực mà các lớp luyện thi thuần tuý không có.</p>
            </div>
            <div className="ka-card">
              <div className="ka-ic ka-ic-blue">🤝</div>
              <h3 className="ka-h3">Đồng hành trọn gói</h3>
              <p className="ka-card-p">Học tiếng — luyện thi — du học — sửa luận học bổng, một đầu mối theo bạn suốt hành trình.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ COURSES ============ */}
      <section id="khoa-hoc" style={{ background: "#fff" }}>
        <div className="ka-wrap ka-sec-head">
          <div className="ka-eyebrow" style={{ color: RED }}>Khóa học tại KAISH</div>
          <h2 className="ka-h2">Chọn đúng khóa cho mục tiêu của bạn</h2>
          <p className="ka-sub">Từ nền tảng chữ cái đến phân tích xã hội chuyên sâu — tất cả đều học online, có record xem lại.</p>
        </div>
        <div className="ka-wrap ka-grid3" style={{ paddingBottom: 40 }}>
          {COURSES.map((c, i) => (
            <div key={i} className={c.feat ? "ka-course ka-course-feat" : "ka-course"}>
              <div className="ka-course-top">
                <span>{c.cat}</span>
                {c.feat && <span className="ka-course-badge">NỔI BẬT</span>}
              </div>
              <div className="ka-course-body">
                <span className={c.feat ? "ka-pill ka-pill-red" : "ka-pill ka-pill-navy"}>{c.tag}</span>
                <h3 className="ka-h3" style={{ marginBottom: 8 }}>{c.title}</h3>
                <p className="ka-course-desc">{c.desc}</p>
                <div className="ka-course-meta">{c.meta.map((m, j) => <span key={j}>{m}</span>)}</div>
                <div className="ka-course-foot">
                  <span style={{ fontWeight: 800, color: NAVY, fontSize: c.priceSm ? 16 : 18 }}>{c.price}</span>
                  <a href="#dang-ky" style={{ fontWeight: 600, color: RED, fontSize: 14 }}>Xem chi tiết →</a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", padding: "0 24px 84px" }}><a href="#dang-ky" className="ka-btn ka-btn-ghost">Xem tất cả khóa học →</a></div>
      </section>

      {/* ============ PROCESS ============ */}
      <section id="lo-trinh" style={{ background: BG_BLUE }}>
        <div className="ka-wrap" style={{ padding: "84px 24px", textAlign: "center" }}>
          <div className="ka-eyebrow" style={{ color: NAVY }}>Lộ trình học tại KAISH</div>
          <h2 className="ka-h2" style={{ maxWidth: 600, margin: "0 auto 52px" }}>4 bước để đạt mục tiêu của bạn</h2>
          <div className="ka-steps">
            {STEPS.map((s, i) => (
              <div key={i} className={i === 3 ? "ka-step ka-step-last" : "ka-step"}>
                <div className={i === 3 ? "ka-step-n ka-step-n-red" : "ka-step-n"}>{s.n}</div>
                <h3 className="ka-step-t" style={i === 3 ? { color: "#fff" } : undefined}>{s.t}</h3>
                <p className="ka-step-p" style={i === 3 ? { color: "#C6D3E5" } : undefined}>{s.d}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 44 }}><a href="#dang-ky" className="ka-btn ka-btn-navy ka-btn-lg">Nhận lộ trình phù hợp với bạn →</a></div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section id="hoc-vien" style={{ background: "#fff" }}>
        <div className="ka-wrap ka-sec-head">
          <div className="ka-eyebrow" style={{ color: RED }}>Câu chuyện học viên</div>
          <h2 className="ka-h2">Người thật, kết quả thật</h2>
          <p className="ka-sub">Những bạn trẻ đã đi cùng KAISH trên hành trình chinh phục Hàn Quốc.</p>
        </div>
        <div className="ka-wrap ka-grid3" style={{ paddingBottom: 84 }}>
          {TESTI.map((t, i) => (
            <div key={i} className="ka-card-soft">
              <div style={{ color: "#C98A00", fontSize: 16, marginBottom: 14 }}>★★★★★</div>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: BODY, marginBottom: 22 }}>“{t.quote}”</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="ka-avatar" />
                <div><div style={{ fontWeight: 700, color: INK, fontSize: 15 }}>{t.name}</div><div style={{ fontSize: 13, color: MUTED }}>{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="hoc-phi" style={{ background: BG_SOFT }}>
        <div className="ka-wrap" style={{ padding: "84px 24px", textAlign: "center" }}>
          <div className="ka-eyebrow" style={{ color: NAVY }}>Học phí &amp; gói</div>
          <h2 className="ka-h2" style={{ maxWidth: 600, margin: "0 auto 52px" }}>Minh bạch, đúng nhu cầu của bạn</h2>
          <div className="ka-grid3 ka-grid3-left" style={{ alignItems: "start" }}>
            {PRICING.map((p, i) => (
              <div key={i} className={p.feat ? "ka-price ka-price-feat" : "ka-price"}>
                {p.feat && <div className="ka-price-tag">PHỔ BIẾN NHẤT</div>}
                <h3 style={{ fontSize: 19, fontWeight: 700, color: INK, marginBottom: 6 }}>{p.name}</h3>
                <p style={{ fontSize: 14, color: MUTED, marginBottom: 18 }}>{p.sub}</p>
                <div style={{ fontSize: 34, fontWeight: 800, color: NAVY, marginBottom: 20 }}>{p.price}<span style={{ fontSize: 15, fontWeight: 500, color: "#8A96A5" }}>{p.unit}</span></div>
                <div className="ka-price-list">{p.items.map((it, j) => <span key={j}><span style={{ color: "#1F8A54", fontWeight: 700 }}>✓</span> {it}</span>)}</div>
                <a href="#dang-ky" className={p.feat ? "ka-btn ka-btn-red ka-btn-block" : "ka-btn ka-btn-ghost ka-btn-block"}>{p.cta}</a>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 14, color: "#8A96A5", marginTop: 28 }}>* Học phí combo &amp; du học tuỳ theo lộ trình — liên hệ để nhận bảng chi tiết.</p>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" style={{ background: "#fff" }}>
        <div className="ka-wrap-narrow">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="ka-eyebrow" style={{ color: RED }}>Câu hỏi thường gặp</div>
            <h2 className="ka-h2">Bạn còn băn khoăn?</h2>
          </div>
          <div className="ka-faq-list">
            {FAQS.map((f, i) => (
              <div key={i} className="ka-faq-item">
                <button className="ka-faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  <span>{f.q}</span>
                  <span className="ka-faq-sign">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && <div className="ka-faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 32, fontSize: 15, color: MUTED }}>Còn thắc mắc khác? <a href="#dang-ky" style={{ color: RED, fontWeight: 600 }}>Chat với tư vấn viên →</a></p>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section id="dang-ky" className="ka-final">
        <div className="ka-wrap-narrow" style={{ textAlign: "center", padding: "88px 24px" }}>
          <h2 className="ka-final-h">Bắt đầu hành trình chinh phục Hàn Quốc của bạn</h2>
          <p className="ka-final-p">Đăng ký nhận tư vấn miễn phí — chúng tôi sẽ giúp bạn chọn đúng lộ trình cho mục tiêu của mình.</p>
          <div className="ka-final-cta">
            <a href="#top" className="ka-btn ka-btn-red ka-btn-lg">Đăng ký tư vấn miễn phí →</a>
            <a href="#top" className="ka-btn ka-btn-glass ka-btn-lg">Nhắn Zalo: 0365-142-241</a>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="ka-footer">
        <div className="ka-wrap ka-footgrid">
          <div>
            <div className="ka-foot-logo"><span style={{ color: RED }}>K</span><span style={{ color: "#fff" }}>AISH</span></div>
            <p className="ka-foot-desc">Korean Academic Insight &amp; Skills Hub — Trung tâm Học thuật &amp; Kỹ năng Tiếng Hàn. Tiếng Hàn thực tế, kỹ năng thực thụ.</p>
          </div>
          <div>
            <div className="ka-foot-h">Khóa học</div>
            <div className="ka-foot-links"><a href="#khoa-hoc">Tiếng Hàn Sơ cấp</a><a href="#khoa-hoc">Luyện thi TOPIK</a><a href="#khoa-hoc">Phân tích xã hội HQ</a><a href="#khoa-hoc">Du học Hàn Quốc</a></div>
          </div>
          <div>
            <div className="ka-foot-h">Về KAISH</div>
            <div className="ka-foot-links"><a href="#gioi-thieu">Giới thiệu</a><a href="#lo-trinh">Lộ trình học</a><a href="#hoc-vien">Câu chuyện học viên</a><a href="#faq">Câu hỏi thường gặp</a></div>
          </div>
          <div>
            <div className="ka-foot-h">Liên hệ</div>
            <div className="ka-foot-links"><span>📞 Zalo: 0365-142-241</span><span>💬 fb.com/thanhquang.vo.79</span><span>💻 Học online qua Google Meet</span></div>
          </div>
        </div>
        <div className="ka-foot-bar"><div className="ka-wrap ka-foot-barrow"><span>© 2026 KAISH. Bảo lưu mọi quyền.</span><span>Chính sách bảo mật · Điều khoản</span></div></div>
      </footer>

      <a href="#dang-ky" className="ka-fab" aria-label="Liên hệ tư vấn">💬</a>
    </div>
  );
}

// ============================================================================
// AboutOverlay — CÁCH TÍCH HỢP DỄ NHẤT (không cần sửa cấu trúc App)
// Tự bật trang About (phủ toàn màn hình) khi URL có #about.
//
// Chỉ cần làm 2 việc trong App.tsx của bạn:
//   1) import: import AboutPage, { AboutOverlay } from "./pages/AboutPage";
//   2) Đặt <AboutOverlay /> ở NGAY TRƯỚC thẻ đóng cuối cùng của return, ví dụ:
//         return (
//           <div className="app">
//             ...toàn bộ trang hiện tại...
//             <AboutOverlay />
//           </div>
//         );
//   3) Cho nút "About" mở nó — chọn 1 trong 2:
//        • Nếu About là <button>: onClick={() => { window.location.hash = "about"; }}
//        • Nếu About là <a>:      href="#about"
//      (Các mục menu khác giữ nguyên.)
// Đóng lại: bấm logo / nút "Về trang chủ" trong trang About (tự xóa #about).
// ============================================================================
export function AboutOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      if (window.location.hash.replace("#", "") === "about") setOpen(true);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const close = () => {
    setOpen(false);
    if (window.location.hash.replace("#", "") === "about") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "#fff", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      <button
        onClick={close}
        aria-label="Đóng"
        style={{ position: "fixed", top: 16, right: 16, zIndex: 2100, width: 40, height: 40, borderRadius: 999, border: "none", background: "rgba(13,31,56,.75)", color: "#fff", fontSize: 20, cursor: "pointer", lineHeight: 1 }}
      >
        ✕
      </button>
      <AboutPage onBack={close} />
    </div>
  );
}

const COURSES = [
  { cat: "Tiếng Hàn cơ bản", tag: "Sơ cấp · A1–A2", title: "Tiếng Hàn Sơ cấp 1A", desc: "Nắm vững bảng chữ cái, đọc thành thạo & giao tiếp cơ bản. Giáo trình Tiếng Hàn Tổng Hợp 1 (Bài 1–7).", meta: ["📅 20 buổi · 90 phút/buổi · 3 tháng", "👥 Sĩ số 10 học viên · Google Meet"], price: "70.000₫/buổi", feat: false, priceSm: false },
  { cat: "Phân tích xã hội", tag: "Chuyên sâu · Liên ngành", title: "Phân tích XH Hàn Quốc qua ArcGIS Pro", desc: "Ứng dụng GIS & viễn thám phân tích dân cư, giao thông, môi trường đô thị Hàn Quốc — kết thúc bằng báo cáo nghiên cứu.", meta: ["📅 8 buổi · 120 phút/buổi", "👨‍🏫 GV: NCS Tiến sĩ SNU · TOPIK 6"], price: "Khai giảng 15/04", feat: true, priceSm: true },
  { cat: "Du học Hàn Quốc", tag: "Dịch vụ · Trọn gói", title: "Du học trọn gói + Học bổng", desc: "Tư vấn chọn trường, chuẩn bị hồ sơ, luyện phỏng vấn & sửa luận học bổng — đồng hành đến khi nhập học.", meta: ["🎯 Lộ trình cá nhân hoá", "✍️ Sửa luận học bổng 1-1"], price: "Nhận tư vấn", feat: false, priceSm: true },
];

const STEPS = [
  { n: "01", t: "Tư vấn & kiểm tra đầu vào", d: "Xác định trình độ, mục tiêu & nguyện vọng của bạn — hoàn toàn miễn phí." },
  { n: "02", t: "Thiết kế lộ trình riêng", d: "Cá nhân hoá theo mục tiêu: giao tiếp, TOPIK, học thuật hay du học." },
  { n: "03", t: "Học & luyện tập có kèm cặp", d: "Lớp nhỏ, hướng dẫn sát sao, có record xem lại toàn bộ bài giảng." },
  { n: "04", t: "Đạt mục tiêu", d: "Đỗ TOPIK, hoàn thành báo cáo nghiên cứu hoặc nhận học bổng du học." },
];

const TESTI = [
  { quote: "Lộ trình rõ ràng nên mình không còn học lan man. Sau 6 tháng mình đã đạt TOPIK 4 đúng như kế hoạch.", name: "ㅇㅇ Trà", role: "TOPIK 4 · 6 tháng" },
  { quote: "Khóa phân tích xã hội bằng ArcGIS thực sự khác biệt — mình viết được báo cáo nghiên cứu để nộp hồ sơ du học.", name: "ㅇㅇ Linh", role: "TOPIK 5·3 tháng" },
  { quote: "Được sửa luận học bổng tận tình. Mình nhận học bổng và giờ đang học tại Seoul, biết ơn KAISH rất nhiều.", name: "ㅇㅇㅇ", role: "Học bổng · Sogang University" },
];

const PRICING = [
  { name: "Khóa lẻ", sub: "Học theo từng cấp độ tiếng Hàn.", price: "70.000₫", unit: "/buổi", items: ["Sơ cấp / Trung cấp", "Lớp ≤ 10 học viên", "Record xem lại"], cta: "Đăng ký", feat: false },
  { name: "Lộ trình trọn khóa", sub: "Combo nhiều cấp + luyện thi TOPIK.", price: "Ưu đãi", unit: " theo combo", items: ["Lộ trình cá nhân hoá", "Kèm luyện thi TOPIK", "Ưu tiên hỗ trợ 1-1", "Giá tốt hơn học lẻ"], cta: "Nhận tư vấn", feat: true },
  { name: "Du học trọn gói", sub: "Đồng hành đến khi nhập học.", price: "Báo giá", unit: " riêng", items: ["Tư vấn chọn trường", "Chuẩn bị hồ sơ", "Sửa luận học bổng"], cta: "Nhận báo giá", feat: false },
];

const CSS = `
.kaish-about{font-family:"Be Vietnam Pro",system-ui,"Segoe UI",Roboto,sans-serif;color:${BODY};background:#fff;line-height:1.5}
.kaish-about *{box-sizing:border-box}
.kaish-about a{text-decoration:none}
.ka-wrap{max-width:1200px;margin:0 auto;padding:0 24px}
.ka-wrap-narrow{max-width:780px;margin:0 auto;padding:84px 24px}
.ka-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:600;font-size:15px;padding:11px 20px;border-radius:10px;border:none;cursor:pointer;transition:all .18s;font-family:inherit}
.ka-btn-navy{background:${NAVY};color:#fff}
.ka-btn-navy:hover{background:#1E437A}
.ka-btn-red{background:${RED};color:#fff;font-weight:700;box-shadow:0 8px 20px rgba(196,21,28,.24)}
.ka-btn-red:hover{background:#A11015;transform:translateY(-2px)}
.ka-btn-ghost{background:#fff;color:${NAVY};border:1.5px solid ${NAVY}}
.ka-btn-ghost:hover{background:#DCE6F2}
.ka-btn-glass{background:rgba(255,255,255,.1);color:#fff;border:1.5px solid rgba(255,255,255,.3)}
.ka-btn-glass:hover{background:rgba(255,255,255,.18)}
.ka-btn-lg{font-size:16px;padding:15px 30px;border-radius:12px}
.ka-btn-block{display:flex;width:100%;padding:13px}
/* header */
.ka-header{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.94);backdrop-filter:blur(10px);border-bottom:1px solid ${LINE};box-shadow:0 1px 2px rgba(13,31,56,.06)}
.ka-headrow{height:72px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.ka-logo{font-size:24px;font-weight:800;letter-spacing:.02em;background:none;border:none;cursor:pointer;font-family:inherit}
.ka-nav{display:flex;align-items:center;gap:28px}
.ka-nav a{font-size:15px;font-weight:600;color:${BODY}}
.ka-nav a:hover{color:${NAVY}}
/* hero */
.ka-hero{background:${BG_BLUE};overflow:hidden}
.ka-herogrid{padding:72px 24px 84px;display:grid;grid-template-columns:1.15fr .85fr;gap:56px;align-items:center}
.ka-eyebrow-pill{display:inline-block;font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${NAVY};background:#DCE6F2;padding:7px 14px;border-radius:999px;margin-bottom:22px}
.ka-h1{font-size:54px;line-height:1.08;font-weight:800;color:${INK};letter-spacing:-.01em;margin:0 0 22px}
.ka-lead{font-size:18px;line-height:1.65;color:${MUTED};max-width:520px;margin:0 0 32px}
.ka-hero-cta{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:34px}
.ka-hero-trust{display:flex;align-items:center;gap:18px;flex-wrap:wrap;color:${MUTED};font-size:14px;font-weight:500}
.ka-sep{width:1px;height:16px;background:#CBD5E1}
.ka-hero-media{position:relative}
.ka-hero-imgbg{position:absolute;inset:-14px -14px 20px 20px;background:${NAVY};border-radius:24px;opacity:.08}
.ka-hero-img{position:relative;aspect-ratio:4/5;border-radius:20px;overflow:hidden;box-shadow:0 20px 48px rgba(13,31,56,.16);background:repeating-linear-gradient(45deg,#E3EBF5,#E3EBF5 12px,#DAE4F0 12px,#DAE4F0 24px);display:flex;align-items:center;justify-content:center;text-align:center}
.ka-hero-img span{font-family:ui-monospace,monospace;font-size:13px;color:#7A889A;padding:16px}
.ka-hero-badge{position:absolute;bottom:-22px;left:-22px;background:#fff;border-radius:16px;padding:16px 20px;box-shadow:0 12px 30px rgba(13,31,56,.14);display:flex;align-items:center;gap:12px}
.ka-hero-badge-ic{width:44px;height:44px;border-radius:12px;background:#DCE6F2;display:flex;align-items:center;justify-content:center;font-size:22px}
/* trust */
.ka-trust{background:#fff;border-bottom:1px solid #EDF1F6}
.ka-trustgrid{padding:36px 24px;display:grid;grid-template-columns:repeat(4,1fr);gap:20px;text-align:center;max-width:1120px}
.ka-trust-bd{border-left:1px solid #EDF1F6}
/* sections */
.ka-sec-head{padding:84px 24px 40px;text-align:center;max-width:1120px}
.ka-eyebrow{font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px}
.ka-h2{font-size:36px;font-weight:800;color:${INK};letter-spacing:-.01em;max-width:680px;margin:0 auto 16px}
.ka-sub{font-size:17px;color:${MUTED};max-width:560px;margin:0 auto}
.ka-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1120px}
.ka-grid3-left{text-align:left}
.ka-h3{font-size:20px;font-weight:700;color:${INK};margin:0 0 10px}
.ka-card-p,.ka-course-desc{font-size:15px;line-height:1.6;color:${MUTED}}
.ka-card-soft{background:${BG_SOFT};border:1px solid ${LINE};border-radius:16px;padding:32px}
.ka-card{background:#fff;border-radius:16px;padding:34px;box-shadow:0 4px 16px rgba(13,31,56,.06)}
.ka-card-feat{box-shadow:0 6px 20px rgba(13,31,56,.1);border:1.5px solid ${NAVY};position:relative}
.ka-feat-tag{position:absolute;top:-12px;left:34px;background:${RED};color:#fff;font-size:12px;font-weight:700;padding:5px 12px;border-radius:999px}
.ka-ic{width:54px;height:54px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:18px}
.ka-ic-white{width:52px;height:52px;background:#fff;border:1px solid ${LINE}}
.ka-ic-blue{background:#DCE6F2}
.ka-ic-red{background:#FBE3E4}
/* courses */
.ka-course{background:#fff;border:1px solid ${LINE};border-radius:18px;overflow:hidden;box-shadow:0 4px 16px rgba(13,31,56,.06);display:flex;flex-direction:column;transition:all .16s}
.ka-course:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(13,31,56,.12)}
.ka-course-feat{border:1.5px solid ${RED};box-shadow:0 8px 26px rgba(13,31,56,.12)}
.ka-course-top{height:120px;background:repeating-linear-gradient(45deg,${NAVY},${NAVY} 14px,#1B3A66 14px,#1B3A66 28px);display:flex;align-items:flex-end;justify-content:space-between;padding:16px;color:#fff;font-weight:700;font-size:15px}
.ka-course-badge{background:${RED};font-size:11px;padding:4px 10px;border-radius:999px}
.ka-course-body{padding:24px;flex:1;display:flex;flex-direction:column}
.ka-pill{align-self:flex-start;font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;margin-bottom:12px}
.ka-pill-navy{color:${NAVY};background:#DCE6F2}
.ka-pill-red{color:${RED};background:#FBE3E4}
.ka-course-desc{margin:0 0 16px;flex:1}
.ka-course-meta{display:flex;flex-direction:column;gap:6px;font-size:13px;color:${MUTED};margin-bottom:18px}
.ka-course-foot{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #EDF1F6;padding-top:14px}
/* process */
.ka-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;text-align:left}
.ka-step{background:#fff;border-radius:16px;padding:28px 24px;box-shadow:0 4px 16px rgba(13,31,56,.06)}
.ka-step-last{background:${NAVY};box-shadow:0 8px 24px rgba(13,31,56,.18)}
.ka-step-n{width:44px;height:44px;border-radius:12px;background:${NAVY};color:#fff;font-weight:800;font-size:18px;display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.ka-step-n-red{background:${RED}}
.ka-step-t{font-size:17px;font-weight:700;color:${INK};margin:0 0 8px}
.ka-step-p{font-size:14px;line-height:1.6;color:${MUTED};margin:0}
/* avatar / testi */
.ka-avatar{width:46px;height:46px;border-radius:999px;background:repeating-linear-gradient(45deg,#DCE6F2,#DCE6F2 6px,#CDDBEC 6px,#CDDBEC 12px)}
/* pricing */
.ka-price{background:#fff;border:1px solid ${LINE};border-radius:18px;padding:32px;box-shadow:0 4px 16px rgba(13,31,56,.06)}
.ka-price-feat{border:1.5px solid ${RED};box-shadow:0 10px 30px rgba(13,31,56,.14);position:relative}
.ka-price-tag{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:${RED};color:#fff;font-size:12px;font-weight:700;padding:6px 16px;border-radius:999px;white-space:nowrap}
.ka-price-list{display:flex;flex-direction:column;gap:11px;font-size:14px;color:${BODY};margin-bottom:26px}
.ka-price-list span{display:flex;gap:9px}
/* faq */
.ka-faq-list{display:flex;flex-direction:column;gap:12px}
.ka-faq-item{border:1px solid ${LINE};border-radius:14px;overflow:hidden;background:#fff}
.ka-faq-q{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;text-align:left;background:none;border:none;cursor:pointer;padding:20px 22px;font-family:inherit;font-size:16px;font-weight:600;color:${INK}}
.ka-faq-sign{flex-shrink:0;width:26px;height:26px;border-radius:999px;background:#DCE6F2;color:${NAVY};font-weight:700;display:flex;align-items:center;justify-content:center;font-size:16px}
.ka-faq-a{padding:0 22px 22px;font-size:15px;line-height:1.65;color:${MUTED}}
/* final */
.ka-final{background:linear-gradient(135deg,${NAVY} 0%,${NAVY_DARK} 100%)}
.ka-final-h{font-size:40px;font-weight:800;color:#fff;letter-spacing:-.01em;margin:0 0 18px}
.ka-final-p{font-size:18px;line-height:1.6;color:#C6D3E5;max-width:560px;margin:0 auto 36px}
.ka-final-cta{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
/* footer */
.ka-footer{background:${NAVY_DARK};color:#B9C6DA}
.ka-footgrid{padding:64px 24px 32px;display:grid;grid-template-columns:1.4fr 1fr 1fr 1.2fr;gap:40px}
.ka-foot-logo{font-size:26px;font-weight:800;margin-bottom:14px}
.ka-foot-desc{font-size:14px;line-height:1.65;color:#8FA1BC;max-width:280px}
.ka-foot-h{font-size:14px;font-weight:700;color:#fff;margin-bottom:16px;text-transform:uppercase;letter-spacing:.04em}
.ka-foot-links{display:flex;flex-direction:column;gap:11px;font-size:14px}
.ka-foot-links a{color:#B9C6DA}
.ka-foot-links a:hover{color:#fff}
.ka-foot-bar{border-top:1px solid rgba(255,255,255,.1)}
.ka-foot-barrow{padding:22px 24px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:13px;color:#6E7F98}
/* fab */
.ka-fab{position:fixed;right:22px;bottom:22px;z-index:60;width:58px;height:58px;border-radius:999px;background:${RED};color:#fff;display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 8px 24px rgba(196,21,28,.4)}
/* responsive */
@media(max-width:960px){
  .ka-nav,.ka-header .ka-btn{display:none}
  .ka-herogrid,.ka-grid3,.ka-steps,.ka-footgrid{grid-template-columns:1fr!important}
  .ka-trustgrid{grid-template-columns:repeat(2,1fr)}
  .ka-h1{font-size:38px}.ka-h2,.ka-final-h{font-size:30px}
}
@media(max-width:560px){.ka-trustgrid{grid-template-columns:1fr}.ka-h1{font-size:32px}}
`;

/* ============================================================================
 * HƯỚNG DẪN TÍCH HỢP VÀO CODE HIỆN TẠI
 * ============================================================================
 *
 * Trong file component chính (nơi có `const navLinks = [...]`), làm 3 việc:
 *
 * 1) Import ở đầu file:
 *      import AboutPage from "./pages/AboutPage";   // sửa đường dẫn cho đúng
 *
 * 2) Thêm state trang, ngay cạnh các useState khác:
 *      const [page, setPage] = useState<"main" | "about">("main");
 *
 * 3a) Khi bấm "About" trên menu → gọi setPage("about"). Ví dụ chỗ render navLinks:
 *      {navLinks.map((link) => (
 *        <button
 *          key={link}
 *          onClick={() => {
 *            if (link === "About") setPage("about");
 *            // ...giữ nguyên xử lý cũ cho các mục khác
 *          }}
 *        >
 *          {link}
 *        </button>
 *      ))}
 *
 * 3b) Ngay đầu phần return của component chính, chèn:
 *      if (page === "about") {
 *        return <AboutPage onBack={() => setPage("main")} />;
 *      }
 *      // ...phần return trang chính giữ nguyên bên dưới
 *
 * FONT: để đúng chữ như thiết kế, thêm vào <head> (index.html) hoặc CSS gốc:
 *   <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
 *
 * LOGO: hiện dùng chữ "KAISH". Muốn dùng logo ảnh, thay khối <button className="ka-logo">
 *   bằng: <button className="ka-logo" onClick={onBack}><img src="/logo-horizontal.png" style={{height:44}} /></button>
 *
 * Nếu bạn dùng React Router thay vì state, tạo <Route path="/about" element={<AboutPage/>} />
 * và nút About là <Link to="/about">About</Link>.
 * ========================================================================== */
