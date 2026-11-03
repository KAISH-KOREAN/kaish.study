import { useEffect, useRef, useState } from "react";
import "./AboutPage.css";

const sections = [
  ["Journey", "founder-journey"],
  ["Research", "founder-research"],
  ["Projects", "founder-projects"],
  ["Credentials", "founder-credentials"],
  ["Beyond research", "founder-beyond"],
] as const;

const credentials = [
  {
    title: "Net Zero 101: What, Why and How",
    issuer:
      "United Nations University Institute for the Advanced Study of Sustainability",
    date: "2026",
    kind: "Course completion",
  },
  {
    title: "Introduction to Urban Planning",
    issuer: "University of Seoul",
    date: "2025",
    kind: "Course completion",
  },
  {
    title:
      "Site Planning: Toward Shared Grounds Between Urban Design and Architecture",
    issuer: "University of Seoul",
    date: "2025",
    kind: "Course completion",
  },
  {
    title: "Urban Space and Residential Culture in Korea",
    issuer: "Yonsei University",
    date: "2025",
    kind: "Course completion",
  },
  {
    title:
      "History of Urban Development and the Lives of the Ruled Class of Seoul during the 1960s and 1970s",
    issuer: "Yonsei University",
    date: "2025",
    kind: "Course completion",
  },
  {
    title: "Regular Member",
    issuer: "Korea Planning Association",
    date: "2026",
    kind: "Professional membership",
  },
];

