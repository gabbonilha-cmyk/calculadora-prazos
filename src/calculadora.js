// =====================================================================
// CALCULADORA DE PRAZOS DO CPC
// Aqui fica a regra de contagem: recebe a data e o número de dias e
// devolve a data final, junto com a explicação de cada dia do caminho.
// =====================================================================
//
// Regras do CPC aplicadas:
// - art. 219: contam só os dias úteis;
// - art. 224, caput e § 3º: exclui o dia da publicação e começa a contar
//   no primeiro dia útil seguinte; inclui o último dia;
// - art. 224, § 1º: se o primeiro ou o último dia cair em dia de
//   expediente reduzido, passa para o próximo dia útil;
// - art. 224, § 2º: no Diário eletrônico, considera-se publicado no
//   primeiro dia útil depois da disponibilização;
// - art. 220: prazos suspensos de 20/12 a 20/01.

import {
  FERIADOS_FIXOS,
  FERIADOS_MOVEIS,
  EXPEDIENTE_PARCIAL_MOVEL,
  SUSPENSOES_POR_ANO,
  SUSPENSAO_FIM_DE_ANO,
} from './feriados.js';

// ---------------------------------------------------------------------
// Ferramentas de data
// Trabalhamos sempre com textos "AAAA-MM-DD" e fazemos as contas em UTC,
// para que o fuso horário do celular nunca mude o dia por engano.
// ---------------------------------------------------------------------

// Transforma "2026-04-20" em um objeto Date (meia-noite UTC).
export function lerData(texto) {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    throw new Error(`Data inválida: "${texto}". Use o formato AAAA-MM-DD.`);
  }
  const [ano, mes, dia] = texto.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  // Recusa datas que não existem, como 31/02.
  if (data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== dia) {
    throw new Error(`Data inexistente: "${texto}".`);
  }
  return data;
}

// Transforma um Date de volta em "AAAA-MM-DD".
export function escreverData(data) {
  return data.toISOString().slice(0, 10);
}

// Soma (ou subtrai, se negativo) um número de dias corridos.
export function somarDias(data, quantidade) {
  const nova = new Date(data.getTime());
  nova.setUTCDate(nova.getUTCDate() + quantidade);
  return nova;
}

// Formata para o padrão brasileiro: "20/04/2026".
export function formatarBR(texto) {
  const [ano, mes, dia] = texto.split('-');
  return `${dia}/${mes}/${ano}`;
}

const NOMES_DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
  'quinta-feira', 'sexta-feira', 'sábado'];

export function diaDaSemana(texto) {
  return NOMES_DIAS[lerData(texto).getUTCDay()];
}

// ---------------------------------------------------------------------
// Páscoa
// Fórmula clássica (algoritmo de Meeus/Jones/Butcher) que acha o domingo
// de Páscoa de qualquer ano. Dela saem Carnaval, Sexta Santa e Corpus Christi.
// ---------------------------------------------------------------------
export function calcularPascoa(ano) {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return escreverData(new Date(Date.UTC(ano, mes - 1, dia)));
}

// ---------------------------------------------------------------------
// Lista de feriados de um ano
// Junta os fixos, os móveis e as suspensões extras num só "mapa":
// a chave é a data e o valor é a descrição. Guardamos o resultado
// para não recalcular o mesmo ano várias vezes.
// ---------------------------------------------------------------------
const memoria = new Map();

export function feriadosDoAno(ano, { incluirMunicipais = true } = {}) {
  const chave = `${ano}-${incluirMunicipais}`;
  if (memoria.has(chave)) return memoria.get(chave);

  const feriados = new Map(); // dias sem expediente
  const parciais = new Map(); // dias com expediente reduzido
  const pascoa = lerData(calcularPascoa(ano));

  for (const f of FERIADOS_FIXOS) {
    if (f.abrangencia === 'municipal' && !incluirMunicipais) continue;
    const data = escreverData(new Date(Date.UTC(ano, f.mes - 1, f.dia)));
    feriados.set(data, f.nome);
  }
  for (const f of FERIADOS_MOVEIS) {
    feriados.set(escreverData(somarDias(pascoa, f.diasDepoisDaPascoa)), f.nome);
  }
  for (const p of EXPEDIENTE_PARCIAL_MOVEL) {
    parciais.set(escreverData(somarDias(pascoa, p.diasDepoisDaPascoa)), p.nome);
  }
  for (const s of SUSPENSOES_POR_ANO[ano] || []) {
    if (s.tipo === 'parcial') parciais.set(s.data, s.nome);
    else feriados.set(s.data, s.nome);
  }

  const resultado = { feriados, parciais };
  memoria.set(chave, resultado);
  return resultado;
}

// ---------------------------------------------------------------------
// Fim de ano (art. 220)
// ---------------------------------------------------------------------

// Está entre 20/12 e 20/01 (inclusive)? Então o prazo não corre.
export function emSuspensaoDeFimDeAno(texto) {
  const data = lerData(texto);
  const mes = data.getUTCMonth() + 1;
  const dia = data.getUTCDate();
  const { inicio, fim } = SUSPENSAO_FIM_DE_ANO;
  return (mes === inicio.mes && dia >= inicio.dia) || (mes === fim.mes && dia <= fim.dia);
}

// Está entre 20/12 e 06/01? Então nem o fórum funciona (recesso).
export function emRecessoForense(texto) {
  const data = lerData(texto);
  const mes = data.getUTCMonth() + 1;
  const dia = data.getUTCDate();
  const { inicio, fimDoRecesso } = SUSPENSAO_FIM_DE_ANO;
  return (mes === inicio.mes && dia >= inicio.dia) || (mes === fimDoRecesso.mes && dia <= fimDoRecesso.dia);
}

