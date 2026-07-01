# Prompt Mandatorio para Analise de Codebase, Deploy e Escolha de Cloud

## Data de referencia

2026-07-01

## Objetivo

Salvar um prompt em pt-BR, pronto para uso, mandatorio, sem desvios e sem flexibilidade, para orientar uma analise minuciosa de todo o codebase com foco em deploy, escolha inicial de cloud provider, baixo custo operacional e facilidade real de manter ou migrar a solucao no futuro.

## Prompt Original x Prompt Enriquecido

| Prompt original | Prompt enriquecido |
| --- | --- |
| Eu quero que analise/minuciosamente, criteriosamente todo codebase, estou iniciando uma startup, posso fazer cadastro em qual cloud provider, mas a premissa e que quando acabar eu consiga migrar ou manter o custo mais baixo possivel com uso de 2 usuarios. Eu quero um passo a passo com as melhores e mais recomendadas praticas focando em economia, eficiencia. Veja: deployment. | **EXECUTE EXATAMENTE O QUE ESTA NESTE PROMPT. NAO DESVIE, NAO FLEXIBILIZE, NAO RESUMA E NAO COMPLETE COM OPINIOES GENERICAS.**<br><br>Voce deve atuar como um arquiteto senior de plataforma, cloud e custo, com criterio de producao real, foco em economia, eficiencia e baixo risco operacional.<br><br>A data de referencia desta analise e **2026-07-01**.<br><br>Analise minuciosamente e criteriosamente **todo o codebase**, com prioridade obrigatoria para o diretorio **`deployment/`**, arquivos de infraestrutura, runtime, persistencia, dependencias, processos de build, start, operacao, observabilidade, segredos, rede, banco, volumes, containers, proxy, scripts operacionais e qualquer evidencia que impacte deploy ou portabilidade.<br><br>Seu objetivo e definir **em qual cloud provider eu devo fazer cadastro agora**, considerando que estou iniciando uma startup, terei **apenas 2 usuarios**, preciso do **menor custo total realista possivel**, e nao aceito uma recomendacao que me prenda desnecessariamente a um fornecedor se existir alternativa mais portavel e economica.<br><br>A recomendacao final deve equilibrar, obrigatoriamente e ao mesmo tempo:<br>- menor custo inicial realista<br>- simplicidade operacional real<br>- facilidade de manutencao por uma equipe pequena<br>- facilidade de migracao futura<br>- aderencia ao que o codebase ja pede hoje<br>- menor risco de retrabalho de arquitetura e infraestrutura<br><br>Voce **nao pode implementar nada**. Voce deve **apenas analisar e recomendar** com base no repositorio e nas evidencias encontradas.<br><br>### Regras mandatórias e inegociaveis<br>1. Analise o repositorio inteiro antes de concluir.<br>2. Considere o diretorio `deployment/` como fonte obrigatoria de verdade operacional.<br>3. Deduza a arquitetura atual e a arquitetura implicita exigida pelo projeto.<br>4. Identifique dependencias que aumentam lock-in, custo, complexidade operacional ou dificultam migracao.<br>5. Identifique dependencias que favorecem portabilidade, self-hosting, containerizacao, padroes abertos e baixo custo.<br>6. Avalie se o projeto pede VPS simples, PaaS, container host, banco gerenciado ou banco self-hosted.<br>7. Compare a necessidade real do sistema contra o cenario de apenas 2 usuarios.<br>8. Elimine recomendacoes superdimensionadas, caras ou desnecessarias para esse porte.<br>9. Se houver conflito entre free tier e robustez, explique objetivamente o limite e recomende o menor custo viavel de verdade.<br>10. Priorize solucoes com migracao simples entre provedores, preferencialmente baseadas em Docker, Compose, reverse proxy padrao, banco portavel e armazenamento sem acoplamento forte.<br>11. Toda afirmacao importante deve estar ancorada em evidencias observaveis do repositorio.<br>12. E proibido responder como artigo generico, checklist superficial ou texto de marketing.<br><br>### Formato de resposta obrigatorio<br>Entregue a resposta **exatamente** com as 12 secoes abaixo, nesta ordem, sem renomear titulos, sem remover secoes e sem adicionar secoes extras, exceto `Suposicoes Minimas` quando realmente faltar contexto comprovavel.<br><br>## 1. Resumo executivo<br>- diga em uma frase qual cloud provider deve ser usado agora<br>- diga em uma frase por que essa e a melhor escolha para 2 usuarios<br><br>## 2. Evidencias do codebase<br>- liste os arquivos e diretorios mais relevantes encontrados<br>- explique objetivamente o que cada um indica sobre deploy, banco, runtime, rede, proxy, storage e operacao<br><br>## 3. Arquitetura atual inferida<br>- descreva a arquitetura atual do projeto com base nas evidencias<br>- destaque componentes obrigatorios, opcionais e suspeitas de sobrecusto<br><br>## 4. Requisitos reais para producao minima<br>- diga o que realmente e necessario para rodar esse projeto para 2 usuarios<br>- separe o que e obrigatorio do que e excesso para o momento atual<br><br>## 5. Analise de portabilidade e lock-in<br>- aponte onde existe lock-in atual ou potencial<br>- diga o que facilita futura migracao<br>- diga o que deve ser evitado desde o inicio<br><br>## 6. Recomendacao final de cloud provider<br>- escolha **uma unica recomendacao principal**<br>- informe o tipo de oferta ideal (ex.: VPS, PaaS, container host, banco gerenciado ou combinacao minima)<br>- justifique pela relacao entre custo, simplicidade, operacao e migracao<br>- diga claramente em quais cenarios essa recomendacao deixaria de ser a melhor<br><br>## 7. Alternativas ranqueadas<br>- traga no maximo 3 alternativas<br>- ordene da melhor para a pior para este caso especifico<br>- explique por que cada uma perdeu para a recomendacao principal<br><br>## 8. Estrategia de deploy mais economica e segura<br>- descreva o desenho de deploy mais economico coerente com o codebase atual<br>- indique o que deve ficar no mesmo host e o que nao precisa ser separado ainda<br>- evite complexidade prematura<br><br>## 9. Passo a passo obrigatorio<br>- entregue um passo a passo sequencial, pragmatico e sem lacunas<br>- cubra desde o cadastro no provedor ate a operacao inicial minima<br>- inclua melhores praticas realmente recomendadas para economia e eficiencia<br>- nao escreva comandos destrutivos desnecessarios e nao invente etapas sem base no repositorio<br><br>## 10. Custos estimados<br>- estime a faixa mensal inicial mais provavel<br>- detalhe custos obrigatorios e custos opcionais<br>- deixe claro o que pode ficar para depois<br><br>## 11. Riscos, limites e pontos de atencao<br>- mostre riscos operacionais, tecnicos e financeiros<br>- destaque o que pode quebrar a premissa de baixo custo ou migracao facil<br><br>## 12. Decisao final sem ambiguidade<br>- encerre com uma recomendacao objetiva no formato:<br>`Cadastre-se em: <provedor>`<br>`Modelo inicial: <topologia minima>`<br>`Evite agora: <o que nao vale a pena para 2 usuarios>`<br><br>### Restricoes obrigatorias<br>- Responder em pt-BR.<br>- Nao implementar nada.<br>- Nao escrever codigo, Terraform, YAML, Docker Compose novo ou scripts de automacao.<br>- Nao devolver resposta generica de blog.<br>- Nao listar provedores sem concluir.<br>- Nao fugir do cenario de **2 usuarios**.<br>- Nao recomendar arquitetura enterprise desnecessaria.<br>- Nao assumir servicos que o codebase nao exige sem deixar isso explicito.<br>- Nao usar linguagem vaga como `depende`, `talvez`, `pode ser`, `uma opcao seria` sem fechar recomendacao principal.<br>- Nao oferecer multiplas respostas finais equivalentes.<br>- Nao criar ressalvas artificiais para evitar decidir.<br><br>### Regra de excecao controlada<br>Se faltar contexto objetivo do repositorio para sustentar algum ponto, use **apenas** a secao `Suposicoes Minimas`, com o menor numero possivel de suposicoes. Fora isso, e proibido flexibilizar o formato ou o nivel de decisao.<br><br>### Criterios de aceitacao da resposta<br>- A resposta deve deixar claro em qual provedor eu devo me cadastrar agora.<br>- A resposta deve mostrar entendimento real do codebase e do diretorio `deployment/`.<br>- A resposta deve equilibrar custo, eficiencia, operacao e migracao futura.<br>- A resposta deve ser pratica, objetiva e pronta para orientar decisao real de startup.<br>- A resposta deve evitar falso positivo, recomendacao generica e overengineering.<br>- A resposta deve ser utilizavel imediatamente, sem necessidade de reinterpretacao. |

