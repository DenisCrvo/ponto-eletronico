const g = {
  filtro:   document.getElementById('filtro-mes'),
  carregar: document.getElementById('btn-carregar'),
  imprimir: document.getElementById('btn-imprimir'),
  corpo:    document.getElementById('corpo-folha'),
  info:     document.getElementById('info-periodo'),
  prev:     document.getElementById('prev-mes'),
  trab:     document.getElementById('trab-mes'),
  saldoMes: document.getElementById('saldo-mes'),
  saldoAno: document.getElementById('saldo-ano'),
  extras:   document.getElementById('extras-ano'),
  formLanc: document.getElementById('form-lancamento'),
  listaLanc: document.getElementById('lista-lancamentos'),
  formEdit: document.getElementById('form-edicao')
};

let dadosAno = {}; // { 'YYYY-MM-DD': {entrada,..., lancamento} }
let mesAtual = '';

const ROTULOS = {
  entrada: 'Entrada',
  break_start: 'Início do Intervalo',
  break_end: 'Fim do Intervalo',
  saida: 'Saída'
};

// === Inicialização ===
const hojeISO = isoHoje();
g.filtro.value = hojeISO.slice(0, 7);

g.carregar.addEventListener('click', carregar);
g.imprimir.addEventListener('click', () => window.print());

g.formLanc.addEventListener('submit', async (e) => {
  e.preventDefault();
  const ini = document.getElementById('lanc-data-ini').value;
  const fim = document.getElementById('lanc-data-fim').value || ini;
  const tipo = document.getElementById('lanc-tipo').value;
  await Api.lancar(ini, fim, tipo);
  await carregar();
});

// === Submissão da edição com salvaguarda contra apagamento acidental ===
g.formEdit.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = document.getElementById('edit-data').value;

  // Salvaguarda 1: força o usuário a selecionar uma linha antes de editar
  if (!data) {
    alert('Selecione um dia clicando na linha da tabela acima antes de salvar.');
    return;
  }

  const original = dadosAno[data] || {};
  const novo = {
    entrada:     document.getElementById('edit-entrada').value     || null,
    break_start: document.getElementById('edit-break-start').value || null,
    break_end:   document.getElementById('edit-break-end').value   || null,
    saida:       document.getElementById('edit-saida').value       || null
  };

  // Salvaguarda 2: detecta campos que estavam preenchidos e ficaram vazios
  const seraoApagados = Object.keys(novo).filter(k => original[k] && !novo[k]);

  if (seraoApagados.length > 0) {
    const lista = seraoApagados.map(k => `• ${ROTULOS[k]} (${original[k]})`).join('\n');
    const ok = confirm(
      `Atenção: ao salvar, os seguintes registros do dia ${data.split('-').reverse().join('/')} serão APAGADOS:\n\n${lista}\n\nDeseja continuar?`
    );
    if (!ok) return;
  }

  try {
    await Api.editarRegistro(data, novo);
    await carregar();
    alert('Registro salvo com sucesso.');
  } catch (err) {
    alert('Erro ao salvar: ' + err.message);
  }
});

// Clique na linha da tabela popula o form de edição
g.corpo.addEventListener('click', (e) => {
  const tr = e.target.closest('tr[data-data]');
  if (!tr) return;
  const data = tr.dataset.data;
  const reg = dadosAno[data] || {};
  document.getElementById('edit-data').value        = data;
  document.getElementById('edit-entrada').value     = reg.entrada     || '';
  document.getElementById('edit-break-start').value = reg.break_start || '';
  document.getElementById('edit-break-end').value   = reg.break_end   || '';
  document.getElementById('edit-saida').value       = reg.saida       || '';

  // Foca no primeiro campo editável e rola até o formulário
  const formEl = document.getElementById('form-edicao');
  formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => document.getElementById('edit-entrada').focus(), 300);
});

// === Carregamento principal ===
async function carregar() {
  mesAtual = g.filtro.value;
  const ano = parseInt(mesAtual.slice(0, 4), 10);
  const dados = await Api.ano(ano);
  dadosAno = dados.dias || {};
  renderTabela();
  renderResumoAnual();
  renderLancamentosMes();

  // Limpa o formulário de edição ao recarregar a tabela
  ['edit-data','edit-entrada','edit-break-start','edit-break-end','edit-saida']
    .forEach(id => document.getElementById(id).value = '');
}

