import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, Shield, Delete, UserCheck } from 'lucide-react';
import accesosAPI from '../services/accesos';

const PIN_ADMIN = '1234';
const RED       = '#CC0000';
const RED_DIM   = 'rgba(204,0,0,0.15)';
const BEBAS     = "'Bebas Neue', sans-serif";

const FRASES = [
  ['SIN',       'EXCUSAS.'],
  ['CADA REP',  'CUENTA.'],
  ['TU LÍMITE', 'NO EXISTE.'],
  ['HOY ES',    'TU DÍA.'],
  ['SUDÁ.',     'MEJORÁ.'],
  ['LA FUERZA', 'SE ENTRENA.'],
  ['MÁS FUERTE','CADA DÍA.'],
  ['HACELO',    'POSIBLE.'],
];

const TIMER_CONFIRMACION = 12;
const TIMER_RESULTADO    = 5;
const MOTIVOS = {
  no_encontrado:   'DNI no registrado en el sistema',
  cliente_inactivo:'El cliente está dado de baja',
  sin_membresia:   'No tiene membresía activa',
  membresia_vencida:'La membresía está vencida',
};

// ─────────────────────────────────────────
//  Frase rotativa
// ─────────────────────────────────────────
function FraseRotativa({ fontSize = 'clamp(4.5rem, 11vw, 9rem)' }) {
  const [idx, setIdx]         = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const ciclo = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % FRASES.length);
        setVisible(true);
      }, 500);
    }, 4500);
    return () => clearInterval(ciclo);
  }, []);

  const [linea1, linea2] = FRASES[idx];
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.5s ease',
      lineHeight: 0.88,
      fontFamily: BEBAS,
      letterSpacing: '0.02em',
      userSelect: 'none',
    }}>
      <div style={{ fontSize, color: '#ffffff' }}>{linea1}</div>
      <div style={{ fontSize, color: RED }}>{linea2}</div>
    </div>
  );
}

// ─────────────────────────────────────────
//  Logo redondo con glow
// ─────────────────────────────────────────
function LogoCircle({ size = 88 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      border: `2px solid ${RED}`,
      boxShadow: `0 0 22px ${RED_DIM}, 0 0 6px ${RED_DIM}`,
      overflow: 'hidden',
      background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '8px',
      flexShrink: 0,
    }}>
      <img src="/logo-sky.png" alt="Sky Fitness"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </div>
  );
}

// ─────────────────────────────────────────
//  Barra de progreso countdown
// ─────────────────────────────────────────
function BarraProgreso({ porcentaje, color }) {
  return (
    <div style={{ marginTop: '1.4rem', background: '#111', borderRadius: 4, height: 3 }}>
      <div style={{
        width: `${porcentaje}%`, height: '100%',
        background: color, borderRadius: 4, transition: 'width 1s linear',
      }} />
    </div>
  );
}

// ─────────────────────────────────────────
//  Botones teclado
// ─────────────────────────────────────────
function NumBtn({ children, onClick, style = {} }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: h ? '#222' : '#131313', color: '#fff',
        border: '1px solid #1c1c1c', borderRadius: 10,
        padding: '1rem', fontSize: '1.5rem', fontFamily: BEBAS,
        cursor: 'pointer', transition: 'background 0.12s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...style,
      }}>
      {children}
    </button>
  );
}

function OkBtn({ onClick, disabled }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: disabled ? '#1a1a1a' : h ? '#aa0000' : RED,
        color: disabled ? '#333' : '#fff',
        border: 'none', borderRadius: 10, padding: '1rem',
        fontSize: '1.4rem', fontFamily: BEBAS, letterSpacing: '0.08em',
        cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
        boxShadow: disabled ? 'none' : `0 0 18px ${RED_DIM}`,
      }}>
      OK
    </button>
  );
}

