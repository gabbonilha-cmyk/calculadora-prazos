// =====================================================================
// TESTES AUTOMATIZADOS
// Cada teste é um caso real do calendário do TJSP (2024 a 2027), com a
// data final conferida à mão. Para rodar: npm test
// =====================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calcularPrazo,
  calcularPascoa,
  classificarDia,
  dataDePublicacao,
  lerData,
} from '../src/calculadora.js';

// Atalho: calcula e devolve só a data final.
function dataFinal(data, dias, extras = {}) {
  return calcularPrazo({ data, dias, ...extras }).dataFinal;
}

describe('Contagem simples em dias úteis (arts. 219 e 224)', () => {
  test('15 dias publicados numa segunda de março/2026, sem feriados', () => {
    assert.equal(dataFinal('2026-03-09', 15), '2026-03-30');
  });

  test('publicação na sexta: começa a contar na segunda', () => {
    const r = calcularPrazo({ data: '2026-03-06', dias: 5 });
    assert.equal(r.inicio, '2026-03-09');
    assert.equal(r.dataFinal, '2026-03-13');
  });

  test('publicação num sábado: conta a partir da segunda', () => {
    assert.equal(dataFinal('2026-03-07', 5), '2026-03-13');
  });

  test('30 dias úteis passando pela Independência (07/09/2026)', () => {
    assert.equal(dataFinal('2026-08-03', 30), '2026-09-15');
  });

  test('prazo de 1 dia vence no dia útil seguinte', () => {
    assert.equal(dataFinal('2026-03-10', 1), '2026-03-11');
  });
});

describe('Feriados e pontes do TJSP em 2026 (Provimento CSM 2.813/2025)', () => {
  test('Tiradentes com a ponte de 20/04/2026', () => {
    assert.equal(dataFinal('2026-04-15', 5), '2026-04-24');
  });

  test('Semana Santa: quinta e sexta-feira não contam', () => {
    assert.equal(dataFinal('2026-03-31', 5), '2026-04-09');
  });

  test('Corpus Christi com a ponte de 05/06/2026', () => {
    assert.equal(dataFinal('2026-06-02', 5), '2026-06-11');
  });

  test('Data Magna de SP (09/07) com a ponte de 10/07/2026', () => {
    assert.equal(dataFinal('2026-07-08', 1), '2026-07-13');
  });

  test('Aparecida, Dia do Servidor e Finados no mesmo prazo', () => {
    assert.equal(dataFinal('2026-10-09', 15), '2026-11-04');
  });

  test('Consciência Negra, ponte de 07/12 e Dia da Justiça', () => {
    assert.equal(dataFinal('2026-11-18', 15), '2026-12-14');
  });
});

describe('Carnaval e Quarta-feira de Cinzas (art. 224, § 1º)', () => {
  test('Cinzas no meio do prazo conta normalmente', () => {
    assert.equal(dataFinal('2026-02-12', 5), '2026-02-23');
  });

  test('prazo não começa na Quarta-feira de Cinzas', () => {
    const r = calcularPrazo({ data: '2026-02-13', dias: 5 });
    assert.equal(r.inicio, '2026-02-19');
    assert.equal(r.dataFinal, '2026-02-25');
  });

  test('vencimento na Cinzas é prorrogado para quinta', () => {
    assert.equal(dataFinal('2026-02-09', 5), '2026-02-19');
  });

  test('prazo de 1 dia publicado na sexta antes do Carnaval', () => {
    assert.equal(dataFinal('2026-02-13', 1), '2026-02-19');
  });

  test('Carnaval de 2025: começa só na quinta, 06/03', () => {
    const r = calcularPrazo({ data: '2025-02-28', dias: 5 });
    assert.equal(r.inicio, '2025-03-06');
    assert.equal(r.dataFinal, '2025-03-12');
  });
});

describe('Recesso e suspensão de 20/12 a 20/01 (art. 220)', () => {
  test('prazo iniciado em dezembro de 2025 retoma em 21/01/2026', () => {
    assert.equal(dataFinal('2025-12-12', 15), '2026-02-03');
  });

  test('publicação em 15/01 (com expediente, prazos suspensos)', () => {
    const r = calcularPrazo({ data: '2026-01-15', dias: 5 });
    assert.equal(r.inicio, '2026-01-21');
    assert.equal(r.dataFinal, '2026-01-27');
  });

  test('publicação em 19/12: prazo de 1 dia vence em 21/01', () => {
    assert.equal(dataFinal('2025-12-19', 1), '2026-01-21');
  });

  test('publicação em 21/01: conta normalmente a partir de 22/01', () => {
    assert.equal(dataFinal('2026-01-21', 5), '2026-01-28');
  });

  test('virada 2024/2025: publicação em 19/12/2024, 15 dias', () => {
    assert.equal(dataFinal('2024-12-19', 15), '2025-02-10');
  });

  test('recesso de 2026/2027 seguido do aniversário de SP', () => {
    assert.equal(dataFinal('2026-12-14', 10), '2027-01-29');
  });
});

