
# Projeto

## Modelo de domínio
Diagrama em `diagrams/dominio.mmd`.
| Classe | Origem no REQUISITOS.md | Observação |
|---|---|---|
| Usuário | RN-01, RN-02| Com subclasse; ver decisão D-01 |
| Cliente | RF-01, RF-03, RN-01 | --- |
| Prestador | RF-02, RF-04, RF-05, RN-01 | --- |
| Serviço | RF-01, RF-04, RN-03, RN-04 | --- |
| Agenda | RF-02 | --- |
| Materiais | RF-05 | Classe separada; ver decisão D-02 |

## Modelo de dados
Diagrama em `diagrams/dados.mmd`.
Estratégia de identidade: chave artificial, com chaves naturais como
restrição de unicidade.
Apagamento: lógico, com coluna `ativo`.

## Comportamento
Sequência do fluxo principal em `diagrams/sequencia-envio.mmd`.
Estados do documento em `diagrams/estados-documento.mmd`.

## Distribuição de responsabilidades
| Parte | Sabe | Faz |
|---|---|---|
| Usuário | nome, email | defini um novo usuário dentro do sistema |
| Cliente | CPF | defini um usuário como um contratante de serviços |
| Prestador | CNPJ, serviço que presta | defini um usuário como um prestador de serviços |
| Serviço | preço, descrição | defini um serviço a ser prestado |
| Agenda | horário, local | defini as condições sob a quais o serviço será prestado |
| Materiais | quantidade, serviço | defini os materiais eventualmente envolvidos num serviço |

## Decisões de projeto
| Id | Decisão | Motivo | Consequência aceita |
|---|---|---|---|
| D-01 | Cliente e Prestador como herança de Usuário | Regra de negócio RN-01 | Insuficiência na definição própria de Cliente |
| D-02 | Inclusão de materiais como classe separada | Há serviços que dispensam a necessidade de materiais | Mais de uma classe para definir por completo um serviço |
| D-03 | Regras de prazo em módulo único | Risco R5, regulamento pode mudar | Uma indireção a mais entre tela e regra| 
| D-04 | Avaliação do supervisor como classe separada | "Enviar arquivo" não se aplica a ela | Duas listagens em vez de uma |

## Protótipo
Telas do fluxo principal em `diagrams/prototype/`.

## Histórico de revisão
- 2026-09-16: versão inicial
- 2026-09-23: versão modificando decisões de projetos 
