const els = {
  data:    document.getElementById('data-atual'),
  hora:    document.getElementById('hora-atual'),
  lista:   document.getElementById('lista-registros'),
  alerta:  document.getElementById('alerta'),
  btnEnt:  document.getElementById('btn-entrada'),
  btnBs:   document.getElementById('btn-break-start'),
  btnBe:   document.getElementById('btn-break-end'),
  btnSai:  document.getElementById('btn-saida')
};

// Relógio em tempo real
function tickRelogio() {
  const d = new Date();
  els.hora.textContent = horaAgora();
  els.data.textContent = d.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });
}
tickRelogio();
setInterval(tickRelogio, 1000);

// === Estado dos botões ===
function aplicarEstado(reg) {
  reg = reg || {};
  const tem = (k) => Boolean(reg[k]);

  // Regra de fluxo:
  // sem entrada -> só entrada
  // entrada feita, sem break_start, sem saida -> break_start ou saida
  // break_start feito, sem break_end -> só break_end
  // break_end feito, sem saida -> só saida
  // saida feita -> nada
  els.btnEnt.disabled = tem('entrada');
  els.btnBs.disabled  = !tem('entrada') || tem('break_start') || tem('saida');
  els.btnBe.disabled  = !tem('break_start') || tem('break_end') || tem('saida');
  els.btnSai.disabled = !tem('entrada') || (tem('break_start') && !tem('break_end')) || tem('saida');

  // Lista de status
  const linhas = [
    ['Entrada',        reg.entrada],
    ['Início Intervalo', reg.break_start],
    ['Fim Intervalo',  reg.break_end],
    ['Saída',          reg.saida]
  ];
  els.lista.innerHTML = linhas.map(([rot, val]) => `
    <li class="${val ? 'feito' : ''}">
      <span>${rot}</span><span>${val || '--:--'}</span>
    </li>`).join('');
}

function avisar(msg, ok = true) {
  els.alerta.className = `alert mt-3 ${ok ? 'alert-success' : 'alert-danger'}`;
  els.alerta.textContent = msg;
  els.alerta.classList.remove('d-none');
  setTimeout(() => els.alerta.classList.add('d-none'), 3000);
}

async function carregarStatus() {
  try {
    const { registros } = await Api.diaAtual();
    aplicarEstado(registros);
  } catch (e) {
    avisar('Falha ao carregar status do dia.', false);
  }
}

document.querySelectorAll('.btn-ponto').forEach(b => {
  b.addEventListener('click', async () => {
    const tipo = b.dataset.tipo;
    b.disabled = true;
    try {
      const r = await Api.registrar(tipo);
      aplicarEstado(r.registros);
      avisar(`Registrado: ${tipo} às ${r.hora}`);
    } catch (e) {
      avisar('Erro ao registrar ponto. Tente novamente.', false);
      carregarStatus();
    }
  });
});

carregarStatus();