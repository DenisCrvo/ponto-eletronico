// === Constantes da jornada ===
// 44h semanais distribuídas de seg a sex = 8h48min/dia
const MIN_JORNADA_DIARIA = 8 * 60 + 48; // 528 min

// === Conversões HH:MM <-> minutos ===
function hmToMin(hm) {
  if (!hm || typeof hm !== 'string') return 0;
  const [h, m] = hm.split(':').map(Number);
  return (h * 60) + m;
}

function minToHm(min) {
  const sign = min < 0 ? '-' : '';
  const abs = Math.abs(min);
  const h = String(Math.floor(abs / 60)).padStart(2, '0');
  const m = String(abs % 60).padStart(2, '0');
  return `${sign}${h}:${m}`;
}

// === Datas ===
function pad(n) { return String(n).padStart(2, '0'); }

function isoHoje() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function horaAgora() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function diasDoMes(ano, mes) {
  // mes: 1-12
  return new Date(ano, mes, 0).getDate();
}

function diaSemana(isoDate) {
  // 0=Dom, 6=Sab
  const [a, m, d] = isoDate.split('-').map(Number);
  return new Date(a, m - 1, d).getDay();
}

const NOMES_DIA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

// === Lógica de jornada ===
function jornadaPrevista(isoDate) {
  // Sábado, domingo e feriado: 0 min de jornada prevista
  const ds = diaSemana(isoDate);
  if (ds === 0 || ds === 6) return 0;
  if (FERIADOS && FERIADOS[isoDate]) return 0;
  return MIN_JORNADA_DIARIA;
}

function calcularHorasTrabalhadas(reg) {
  if (!reg || !reg.entrada || !reg.saida) return 0;
  const ini = hmToMin(reg.entrada);
  const fim = hmToMin(reg.saida);
  let total = fim - ini;
  if (reg.break_start && reg.break_end) {
    total -= (hmToMin(reg.break_end) - hmToMin(reg.break_start));
  }
  return total > 0 ? total : 0;
}

function tipoLancamentoAfetaJornada(tipo) {
  // ferias, atestado, feriado, compensacao -> dia justificado, sem desconto
  return ['ferias', 'atestado', 'feriado', 'compensacao'].includes(tipo);
}

function obsLinha(isoDate, lancamento) {
  if (lancamento) {
    const map = {
      ferias: 'FÉRIAS',
      compensacao: 'COMPENSAÇÃO',
      atestado: 'ATESTADO',
      feriado: 'FERIADO'
    };
    return map[lancamento] || lancamento.toUpperCase();
  }
  if (FERIADOS[isoDate]) return `FERIADO — ${FERIADOS[isoDate]}`;
  const ds = diaSemana(isoDate);
  if (ds === 0) return 'DOMINGO';
  if (ds === 6) return 'SÁBADO';
  return '';
}