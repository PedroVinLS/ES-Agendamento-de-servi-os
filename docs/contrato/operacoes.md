# Contrato de Operações da API

## 1. Informações gerais

Este documento define o contrato de comunicação entre o frontend e o backend da aplicação. São descritas as operações disponíveis, seus respectivos métodos HTTP, parâmetros de entrada, regras de negócio aplicadas e respostas esperadas.

O contrato estabelece o comportamento que deve ser observado pelo consumidor da API, independentemente dos detalhes internos de implementação.

### 1.1. Formato de comunicação

- Protocolo: HTTP/HTTPS.
- Formato das requisições: JSON, quando houver corpo de requisição.
- Formato das respostas: JSON.
- Codificação: UTF-8.
- Cabeçalho para envio de dados: `Content-Type: application/json`.

### 1.2. Autenticação

As operações protegidas exigem autenticação por meio de token JWT.

O token deve ser enviado no cabeçalho HTTP `Authorization`, utilizando o esquema Bearer:

```http
Authorization: Bearer <token>
```

O token é obtido pela operação `POST /usuario/login` e possui validade de uma hora.

A ausência de token, token inválido ou expirado resulta em resposta HTTP `401`.

### 1.3. Convenções

- `{id}` representa o identificador numérico de um registro.
- `{cpf}` representa o CPF do cliente, com 11 caracteres numéricos.
- `{cnpj}` representa o CNPJ do prestador, com 14 caracteres numéricos.
- Os identificadores presentes na URL devem ser enviados sem chaves.
- Os campos opcionais podem ser omitidos quando não houver informação correspondente.
- Datas e horários devem ser representados em formato compatível com os valores aceitos pela API.

### 1.4. Endereçamento

As operações utilizam os caminhos apresentados neste documento diretamente na raiz da aplicação. Não existe um prefixo global `/api` configurado no roteador.

---

## 2. Usuários

### POST /usuario/login

**Origem:** RN-01.

**Quem chama:** frontend, na tela de autenticação.

**Entrada:** objeto JSON contendo:

- `email`: endereço de e-mail do usuário.
- `senha`: senha cadastrada.

Exemplo de entrada:

```json
{
  "email": "usuario@email.com",
  "senha": "senha123"
}
```

**Regras aplicadas no servidor:**
- Verificar se e-mail e senha foram informados como strings não vazias.
- Localizar o usuário pelo endereço de e-mail.
- Comparar a senha informada com o hash armazenado.
- Gerar um token JWT utilizando o algoritmo HS256.
- Definir o identificador do usuário no campo `sub` do token.
- Definir a validade do token em uma hora.

**Sucesso:** `200 OK`, com token de autenticação, tipo de autorização, tempo de validade e dados básicos do usuário (`exemplos/usuario/login-sucesso.json`).

**Falhas:**
- `400`: e-mail ou senha não informados (`exemplos/usuario/erro-login-dados.json`).
- `401`: e-mail ou senha inválidos (`exemplos/usuario/erro-login-credenciais.json`).
- `503`: serviço de autenticação indisponível (`exemplos/usuario/erro-autenticacao-indisponivel.json`).
- `500`: erro interno durante a autenticação (`exemplos/usuario/erro-login-interno.json`).

### GET /usuario

**Origem:** RN-01.

**Quem chama:** frontend, em fluxos que necessitam consultar os usuários cadastrados.

**Entrada:** não possui parâmetros ou corpo de requisição.

**Regras aplicadas no servidor:**
- Consultar os usuários cadastrados.
- Excluir o campo `senha` dos registros retornados.

**Sucesso:** `200 OK`, com uma lista de usuários (`exemplos/usuario/usuarios-listados.json`).

**Falhas:**
- `400`: erro durante a consulta (`exemplos/usuario/erro-consulta.json`).

### GET /usuario/{id}

**Origem:** RN-01.

**Quem chama:** frontend, em fluxos que necessitam consultar um usuário específico.

**Entrada:** identificador do usuário no caminho da requisição.

**Regras aplicadas no servidor:**
- Localizar o usuário pelo identificador informado.
- Excluir o campo `senha` da resposta.

**Sucesso:** `200 OK`, com os dados do usuário (`exemplos/usuario/usuario-consultado.json`).