function renderTabela() {
  const [ano, mes] = mesAtual.split('-').map(Number);
  const dias = diasDoMes(ano, mes);
  let prevMin = 0, trabMin = 0;
  const linhas = [];

  for (let d = 1; d <= dias; d++) {
    const iso = `${ano}-${pad(mes)}-${pad(d)}`;
    const reg = dadosAno[iso] || {};
    const lanc = reg.lancamento || null;

    const ds = diaSemana(iso);
    let prev = jornadaPrevista(iso);
    if (lanc && tipoLancamentoAfetaJornada(lanc)) prev = 0;

    const trab = calcularHorasTrabalhadas(reg);
    const saldo = trab - prev;

    prevMin += prev;
    trabMin += trab;

    const classes = [];
    if (ds === 0 || ds === 6) classes.push('fim-semana');
    if (FERIADOS[iso] && !lanc) classes.push('feriado');
    if (lanc) classes.push(lanc);

    linhas.push(`
      <tr class="${classes.join(' ')}" data-data="${iso}" style="cursor:pointer">
        <td>${NOMES_DIA[ds]}</td>
        <td>${pad(d)}/${pad(mes)}</td>
        <td>${reg.entrada     || '--:--'}</td>
        <td>${reg.break_start || '--:--'}</td>
        <td>${reg.break_end   || '--:--'}</td>
        <td>${reg.saida       || '--:--'}</td>
        <td>${trab ? minToHm(trab) : '--:--'}</td>
        <td class="${saldo > 0 ? 'saldo-positivo' : saldo < 0 ? 'saldo-negativo' : ''}">
          ${saldo === 0 ? '00:00' : minToHm(saldo)}
        </td>
        <td>${obsLinha(iso, lanc)}</td>
      </tr>
    `);
  }

  g.corpo.innerHTML = linhas.join('');
  g.info.textContent = `${pad(mes)}/${ano} — ${dias} dias`;
  g.prev.textContent     = minToHm(prevMin);
  g.trab.textContent     = minToHm(trabMin);
  g.saldoMes.textContent = minToHm(trabMin - prevMin);
}

function renderResumoAnual() {
  const ano = parseInt(mesAtual.slice(0, 4), 10);
  let prev = 0, trab = 0;
  for (const iso in dadosAno) {
    if (!iso.startsWith(`${ano}-`)) continue;
    const reg = dadosAno[iso];
    const lanc = reg.lancamento || null;
    let p = jornadaPrevista(iso);
    if (lanc && tipoLancamentoAfetaJornada(lanc)) p = 0;
    prev += p;
    trab += calcularHorasTrabalhadas(reg);
  }
  const saldoAno = trab - prev;
  g.saldoAno.textContent = minToHm(saldoAno);
  g.extras.textContent = (saldoAno >= 0 ? '+' : '') + minToHm(saldoAno);
  g.extras.style.color = saldoAno >= 0 ? '#198754' : '#dc3545';
}

function renderLancamentosMes() {
  const itens = Object.entries(dadosAno)
    .filter(([iso, r]) => iso.startsWith(mesAtual) && r.lancamento)
    .sort(([a],[b]) => a.localeCompare(b));

  if (!itens.length) {
    g.listaLanc.innerHTML = '<li class="list-group-item text-muted">Nenhum lançamento neste mês.</li>';
    return;
  }
  g.listaLanc.innerHTML = itens.map(([iso, r]) => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <span><strong>${iso.split('-').reverse().join('/')}</strong> — ${r.lancamento.toUpperCase()}</span>
      <button class="btn btn-sm btn-outline-danger" data-remover="${iso}">Remover</button>
    </li>`).join('');

  g.listaLanc.querySelectorAll('button[data-remover]').forEach(b => {
    b.addEventListener('click', async () => {
      if (!confirm(`Remover lançamento de ${b.dataset.remover.split('-').reverse().join('/')}?`)) return;
      await Api.removerLancamento(b.dataset.remover);
      await carregar();
    });
  });
}

carregar();