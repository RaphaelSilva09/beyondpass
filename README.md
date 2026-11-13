# BeyondPass

Landing page do conceito de assinatura de cultura e lazer apresentado no pitch da BeyondPass. A proposta reúne até quatro experiências por mês, recomendações baseadas em interesses e um plano mensal de R$ 159,90.

[Acesse a landing page](https://beyondpass.up.railway.app/).

## Rodar localmente

Requer Node.js 22 ou superior. O projeto usa HTML, CSS e JavaScript e roda sem instalar dependências.

```sh
npm start
```

Abra [localhost:4173](http://localhost:4173). Use `PORT` para mudar a porta ou `HOST=127.0.0.1` para restringir o acesso à máquina local. `npm run check` verifica a sintaxe dos scripts.

## Demonstração

O filtro de interesses usa uma programação fictícia. A página apresenta uma proposta e funciona sem conta, coleta de dados, pagamentos ou reservas. As imagens foram geradas para ilustrar as experiências. Os arquivos das fontes Barlow Condensed e DM Sans são distribuídos com suas licenças OFL na pasta `assets/`.

## Publicação

O comando de inicialização é `npm start`. O servidor lê a porta pela variável `PORT`, aceita conexões em `0.0.0.0` por padrão e responde a `GET /` para verificação de saúde.
