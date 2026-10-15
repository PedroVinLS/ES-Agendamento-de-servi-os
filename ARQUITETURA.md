# Arquitetura

## Visão geral
Diagrama em `diagrams/arquitetura.mmd`.

## Responsabilidades
| Parte | Sabe | Faz |
|---|---|---|
| Frontend | Como solicitar e organizar os dados para apresentação | Desenha das telas (home, perfil, agenda, entre outros), induz, de maneira favorável, o comportamento do usuário, identifica e registra a entrada, solicita a API e retorna os dados obtidos |
| Backend | As regras estabelecidas no domínio | Recebe a requisição, trata das verificações de origem e conteúdo, aplica as regras do domínio, consulta o banco de dados e retorna uma resposta para a requisição, seja de sucesso ou erro |
| Banco de dados | Os dados registrados e a estrutura interna de armazenamento deles | Recebe a consulta e, através dela, guarda e registra dados, além de impossibilitar a quebra da estrutura e regras de armazenamento |

## Onde cada parte roda
Diagrama em `diagrams/implantacao.mmd`.

## Contrato da API
Operações em `contrato/operacoes.md`, exemplos em `contrato/exemplos/`.

## Verificações
| Verificação | Frontend | Backend |
|---|---|---|
| Mesmo agendamento com solicitantes diferentes | Processa e faz a requisição, evidencia recusa quando este for o caso | É quem decide e recusa todos os agendamentos, com exceção de um, com 409 |
| Data e hora de agendamento | Mostra horários possíveis e destaca os disponíveis | Registra a escolha, se necessário recusa com 409 |

## Qualidades e custos
| Qualidade | Requisito | Decisão | Custo aceito |
|---|---|---|---|
| Manutenibilidade | Possível necessidade de manutenção | Regras definidas em objetos no backend; o frontend as consulta | Uma nova camada entre a tela e a regra |
| Eficiência de desempenho | RNF-01: conjunto de 60 mensagens em até 10 segundos | Sistema de troca de mensagens otimizado | Funcionalidade de troca de mensagens mais complexa de desenvolver |
| Confiabilidade | Envio de solicitação não configura serviço agendado | Registrar a solicitação, definir seu estado (aceita/recusada) e retornar | Necessidade de retorno para confirmação de solicitação |
| Segurança | Apenas o cliente e o prestador de serviço em questão têm acesso ao chat entre eles | Conferir identidade no backend, para cada chat aberto | Verificação extra para cada chat |
| Flexibilidade | Interface utilizável em tela de celular (O1) | Frontend separado, que fala com o backend só pelo contrato | O contrato precisa ser mantido |

## Decisões
| Id | Decisão | Motivo | Consequência aceita | Situação |
|---|---|---|---|---|
| A-01 | O backend decide toda verificação importante; o fronted lida com verificações menores e orienta o usuário | Impossibilita irregularidades provenientes do usuário | Dois centros de verificação para manter coerentes | Aceita |
| A-02 | Banco de dados relacional acessado apenas pelo backend | Modelo de dados definido em PROJETO.md | Toda consulta, necessariamente, passa pelo backend | Aceita |

## Histórico de revisão
- 2026-10-15: versão inicial
