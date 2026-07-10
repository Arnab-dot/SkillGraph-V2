import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Cpu, FileText, Database, Network, ArrowRight, LineChart } from 'lucide-react';

// Matrix Rain Backdrop Component
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const chars = '01{}[]()<>#_-$@+*!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charArr = chars.split('');
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(0).map(() => Math.floor(Math.random() * -100));

    const draw = () => {
      ctx.fillStyle = 'rgba(3, 3, 8, 0.08)'; // Trail effect matching obsidian background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px "Share Tech Mono"`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArr[Math.floor(Math.random() * charArr.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (Math.random() > 0.98) {
          ctx.fillStyle = '#ffffff'; // White flash
        } else if (Math.random() > 0.95) {
          ctx.fillStyle = '#bc3bf0'; // Neon purple
        } else {
          ctx.fillStyle = '#00f0ff'; // Neon cyan
        }

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.3,
        zIndex: 0,
      }}
    />
  );
}

// Live Terminal Simulation Component
function SimulatedTerminal() {
  const [logs, setLogs] = useState<string[]>([]);
  const logsPool = [
    'INIT: Loading job embeddings model (all-MiniLM-L6-v2)...',
    'STATUS: Embeddings model loaded. Ready for ingestion.',
    'INGEST: Fetching latest job postings from database...',
    'INGEST: Loaded 48,291 posting vectors.',
    'UMAP: Starting dimensional reduction d=384 -> d=2...',
    'UMAP: Iteration 200/500 - Kullback-Leibler divergence: 0.281',
    'UMAP: Finished projection. Shape: (48291, 2)',
    'HDBSCAN: Running density clustering (min_cluster_size=25, min_samples=5)...',
    'HDBSCAN: Discovered 47 distinct skill clusters.',
    'BERTopic: Computing c-TF-IDF keyword ranks for topics...',
    'BERTopic: Discovered Cluster 12: React, TypeScript, Next.js, Tailwind',
    'BERTopic: Discovered Cluster 29: PyTorch, TensorFlow, LSTM, Transformers',
    'ANOMALY: Running autoencoder reconstruction anomaly check...',
    'ANOMALY: Detected 34 novel job titles out of threshold range.',
    'LSTM: Running predictive forecasting on Cluster 12 history...',
    'LSTM: Growth predicted for Next.js over Q3: +14.8%',
    'SYNC: NetworkX graph indices updated. Graph coverage: 94.2%',
  ];

  useEffect(() => {
    let index = 0;
    setLogs([logsPool[0], logsPool[1], logsPool[2]]);
    index = 3;

    const timer = setInterval(() => {
      setLogs(prev => {
        const next = [...prev, logsPool[index]];
        if (next.length > 8) next.shift(); // Keep last 8 lines
        return next;
      });
      index = (index + 1) % logsPool.length;
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-claymorphism" style={{
      width: '100%',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.8rem',
      padding: '1.25rem',
      background: 'rgba(5, 5, 12, 0.85)',
      color: '#e2e8f0',
      minHeight: '230px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      textAlign: 'left',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid rgba(0, 240, 255, 0.2)', paddingBottom: '0.5rem' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff0055' }} />
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffaa00' }} />
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#39ff14' }} />
        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>skillgraph_ai_engine.log</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {logs.map((log, i) => (
          <div key={i} style={{
            opacity: i === logs.length - 1 ? 1 : 0.65,
            transition: 'opacity 0.3s ease',
            color: log.includes('INIT') || log.includes('STATUS') ? '#00f0ff' : 
                   log.includes('HDBSCAN') || log.includes('BERTopic') ? '#bc3bf0' :
                   log.includes('LSTM') ? '#39ff14' : '#e2e8f0',
          }}>
            <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>$</span>
            {log}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>$</span>
          <span style={{ width: '6px', height: '12px', background: '#00f0ff', animation: 'pulse-glow 1s infinite' }} />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [scrollPos, setScrollPos] = useState(0);
  const [hasCSSParallax, setHasCSSParallax] = useState(true);

  useEffect(() => {
    // Detect CSS timeline support
    const supportsCSS = CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
    setHasCSSParallax(supportsCSS);

    if (!supportsCSS) {
      // Set scroll position for parallax fallback
      const handleScroll = () => {
        setScrollPos(window.scrollY);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });

      // Fallback for browsers that do not support native CSS timelines (e.g. Firefox)
      const sections = document.querySelectorAll('.cinematic-section');
      const contents = document.querySelectorAll('.cinematic-content');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const index = Array.from(sections).indexOf(entry.target);
          if (index !== -1 && contents[index]) {
            const content = contents[index] as HTMLElement;
            const ratio = entry.intersectionRatio;
            
            // Interpolate values corresponding to the CSS animation
            content.style.opacity = String(0.15 + ratio * 0.85);
            content.style.transform = `scale(${0.95 + ratio * 0.05}) translateY(${(1 - ratio) * 40}px)`;
            content.style.filter = `blur(${(1 - ratio) * 6}px)`;
          }
        });
      }, {
        threshold: Array.from({ length: 101 }, (_, i) => i / 100)
      });

      sections.forEach(sec => observer.observe(sec));

      return () => {
        window.removeEventListener('scroll', handleScroll);
        sections.forEach(sec => observer.unobserve(sec));
      };
    }
  }, []);

  // Compute JS-fallback offsets
  const getOffset = (factor: number) => {
    if (hasCSSParallax) return {};
    return {
      transform: `translateY(${scrollPos * factor}px)`,
    };
  };

  return (
    <div style={{ position: 'relative', overflowX: 'clip', background: 'var(--bg-primary)' }}>
      {/* BACKGROUND MATRIX GRID */}
      <div className="cyber-grid" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} />
      
      {/* ── SECTION 1: HERO ── */}
      <section className="cinematic-section parallax-section" style={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1.5rem',
        zIndex: 2,
        overflow: 'hidden',
      }}>
        <MatrixRain />

        {/* Floating background blobs (claymorphic/glassmorphic lights) */}
        <div 
          className="parallax-layer-slow" 
          style={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(188, 59, 240, 0.12) 0%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
            ...getOffset(0.08),
          }} 
        />
        <div 
          className="parallax-layer-fast" 
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '8%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
            ...getOffset(-0.06),
          }} 
        />

        <div className="cinematic-content" style={{ position: 'relative', zIndex: 2, maxWidth: '900px', textAlign: 'center', marginTop: '-3rem' }}>
          {/* Tagline label */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.2rem', borderRadius: '40px', background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.15)', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent-cyan)' }}>
              UNLEASH NEURAL MARKET INTELLIGENCE
            </span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6.5vw, 5rem)',
            fontFamily: 'var(--font-sans)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            marginBottom: '1.5rem',
            position: 'relative',
          }}>
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 40px rgba(0, 240, 255, 0.15)' }}>
              SKILLGRAPH
            </span>
            <span style={{ color: 'var(--accent-cyan)', fontSize: '1.5rem', verticalAlign: 'super', marginLeft: '0.4rem' }}>v2</span>
          </h1>

          {/* Sci-fi layout description */}
          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            maxWidth: '750px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}>
            An unsupervised job market intelligence tool analyzing postings using UMAP, HDBSCAN clusters, and BERTopic networks. Discover trends, forecast with TensorFlow LSTMs, and diagnose skill gaps.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="glass-claymorphism" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1.75rem',
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.92rem',
              color: 'white',
              border: 'none',
              boxShadow: '0 8px 25px rgba(188, 59, 240, 0.35)',
            }}>
              Launch Platform Dashboard
              <ArrowRight size={16} />
            </Link>
            <Link to="/resume" className="glass-claymorphism" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1.75rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.92rem',
              color: 'var(--text-primary)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              Analyze Skill Gaps
              <FileText size={16} />
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div style={{ position: 'absolute', bottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 0.5 }}>
          <span style={{ fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>SCROLL DOWN</span>
          <div style={{ width: '2px', height: '40px', background: 'linear-gradient(to bottom, var(--accent-cyan), transparent)', borderRadius: '1px' }} />
        </div>
      </section>

      {/* ── SECTION 2: UNSUPERVISED INTELLIGENCE ── */}
      <section className="cinematic-section parallax-section" style={{
        position: 'relative',
        padding: '8rem 2rem',
        borderTop: '1px solid var(--border-color)',
        zIndex: 2,
        background: '#04040a',
      }}>
        {/* Floating elements */}
        <div 
          className="parallax-layer-slow" 
          style={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            width: '180px',
            height: '180px',
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
            ...getOffset(0.05),
          }} 
        />

        <div className="cinematic-content" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--accent-purple)', marginBottom: '0.75rem', fontWeight: 600 }}>
              MODULE 01
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>
              Unsupervised Clustering and <br />
              <span style={{ background: 'var(--gradient-secondary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Skill Mapping
              </span>
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
              Our engine takes high-dimensional embeddings from hundreds of thousands of job postings and projects them using UMAP. It then runs HDBSCAN to discover natural clusters without preset human limitations. We extract exact topics with BERTopic c-TF-IDF calculations.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="glass-claymorphism" style={{ padding: '1.25rem' }}>
                <Cpu size={22} color="var(--accent-cyan)" style={{ marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: '#fff' }}>No Bias Tagging</h4>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>Clusters form automatically based on real market requirements, not arbitrary industry tags.</p>
              </div>
              <div className="glass-claymorphism" style={{ padding: '1.25rem' }}>
                <Brain size={22} color="var(--accent-purple)" style={{ marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: '#fff' }}>c-TF-IDF Modeling</h4>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>Documents are analyzed locally to discover critical keywords that differentiate target categories.</p>
              </div>
            </div>
          </div>

          <div style={{ width: '100%' }}>
            <SimulatedTerminal />
          </div>
        </div>
      </section>

      {/* ── SECTION 3: NEURAL DEMAND FORECASTING ── */}
      <section className="cinematic-section parallax-section" style={{
        position: 'relative',
        padding: '8rem 2rem',
        borderTop: '1px solid var(--border-color)',
        zIndex: 2,
        background: '#020206',
      }}>
        {/* Floating background details */}
        <div 
          className="parallax-layer-fast" 
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '12%',
            width: '240px',
            height: '240px',
            background: 'radial-gradient(circle, rgba(57, 255, 20, 0.06) 0%, transparent 70%)',
            filter: 'blur(35px)',
            pointerEvents: 'none',
            ...getOffset(-0.07),
          }} 
        />

        <div className="cinematic-content" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem', alignItems: 'center' }}>
          
          {/* Graphical Mock Showcase */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-claymorphism" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LineChart size={16} color="var(--accent-green)" />
                  <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#fff' }}>TF LSTM FORECASTER</span>
                </div>
                <span style={{ fontSize: '0.62rem', background: 'rgba(57, 255, 20, 0.1)', color: 'var(--accent-green)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(57, 255, 20, 0.3)' }}>ONLINE</span>
              </div>

              {/* Graphic container */}
              <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '6%', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {[
                  { month: 'Jan', val: '28%', forecast: false },
                  { month: 'Feb', val: '34%', forecast: false },
                  { month: 'Mar', val: '45%', forecast: false },
                  { month: 'Apr', val: '48%', forecast: false },
                  { month: 'May', val: '59%', forecast: false },
                  { month: 'Jun', val: '72%', forecast: true },
                  { month: 'Jul', val: '88%', forecast: true },
                ].map((item, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{
                      width: '100%',
                      height: item.val,
                      background: item.forecast ? 'var(--gradient-success)' : 'var(--gradient-primary)',
                      borderRadius: '4px 4px 0 0',
                      boxShadow: item.forecast ? '0 0 10px rgba(57, 255, 20, 0.2)' : 'none',
                      opacity: item.forecast ? 0.9 : 0.7,
                      transition: 'all 0.3s ease',
                    }} />
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>{item.month}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <span>HISTORICAL DATA</span>
                <span style={{ color: 'var(--accent-green)' }}>NEURAL FORECAST</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="glass-claymorphism" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>PyTorch AE Loss</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>0.0142</span>
              </div>
              <div className="glass-claymorphism" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>LSTM Accuracy</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-green)' }}>92.81%</span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--accent-green)', marginBottom: '0.75rem', fontWeight: 600 }}>
              MODULE 02
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>
              Predictive Demand and <br />
              <span style={{ background: 'var(--gradient-success)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                LSTM Forecasts
              </span>
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
              Predict which skills will dominate the tech landscape next. By modeling monthly job frequencies as deep temporal sequence data, our TensorFlow LSTM networks project volume trends up to 12 months in advance.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { title: 'Time Series Modeling', desc: 'Identifies seasonal variance and long-term skill trajectories.' },
                { title: 'Anomaly Flags via PyTorch Autoencoder', desc: 'Flags highly abnormal skill pairings to identify revolutionary new roles.' }
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)', marginTop: '0.6rem' }} />
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.75rem' }}>{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* ── SECTION 4: RESUME GAP ROADMAP ── */}
      <section className="cinematic-section parallax-section" style={{
        position: 'relative',
        padding: '8rem 2rem',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 2,
        background: '#04040e',
      }}>
        {/* Floating background details */}
        <div 
          className="parallax-layer-slow" 
          style={{
            position: 'absolute',
            top: '15%',
            left: '35%',
            width: '260px',
            height: '260px',
            background: 'radial-gradient(circle, rgba(188, 59, 240, 0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
            ...getOffset(0.04),
          }} 
        />

        <div className="cinematic-content" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', marginBottom: '0.75rem', fontWeight: 600 }}>
              MODULE 03
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>
              Resume Analysis and <br />
              <span style={{ background: 'var(--gradient-cyber)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Skill Gap Roadmap
              </span>
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
              Upload your PDF resume to map your profile against our high-dimensional market clusters. Our engine computes semantic matches, graphs direct connectivity pathways, and highlights critical missing knowledge areas.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { title: 'Interactive Learning Paths', label: 'Suggests concrete courses or projects to close discovered gaps.' },
                { title: 'Graph Alignment Scoring', label: 'Visualizes your proximity to central market skill nodes.' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.25)' }}>
                    <Database size={16} color="var(--accent-cyan)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Upload Card Mockup */}
          <div className="glass-claymorphism" style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{
              border: '2px dashed rgba(0, 240, 255, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '2.5rem 1.5rem',
              background: 'rgba(3, 3, 8, 0.4)',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.25)'}
            >
              <FileText size={36} color="var(--accent-cyan)" style={{ margin: '0 auto 1rem', filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.3))' }} />
              <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.5rem' }}>Drag & Drop Resume</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Supports PDF, DOCX up to 5MB</p>
              
              <Link to="/resume" className="glass-claymorphism" style={{
                display: 'inline-block',
                padding: '0.5rem 1.25rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#fff',
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '6px',
              }}>
                Browse Files
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: FOOTER CTA ── */}
      <section style={{
        padding: '5rem 2rem',
        textAlign: 'center',
        background: '#010103',
        zIndex: 2,
        position: 'relative',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 700 }}>
            READY TO INGEST MARKET DATA
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Gain real-time intelligence into the tech market and map your professional growth vector.
          </p>
          <Link to="/dashboard" className="glass-claymorphism" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 2rem',
            background: 'var(--gradient-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}>
            Ingest System
            <Network size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
