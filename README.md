# ByJohwGimenes MKT — Currículo ATS

MVP web (pt-BR) que compara um currículo com uma descrição de vaga por **análise textual com regras locais** (não é IA generativa nem um ATS real) e ajuda a montar uma versão em texto simples, fiel aos dados originais.

## Fluxo
1. Cole a vaga e o currículo (ou carregue o exemplo fictício de marketing — não é analisado automaticamente).
2. Clique em **Analisar**. Campos vazios exibem erros acessíveis.
3. Veja o percentual aproximado: termos distintos da vaga encontrados no currículo ÷ total de termos distintos da vaga (sem acentos, sem diferenciar maiúsculas, ignorando palavras comuns e termos com menos de 3 letras).
4. Marque apenas os termos ausentes que você realmente possui e escreva uma comprovação. Só termos marcados entram no currículo, numa seção identificada como "confirmadas pelo candidato".
5. Edite o texto final, **Copie** ou **Exporte PDF** (uma coluna, texto selecionável, sem gráficos/tabelas/ícones, paginação automática).

## Limitações
- Estimativa aproximada: não é resultado de ATS, avaliação oficial nem garantia de entrevista.
- Falsos positivos (palavra presente em outro contexto) e sinônimos não detectados; termos compostos são avaliados palavra por palavra.
- A organização reconhece títulos de seção comuns; se houver menos de dois, o texto original é preservado como está.
- Nenhuma compatibilidade universal com sistemas ATS é garantida.

## Privacidade
Todo o processamento ocorre no navegador. Não há login, banco de dados, envio, registro, persistência, rastreamento ou chaves de terceiros.

## Instruções
- Desenvolvimento: `bun install` e `bun run dev`.
- Testes: `bunx vitest run` (`src/test/ats.test.ts` cobre acentos/caixa, vaga vazia, termos sem correspondência, não inclusão de termos não confirmados, preservação do texto original e PDF longo com acentos paginado).

## Prompt original
> Crie um MVP web em português do Brasil que compara um currículo com uma descrição de vaga e ajuda a montar uma versão ATS-friendly fiel aos dados originais. Público geral, com exemplos de marketing. Projeto separado de outros apps.
>
> **Interface** — React, Tailwind e shadcn/ui, responsivo e acessível. Paleta preta/grafite, branca e amarela, boa legibilidade e foco visível. Sem logos fictícias. Texto destacado: "Esta ferramenta melhora a apresentação do seu currículo; nunca inventa experiências ou qualificações." Dois campos (vaga e currículo), botões Analisar e Limpar; exemplo inteiramente fictício identificado, sem envio automático. Validar entradas vazias com erros acessíveis.
>
> **Análise real e transparência** — análise de termos com normalização de acentos/caixa, ignorando palavras comuns; palavras encontradas e ausentes; percentual aproximado com explicação, nunca como ATS real/garantia/avaliação oficial. Marcar ausentes que o candidato possui com comprovação; não incluir termos não confirmados. Avisar sobre falsos positivos e sinônimos.
>
> **Currículo ajustado e exportação** — versão editável, texto linear, preservando integralmente as informações sem inventar cargos, datas, empresas, competências, cursos, resultados ou dados pessoais. Se a estrutura não for confiável, preservar o original. Recomendações separadas para confirmar. Copiar e exportar PDF selecionável, uma coluna, sem gráficos/tabelas/ícones, paginação correta. Testar PDF longo com acentos.
>
> **Privacidade e escopo** — dados no navegador; sem login, banco, integrações pagas, rastreamento ou chaves. Descrever honestamente como análise textual. Sem promessas de compatibilidade universal.
>
> **Entrega e testes** — testar acentos, vazio, sem correspondência e currículo longo; confirmar que sugestões não criam fatos; README com prompt, fluxo, limitações e instruções. Não publicar antes dos testes.