function PinBtn({ children, onClick, style = {} }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: h ? '#1f1f1f' : '#0d0d0d', color: '#fff',
        border: '1px solid #1a1a1a', borderRadius: 8,
        padding: '0.7rem', fontSize: '1rem', fontWeight: 700,
        cursor: 'pointer', transition: 'background 0.12s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...style,
      }}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────
//  COMPONENTE PRINCIPAL
// ─────────────────────────────────────────
export default function AccesoKiosk() {
  const [estado, setEstado]     = useState('idle');
  const [dni, setDni]           = useState('');
  const [previa, setPrevia]     = useState(null);
  const [resultado, setResultado] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [showPin, setShowPin]   = useState(false);
  const [pin, setPin]           = useState('');
  const [pinError, setPinError] = useState(false);
  const [hora, setHora]         = useState(new Date());
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (estado === 'idle' && !showPin && inputRef.current)
      inputRef.current.focus();
  }, [estado, showPin]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => {
      setCountdown(c => { if (c <= 1) { resetear(); return 0; } return c - 1; });
    }, 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const resetear = useCallback(() => {
    setDni(''); setEstado('idle'); setPrevia(null); setResultado(null); setCountdown(0);
  }, []);

  const buscarCliente = useCallback(async () => {
    if (!dni.trim() || estado !== 'idle') return;
    setEstado('buscando');
    try {
      const res = await accesosAPI.buscarDni(dni);
      const data = res.data;
      if (!data.encontrado || !data.puede_entrar) {
        const res2 = await accesosAPI.validarDni(dni);
        setResultado(res2.data);
        setEstado('denegado');
        setCountdown(TIMER_RESULTADO);
      } else {
        setPrevia(data);
        setEstado('confirmando');
        setCountdown(TIMER_CONFIRMACION);
      }
    } catch {
      setResultado({ motivo: 'error', mensaje: 'Error de conexión' });
      setEstado('denegado');
      setCountdown(TIMER_RESULTADO);
    }
  }, [dni, estado]);

  const confirmarAcceso = useCallback(async () => {
    setEstado('procesando');
    setCountdown(0);
    try {
      const res = await accesosAPI.validarDni(dni);
      setResultado(res.data);
      setEstado(res.data.resultado);
      setCountdown(TIMER_RESULTADO);
    } catch {
      setResultado({ motivo: 'error', mensaje: 'Error de conexión' });
      setEstado('denegado');
      setCountdown(TIMER_RESULTADO);
    }
  }, [dni]);

  useEffect(() => {
    const h = (e) => {
      if (showPin) return;
      if (e.key === 'Enter' && estado === 'idle') buscarCliente();
      if (e.key === 'Escape' && estado === 'confirmando') resetear();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [showPin, estado, buscarCliente, resetear]);

  const presionarTecla = (key) => {
    if (estado !== 'idle') return;
    if (key === 'DEL') setDni(d => d.slice(0, -1));
    else if (key === 'OK') buscarCliente();
    else if (dni.length < 10) setDni(d => d + key);
  };

  const ingresarPinDigito = (digit) => {
    if (pin.length >= 4) return;
    const nuevo = pin + digit;
    setPin(nuevo);
    if (nuevo.length === 4) {
      if (nuevo === PIN_ADMIN) { window.location.href = '/'; }
      else {
        setPinError(true);
        setTimeout(() => { setPin(''); setPinError(false); }, 800);
      }
    }
  };

  const formatHora  = d => d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const formatFecha = d => d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  const esCargando  = estado === 'buscando' || estado === 'procesando';
  const porcConf    = countdown > 0 && estado === 'confirmando' ? (countdown / TIMER_CONFIRMACION) * 100 : 0;
  const porcResult  = countdown > 0 && (estado === 'permitido' || estado === 'denegado') ? (countdown / TIMER_RESULTADO) * 100 : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden', userSelect: 'none' }}>

      {/* Línea roja superior */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: RED }} />

      {/* Glow de fondo */}
      <div style={{
        position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
        width: '70vw', height: '300px',
        background: `radial-gradient(ellipse, rgba(204,0,0,0.1) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* ════ ESTADO IDLE — dos columnas ════ */}
      {estado === 'idle' && (
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          minHeight: 0,
        }}>

          {/* ── COLUMNA IZQUIERDA: frase ── */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '3rem 6vw 3.5rem 6vw',
            borderRight: `1px solid rgba(204,0,0,0.25)`,
            position: 'relative',
          }}>
            {/* Glow lateral derecho del separador */}
            <div style={{
              position: 'absolute', top: '10%', right: -1, width: 1, bottom: '10%',
              boxShadow: `0 0 18px 4px rgba(204,0,0,0.2)`,
              pointerEvents: 'none',
            }} />
            <FraseRotativa fontSize="clamp(4rem, 9vw, 8rem)" />
          </div>

          {/* ── COLUMNA DERECHA: input ── */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 2.5rem',
            position: 'relative',
          }}>

            {/* Hora — arriba derecha */}
            <div style={{ position: 'absolute', top: '1.4rem', right: '1.8rem', textAlign: 'right' }}>
              <div style={{ color: '#fff', fontSize: '2rem', fontFamily: BEBAS, letterSpacing: '0.05em' }}>
                {formatHora(hora)}
              </div>
              <div style={{ color: '#2a2a2a', fontSize: '0.65rem', textTransform: 'capitalize', marginTop: 2 }}>
                {formatFecha(hora)}
              </div>
            </div>

            {/* Logo redondo */}
            <LogoCircle size={90} />

            <p style={{
              color: '#3a3a3a', fontSize: '0.75rem', letterSpacing: '0.3em',
              textTransform: 'uppercase', fontFamily: BEBAS,
              marginTop: '1.5rem', marginBottom: '0.7rem',
            }}>
              Ingresá tu DNI
            </p>

            {/* Display DNI */}
            <div style={{
              background: '#0a0a0a', border: '1px solid #1c1c1c',
              borderBottom: `2px solid ${RED}`, borderRadius: 10,
              padding: '0.75rem 1.5rem', marginBottom: '1rem',
              width: '100%', maxWidth: 300,
            }}>
              <input
                ref={inputRef}
                type="text" inputMode="numeric"
                value={dni}
                onChange={e => setDni(e.target.value.replace(/\D/g, '').slice(0, 10))}
                style={{
                  background: 'transparent', color: '#fff', width: '100%', textAlign: 'center',
                  outline: 'none', border: 'none', fontSize: '2.4rem',
                  fontFamily: BEBAS, letterSpacing: '0.2em', caretColor: RED,
                }}
                placeholder="· · · · · · · ·"
                maxLength={10}
              />
            </div>

            {/* Teclado numérico */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: '100%', maxWidth: 300 }}>
              {['1','2','3','4','5','6','7','8','9'].map(n => (
                <NumBtn key={n} onClick={() => presionarTecla(n)}>{n}</NumBtn>
              ))}
              <NumBtn onClick={() => presionarTecla('DEL')} style={{ color: RED }}>
                <Delete size={20} style={{ margin: 'auto' }} />
              </NumBtn>
              <NumBtn onClick={() => presionarTecla('0')}>0</NumBtn>
              <OkBtn onClick={buscarCliente} disabled={!dni} />
            </div>
          </div>
        </div>
      )}

      {/* ════ CARGANDO ════ */}
      {esCargando && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
          <LogoCircle size={90} />
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            border: '3px solid #1a1a1a', borderTopColor: RED,
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: '#333', fontFamily: BEBAS, fontSize: '1.4rem', letterSpacing: '0.2em' }}>
            {estado === 'buscando' ? 'BUSCANDO...' : 'PROCESANDO...'}
          </p>
        </div>
      )}

      {/* ════ CONFIRMACIÓN ════ */}
      {estado === 'confirmando' && previa && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '2rem' }}>
          <div style={{
            width: '100%', maxWidth: 400, background: '#0a0a0a',
            border: '1px solid #1c1c1c', borderTop: `3px solid ${RED}`,
            borderRadius: 20, padding: '2.5rem 2rem', textAlign: 'center',
          }}>
            <LogoCircle size={70} />

            <UserCheck style={{ color: RED, margin: '1.2rem auto 0.8rem', display: 'block' }}
              size={44} strokeWidth={1.3} />

            <p style={{ color: '#444', fontFamily: BEBAS, fontSize: '0.85rem',
              letterSpacing: '0.3em', marginBottom: '0.5rem' }}>
              CONFIRMÁ TU IDENTIDAD
            </p>

            <h2 style={{ color: '#fff', fontFamily: BEBAS, fontSize: '2.8rem',
              letterSpacing: '0.05em', lineHeight: 1, margin: '0 0 0.3rem' }}>
              {previa.cliente}
            </h2>

            {previa.plan && (
              <p style={{ color: RED, fontFamily: BEBAS, fontSize: '1.1rem',
                letterSpacing: '0.1em', marginBottom: '1.8rem' }}>
                {previa.plan}
              </p>
            )}

            <p style={{ color: '#3a3a3a', fontSize: '0.78rem', marginBottom: '1.4rem' }}>
              ¿Sos vos?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={resetear} style={{
                background: '#111', border: '1px solid #222', color: '#555',
                borderRadius: 12, padding: '0.9rem', fontFamily: BEBAS,
                fontSize: '1rem', letterSpacing: '0.1em', cursor: 'pointer',
              }}>
                NO, CANCELAR
              </button>
              <button onClick={confirmarAcceso} style={{
                background: RED, border: 'none', color: '#fff',
                borderRadius: 12, padding: '0.9rem', fontFamily: BEBAS,
                fontSize: '1rem', letterSpacing: '0.1em', cursor: 'pointer',
                boxShadow: `0 0 24px ${RED_DIM}`,
              }}>
                SÍ, SOY YO
              </button>
            </div>

            <BarraProgreso porcentaje={porcConf} color="#2a2a2a" />
            <p style={{ color: '#1f1f1f', fontSize: '0.65rem', marginTop: 6 }}>
              Cancelando en {countdown}s...
            </p>
          </div>
        </div>
      )}

      {/* ════ PERMITIDO ════ */}
      {estado === 'permitido' && resultado && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '2rem' }}>
          <div style={{
            width: '100%', maxWidth: 420, textAlign: 'center',
            background: 'rgba(0,30,0,0.5)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 24, padding: '3rem 2rem',
          }}>
            <LogoCircle size={70} />
            <CheckCircle style={{ color: '#22c55e', margin: '1.5rem auto 1rem', display: 'block' }}
              size={80} strokeWidth={1.1} />
            <h2 style={{ color: '#22c55e', fontFamily: BEBAS, fontSize: '3.5rem',
              letterSpacing: '0.12em', margin: '0 0 1rem' }}>
              BIENVENIDO
            </h2>
            <p style={{ color: '#fff', fontFamily: BEBAS, fontSize: '2rem', letterSpacing: '0.06em' }}>
              {resultado.cliente}
            </p>
            <p style={{ color: '#22c55e', fontFamily: BEBAS, fontSize: '1.1rem',
              letterSpacing: '0.1em', marginTop: 4 }}>
              {resultado.plan}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, color: '#2a2a2a', marginTop: '1.2rem', fontSize: '0.8rem' }}>
              <Clock size={13} />
              <span>{resultado.dias_restantes} días restantes</span>
            </div>
            <BarraProgreso porcentaje={porcResult} color="#22c55e" />
            <p style={{ color: '#1f1f1f', fontSize: '0.65rem', marginTop: 6 }}>
              Cerrando en {countdown}s...
            </p>
          </div>
        </div>
      )}

      {/* ════ DENEGADO ════ */}
      {estado === 'denegado' && resultado && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '2rem' }}>
          <div style={{
            width: '100%', maxWidth: 420, textAlign: 'center',
            background: 'rgba(30,0,0,0.6)', border: `1px solid ${RED}44`,
            borderRadius: 24, padding: '3rem 2rem',
          }}>
            <LogoCircle size={70} />
            <XCircle style={{ color: RED, margin: '1.5rem auto 1rem', display: 'block' }}
              size={80} strokeWidth={1.1} />
            <h2 style={{ color: RED, fontFamily: BEBAS, fontSize: '3rem',
              letterSpacing: '0.12em', margin: '0 0 1rem' }}>
              ACCESO DENEGADO
            </h2>
            {resultado.cliente && (
              <p style={{ color: '#fff', fontFamily: BEBAS, fontSize: '2rem',
                letterSpacing: '0.06em', marginBottom: 8 }}>
                {resultado.cliente}
              </p>
            )}
            <p style={{ color: '#888', fontSize: '0.9rem' }}>
              {MOTIVOS[resultado.motivo] || resultado.mensaje}
            </p>
            {(resultado.motivo === 'membresia_vencida' || resultado.motivo === 'sin_membresia') && (
              <p style={{ color: '#333', fontSize: '0.78rem', marginTop: 8 }}>
                Acercate a recepción para renovar tu membresía
              </p>
            )}
            <BarraProgreso porcentaje={porcResult} color={RED} />
            <p style={{ color: '#1f1f1f', fontSize: '0.65rem', marginTop: 6 }}>
              Cerrando en {countdown}s...
            </p>
          </div>
        </div>
      )}

      {/* Botón admin oculto */}
      <div style={{ position: 'absolute', bottom: 14, right: 14, zIndex: 10 }}>
        <button onClick={() => { setShowPin(true); setPin(''); setPinError(false); }}
          style={{ color: '#1a1a1a', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          title="Panel administrativo">
          <Shield size={15} />
        </button>
      </div>

      {/* Línea inferior */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: `${RED}44` }} />

      {/* Keyframe para el spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ════ MODAL PIN ════ */}
      {showPin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{
            background: '#0a0a0a', border: '1px solid #1c1c1c',
            borderTop: `3px solid ${RED}`, borderRadius: 18, padding: '2rem', width: 280,
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <LogoCircle size={54} />
            </div>
            <h3 style={{ color: '#fff', fontFamily: BEBAS, fontSize: '0.9rem',
              letterSpacing: '0.25em', textAlign: 'center', marginBottom: 4 }}>
              ACCESO ADMINISTRATIVO
            </h3>
            <p style={{ color: '#2a2a2a', fontSize: '0.7rem', textAlign: 'center', marginBottom: '1.4rem' }}>
              Ingresá el PIN de 4 dígitos
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: '1.4rem' }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  width: 13, height: 13, borderRadius: '50%',
                  background: pinError ? RED : i < pin.length ? RED : '#1c1c1c',
                  transition: 'all 0.15s', transform: pinError ? 'scale(1.2)' : 'scale(1)',
                }} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {['1','2','3','4','5','6','7','8','9'].map(n => (
                <PinBtn key={n} onClick={() => ingresarPinDigito(n)}>{n}</PinBtn>
              ))}
              <PinBtn onClick={() => setPin(p => p.slice(0, -1))} style={{ color: RED }}>
                <Delete size={14} style={{ margin: 'auto' }} />
              </PinBtn>
              <PinBtn onClick={() => ingresarPinDigito('0')}>0</PinBtn>
              <PinBtn onClick={() => { setShowPin(false); setPin(''); }}
                style={{ color: '#333', fontSize: '0.7rem' }}>
                Cancelar
              </PinBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