describe('Feriado municipal da capital (25/01)', () => {
  test('25/01/2027 (segunda) não conta na capital', () => {
    assert.equal(dataFinal('2027-01-21', 3), '2027-01-27');
  });

  test('sem feriados municipais, 25/01/2027 conta como útil', () => {
    assert.equal(dataFinal('2027-01-21', 3, { incluirMunicipais: false }), '2027-01-26');
  });

  test('25/01/2024 (quinta) não conta na capital', () => {
    assert.equal(dataFinal('2024-01-22', 5), '2024-01-30');
  });
});

describe('Feriados e pontes de 2025 (Provimento CSM 2.765/2024)', () => {
  test('Dia do Trabalho com a ponte de 02/05/2025', () => {
    assert.equal(dataFinal('2025-04-30', 3), '2025-05-07');
  });

  test('Semana Santa seguida de Tiradentes em 2025', () => {
    assert.equal(dataFinal('2025-04-16', 5), '2025-04-28');
  });

  test('Consciência Negra com a ponte de 21/11/2025', () => {
    assert.equal(dataFinal('2025-11-19', 2), '2025-11-25');
  });
});

describe('Feriados e pontes de 2024 (Provimento CSM 2.728/2023)', () => {
  test('Corpus Christi com a ponte de 31/05/2024', () => {
    assert.equal(dataFinal('2024-05-29', 5), '2024-06-07');
  });

  test('ponte de 08/07 e Data Magna de 09/07/2024', () => {
    assert.equal(dataFinal('2024-07-05', 1), '2024-07-10');
  });

  test('Proclamação da República e Consciência Negra em 2024', () => {
    assert.equal(dataFinal('2024-11-14', 5), '2024-11-25');
  });
});

describe('Diário eletrônico: disponibilização (art. 224, § 2º)', () => {
  test('disponibilizado na quinta, publicado na sexta', () => {
    const r = calcularPrazo({ data: '2026-03-12', dias: 15, disponibilizacao: true });
    assert.equal(r.dataPublicacao, '2026-03-13');
    assert.equal(r.dataFinal, '2026-04-07');
  });

  test('disponibilizado antes de Tiradentes e da ponte de 2026', () => {
    const r = calcularPrazo({ data: '2026-04-17', dias: 5, disponibilizacao: true });
    assert.equal(r.dataPublicacao, '2026-04-22');
    assert.equal(r.dataFinal, '2026-04-29');
  });

  test('disponibilizado em 19/12: publicação em 07/01, prazo a partir de 21/01', () => {
    const r = calcularPrazo({ data: '2025-12-19', dias: 5, disponibilizacao: true });
    assert.equal(r.dataPublicacao, '2026-01-07');
    assert.equal(r.inicio, '2026-01-21');
    assert.equal(r.dataFinal, '2026-01-27');
  });

  test('disponibilizado antes do Carnaval: publicação na Cinzas', () => {
    assert.equal(dataDePublicacao('2026-02-13'), '2026-02-18');
    assert.equal(dataFinal('2026-02-13', 5, { disponibilizacao: true }), '2026-02-25');
  });
});

describe('Páscoa e classificação dos dias', () => {
  test('Páscoa de 2024 a 2027', () => {
    assert.equal(calcularPascoa(2024), '2024-03-31');
    assert.equal(calcularPascoa(2025), '2025-04-20');
    assert.equal(calcularPascoa(2026), '2026-04-05');
    assert.equal(calcularPascoa(2027), '2027-03-28');
  });

  test('Corpus Christi de 2027 é calculado sozinho (27/05)', () => {
    assert.equal(classificarDia('2027-05-27').tipo, 'feriado');
  });

  test('classifica corretamente cada tipo de dia', () => {
    assert.equal(classificarDia('2026-03-10').tipo, 'util');
    assert.equal(classificarDia('2026-03-14').tipo, 'fim_de_semana');
    assert.equal(classificarDia('2026-04-21').tipo, 'feriado');
    assert.equal(classificarDia('2026-02-18').tipo, 'parcial');
    assert.equal(classificarDia('2026-12-22').tipo, 'suspenso');
    assert.equal(classificarDia('2027-01-12').tipo, 'suspenso');
  });
});

describe('Contagem dia a dia e validações', () => {
  test('a contagem numera os dias de 1 até o total, sem pular', () => {
    const r = calcularPrazo({ data: '2026-10-09', dias: 15 });
    const numeros = r.contagem.filter((d) => d.numero !== null).map((d) => d.numero);
    assert.deepEqual(numeros, Array.from({ length: 15 }, (_, i) => i + 1));
    assert.equal(r.contagem[0].data, '2026-10-09');
    assert.equal(r.contagem.at(-1).data, '2026-11-04');
  });

  test('explica por que o feriado não contou', () => {
    const r = calcularPrazo({ data: '2026-04-15', dias: 5 });
    const tiradentes = r.contagem.find((d) => d.data === '2026-04-21');
    assert.equal(tiradentes.numero, null);
    assert.equal(tiradentes.motivo, 'Tiradentes');
  });

  test('recusa datas inválidas e número de dias inválido', () => {
    assert.throws(() => lerData('2026-02-30'));
    assert.throws(() => lerData('17/10/2026'));
    assert.throws(() => calcularPrazo({ data: '2026-03-09', dias: 0 }));
    assert.throws(() => calcularPrazo({ data: '2026-03-09', dias: 2.5 }));
  });
});