**Falhas:**
- `404`: usuário não encontrado (`exemplos/usuario/erro-nao-encontrado.json`).
- `400`: erro durante a consulta (`exemplos/usuario/erro-consulta.json`).

### POST /usuario

**Origem:** RN-01, RN-02.

**Quem chama:** frontend, no fluxo de cadastro de usuário.

**Entrada:** objeto JSON contendo:

- `nome`: nome do usuário.
- `email`: endereço de e-mail.
- `senha`: senha para autenticação.

- `dataCriacao`: opcional, caso seja necessário informar a data de criação.

Exemplo de entrada:

```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Regras aplicadas no servidor:**
- Exigir o campo `senha`.
- Aplicar hash à senha utilizando bcrypt antes do armazenamento.
- Criar o registro do usuário.
- Remover o campo `senha` da resposta.

**Sucesso:** `201 Created`, com os dados do usuário criado, sem a senha (`exemplos/usuario/usuario-criado.json`).

**Falhas:**
- `400`: senha não informada (`exemplos/usuario/erro-senha-obrigatoria.json`).
- `400`: erro durante a criação, incluindo possíveis violações de restrições do banco (`exemplos/usuario/erro-cadastro.json`).

### PUT /usuario/{id}

**Origem:** RN-01, RN-02.

**Quem chama:** frontend, no fluxo de atualização dos dados do usuário.

**Entrada:** identificador do usuário no caminho da requisição e objeto JSON com os campos que serão atualizados:

- `nome`: opcional.
- `email`: opcional.
- `senha`: opcional.

**Regras aplicadas no servidor:**
- Localizar o usuário pelo identificador.
- Caso uma nova senha seja informada, aplicar hash bcrypt.
- Caso a senha não seja informada, preservar a senha anteriormente armazenada.
- Atualizar os campos recebidos.
- Remover o campo `senha` da resposta.

**Sucesso:** `200 OK`, com os dados atualizados do usuário, sem a senha (`exemplos/usuario/usuario-atualizado.json`).

**Falhas:**
- `404`: usuário não encontrado (`exemplos/usuario/erro-nao-encontrado.json`).
- `400`: erro durante a atualização (`exemplos/usuario/erro-atualizacao.json`).

### DELETE /usuario/{id}

**Origem:** RN-01.

**Quem chama:** frontend, no fluxo de exclusão de usuário.

**Entrada:** identificador do usuário no caminho da requisição.

**Regras aplicadas no servidor:**
- Localizar o usuário pelo identificador.
- Excluir o registro encontrado.

**Sucesso:** `200 OK`, com mensagem de confirmação (`exemplos/usuario/usuario-excluido.json`).

**Falhas:**
- `404`: usuário não encontrado (`exemplos/usuario/erro-nao-encontrado.json`).
- `400`: erro durante a exclusão (`exemplos/usuario/erro-exclusao.json`).

---

## 3. Clientes

### GET /cliente

**Origem:** RF-03, N3.

**Quem chama:** frontend, em fluxos que necessitam consultar clientes cadastrados.

**Entrada:** não possui parâmetros ou corpo de requisição.

**Regras aplicadas no servidor:**
- Consultar os clientes cadastrados.
- Retornar os registros encontrados.

**Sucesso:** `200 OK`, com uma lista de clientes (`exemplos/cliente/clientes-listados.json`).

**Falhas:**
- `400`: erro durante a consulta (`exemplos/cliente/erro-consulta.json`).

### GET /cliente/{cpf}

**Origem:** RF-03, N3.

**Quem chama:** frontend, em fluxos de consulta de um cliente específico.

**Entrada:** CPF do cliente no caminho da requisição.

**Regras aplicadas no servidor:**
- Localizar o cliente pelo CPF.
- Retornar os dados do registro encontrado.

**Sucesso:** `200 OK`, com os dados do cliente (`exemplos/cliente/cliente-consultado.json`).

**Falhas:**
- `404`: cliente não encontrado (`exemplos/cliente/erro-nao-encontrado.json`).
- `400`: erro durante a consulta (`exemplos/cliente/erro-consulta.json`).

### GET /cliente/{cpf}/more

**Origem:** RF-03, N3.

**Quem chama:** frontend, em fluxos que necessitam consultar os dados do cliente associados às informações básicas do usuário.

**Entrada:** CPF do cliente no caminho da requisição.

**Regras aplicadas no servidor:**
- Localizar o cliente pelo CPF.
- Consultar os dados associados ao usuário.
- Retornar os campos `nome` e `email` do usuário relacionado.

**Sucesso:** `200 OK`, com os dados do cliente e as informações selecionadas do usuário associado (`exemplos/cliente/cliente-detalhado.json`).

**Falhas:**
- `404`: cliente não encontrado (`exemplos/cliente/erro-nao-encontrado-detalhado.json`).
- `400`: erro durante a consulta (`exemplos/cliente/erro-consulta-detalhada.json`).

### POST /cliente

**Origem:** RN-01, RN-02.

**Quem chama:** frontend, no fluxo de definição do perfil de cliente.

**Entrada:** objeto JSON contendo:

- `id_usuario`: identificador do usuário associado.
- `cpf`: CPF do cliente.
- `observacoes`: opcional.

Exemplo de entrada:

```json
{
  "id_usuario": 1,
  "cpf": "12345678901",
  "observacoes": "Prefere atendimento no período da manhã."
}
```

**Regras aplicadas no servidor:**
- Verificar se o usuário informado já está registrado como prestador.
- Recusar o cadastro caso exista um prestador associado ao mesmo usuário.
- Criar o registro de cliente com os dados recebidos.

**Sucesso:** `201 Created`, com os dados do cliente criado (`exemplos/cliente/cliente-criado.json`).

**Falhas:**
- `409`: usuário já registrado como prestador (`exemplos/cliente/erro-perfil-conflitante.json`).
- `400`: erro durante o cadastro (`exemplos/cliente/erro-cadastro.json`).

### PUT /cliente/{cpf}

**Origem:** RN-01, RN-02.

**Quem chama:** frontend, no fluxo de atualização do perfil de cliente.

**Entrada:** CPF do cliente no caminho da requisição e objeto JSON com os campos que serão atualizados.

Campos disponíveis no modelo:

- `id_usuario`.
- `cpf`.
- `observacoes`.

**Regras aplicadas no servidor:**
- Localizar o cliente pelo CPF.
- Atualizar o registro com os dados recebidos.
- As restrições definidas no modelo e no banco de dados continuam aplicáveis.

**Sucesso:** `200 OK`, com os dados atualizados do cliente (`exemplos/cliente/cliente-atualizado.json`).

**Falhas:**
- `404`: cliente não encontrado (`exemplos/cliente/erro-nao-encontrado.json`).
- `400`: erro durante a atualização (`exemplos/cliente/erro-atualizacao.json`).

### DELETE /cliente/{cpf}

**Origem:** RN-01.

**Quem chama:** frontend, no fluxo de exclusão do perfil de cliente.

**Entrada:** CPF do cliente no caminho da requisição.

**Regras aplicadas no servidor:**
- Localizar o cliente pelo CPF.
- Excluir o registro encontrado.

**Sucesso:** `200 OK`, com mensagem de confirmação (`exemplos/cliente/cliente-excluido.json`).

**Falhas:**
- `404`: cliente não encontrado (`exemplos/cliente/erro-nao-encontrado.json`).
- `400`: erro durante a exclusão (`exemplos/cliente/erro-exclusao.json`).

---

## 4. Prestadores

### GET /prestador

**Origem:** RF-03, N8.

**Quem chama:** frontend, em fluxos de consulta e descoberta de prestadores.

**Entrada:** não possui parâmetros ou corpo de requisição.

**Regras aplicadas no servidor:**
- Consultar os prestadores cadastrados.
- Retornar os registros encontrados.

**Sucesso:** `200 OK`, com uma lista de prestadores (`exemplos/prestador/prestadores-listados.json`).

**Falhas:**
- `400`: erro durante a consulta (`exemplos/prestador/erro-consulta.json`).

### GET /prestador/{cnpj}

**Origem:** RF-03, N8.

**Quem chama:** frontend, em fluxos de consulta de um prestador específico.

**Entrada:** CNPJ do prestador no caminho da requisição.

**Regras aplicadas no servidor:**
- Localizar o prestador pelo CNPJ.
- Retornar os dados do registro encontrado.

**Sucesso:** `200 OK`, com os dados do prestador (`exemplos/prestador/prestador-consultado.json`).

**Falhas:**
- `404`: prestador não encontrado (`exemplos/prestador/erro-nao-encontrado.json`).
- `400`: erro durante a consulta (`exemplos/prestador/erro-consulta.json`).

### GET /prestador/{cnpj}/more

**Origem:** RF-03, N8.

**Quem chama:** frontend, em fluxos que necessitam consultar os dados do prestador associados às informações básicas do usuário.

**Entrada:** CNPJ do prestador no caminho da requisição.

**Regras aplicadas no servidor:**
- Localizar o prestador pelo CNPJ.
- Consultar os dados associados ao usuário.
- Retornar os campos `nome` e `email` do usuário relacionado.

**Sucesso:** `200 OK`, com os dados do prestador e as informações selecionadas do usuário (`exemplos/prestador/prestador-detalhado.json`).

**Falhas:**
- `404`: prestador não encontrado (`exemplos/prestador/erro-nao-encontrado-detalhado.json`).
- `400`: erro durante a consulta (`exemplos/prestador/erro-consulta-detalhada.json`).

### POST /prestador

**Origem:** RN-01, RN-02, RN-04.

**Quem chama:** frontend, no fluxo de cadastro do perfil de prestador.

**Entrada:** requer autenticação. Objeto JSON contendo:

- `id_usuario`: identificador do usuário autenticado, utilizado na verificação de titularidade.
- `cnpj`: CNPJ do prestador.
- `servicoPrestado`: descrição do serviço oferecido.
- `preco`: preço do serviço.

Exemplo de entrada:

```json
{
  "id_usuario": 1,
  "cnpj": "12345678000199",
  "servicoPrestado": "Serviços de encanamento",
  "preco": 150.00
}
```

**Regras aplicadas no servidor:**
- Exigir autenticação.
- Verificar se o identificador informado corresponde ao usuário autenticado.
- Validar a descrição do serviço, que deve possuir de 1 a 150 caracteres.
- Validar o preço, que deve estar entre R$ 0,01 e R$ 99.999.999,99, com até duas casas decimais.
- Verificar se o usuário já está registrado como cliente.
- Associar o cadastro ao usuário autenticado.
- Definir a avaliação inicial conforme o valor padrão do modelo.

**Sucesso:** `201 Created`, com os dados do prestador criado (`exemplos/prestador/prestador-criado.json`).

**Falhas:**
- `401`: autenticação necessária (`exemplos/prestador/erro-nao-autenticado.json`).
- `403`: usuário sem permissão para realizar o cadastro (`exemplos/prestador/erro-sem-permissao.json`).
- `400`: dados inválidos, incluindo descrição ou preço fora dos limites (`exemplos/prestador/erro-dados-invalidos.json`).
- `409`: usuário já registrado como cliente (`exemplos/prestador/erro-perfil-conflitante.json`).
- `400`: erro durante o cadastro (`exemplos/prestador/erro-cadastro.json`).

### PUT /prestador/{cnpj}

**Origem:** RN-01, RN-04.

**Quem chama:** frontend, no fluxo de atualização dos dados do prestador.

**Entrada:** requer autenticação. CNPJ do prestador no caminho da requisição e objeto JSON contendo um ou ambos os campos:

- `servicoPrestado`: nova descrição do serviço.
- `preco`: novo preço.

Exemplo de entrada:

```json
{
  "servicoPrestado": "Manutenção hidráulica",
  "preco": 180.00
}
```

**Regras aplicadas no servidor:**
- Exigir autenticação.
- Localizar o prestador pelo CNPJ.
- Verificar se o cadastro pertence ao usuário autenticado.
- Aceitar apenas os campos `servicoPrestado` e `preco`.
- Exigir pelo menos um campo para atualização.
- Validar a descrição e o preço, considerando também os valores já existentes quando apenas um dos campos for informado.
- Remover espaços excedentes nas extremidades da descrição.

**Sucesso:** `200 OK`, com os dados atualizados do prestador (`exemplos/prestador/prestador-atualizado.json`).

**Falhas:**
- `401`: autenticação necessária (`exemplos/prestador/erro-nao-autenticado.json`).
- `403`: usuário sem permissão para atualizar o cadastro (`exemplos/prestador/erro-sem-permissao.json`).
- `404`: prestador não encontrado (`exemplos/prestador/erro-nao-encontrado.json`).
- `400`: nenhum campo informado ou dados inválidos (`exemplos/prestador/erro-dados-invalidos.json`).
- `500`: erro interno durante a atualização (`exemplos/prestador/erro-atualizacao.json`).

### DELETE /prestador/{cnpj}

**Origem:** RN-01.

**Quem chama:** frontend, no fluxo de exclusão do perfil de prestador.

**Entrada:** requer autenticação. CNPJ do prestador no caminho da requisição.

**Regras aplicadas no servidor:**
- Exigir autenticação.
- Localizar o prestador pelo CNPJ.
- Verificar se o cadastro pertence ao usuário autenticado.
- Excluir o registro encontrado.

**Sucesso:** `200 OK`, com mensagem de confirmação (`exemplos/prestador/prestador-excluido.json`).

**Falhas:**
- `401`: autenticação necessária (`exemplos/prestador/erro-nao-autenticado.json`).
- `403`: usuário sem permissão para excluir o cadastro (`exemplos/prestador/erro-sem-permissao.json`).
- `404`: prestador não encontrado (`exemplos/prestador/erro-nao-encontrado.json`).
- `500`: erro interno durante a exclusão (`exemplos/prestador/erro-exclusao.json`).

---

## 5. Serviços

Todas as operações deste recurso exigem autenticação.

### GET /servico

**Origem:** RF-03, RF-04, N3, N8.

**Quem chama:** frontend, na consulta dos serviços associados ao usuário autenticado.

**Entrada:** token JWT no cabeçalho `Authorization`.

**Regras aplicadas no servidor:**
- Identificar o perfil associado ao usuário autenticado.
- Verificar se o usuário possui perfil de cliente ou prestador.
- Caso seja cliente, retornar os serviços associados ao seu CPF.
- Caso seja prestador, retornar os serviços associados ao seu CNPJ.
- Não permitir consulta sem perfil cadastrado ou com perfis conflitantes.

**Sucesso:** `200 OK`, com a lista de serviços pertencentes ao usuário (`exemplos/servico/servicos-listados.json`).

**Falhas:**
- `401`: token ausente, inválido ou expirado (`exemplos/servico/erro-nao-autenticado.json`).
- `403`: usuário sem perfil cadastrado ou com perfis conflitantes (`exemplos/servico/erro-sem-perfil.json`).
- `500`: erro interno durante a consulta (`exemplos/servico/erro-consulta.json`).

### GET /servico/{id}

**Origem:** RF-03, N3, N8.

**Quem chama:** frontend, na consulta de um serviço específico.

**Entrada:** token JWT e identificador do serviço no caminho da requisição.

**Regras aplicadas no servidor:**
- Identificar o perfil do usuário autenticado.
- Localizar o serviço pelo identificador.
- Verificar se o serviço pertence ao cliente ou prestador autenticado.
- Impedir o acesso a serviços pertencentes a outros usuários.

**Sucesso:** `200 OK`, com os dados do serviço (`exemplos/servico/servico-consultado.json`).

**Falhas:**
- `401`: token ausente, inválido ou expirado (`exemplos/servico/erro-nao-autenticado.json`).
- `403`: usuário sem perfil ou sem permissão para acessar o serviço (`exemplos/servico/erro-sem-permissao.json`).
- `404`: serviço não encontrado (`exemplos/servico/erro-nao-encontrado.json`).
- `500`: erro interno durante a consulta (`exemplos/servico/erro-consulta.json`).

### GET /servico/{id}/more

**Origem:** RF-03, N3, N8.

**Quem chama:** frontend, em fluxos que necessitam consultar as informações completas de um serviço.

**Entrada:** token JWT e identificador do serviço no caminho da requisição.

**Regras aplicadas no servidor:**
- Identificar o perfil do usuário autenticado.
- Localizar o serviço pelo identificador.
- Verificar a titularidade do serviço.
- Consultar os dados relacionados do cliente, prestador e agenda.
- Retornar somente os atributos selecionados:
  - Cliente: `cpf`.
  - Prestador: `cnpj`, `servicoPrestado`, `preco` e `avaliacao`.
  - Agenda: `horario` e `local`.

**Sucesso:** `200 OK`, com os dados do serviço e seus relacionamentos (`exemplos/servico/servico-detalhado.json`).

**Falhas:**
- `401`: token ausente, inválido ou expirado (`exemplos/servico/erro-nao-autenticado.json`).
- `403`: usuário sem perfil ou sem permissão para acessar o serviço (`exemplos/servico/erro-sem-permissao.json`).
- `404`: serviço não encontrado (`exemplos/servico/erro-nao-encontrado.json`).
- `500`: erro interno durante a consulta dos detalhes (`exemplos/servico/erro-consulta-detalhada.json`).

### POST /servico

**Origem:** RF-01, RF-02, RF-03, RN-03, RN-04.

**Quem chama:** frontend, no fluxo de solicitação e agendamento de serviço por um cliente.

**Entrada:** requer autenticação. Objeto JSON contendo:

- `id_prestador`: CNPJ do prestador escolhido.
- `id_agenda`: identificador da agenda selecionada.
- `tag`: opcional, identificação de prioridade.
- `descricao`: opcional, descrição da solicitação.

Exemplo de entrada:

```json
{
  "id_prestador": "12345678000199",
  "id_agenda": 1,
  "tag": "Urgente",
  "descricao": "Solicito manutenção hidráulica."
}
```

**Regras aplicadas no servidor:**
- Identificar o perfil do usuário autenticado.
- Permitir a criação somente para usuários com perfil de cliente.
- Obter o CPF do cliente a partir do usuário autenticado, sem confiar em um `id_cliente` enviado pelo frontend.
- Verificar se o CNPJ informado corresponde a um prestador existente.
- Verificar se a agenda informada existe.
- Verificar se o prestador já possui outro serviço no horário escolhido.
- Verificar se o cliente já possui outro serviço no mesmo horário.
- Recusar o agendamento caso exista algum conflito.
- Associar o serviço ao cliente, prestador e agenda identificados.

**Sucesso:** `201 Created`, com os dados do serviço criado (`exemplos/servico/servico-criado.json`).

**Falhas:**
- `401`: token ausente, inválido ou expirado (`exemplos/servico/erro-nao-autenticado.json`).
- `403`: usuário sem perfil, com perfis conflitantes ou que não seja cliente (`exemplos/servico/erro-sem-permissao.json`).
- `400`: identificador do prestador ou da agenda inválido (`exemplos/servico/erro-dados-invalidos.json`).
- `404`: prestador ou agenda não encontrados (`exemplos/servico/erro-relacionamento-nao-encontrado.json`).
- `409`: conflito de horário para o cliente ou prestador (`exemplos/servico/erro-conflito-horario.json`).
- `500`: erro interno durante a criação (`exemplos/servico/erro-cadastro.json`).

### PUT /servico/{id}

**Origem:** RF-02, RN-03.

**Quem chama:** frontend, no fluxo de alteração do horário ou local de um serviço existente.

**Entrada:** requer autenticação. Identificador do serviço no caminho da requisição e objeto JSON contendo pelo menos um dos campos:

- `horario`: novo horário, representado por uma string de data e hora válida.
- `local`: novo local de atendimento.

Exemplo de entrada:

```json
{
  "horario": "2026-12-10T14:00:00.000Z",
  "local": "Av. Tocantins, 100 - Palmas"
}
```

**Regras aplicadas no servidor:**
- Identificar o perfil do usuário autenticado.
- Localizar o serviço pelo identificador.
- Verificar se o serviço pertence ao usuário autenticado.
- Exigir pelo menos um dos campos `horario` ou `local`.
- Localizar a agenda associada ao serviço.
- Validar o horário informado, caso exista.
- Verificar se o novo horário gera conflito com outro serviço do mesmo cliente ou prestador.
- Validar o local informado, caso exista.
- Atualizar os dados da agenda associada ao serviço.
- Retornar o serviço atualizado acompanhado de sua agenda.

**Sucesso:** `200 OK`, com os dados do serviço e da agenda atualizados (`exemplos/servico/servico-atualizado.json`).

**Falhas:**
- `401`: token ausente, inválido ou expirado (`exemplos/servico/erro-nao-autenticado.json`).
- `403`: usuário sem perfil ou sem permissão para atualizar o serviço (`exemplos/servico/erro-sem-permissao.json`).
- `404`: serviço ou agenda não encontrados (`exemplos/servico/erro-nao-encontrado.json`).
- `400`: nenhum campo informado, horário inválido ou local inválido (`exemplos/servico/erro-dados-invalidos.json`).
- `409`: conflito de horário (`exemplos/servico/erro-conflito-horario.json`).
- `500`: erro interno durante a atualização (`exemplos/servico/erro-atualizacao.json`).

### DELETE /servico/{id}

**Origem:** RF-02, RN-03.

**Quem chama:** frontend, no fluxo de exclusão de um serviço agendado.

**Entrada:** requer autenticação. Identificador do serviço no caminho da requisição.

**Regras aplicadas no servidor:**
- Identificar o perfil do usuário autenticado.
- Localizar o serviço pelo identificador.
- Verificar se o serviço pertence ao usuário autenticado.
- Excluir o registro encontrado.

**Sucesso:** `200 OK`, com mensagem de confirmação (`exemplos/servico/servico-excluido.json`).

**Falhas:**
- `401`: token ausente, inválido ou expirado (`exemplos/servico/erro-nao-autenticado.json`).
- `403`: usuário sem perfil ou sem permissão para excluir o serviço (`exemplos/servico/erro-sem-permissao.json`).
- `404`: serviço não encontrado (`exemplos/servico/erro-nao-encontrado.json`).
- `500`: erro interno durante a exclusão (`exemplos/servico/erro-exclusao.json`).

---

## 6. Agenda

### GET /agenda

**Origem:** RF-02, RN-02.

**Quem chama:** frontend, em fluxos de consulta dos horários disponíveis cadastrados.

**Entrada:** não possui parâmetros ou corpo de requisição.

**Regras aplicadas no servidor:**
- Consultar os registros de agenda cadastrados.
- Retornar os horários e locais encontrados.

**Sucesso:** `200 OK`, com uma lista de agendas (`exemplos/agenda/agendas-listadas.json`).

**Falhas:**
- `400`: erro durante a consulta (`exemplos/agenda/erro-consulta.json`).

### GET /agenda/{id}

**Origem:** RF-02.

**Quem chama:** frontend, em fluxos de consulta de uma agenda específica.

**Entrada:** identificador da agenda no caminho da requisição.

**Regras aplicadas no servidor:**
- Localizar a agenda pelo identificador informado.
- Retornar os dados do registro encontrado.

**Sucesso:** `200 OK`, com os dados da agenda (`exemplos/agenda/agenda-consultada.json`).

**Falhas:**
- `404`: agenda não encontrada (`exemplos/agenda/erro-nao-encontrado.json`).
- `400`: erro durante a consulta (`exemplos/agenda/erro-consulta.json`).

### POST /agenda

**Origem:** RF-02, RN-02.

**Quem chama:** frontend, no fluxo de cadastro de horários e locais de atendimento.

**Entrada:** objeto JSON contendo:

- `horario`: data e horário do atendimento.
- `local`: local onde o serviço será realizado.

Exemplo de entrada:

```json
{
  "horario": "2026-12-10T14:00:00.000Z",
  "local": "Av. Tocantins, 100 - Palmas"
}
```

**Regras aplicadas no servidor:**
- Verificar se já existe uma agenda com a mesma combinação de horário e local.
- Recusar a criação caso essa combinação já esteja cadastrada.
- Criar o registro de agenda com os dados recebidos.

**Sucesso:** `201 Created`, com os dados da agenda criada (`exemplos/agenda/agenda-criada.json`).

**Falhas:**
- `409`: já existe uma agenda com o mesmo horário e local (`exemplos/agenda/erro-agenda-duplicada.json`).
- `400`: erro durante a criação (`exemplos/agenda/erro-cadastro.json`).

### PUT /agenda/{id}

**Origem:** RF-02.

**Quem chama:** frontend, no fluxo de atualização de horários e locais cadastrados.

**Entrada:** identificador da agenda no caminho da requisição e objeto JSON com os campos que serão atualizados:

- `horario`: opcional.
- `local`: opcional.

**Regras aplicadas no servidor:**
- Localizar a agenda pelo identificador.
- Atualizar o registro com os dados recebidos.
- Aplicar as restrições definidas no modelo e no banco de dados.

**Sucesso:** `200 OK`, com os dados atualizados da agenda (`exemplos/agenda/agenda-atualizada.json`).

**Falhas:**
- `404`: agenda não encontrada (`exemplos/agenda/erro-nao-encontrado.json`).
- `400`: erro durante a atualização (`exemplos/agenda/erro-atualizacao.json`).

### DELETE /agenda/{id}

**Origem:** RF-02.

**Quem chama:** frontend, no fluxo de exclusão de um horário cadastrado.

**Entrada:** identificador da agenda no caminho da requisição.

**Regras aplicadas no servidor:**
- Localizar a agenda pelo identificador.
- Excluir o registro encontrado.

**Sucesso:** `200 OK`, com mensagem de confirmação (`exemplos/agenda/agenda-excluida.json`).

**Falhas:**
- `404`: agenda não encontrada (`exemplos/agenda/erro-nao-encontrado.json`).
- `400`: erro durante a exclusão (`exemplos/agenda/erro-exclusao.json`).

---

## 7. Verificação da aplicação

### GET /

**Origem:** necessidade operacional de verificação da disponibilidade da aplicação.

**Quem chama:** frontend, navegador ou ferramenta de monitoramento.

**Entrada:** não possui parâmetros ou corpo de requisição.

**Regras aplicadas no servidor:**
- Retornar uma mensagem indicando que a API está funcionando.

**Sucesso:** `200 OK`, com a mensagem de funcionamento (`exemplos/saude/api-funcionando.json`).

### GET /health

**Origem:** necessidade operacional de verificação da disponibilidade da aplicação e da conexão com o banco de dados.

**Quem chama:** ferramenta de monitoramento, ambiente de desenvolvimento ou infraestrutura de execução.

**Entrada:** não possui parâmetros ou corpo de requisição.

**Regras aplicadas no servidor:**
- Verificar a conexão com o banco de dados.
- Retornar o estado da API e do banco de dados.

**Sucesso:** `200 OK`, quando o banco de dados está conectado (`exemplos/saude/banco-conectado.json`).

**Falhas:**
- `503`: API disponível, mas banco de dados indisponível (`exemplos/saude/banco-indisponivel.json`).

---

## 8. Observações e limitações conhecidas

As seguintes particularidades devem ser consideradas durante a integração e evolução da API:

- As operações de consulta de usuários, clientes, prestadores e agendas não possuem middleware de autenticação registrado nas respectivas rotas.
- O cadastro e a atualização de clientes e usuários também não possuem autenticação registrada nas rotas apresentadas.
- As operações de escrita de prestadores exigem autenticação e verificam a titularidade do cadastro.
- Todas as operações de serviços exigem autenticação e verificam a titularidade dos registros.
- As operações de agenda não possuem autenticação registrada.
- A atualização de serviço modifica a agenda associada ao serviço, não os demais atributos do registro de serviço.
- A atualização de agenda diretamente por `/agenda/{id}` não executa a verificação de conflito de horário existente nas operações de serviço.
- O cadastro de agenda impede a duplicação da combinação de horário e local, enquanto a criação de serviços verifica conflitos de horário para o cliente e o prestador.
- O cadastro de cliente e prestador ocorre em operações separadas do cadastro de usuário.
- A exclusão dos registros utiliza a operação de exclusão física do Sequelize. Não foi identificado apagamento lógico nos Models apresentados.
- Os exemplos JSON referenciados neste documento devem representar as respostas efetivamente retornadas pela API.

## 9. Rastreabilidade

A documentação utiliza como referência os seguintes requisitos e necessidades:

| Identificador | Descrição relacionada |
|---|---|
| RF-01 | Notificação de confirmação de serviço. |
| RF-02 | Agenda para organização dos agendamentos. |
| RF-03 | Disponibilização de informações para comunicação entre cliente e servidor. |
| RF-04 | Tags de prioridade para serviços agendados. |
| RN-01 | Usuário na condição de cliente ou prestador. |
| RN-02 | Cadastro condicionado ao preenchimento do perfil. |
| RN-03 | Recusa de conflitos de agendamento. |
| RN-04 | Definição de preço mínimo. |
| N3 | Acesso às informações do cliente. |
| N8 | Acesso às informações do prestador. |

A associação entre operações e requisitos indica a relação funcional identificada durante a análise do sistema. Ela não substitui a definição de critérios de aceitação ou histórias de usuário específicas.


