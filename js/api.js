async function apiGet(path) {
  const r = await fetch(`${API_BASE}${path}`, { method: 'GET' });
  if (!r.ok) throw new Error(`GET ${path} -> ${r.status}`);
  return r.json();
}

async function apiPost(path, body) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`POST ${path} -> ${r.status}`);
  return r.json();
}

async function apiDelete(path) {
  const r = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  if (!r.ok) throw new Error(`DELETE ${path} -> ${r.status}`);
  return r.json();
}

// === Endpoints ===
const Api = {
  registrar: (tipo)             => apiPost('/registro', { tipo }),
  diaAtual:  ()                 => apiGet('/dia-atual'),
  ano:       (a)                => apiGet(`/ano/${a}`),
  lancar:    (data_ini, data_fim, tipo) => apiPost('/lancamento', { data_ini, data_fim, tipo }),
  removerLancamento: (data)     => apiDelete(`/lancamento/${data}`),
  editarRegistro:    (data, registros) => apiPost('/editar', { data, registros })
};