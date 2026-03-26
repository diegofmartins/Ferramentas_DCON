# Calculadora de Reajustes Contratuais (Lei 14.133)

Esta é uma ferramenta profissional para cálculo de reajustes, repactuações e planejamento de empenho anual de contratos públicos brasileiros. Esta versão funciona de forma 100% nativa no navegador e não requer conexão com a internet para realizar os cálculos.

## Como hospedar no GitHub Pages

Este projeto já está configurado para ser hospedado em:
`https://diegofmartins.github.io/Ferramentas_DCON/Calculadora_Contratual/`

### Passos para Configuração:

1. **Crie o Repositório no GitHub:**
   - Crie um repositório chamado `Ferramentas_DCON`.
   - Suba os arquivos deste projeto para uma pasta chamada `Calculadora_Contratual` dentro desse repositório (ou suba na raiz se o repositório for apenas para a calculadora).
   - *Nota:* Se você subir na raiz de um repositório chamado `Calculadora_Contratual`, o endereço será `https://diegofmartins.github.io/Calculadora_Contratual/`. Se mudar o nome, lembre-se de ajustar o `base` no arquivo `vite.config.ts`.

2. **Ative o GitHub Pages:**
   - Vá em **Settings** > **Pages**.
   - Em **Build and deployment** > **Source**, selecione **GitHub Actions**.

3. **Deploy Automático:**
   - O arquivo `.github/workflows/deploy.yml` já está configurado. Toda vez que você fizer um `push` para a branch `main`, o GitHub irá automaticamente compilar e publicar o site.

## Desenvolvimento Local

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Para gerar a versão de produção:
   ```bash
   npm run build
   ```
   Os arquivos prontos para hospedagem manual estarão na pasta `dist/`.
