# Bruno Personal — Site Oficial

Site institucional em HTML, CSS e JavaScript puros (sem frameworks), pronto para publicação no GitHub Pages.

## Estrutura de arquivos

```
bruno-personal/
├── index.html              → todo o conteúdo e a estrutura das seções
├── style.css                → design, cores, tipografia e responsividade
├── script.js                 → menu mobile, header fixo, animações de rolagem, links de contato
├── README.md                 → este arquivo
└── assets/
    ├── icons/
    │   └── favicon.svg       → ícone da aba do navegador
    └── img/
        └── LEIA-ME.txt        → onde colocar as fotos reais (hero, Bruno, galeria, OG)
```

## Como executar localmente

Não é necessário instalar nada. Duas opções:

1. **Abrir direto**: dê duplo clique em `index.html` — ele abre no navegador.
2. **Servidor local (recomendado)**, para o comportamento ficar idêntico ao GitHub Pages:
   ```bash
   cd bruno-personal
   python3 -m http.server 8000
   ```
   Depois acesse `http://localhost:8000`.

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `bruno-personal`).
2. Envie os arquivos deste projeto para a raiz do repositório:
   ```bash
   cd bruno-personal
   git init
   git add .
   git commit -m "Site Bruno Personal"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/bruno-personal.git
   git push -u origin main
   ```
3. No GitHub, vá em **Settings → Pages**.
4. Em "Build and deployment", selecione **Deploy from a branch**, branch `main`, pasta `/root`.
5. Salve. O site ficará disponível em `https://SEU-USUARIO.github.io/bruno-personal/`.

Como o projeto usa apenas HTML/CSS/JS estáticos, não há build nem etapa de compilação — o que está no repositório é exatamente o que vai para o ar.

## Onde alterar cada informação

| O que alterar | Onde |
|---|---|
| **Nome / textos gerais** | Direto no `index.html`, dentro de cada seção (`<h1>`, `<h2>`, `<p>`) |
| **Fotos** (hero, Bruno, galeria) | Substitua os placeholders em `index.html` pelas tags `<img>` comentadas logo acima de cada bloco `placeholder`, e coloque os arquivos em `assets/img/` (veja `assets/img/LEIA-ME.txt`) |
| **WhatsApp / Instagram / e-mail** | No arquivo `script.js`, dentro do objeto `CONTACT` (linhas comentadas como "PLACEHOLDER CONTACTS"). Preencha `whatsappNumber`, `instagramUser` e `email` — os cards de contato e o botão "Falar comigo" passam a funcionar automaticamente |
| **Localização** | Seção `#contato` em `index.html`, no card "Localização" |
| **Depoimentos** | Seção `#depoimentos` em `index.html` — são 3 cards com texto fictício claramente marcado; substitua pelo relato real de cada aluno |
| **Formação / especializações / experiência / certificações** | Seção `#sobre` em `index.html`, dentro de `<dl class="about-facts">` |
| **Link do aplicativo** | Já configurado nos 3 botões "Acessar meu aplicativo" / "Acessar aplicativo", apontando para `https://brunodiasef.github.io/BRUNOPERSONAL/` com `target="_blank"` e `rel="noopener noreferrer"` |

## Observações importantes

- Nenhuma informação pessoal, certificação, depoimento ou dado de contato foi inventado. Todos os campos sem informação real estão marcados visualmente (borda tracejada laranja) e por texto entre colchetes, ex.: `[ inserir número ]`.
- O botão **ACESSAR MEU APLICATIVO** já está funcional em três pontos do site (cabeçalho, hero e seção do aplicativo).
- O site foi construído mobile-first: teste o menu hambúrguer, os cards e os espaçamentos primeiro em uma tela de celular.
- Para trocar a cor de destaque, edite a variável `--accent` no topo do `style.css`.
