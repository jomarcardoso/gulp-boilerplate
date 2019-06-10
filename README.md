
# Hotsites Boilerplate

Ambiente para criação de novos hotsites feito em Gulp. O plugin "webpack-stream" é responsável por acionar o webpack e foi usado apenas para os arquivos ".js".

**Obs:** se ocorrer no gulp-sass/node-sass, talvez resolva instalando:

- npm --add-python-to-path='true' --debug install --global windows-build-tools
- npm install --global node-gyp

## Características

- o caminho do FTP/CDN é verificado pela pasta da loja + a pasta do página, exemplo */arz/inverno-2019*
- Por padrão o HTML vem com dois "wrappers" no primeiro, *".hs"*, é incluído os "resets", no segundo vai o conteúdo da página. Dessa forma aumentamos a força de todos os seletores e evita de competir com os do ecommerce.
- É recomendado escrever as classes com prefixo, exemplo *".hs-container"* com o prefixo "hs" evitamos do ecommerce ter uma classe com o mesmo nome e o hotsite "herdar" as características.
- A porta padrão dos hotsites é a 3015 para alinhar com a etapa abaixo, "Rodando local e dentro da hybris".
- As pastas js/vendors e css/vendors são usadas para levar os arquivos até o dist, não colocar lá arquivos que serão importados pelo JS ou pelo SCSS.
- Possibilidade de usar alguns [HTML Template engine](#html-template-engine)
	- [Pug](#pug)

## Incluindo novas dependências

As dependências são incluídas diretamente nos arquivos de seus tipos:

#### Exemplo de dependência JS

- instalar: ```yarn add jquery```
- importar num arquivo ".js": ```import $ from 'jquery';```

#### Exemplo de dependência CSS

- instalar: ```yarn add normalize.css```
- importar num arquivo ".scss": ```@import '../../node_modules/normalize.css/normalize';```

### Ajax
Para enviar cadastros à api pode-se usar a variável "apiHost" que através do "__API__" o webpack injeta o caminho correspondente a cada ambiente.
**Variável de caminho da api**
```
const apiHost = __API__;```
```
**Campos comuns**
- name
- email
- phoneNumber
- acceptNews
- campaignName

## Rodando local e dentro de outra página

Usar o script ```start:local```, pois este aplica a cdn e faz o caminho de acesso dos arquivos serem absolutos.

## <a name="html-template-engine">HTML Template engine</a>

É possibilitado a implementação de mais destes no projeto, basta no gulpfile:

- Incluir a task respectiva
- Verificar o index do tipo respectivo na task "html"
- Adicionar o watch do tipo

**exemplo:**
```js
// task gulp
function pug() {
  return gulp
    .src('./src/**/*.pug')
    .pipe(gulpPug())
    .pipe(gulp.dest('./dist/'))
    .pipe(browsersync.stream());

// task html
function  html() {
  if (fs.existsSync('./src/index.pug')) return  pug();
  // {...}
}

// task watch
function  watchFiles() {
  gulp.watch('./src/**/*.pug', pug);
  // {...}
}
```

### <a name="pug">Pug</a>

Para usar o Pug é necessário criar o arquivo "index.pug" na pasta "./src".

```pug
doctype html
html
  head
    meta(charset="UTF-8")
    meta(name="viewport"  content="width=device-width, initial-scale=1.0")
    meta(http-equiv="X-UA-Compatible"  content="ie=edge")
    title Hotsite
    link(rel="stylesheet"  href="./css/main.css")
  body
    .hs
      .hs-wrapper
    script(src="./js/index.js")
```

## Realeses

- 1.0.0 - Criado o bolilerplate e testado nas páginas: fvr/dumbo, ana/inverno, arz/inverno-2019
- 1.1.0 - Implementado o star:local para teste das páginas dentro de outra página, **Atenção:** se sua versão do boilerplate estiver abaixo desta não conseguirás realizar deploy no Jenkins.
- 1.2.0 - Separado as imagens que serão buscadas na CDN.
- 1.3.0 - Copia e minifica JSON
- 1.4.0 - Copia os vendors de JS e CSS para o dist
- 1.5.0 - Caminho das APIs para cada ambiente