## Ambiguidades identificadas

- O pedido original nao define se a prioridade maxima e custo zero, custo minimo pago ou robustez minima com previsibilidade; o prompt enriquecido obriga o analista a tratar esse conflito de forma explicita sem escapar da decisao final.
- "Qual cloud provider" pode gerar uma lista aberta de opcoes; o prompt enriquecido exige uma recomendacao principal unica e alternativas apenas como backup comparativo.
- O pedido original fala em economia e eficiencia, mas nao define formato de saida; o prompt enriquecido fixa secoes obrigatorias, passo a passo e criterio de aceitacao.
- "Veja: deployment" pode ser tratado superficialmente; o prompt enriquecido torna `deployment/` uma fonte obrigatoria de evidencia operacional.

## Justificativas das adicoes

- Adicionei uma abertura imperativa e bloqueios explicitos de desvio para tornar o prompt estrito e imediatamente usavel.
- Adicionei um papel explicito de arquiteto senior de plataforma e custo para puxar uma analise mais rigorosa e menos superficial.
- Transformei a data atual em contexto obrigatorio para reduzir risco de recomendacoes desatualizadas.
- Forcei analise do codebase inteiro e priorizacao de `deployment/` para impedir resposta genérica desconectada do repositorio.
- Exigi uma recomendacao principal unica para eliminar ambiguidade e excesso de opcionalidade.
- Estruturei o output com secoes fixas para gerar uma resposta pronta para decisao pratica, nao um texto solto.
- Inclui restricoes negativas para bloquear implementacao, overengineering, lock-in desnecessario e resposta estilo blog post.
- Defini criterios de aceitacao objetivos para reduzir falso positivo e aumentar utilidade real do resultado.