export function AboutOverlay() {
  const [open, setOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncHash = () => setOpen(window.location.hash === "#about");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        const focusable = dialog.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function close() {
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    setOpen(false);
    window.requestAnimationFrame(() =>
      document.querySelector<HTMLElement>('a[href="#about"]')?.focus(),
    );
  }

  if (!open) return null;

  return (
    <div
      ref={dialog}
      className="founder-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="founder-title"
    >
      <div className="founder-page">
        <header className="founder-header">
          <a
            className="founder-brand"
            href="#about"
            aria-label="KAISH founder portfolio home"
          >
            KAISH<span className="founder-dot">.</span> <span>FOUNDER</span>
          </a>
          <nav className="founder-nav" aria-label="Founder portfolio sections">
            {sections.map(([label, id]) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  document
                    .getElementById(id)
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {label}
              </button>
            ))}
          </nav>
          <button
            ref={closeButton}
            className="founder-close"
            type="button"
            onClick={close}
            aria-label="Close founder portfolio"
          >
            <span aria-hidden="true">×</span> Close
          </button>
        </header>

        <main>
          <section className="founder-hero" aria-labelledby="founder-title">
            <div className="founder-hero-copy">
              <p className="founder-script">hello, I’m</p>
              <h1 id="founder-title">
                Vo Thanh
                <br />
                Quang<span className="founder-dot">.</span>
              </h1>
              <p className="founder-hero-role">
                Urban planning researcher <span>•</span> Founder of KAISH
              </p>
              <p className="founder-intro">
                I study how cities grow, adapt to climate change, and shape the
                lives of the people who call them home. I am a PhD researcher in
                Urban Planning at Seoul National University’s Graduate School of
                Environmental Studies, affiliated with the Sustainable &amp;
                Smart City Lab (SNS Lab).
              </p>
              <div className="founder-hero-actions">
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("founder-research")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Explore my research <span aria-hidden="true">↗</span>
                </button>
                <button
                  className="founder-quiet-button"
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("founder-journey")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  My journey <span aria-hidden="true">↓</span>
                </button>
              </div>
              <p className="founder-current">
                <span className="founder-pulse" /> Currently researching climate
                resilient cities in Seoul
              </p>
            </div>
            <div className="founder-visuals">
              <figure className="founder-portrait">
                <img
                  src="/anh-chan-dung.jpg"
                  alt="Vo Thanh Quang"
                  width={1616}
                  height={2880}
                  decoding="async"
                />
                <figcaption>
                  <strong>Vo Thanh Quang</strong>
                  <span>Urban planning researcher</span>
                </figcaption>
              </figure>
              <div
                className="founder-map"
                aria-label="Illustrated connection between Vietnam and South Korea"
              >
                <div className="founder-map-lines" aria-hidden="true" />
                <div className="founder-map-title">
                  A research journey across cities
                </div>
                <div className="founder-map-path" aria-hidden="true" />
                <div className="founder-city founder-city-one">
                  <span className="founder-city-pin" />
                  <strong>Ho Chi Minh City</strong>
                  <small>Vietnam · where my questions began</small>
                </div>
                <div className="founder-city founder-city-two">
                  <span className="founder-city-pin" />
                  <strong>Seoul</strong>
                  <small>South Korea · where I study them</small>
                </div>
                <div className="founder-map-footer">
                  URBAN CHANGE / CLIMATE / COMMUNITY
                </div>
              </div>
            </div>
          </section>

          <div className="founder-ticker" aria-hidden="true">
            <span>URBAN PLANNING</span>
            <b>✳</b>
            <span>CLIMATE ADAPTATION</span>
            <b>✳</b>
            <span>CARBON ACCOUNTING</span>
            <b>✳</b>
            <span>SUSTAINABLE CITIES</span>
          </div>

          <section
            className="founder-section"
            id="founder-journey"
            aria-labelledby="founder-journey-title"
          >
            <div className="founder-section-heading">
              <p>the path</p>
              <h2 id="founder-journey-title">
                From language and culture
                <br />
                to the future of cities.
              </h2>
            </div>
            <div className="founder-timeline">
              <article>
                <span>Now</span>
                <div>
                  <h3>PhD in Urban Planning</h3>
                  <p>
                    Seoul National University · Graduate School of Environmental
                    Studies · Sustainable &amp; Smart City Lab (SNS Lab)
                  </p>
                </div>
              </article>
              <article>
                <span>2023–2025</span>
                <div>
                  <h3>Master’s in Urban Planning</h3>
                  <p>Dankook University, South Korea</p>
                </div>
              </article>
              <article>
                <span>2019–2020</span>
                <div>
                  <h3>Exchange student</h3>
                  <p>Yeungnam University, South Korea</p>
                </div>
              </article>
              <article>
                <span>Earlier</span>
                <div>
                  <h3>
                    BA in Oriental Studies, specializing in Korean Studies
                  </h3>
                  <p>
                    Studied Korean culture, history and language, alongside the
                    cultures, histories and languages of the Indochinese
                    Peninsula.
                  </p>
                </div>
              </article>
            </div>
          </section>

          <section
            className="founder-section founder-section-dark"
            id="founder-research"
            aria-labelledby="founder-research-title"
          >
            <div className="founder-section-heading">
              <p>research notebook</p>
              <h2 id="founder-research-title">Questions I am working on.</h2>
              <span>
                Working papers and presentations are labelled by their current
                status.
              </span>
            </div>
            <div className="founder-research-grid">
              <article className="founder-research-card">
                <span className="founder-chip">Manuscript in progress</span>
                <h3>
                  Urban expansion and carbon storage in Ho Chi Minh City,
                  2002–2026
                </h3>
                <p>
                  Using land cover transitions and carbon density estimates to
                  examine how urban growth changes ecosystem carbon storage.
                </p>
                <small>Land use · carbon storage · Vietnam</small>
              </article>
              <article className="founder-research-card">
                <span className="founder-chip">Manuscript in progress</span>
                <h3>Heat hotspots and vulnerable populations across Vietnam</h3>
                <p>
                  Mapping long term heat trends and emerging hotspots to
                  understand where climate risks overlap with social
                  vulnerability.
                </p>
                <small>Extreme heat · climate adaptation · Vietnam</small>
              </article>
              <article className="founder-research-card">
                <span className="founder-chip">Conference presentation</span>
                <h3>Oral presentation</h3>
                <p>
                  A conference program entry is available. The presentation
                  title and publication details can be added when confirmed.
                </p>
                <a
                  href="https://kst.or.kr/bbs/board.php?bo_table=tugo_programbook94&wr_id=442"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View program ↗
                </a>
              </article>
            </div>
          </section>

          <section
            className="founder-section"
            id="founder-projects"
            aria-labelledby="founder-projects-title"
          >
            <div className="founder-section-heading">
              <p>current work</p>
              <h2 id="founder-projects-title">Research in practice.</h2>
            </div>
            <div className="founder-project-list">
              <article>
                <div className="founder-project-meta">
                  <span>2026–2027</span>
                  <strong>BK21 FOUR</strong>
                </div>
                <div>
                  <h3>
                    Training innovative researchers for sustainable urban
                    transitions
                  </h3>
                  <p>
                    Participating PhD student in the Ministry of Education’s
                    BK21 FOUR program, led by Professor Soonjin Yoon.
                  </p>
                  <dl>
                    <div>
                      <dt>Project number</dt>
                      <dd>A0459-20260100</dd>
                    </div>
                    <div>
                      <dt>Period</dt>
                      <dd>March 1, 2026 – February 28, 2027</dd>
                    </div>
                  </dl>
                </div>
              </article>
              <article>
                <div className="founder-project-meta">
                  <span>2026</span>
                  <strong>Commissioned research</strong>
                </div>
                <div>
                  <h3>
                    Advancing the quantification and application of avoided
                    emissions for climate adaptation and carbon management
                  </h3>
                  <p>
                    PhD researcher on a project commissioned by the Korea
                    Conformity Laboratories and led by Professor Jaemin Song. I
                    review international voluntary carbon markets, compare
                    credit systems and governance at major standards bodies
                    including Verra, and lead Chapter 1, “Comprehensive Review
                    of International Voluntary Carbon Trading Systems.”
                  </p>
                  <dl>
                    <div>
                      <dt>Project number</dt>
                      <dd>0434-20260095</dd>
                    </div>
                    <div>
                      <dt>Period</dt>
                      <dd>August 13 – November 30, 2026</dd>
                    </div>
                  </dl>
                </div>
              </article>
            </div>
          </section>

          <section
            className="founder-section founder-credentials-section"
            id="founder-credentials"
            aria-labelledby="founder-credentials-title"
          >
            <div className="founder-section-heading">
              <p>recognition &amp; learning</p>
              <h2 id="founder-credentials-title">Always learning.</h2>
            </div>
            <div className="founder-scholarship">
              <span className="founder-spark" aria-hidden="true">
                ✳
              </span>
              <div>
                <small>Scholarship · 2023</small>
                <h3>Korean Government Scholarship</h3>
                <p>Master’s degree track</p>
              </div>
            </div>
            <div className="founder-credential-grid">
              {credentials.map((item) => (
                <article key={item.title}>
                  <span>
                    {item.kind} · {item.date}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.issuer}</p>
                </article>
              ))}
            </div>
          </section>

          <section
            className="founder-section founder-beyond"
            id="founder-beyond"
            aria-labelledby="founder-beyond-title"
          >
            <div>
              <p className="founder-script">off the field notes</p>
              <h2 id="founder-beyond-title">A different kind of focus.</h2>
              <p>
                Outside research, I play futsal as a goalkeeper for the HUFLIT
                football team. A team photo will join this section soon.
              </p>
            </div>
            <div
              className="founder-sport-art"
              aria-label="Graphic placeholder for a future futsal team photograph"
            >
              <span>01</span>
              <strong>
                GOAL
                <br />
                KEEPER
              </strong>
              <small>HUFLIT FUTSAL</small>
            </div>
          </section>
        </main>
        <footer className="founder-footer">
          <strong>
            Vo Thanh Quang<span className="founder-dot">.</span>
          </strong>
          <span>Founder of KAISH · Urban planning researcher</span>
          <button
            type="button"
            onClick={() =>
              document
                .querySelector(".founder-page")
                ?.scrollTo({ top: 0, behavior: "smooth" })
            }
          >
            Back to top ↑
          </button>
        </footer>
      </div>
    </div>
  );
}
