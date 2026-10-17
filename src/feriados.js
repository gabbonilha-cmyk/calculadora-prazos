// =====================================================================
// FERIADOS E SUSPENSÕES DE EXPEDIENTE
// Este é o único arquivo que precisa ser atualizado todo ano.
// Ele lista os dias em que o fórum não funciona, separados em quatro grupos.
// =====================================================================
//
// COMO ATUALIZAR PARA UM ANO NOVO
// Todo mês de novembro o TJSP publica um Provimento do Conselho Superior
// da Magistratura (CSM) com os dias sem expediente do ano seguinte.
// Basta copiar as "pontes" e suspensões extras dele para dentro de
// SUSPENSOES_POR_ANO (mais abaixo), no ano correspondente.
// Os feriados fixos e os ligados à Páscoa já se repetem sozinhos.
//
// Formato das datas: "AAAA-MM-DD" (ano-mês-dia), por exemplo "2026-04-20".

// ---------------------------------------------------------------------
// 1) Feriados de data fixa: caem todo ano no mesmo dia e mês.
// ---------------------------------------------------------------------
export const FERIADOS_FIXOS = [
  { dia: 1,  mes: 1,  nome: 'Confraternização Universal',         abrangencia: 'nacional' },
  { dia: 25, mes: 1,  nome: 'Aniversário da Cidade de São Paulo', abrangencia: 'municipal' },
  { dia: 21, mes: 4,  nome: 'Tiradentes',                         abrangencia: 'nacional' },
  { dia: 1,  mes: 5,  nome: 'Dia do Trabalho',                    abrangencia: 'nacional' },
  { dia: 9,  mes: 7,  nome: 'Data Magna do Estado de São Paulo',  abrangencia: 'estadual' },
  { dia: 7,  mes: 9,  nome: 'Independência do Brasil',            abrangencia: 'nacional' },
  { dia: 12, mes: 10, nome: 'Nossa Senhora Aparecida',            abrangencia: 'nacional' },
  { dia: 28, mes: 10, nome: 'Dia do Servidor Público',            abrangencia: 'TJSP' },
  { dia: 2,  mes: 11, nome: 'Finados',                            abrangencia: 'nacional' },
  { dia: 15, mes: 11, nome: 'Proclamação da República',           abrangencia: 'nacional' },
  { dia: 20, mes: 11, nome: 'Dia Nacional de Zumbi e da Consciência Negra', abrangencia: 'nacional' },
  { dia: 8,  mes: 12, nome: 'Dia da Justiça',                     abrangencia: 'TJSP' },
  { dia: 25, mes: 12, nome: 'Natal',                              abrangencia: 'nacional' },
];

// ---------------------------------------------------------------------
// 2) Feriados móveis: mudam de data todo ano porque dependem da Páscoa.
//    "diasDepoisDaPascoa" negativo quer dizer "dias antes da Páscoa".
//    Ex.: a Sexta-feira da Paixão é sempre 2 dias antes do domingo de Páscoa.
// ---------------------------------------------------------------------
export const FERIADOS_MOVEIS = [
  { diasDepoisDaPascoa: -48, nome: 'Carnaval (segunda-feira)',   abrangencia: 'TJSP' },
  { diasDepoisDaPascoa: -47, nome: 'Carnaval (terça-feira)',     abrangencia: 'TJSP' },
  { diasDepoisDaPascoa: -3,  nome: 'Quinta-feira Santa (Endoenças)', abrangencia: 'TJSP' },
  { diasDepoisDaPascoa: -2,  nome: 'Sexta-feira da Paixão',      abrangencia: 'nacional' },
  { diasDepoisDaPascoa: 60,  nome: 'Corpus Christi',             abrangencia: 'TJSP' },
];

// ---------------------------------------------------------------------
// 3) Dias de expediente parcial (o fórum abre mais tarde).
//    Pelo art. 224, § 1º, do CPC, o prazo não pode COMEÇAR nem TERMINAR
//    num dia assim, mas ele conta normalmente se cair no meio do prazo.
// ---------------------------------------------------------------------
export const EXPEDIENTE_PARCIAL_MOVEL = [
  { diasDepoisDaPascoa: -46, nome: 'Quarta-feira de Cinzas (expediente a partir das 13h)' },
];

// ---------------------------------------------------------------------
// 4) Suspensões extras de cada ano: "pontes", ponto facultativo,
//    queda de sistema etc. Copie aqui o que sair no Provimento do TJSP.
//    Também dá para registrar expediente parcial extra com tipo: 'parcial'.
// ---------------------------------------------------------------------
export const SUSPENSOES_POR_ANO = {
  // Provimento CSM nº 2.728/2023
  2024: [
    { data: '2024-05-31', nome: 'Suspensão do expediente (ponte de Corpus Christi)' },
    { data: '2024-07-08', nome: 'Suspensão do expediente (ponte da Data Magna)' },
  ],
  // Provimento CSM nº 2.765/2024
  2025: [
    { data: '2025-05-02', nome: 'Suspensão do expediente (ponte do Dia do Trabalho)' },
    { data: '2025-06-20', nome: 'Suspensão do expediente (ponte de Corpus Christi)' },
    { data: '2025-11-21', nome: 'Suspensão do expediente (ponte da Consciência Negra)' },
  ],
  // Provimento CSM nº 2.813/2025
  2026: [
    { data: '2026-04-20', nome: 'Suspensão do expediente (ponte de Tiradentes)' },
    { data: '2026-06-05', nome: 'Suspensão do expediente (ponte de Corpus Christi)' },
    { data: '2026-07-10', nome: 'Suspensão do expediente (ponte da Data Magna)' },
    { data: '2026-12-07', nome: 'Suspensão do expediente (ponte do Dia da Justiça)' },
  ],
};

// ---------------------------------------------------------------------
// 5) Recesso e suspensão de prazos do fim de ano (art. 220 do CPC).
//    De 20/12 a 20/01 os prazos ficam suspensos (não contam).
//    De 20/12 a 06/01 nem há expediente (recesso forense).
// ---------------------------------------------------------------------
export const SUSPENSAO_FIM_DE_ANO = {
  inicio: { dia: 20, mes: 12 },   // começa em 20 de dezembro
  fim: { dia: 20, mes: 1 },       // termina em 20 de janeiro (inclusive)
  fimDoRecesso: { dia: 6, mes: 1 }, // até 6 de janeiro não há expediente nenhum
};
