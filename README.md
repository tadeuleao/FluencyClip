# FluencyClip

Aplicativo portátil para Windows, desenvolvido com Electron, que traduz textos copiados ou o conteúdo de um campo em foco e exibe o resultado em uma pequena janela flutuante.

## Prévia do aplicativo

<img width="343" height="306" alt="image" src="https://github.com/user-attachments/assets/5d98ac47-7b67-452e-ba1e-c9efc36034fd" />


## Como funciona

O aplicativo oferece dois modos de entrada:

- **Área de transferência:** ao iniciar, verifica o texto copiado a cada segundo e traduz os novos conteúdos.
- **Campo em foco:** ao selecionar **Ativar tradução do campo em foco**, consulta o campo editável ativo em outros aplicativos usando a acessibilidade do Windows. Após cerca de dois segundos sem alterações, envia o texto para tradução. Para sair desse modo, selecione **Parar tradução do campo em foco**; o monitoramento da área de transferência é retomado.

Nos dois modos, o Google detecta o idioma automaticamente: textos identificados como inglês são traduzidos para português; os demais, para inglês. A janela mostra o texto original, os idiomas e a tradução.

Para usar o campo em foco, ative o modo e clique em um campo editável de outro aplicativo. A compatibilidade depende das informações de acessibilidade disponibilizadas pelo aplicativo; campos identificados como senha pelo Windows são ignorados.

Também é possível:

- ouvir o texto original ou traduzido usando a síntese de voz do Windows;
- copiar a tradução para a área de transferência;
- mover, minimizar ou fechar a janela;
- alterar manualmente a largura arrastando uma das bordas laterais;
- remover ou restaurar a transparência da janela pelo botão da interface;
- redimensionar automaticamente a janela conforme o conteúdo, até o limite definido pela interface.

## Requisitos

### Para usar o executável

- Windows 10 ou 11 de 64 bits;
- conexão com a internet;
- acesso ao serviço `translate.googleapis.com`.

O executável é portátil: não requer instalação. Basta abri-lo para iniciar o monitoramento da área de transferência.

### Para desenvolvimento

- Node.js 18 ou superior;
- npm.

## Executar em modo de desenvolvimento

```bash
npm install
npm start
```

Depois de abrir o aplicativo, copie um texto em qualquer programa. A tradução será atualizada automaticamente na janela do FluencyClip.

Para traduzir enquanto escreve em outro aplicativo, ative **Ativar tradução do campo em foco**, clique no campo desejado e digite. Aguarde aproximadamente dois segundos após parar de escrever para ver a tradução. Esse modo está em avaliação e ainda precisa ser testado nos aplicativos de interesse.

## Gerar o executável portátil

```bash
npm install
npm run build
```

O arquivo portátil será criado na pasta `dist`. A configuração do projeto gera somente o alvo `portable` para Windows; não é criado instalador.

## Estrutura principal

- `src/main/main.js`: cria a janela, monitora a área de transferência e coordena a tradução.
- `src/main/preload.js`: expõe ao renderer apenas as operações IPC utilizadas pela interface.
- `src/main/focused-text.ps1`: consulta o campo em foco por meio da acessibilidade do Windows quando o modo correspondente está ativo.
- `src/services/googleTranslator.js`: detecta o idioma e realiza as chamadas de tradução.
- `src/renderer/overlay.html`: contém a estrutura da interface.
- `src/renderer/overlay.css`: concentra todos os estilos visuais e animações.
- `src/renderer/overlay.js`: controla as interações, atualizações da tradução e síntese de voz.
- `assets/icon.png`: ícone utilizado pela janela do aplicativo.
- `assets/tela_aplicativo.png`: imagem de apresentação utilizada no README.
- `package.json`: define dependências, comandos e empacotamento portátil.

## Privacidade e limitações

- No modo de área de transferência, novos textos copiados podem ser enviados ao Google. No modo de campo em foco, o conteúdo do campo compatível pode ser enviado após a pausa. Evite usar esses modos com senhas, tokens, dados bancários ou informações confidenciais.
- A exclusão de campos de senha depende de como o aplicativo de origem os identifica para a acessibilidade do Windows. Nem todo campo editável é compatível com essa leitura.
- A integração usa um endpoint web público do Google Translate (`client=gtx`), e não a API oficial Google Cloud Translation. Ela não exige chave, mas não oferece garantia de disponibilidade e pode mudar ou limitar requisições sem aviso.
- O aplicativo não mantém histórico nem grava os textos traduzidos em arquivo.
- A detecção automática e a qualidade da tradução dependem da resposta do serviço externo.
- Ao copiar a tradução pelo botão da interface, esse novo conteúdo passa a ser o texto mais recente da área de transferência e pode gerar outra tradução automática.

## Tecnologias

- Electron
- electron-builder
- Google Translate (endpoint web público)
- Web Speech API

## Licença

O projeto ainda não possui uma licença definida. Adicione um arquivo `LICENSE` antes de distribuir publicamente caso queira estabelecer regras de uso, modificação e redistribuição.
