# Requisitos

## Backlog ordenado
| Ordem | Item | Origem | MoSCoW | Risco técnico | Depende de |
|---:|---|---|---|---|---|
| 1 | RF-01 | N1, N5 | Importante | Baixo | RN-02 |
| 2 | RF-02 | N2 | Obrigatório | Médio | — |
| 3 | RF-03 | N3, N8 | Obrigatório | Baixo | RN-02 |
| 4 | RF-04 | N4 | Desejável | Baixo | — |
| 5 | RF-05 | N6 | Fora desta versão | Alto | — |
| 6 | RNF-01 | N7 | Desejável | Alto | — |
| 7 | RN-01 | O1 | Obrigatório | Baixo | — |
| 8 | RN-02 | O1 | Obrigatório | Baixo | — |
| 9 | RN-03 | O1 | Obrigatório | Baixo | RF-02 |
| 10 | RN-04 | O1 | Obrigatório | Baixo | — |

## Requisitos funcionais
RF-01 Quando o serviço for confirmado por ambas as partes, o sistema deve notificar, preferencialmente via WhatsApp, a confirmação do serviço com horário e local. [Origem: N1, N5]

RF-02 O sistema deve ser composto por uma agenda responsável por organizar os agendamentos realizados. [Origem: N2]

RF-03 O sistema deve fornecer as informações necessárias para a comunicação entre cliente e servidor. [Origem: N3, N8]

RF-04 O sistema deve oferecer uma série de "tags" de prioridade para os serviços agendados. [Origem: N4]

RF-05 O sistema deve fornecer uma aba de com a relação dos materiais necessários para o serviço prestado. [Origem: N6]

## Requisitos não funcionais
RNF-01 Tempo de comunicação entre usuários
- Grandeza: tempo necessário para cominucação entre ambos
- Condição: conjunto de 30 clientes, cada um com duas mensagens inicias.
- Aceitável: até 10 segundos.
- Pretendido: até 5 segundos. 
- Como verificar: medição no navegador, com a base de teste de 30
  alunos, três execuções, valor considerado é o maior. [Origem: N7]

## Restrições e regras de negócio
RN-01 O sistema deve aceitar um usuário tanto na condição de cliente quanto na de prestador de serviço. [Origem: O1] 

RN-02 O sistema deve aceitar o cadastro de um usuário se, e somente se, seu perfil esteja completo dentro das exigências da aplicação. [Origem: O1] 

RN-03 O sistema deve recusar o agendamento de dois serviços diferentes prestados em um mesmo horário. [Origem: O1]

RN-04 O sistema deve definir um preço mínimo para os serviços oferecidos dentro da plataforma. [Origem: O1]

## Validações realizadas
### V1 — 2026-09-01, com aluno em estágio (perfil de E3)
| Achado | Efeito | Item alterado |

## Histórico de revisão
- 2026-09-07: versão inicial
- 2026-09-11: versão parcial
