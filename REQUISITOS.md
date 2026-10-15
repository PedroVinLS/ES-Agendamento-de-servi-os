# Requisitos

## Backlog ordenado
| Ordem | Item | Origem | MoSCoW | Risco técnico | Depende de |
|---:|---|---|---|---|---|
| 1 | RF-01 | N1, N5 | Importante | Baixo | RN-02  |
| 2 | RF-02 | N2 | Obrigatório | Médio | RN-01 |
| 3 | RF-03 | N3, N8 | Obrigatório | Baixo | RN-02 |
| 4 | RF-04 | N4 | Desejável | Baixo | — |
| 5 | RF-05 | N6 | Fora desta versão | Alto | — |
| 6 | RNF-01 | N7 | Desejável | Alto | — |
| 7 | RN-01 | O1 | Obrigatório | Baixo | — |
| 8 | RN-02 | O1 | Obrigatório | Baixo | — |
| 9 | RN-03 | O1 | Obrigatório | Baixo | RF-02 |
| 10 | RN-04 | O1 | Obrigatório | Baixo | — |

## Requisitos funcionais
RF-01 Quando o serviço for confirmado por ambas as partes, o sistema deve notificar o cliente, preferencialmente via WhatsApp, com a confirmação do serviço com horário e local. [Origem: N1, N5]

RF-02 O sistema deve ser composto por uma agenda responsável por organizar os agendamentos realizados pelo prestador. [Origem: N2]

RF-03 O sistema deve fornecer as informações necessárias para a comunicação entre cliente e servidor. [Origem: N3, N8]

RF-04 O sistema deve oferecer uma série de "tags" de prioridade para os serviços agendados pelo prestador de serviço. [Origem: N4]

RF-05 O sistema deve fornecer uma aba com a relação dos materiais necessários para o prestador de serviço. [Origem: N6]

## Fora da versão (Motivo):
RF-05: Não se enquadra no essencial do MVP (Minimun Viable Product). 

## Requisitos não funcionais
RNF-01 Tempo de comunicação entre usuários
- Grandeza: tempo necessário para cominucação entre ambos
- Condição: conjunto de 30 clientes, cada um com duas mensagens inicias.
- Aceitável: até 10 segundos.
- Pretendido: até 5 segundos. 
- Como verificar: medição no navegador, com a base de teste de 30
  usuários, três execuções, valor considerado é o maior. [Origem: N7]

## Restrições e regras de negócio
RN-01 O sistema deve aceitar um usuário na condição de cliente ou prestador de serviço. [Origem: O1] 

RN-02 O sistema deve aceitar o cadastro de um usuário se, e somente se, seu perfil esteja completo dentro das exigências da aplicação. [Origem: O1] 

RN-03 O sistema deve recusar o agendamento de dois serviços diferentes prestados em um mesmo horário. [Origem: O1]

RN-04 O sistema deve definir um preço mínimo para os serviços oferecidos dentro da plataforma. [Origem: O1]

##Custo do Backlog Ordenado
| Ordem | Item | MoSCoW | Pontos |
|---:|---|---|---|
| 1 | HU-01.1 Cadastrar usuário no banco de dados| Obrigatório | 6 |
| 2 | HU-01.2 Registrar usuário registrado como um cliente ou um prestador de serviço| Obrigatório | 3 |
| 3 | HU-02.1 Registro de serviço por um prestador cadastrado no sistema| Obrigatório | 8 |
| 4 | HU-02.2 Expansão e detalhamento dos serviços e qualidades de um prestador de serviço | baixo | 3 |
| 5 | HU-03.1 Interação do usuário com agenda do prestador de serviços | Obrigatório | 8 |
| 6 | HU-03.2 Resolução de conflito de agendamento alguns serviços através de tags | Importante | 6 |
| 7 | HU-04.1 Aviso de resolução e confirmação de serviço através do Whatsapp | Importante | 6 |
| 8 | HU-04.2 Avaliação do serviço prestado e do prestador | baixo | 2 |

Pontos totais: 42, Obrigatórios: 25, Porcentagem de Obrigatório: 59.523%

## Lista de verificação da revisão

Para cada história:
- [X] Tem origem declarada, e a origem existe no DESCOBERTA.md.
- [X] O benefício declarado nomeia quem se beneficia.
- [ ] Tem critério para o caminho principal, para a recusa e para o
      efeito que persiste.
- [X] Nenhum critério descreve a tela em vez do comportamento.
- [X] Cabe em uma iteração, na avaliação de quem vai construir.

Para o conjunto:
- [X] Nenhum par de requisitos se contradiz, e todo termo do domínio
      usado está no glossário.
- [ ] As nove características da ISO/IEC 25010 foram percorridas.
- [X] Toda necessidade confirmada do DESCOBERTA.md tem item
      correspondente, ou motivo registrado para ficar de fora.
- [X] Todo item tem posição na ordem, com critério declarado, e o que
      ficou fora desta versão continua registrado, com motivo.
- [X] Os itens obrigatórios não passam de 60% do esforço previsto até a
      review parcial.

## Histórico de revisão
- 2026-10-15: versão parcial (Criação das fatias do sistema ordenadas por ponto)
- 2026-10-15: versão parcial (modificação da dependência de  RF-02)
- 2026-09-07: versão inicial (criação do REQUISITOS.md);
- 2026-09-11: versão parcial (requisitos funcionais / não funcionais, restrições e regras de negócios);
- 2026-09-14: versão parcial (inclusão de critérios de aceitação e revisão do checklist);
- 2026-09-23: versão parcial (retirando ambiguidade dos requisitos);
