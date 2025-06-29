# 🧠 Analisador Sintático

Este projeto é um analisador sintático preditivo LL(1) desenvolvido como parte da disciplina de **Compiladores**. A aplicação permite simular o processo de análise de sentenças com base em uma gramática livre de contexto fatorada e compatível com LL(1).

## 🚀 Funcionalidades

- ✅ Mostra a **Gramática**, **Tabela de Parsing**, **conjuntos FIRST** e **FOLLOW**
- ✍️ Permite ao usuário **digitar sentenças** para serem analisadas
- 🔄 Permite **gerar sentenças automaticamente** a partir da gramática
- 🪜 Exibe a **execução passo a passo** com:
  - Pilha
  - Entrada
  - Ação realizada
- ⚠️ Identifica e rejeita sentenças inválidas
- ✅ Informa o número de iterações da análise
- 🧹 Botão para limpar a análise
- 📚 Interface simples e intuitiva (HTML + CSS + JavaScript)

## 📜 Gramática Utilizada

```plaintext
S → a A B | b B C | c C D  
A → a A | ε  
B → b A | d C  
C → c D c  
D → c A | B
```

## 📦 Tecnologias
- HTML
- CSS (TailwindCSS via CDN)
- JavaScript

## Como usar
- Clone o repositório:
```
git clone https://github.com/tatianademarco/analisador-sintatico.git
cd analisador-sintatico
```
- Abra o arquivo index.html no navegador.