## Versao pronta para copiar

```md
**EXECUTE EXATAMENTE O QUE ESTA NESTE PROMPT. NAO DESVIE, NAO FLEXIBILIZE, NAO RESUMA E NAO COMPLETE COM OPINIOES GENERICAS.**

Voce deve atuar como um arquiteto senior de plataforma, cloud e custo, com criterio de producao real, foco em economia, eficiencia e baixo risco operacional.

A data de referencia desta analise e **2026-07-01**.

Analise minuciosamente e criteriosamente **todo o codebase**, com prioridade obrigatoria para o diretorio **`deployment/`**, arquivos de infraestrutura, runtime, persistencia, dependencias, processos de build, start, operacao, observabilidade, segredos, rede, banco, volumes, containers, proxy, scripts operacionais e qualquer evidencia que impacte deploy ou portabilidade.

Seu objetivo e definir **em qual cloud provider eu devo fazer cadastro agora**, considerando que estou iniciando uma startup, terei **apenas 2 usuarios**, preciso do **menor custo total realista possivel**, e nao aceito uma recomendacao que me prenda desnecessariamente a um fornecedor se existir alternativa mais portavel e economica.

A recomendacao final deve equilibrar, obrigatoriamente e ao mesmo tempo:
- menor custo inicial realista
- simplicidade operacional real
- facilidade de manutencao por uma equipe pequena
- facilidade de migracao futura
- aderencia ao que o codebase ja pede hoje
- menor risco de retrabalho de arquitetura e infraestrutura

Voce **nao pode implementar nada**. Voce deve **apenas analisar e recomendar** com base no repositorio e nas evidencias encontradas.

### Regras mandatórias e inegociaveis
1. Analise o repositorio inteiro antes de concluir.
2. Considere o diretorio `deployment/` como fonte obrigatoria de verdade operacional.
3. Deduza a arquitetura atual e a arquitetura implicita exigida pelo projeto.
4. Identifique dependencias que aumentam lock-in, custo, complexidade operacional ou dificultam migracao.
5. Identifique dependencias que favorecem portabilidade, self-hosting, containerizacao, padroes abertos e baixo custo.
6. Avalie se o projeto pede VPS simples, PaaS, container host, banco gerenciado ou banco self-hosted.
7. Compare a necessidade real do sistema contra o cenario de apenas 2 usuarios.
8. Elimine recomendacoes superdimensionadas, caras ou desnecessarias para esse porte.
9. Se houver conflito entre free tier e robustez, explique objetivamente o limite e recomende o menor custo viavel de verdade.
10. Priorize solucoes com migracao simples entre provedores, preferencialmente baseadas em Docker, Compose, reverse proxy padrao, banco portavel e armazenamento sem acoplamento forte.
11. Toda afirmacao importante deve estar ancorada em evidencias observaveis do repositorio.
12. E proibido responder como artigo generico, checklist superficial ou texto de marketing.

### Formato de resposta obrigatorio
Entregue a resposta **exatamente** com as 12 secoes abaixo, nesta ordem, sem renomear titulos, sem remover secoes e sem adicionar secoes extras, exceto `Suposicoes Minimas` quando realmente faltar contexto comprovavel.

## 1. Resumo executivo
- diga em uma frase qual cloud provider deve ser usado agora
- diga em uma frase por que essa e a melhor escolha para 2 usuarios

## 2. Evidencias do codebase
- liste os arquivos e diretorios mais relevantes encontrados
- explique objetivamente o que cada um indica sobre deploy, banco, runtime, rede, proxy, storage e operacao

## 3. Arquitetura atual inferida
- descreva a arquitetura atual do projeto com base nas evidencias
- destaque componentes obrigatorios, opcionais e suspeitas de sobrecusto

## 4. Requisitos reais para producao minima
- diga o que realmente e necessario para rodar esse projeto para 2 usuarios
- separe o que e obrigatorio do que e excesso para o momento atual

## 5. Analise de portabilidade e lock-in
- aponte onde existe lock-in atual ou potencial
- diga o que facilita futura migracao
- diga o que deve ser evitado desde o inicio

## 6. Recomendacao final de cloud provider
- escolha **uma unica recomendacao principal**
- informe o tipo de oferta ideal (ex.: VPS, PaaS, container host, banco gerenciado ou combinacao minima)
- justifique pela relacao entre custo, simplicidade, operacao e migracao
- diga claramente em quais cenarios essa recomendacao deixaria de ser a melhor

## 7. Alternativas ranqueadas
- traga no maximo 3 alternativas
- ordene da melhor para a pior para este caso especifico
- explique por que cada uma perdeu para a recomendacao principal

## 8. Estrategia de deploy mais economica e segura
- descreva o desenho de deploy mais economico coerente com o codebase atual
- indique o que deve ficar no mesmo host e o que nao precisa ser separado ainda
- evite complexidade prematura

## 9. Passo a passo obrigatorio
- entregue um passo a passo sequencial, pragmatico e sem lacunas
- cubra desde o cadastro no provedor ate a operacao inicial minima
- inclua melhores praticas realmente recomendadas para economia e eficiencia
- nao escreva comandos destrutivos desnecessarios e nao invente etapas sem base no repositorio

## 10. Custos estimados
- estime a faixa mensal inicial mais provavel
- detalhe custos obrigatorios e custos opcionais
- deixe claro o que pode ficar para depois

## 11. Riscos, limites e pontos de atencao
- mostre riscos operacionais, tecnicos e financeiros
- destaque o que pode quebrar a premissa de baixo custo ou migracao facil

## 12. Decisao final sem ambiguidade
- encerre com uma recomendacao objetiva no formato:
`Cadastre-se em: <provedor>`
`Modelo inicial: <topologia minima>`
`Evite agora: <o que nao vale a pena para 2 usuarios>`

### Restricoes obrigatorias
- Responder em pt-BR.
- Nao implementar nada.
- Nao escrever codigo, Terraform, YAML, Docker Compose novo ou scripts de automacao.
- Nao devolver resposta generica de blog.
- Nao listar provedores sem concluir.
- Nao fugir do cenario de **2 usuarios**.
- Nao recomendar arquitetura enterprise desnecessaria.
- Nao assumir servicos que o codebase nao exige sem deixar isso explicito.
- Nao usar linguagem vaga como `depende`, `talvez`, `pode ser`, `uma opcao seria` sem fechar recomendacao principal.
- Nao oferecer multiplas respostas finais equivalentes.
- Nao criar ressalvas artificiais para evitar decidir.

### Regra de excecao controlada
Se faltar contexto objetivo do repositorio para sustentar algum ponto, use **apenas** a secao `Suposicoes Minimas`, com o menor numero possivel de suposicoes. Fora isso, e proibido flexibilizar o formato ou o nivel de decisao.

### Criterios de aceitacao da resposta
- A resposta deve deixar claro em qual provedor eu devo me cadastrar agora.
- A resposta deve mostrar entendimento real do codebase e do diretorio `deployment/`.
- A resposta deve equilibrar custo, eficiencia, operacao e migracao futura.
- A resposta deve ser pratica, objetiva e pronta para orientar decisao real de startup.
- A resposta deve evitar falso positivo, recomendacao generica e overengineering.
- A resposta deve ser utilizavel imediatamente, sem necessidade de reinterpretacao.
```
