// =====================================================================
// LIGAÇÃO ENTRE A TELA E A CALCULADORA
// Lê o que foi digitado no formulário, chama calcularPrazo() e
// desenha o resultado e a lista dia a dia na página.
// =====================================================================

import { calcularPrazo, formatarBR, diaDaSemana } from './calculadora.js';

const formulario = document.getElementById('formulario');
const campoData = document.getElementById('data');
const campoDias = document.getElementById('dias');
const caixaErro = document.getElementById('erro');
const secaoResultado = document.getElementById('resultado');

// Começa com a data de hoje (no fuso do aparelho) já preenchida.
const hoje = new Date();
campoData.value = [
  hoje.getFullYear(),
  String(hoje.getMonth() + 1).padStart(2, '0'),
  String(hoje.getDate()).padStart(2, '0'),
].join('-');

// Botões de atalho 5, 10, 15, 30: preenchem o número de dias e calculam.
document.querySelectorAll('[data-dias]').forEach((botao) => {
  botao.addEventListener('click', () => {
    campoDias.value = botao.dataset.dias;
    calcular();
  });
});

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault(); // não recarrega a página
  calcular();
});

function calcular() {
  caixaErro.hidden = true;
  try {
    const resultado = calcularPrazo({
      data: campoData.value,
      dias: Number(campoDias.value),
      disponibilizacao: document.getElementById('disponibilizacao').checked,
      incluirMunicipais: document.getElementById('municipais').checked,
    });
    mostrarResultado(resultado);
  } catch (erro) {
    secaoResultado.hidden = true;
    caixaErro.textContent = campoData.value ? erro.message : 'Informe a data.';
    caixaErro.hidden = false;
  }
}

// Desenha a data final em destaque e a lista de todos os dias.
function mostrarResultado(r) {
  document.getElementById('data-final').textContent = formatarBR(r.dataFinal);
  document.getElementById('dia-semana-final').textContent = diaDaSemana(r.dataFinal);
  document.getElementById('resumo').textContent =
    `${r.dias} dias úteis · publicação em ${formatarBR(r.dataPublicacao)} · início em ${formatarBR(r.inicio)}`;

  const lista = document.getElementById('contagem');
  lista.innerHTML = '';
  for (const dia of agruparFimDeAno(r.contagem)) {
    if (dia.grupo) {
      lista.append(linhaDoGrupo(dia));
      continue;
    }
    const item = document.createElement('li');
    item.className = `dia ${dia.numero !== null ? 'conta' : 'nao-conta'} ${dia.tipo}`;
    if (dia.data === r.dataFinal) item.classList.add('final');

    const numero = document.createElement('span');
    numero.className = 'numero';
    numero.textContent = dia.numero !== null ? dia.numero : '–';

    const texto = document.createElement('span');
    texto.className = 'texto';
    const data = document.createElement('strong');
    data.textContent = `${formatarBR(dia.data)} · ${diaDaSemana(dia.data)}`;
    const detalhe = document.createElement('small');
    // Mostra o motivo (ex.: "Tiradentes") e a observação, quando houver.
    const partes = [];
    // (no fim de semana o motivo repetiria o nome do dia, então pulamos)
    if (dia.tipo !== 'util' && dia.tipo !== 'fim_de_semana') partes.push(dia.motivo);
    if (dia.observacao && dia.observacao !== 'Não conta') partes.push(dia.observacao);
    detalhe.textContent = partes.join(' · ');

    texto.append(data, detalhe);
    item.append(numero, texto);
    lista.append(item);
  }
  secaoResultado.hidden = false;
}

// O recesso de fim de ano tem mais de 30 dias seguidos sem contagem.
// Para a lista não ficar enorme no celular, juntamos esses dias numa linha só.
function agruparFimDeAno(contagem) {
  const saida = [];
  let bloco = [];
  const fecharBloco = () => {
    const temSuspensao = bloco.some((d) => d.tipo === 'suspenso');
    if (temSuspensao && bloco.length > 3) {
      saida.push({ grupo: true, de: bloco[0].data, ate: bloco.at(-1).data, quantidade: bloco.length });
    } else {
      saida.push(...bloco);
    }
    bloco = [];
  };
  for (const dia of contagem) {
    // Dias que não contam (e não são a publicação) vão para o bloco.
    if (dia.numero === null && !dia.observacao.startsWith('Publicação') && !dia.observacao.startsWith('Venc')) {
      bloco.push(dia);
    } else {
      fecharBloco();
      saida.push(dia);
    }
  }
  fecharBloco();
  return saida;
}

function linhaDoGrupo(g) {
  const item = document.createElement('li');
  item.className = 'dia nao-conta suspenso';
  item.innerHTML = '<span class="numero">–</span><span class="texto"><strong></strong><small></small></span>';
  item.querySelector('strong').textContent = `${formatarBR(g.de)} a ${formatarBR(g.ate)}`;
  item.querySelector('small').textContent =
    `${g.quantidade} dias sem contagem · recesso e suspensão de prazos (art. 220 do CPC)`;
  return item;
  secaoResultado.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