// ---------------------------------------------------------------------
// Classificar um dia
// Diz o que é cada data: útil, parcial, fim de semana, feriado ou suspensa.
// ---------------------------------------------------------------------
export function classificarDia(texto, opcoes = {}) {
  const data = lerData(texto);
  const semana = data.getUTCDay();
  const { feriados, parciais } = feriadosDoAno(data.getUTCFullYear(), opcoes);

  if (semana === 0 || semana === 6) {
    return { tipo: 'fim_de_semana', motivo: semana === 0 ? 'Domingo' : 'Sábado' };
  }
  if (feriados.has(texto)) {
    return { tipo: 'feriado', motivo: feriados.get(texto) };
  }
  if (emRecessoForense(texto)) {
    return { tipo: 'suspenso', motivo: 'Recesso forense (art. 220 do CPC)', temExpediente: false };
  }
  if (emSuspensaoDeFimDeAno(texto)) {
    return { tipo: 'suspenso', motivo: 'Prazos suspensos até 20/01 (art. 220 do CPC)', temExpediente: true };
  }
  if (parciais.has(texto)) {
    return { tipo: 'parcial', motivo: parciais.get(texto) };
  }
  return { tipo: 'util', motivo: 'Dia útil' };
}

// O dia conta no prazo? (útil ou parcial)
function contaNoPrazo(c) {
  return c.tipo === 'util' || c.tipo === 'parcial';
}

// O fórum funciona nesse dia? Usado para saber quando a publicação
// do Diário eletrônico se considera feita (art. 224, § 2º).
function temExpedienteForense(c) {
  return c.tipo === 'util' || c.tipo === 'parcial' || (c.tipo === 'suspenso' && c.temExpediente);
}

// ---------------------------------------------------------------------
// Data de publicação a partir da disponibilização (art. 224, § 2º)
// Pega o primeiro dia com expediente depois da disponibilização.
// ---------------------------------------------------------------------
export function dataDePublicacao(disponibilizacao, opcoes = {}) {
  let dia = somarDias(lerData(disponibilizacao), 1);
  while (!temExpedienteForense(classificarDia(escreverData(dia), opcoes))) {
    dia = somarDias(dia, 1);
  }
  return escreverData(dia);
}

// ---------------------------------------------------------------------
// A FUNÇÃO PRINCIPAL
// Anda dia a dia a partir do dia seguinte à publicação, contando só
// os dias que valem, até chegar ao número de dias do prazo.
// ---------------------------------------------------------------------
//
// Parâmetros:
//   data        -> "AAAA-MM-DD"
//   dias        -> número de dias do prazo (ex.: 15)
//   disponibilizacao -> true se a data informada é a de disponibilização
//                       no Diário eletrônico (e não a de publicação)
//   incluirMunicipais -> true para considerar feriados da cidade de SP
//
// Devolve: { dataPublicacao, inicio, dataFinal, dias, contagem: [...] }
export function calcularPrazo({ data, dias, disponibilizacao = false, incluirMunicipais = true }) {
  if (!Number.isInteger(dias) || dias < 1 || dias > 365) {
    throw new Error('O número de dias deve ser um inteiro entre 1 e 365.');
  }
  lerData(data); // valida a data antes de começar
  const opcoes = { incluirMunicipais };
  const contagem = [];

  // Passo 1: descobrir a data de publicação.
  let dataPublicacao = data;
  if (disponibilizacao) {
    dataPublicacao = dataDePublicacao(data, opcoes);
    // Mostra os dias entre a disponibilização e a publicação.
    let d = lerData(data);
    while (escreverData(d) !== dataPublicacao) {
      const texto = escreverData(d);
      contagem.push({
        data: texto, numero: null, ...classificarDia(texto, opcoes),
        observacao: texto === data ? 'Disponibilização no Diário eletrônico' : 'Não conta',
      });
      d = somarDias(d, 1);
    }
  }
  contagem.push({
    data: dataPublicacao, numero: null, ...classificarDia(dataPublicacao, opcoes),
    observacao: 'Publicação (excluída da contagem, art. 224)',
  });

  // Passo 2: andar dia a dia contando os dias que valem.
  let contados = 0;
  let inicio = null;
  let dia = somarDias(lerData(dataPublicacao), 1);
  let dataFinal = null;

  while (dataFinal === null) {
    const texto = escreverData(dia);
    const c = classificarDia(texto, opcoes);
    const item = { data: texto, numero: null, ...c, observacao: '' };

    if (!contaNoPrazo(c)) {
      item.observacao = 'Não conta';
    } else if (contados === 0 && c.tipo === 'parcial') {
      // Não pode começar em dia de expediente reduzido (art. 224, § 1º).
      item.observacao = 'Não conta: o prazo não começa em dia de expediente reduzido (art. 224, § 1º)';
    } else if (contados === dias) {
      // Já atingimos o número de dias, mas o último caiu em dia parcial:
      // estamos procurando o próximo dia útil inteiro para o vencimento.
      if (c.tipo === 'util') {
        item.observacao = 'Vencimento prorrogado para este dia (art. 224, § 1º)';
        dataFinal = texto;
      } else {
        item.observacao = 'Expediente reduzido: o vencimento passa adiante (art. 224, § 1º)';
      }
    } else {
      contados += 1;
      item.numero = contados;
      if (contados === 1) inicio = texto;
      if (contados === dias) {
        if (c.tipo === 'util') {
          item.observacao = 'Último dia do prazo';
          dataFinal = texto;
        } else {
          item.observacao = 'Último dia cairia aqui, mas o expediente é reduzido: passa para o próximo dia útil (art. 224, § 1º)';
        }
      }
    }
    contagem.push(item);
    dia = somarDias(dia, 1);
  }

  return { dataPublicacao, inicio, dataFinal, dias, contagem };
}
