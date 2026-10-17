# Calculadora de Prazos do CPC (TJSP)

Calcula prazos processuais em dias úteis, mostrando a data final e a contagem dia a dia.

**Acesse:** https://gabbonilha-cmyk.github.io/calculadora-prazos/

## Regras aplicadas

| Regra | Artigo do CPC |
|---|---|
| Só contam dias úteis | art. 219 |
| Exclui o dia da publicação; começa no primeiro dia útil seguinte | art. 224, caput e § 3º |
| Publicação no Diário eletrônico = primeiro dia útil após a disponibilização (opção na tela) | art. 224, § 2º |
| Prazo não começa nem vence em dia de expediente reduzido (Quarta-feira de Cinzas) | art. 224, § 1º |
| Prazos suspensos de 20/12 a 20/01 | art. 220 |

Feriados considerados: nacionais, os dias sem expediente do TJSP (Carnaval, Quinta-feira Santa,
Corpus Christi, Dia do Servidor, Dia da Justiça, pontes) e o aniversário da cidade de São Paulo (25/01).

## Como atualizar os feriados

Tudo fica em [`src/feriados.js`](src/feriados.js). Os feriados fixos e os que dependem da Páscoa
se repetem sozinhos todo ano. Quando o TJSP publicar o Provimento CSM do ano seguinte (normalmente
em novembro), copie as pontes e suspensões extras para `SUSPENSOES_POR_ANO`. Suspensões
extraordinárias (queda de sistema, por exemplo) entram no mesmo lugar.

## Arquivos

- `index.html` e `estilo.css`: a tela.
- `src/calculadora.js`: a regra de contagem.
- `src/feriados.js`: a lista de feriados.
- `src/app.js`: liga a tela à calculadora.
- `testes/calculadora.test.js`: os testes automatizados, com casos reais de 2024 a 2027.

## Rodar os testes

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo. Não há dependências para instalar.

```
npm test
```

A cada envio para o GitHub os testes rodam sozinhos e o site só é republicado se todos passarem.

> Ferramenta de apoio. Confira sempre o calendário oficial do tribunal.
