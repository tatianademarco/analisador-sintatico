const table = {
    'S': {
        'a': ['a', 'A', 'B'],
        'b': ['b', 'B', 'c'],
        'c': ['c', 'C', 'D']
    },
    'A': {
        'a': ['a', 'A'],
        'b': [],
        'c': [],
        'd': [],
        '$': []
    },
    'B': {
        'b': ['b', 'A'],
        'd': ['d', 'C']
    },
    'C': {
        'c': ['c', 'D', 'c']
    },
    'D': {
        'c': ['c', 'A'],
        'b': ['B'],
        'd': ['B']
    }
};

const grammarRules = `
S → a A B | b B C | c C D
A → a A | ε
B → b A | d C
C → c D c
D → c A | B
`;

const firstSet = `
FIRST(S) = { a, b, c }
FIRST(A) = { a, ε }
FIRST(B) = { b, d }
FIRST(C) = { c }
FIRST(D) = { c, b, d }
`;

const followSet = `
FOLLOW(S) = { $ }
FOLLOW(A) = { b, d, c, $ }
FOLLOW(B) = { c, $ }
FOLLOW(C) = { c, b, d, $ }
FOLLOW(D) = { c, $ }
`;

const terminals = ['a', 'b', 'c', 'd', '$'];
const inputField = document.getElementById('inputSentence');
let ntStack = [];
let generatedSentence = [];
input = [];

//mostra a tabela na tela de acordo com a table
function renderParsingTable() {
    const nonTerminals = Object.keys(table);
    const tableEl = document.getElementById('parsingTable');

    tableEl.innerHTML = '';

    const thead = document.createElement('thead');
    thead.innerHTML = `
    <tr class="bg-gray-200">
      <th class="border px-4 py-2"></th>
      ${terminals.map(t => `<th class="border px-4 py-2">${t}</th>`).join('')}
    </tr>
  `;
    tableEl.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.id = 'parsingBody';

    nonTerminals.forEach(nt => {
        const row = document.createElement('tr');
        row.setAttribute('data-nt', nt);

        row.innerHTML = `<td class="border px-4 py-2 font-semibold">${nt}</td>` +
            terminals.map(t => {
                const prod = table[nt][t];
                const content = prod !== undefined ? `${nt} → ${prod.length ? prod.join(' ') : 'ε'}` : '';
                return `<td class="border px-4 py-2 cursor-pointer" id="${nt}_${t}" data-nt="${nt}" data-t="${t}">${content}</td>`;
            }).join('');

        tbody.appendChild(row);
    });

    tableEl.appendChild(tbody);
}

window.onload = () => {

    renderParsingTable();

    //para gerar a sentença clicando na tabela
    document.getElementById('parsingBody').addEventListener('click', e => {
        if (!generating || !e.target.matches('td[data-nt][data-t]')) return;

        const nt = e.target.getAttribute('data-nt');
        const t = e.target.getAttribute('data-t');
        console.log(nt)
        console.log(t)
        if (nt !== currentNT) return;

        const prod = table[nt][t];
        if (!prod) return;
        console.log(prod)
        ntStack.pop();

        // empilha os próximos não terminais da direita pra esquerda
        for (let i = prod.length - 1; i >= 0; i--) {
            const symbol = prod[i];
            if (!terminals.includes(symbol)) {
                ntStack.push(symbol);
            }
        }

        //para mostrar na tela a sentença gerada
        //pega o indice do não terminal atual na sentença gerada
        const indexNT = generatedSentence.indexOf(currentNT);

        // Substitui o não terminal atual pelos símbolos da produção
        if (indexNT > -1) {
            //remove o não terminal da sentença
            generatedSentence.splice(indexNT, 1);
            for (let i = 0; i < prod.length; i++) {
                //para cada próximo simbolo da produção adiciona no lugar do não terminal
                generatedSentence.splice(indexNT + i, 0, prod[i]);
            }
        } else {
            //caso não tenha sido gravada a sentença ainda ele só vai adicionando cada produção sem substituir
            for (let i = 0; i < prod.length; i++) {
                generatedSentence.push(prod[i]);
            }
        }
        // mostra na tela os terminais até o primiero não terminal
        updateInputPreview();

        //vai para a próxima linha ou para caso já tenha chegado ao fim da pilha
        if (ntStack.length > 0) {
            currentNT = ntStack[ntStack.length - 1];
            highlightGeneration(currentNT);
            runParser(false, true);
        } else {
            currentNT = null;
            generating = false;
            highlightGeneration(null);
            runParser(false, false);
        }
    });
};

//mostrar a sentança na tela
function updateInputPreview() {
    const preview = [];
    for (const symbol of generatedSentence) {
        if (terminals.includes(symbol)) {
            preview.push(symbol);
        } else {
            break; // parou no primeiro não-terminal
        }
    }
    inputField.value = preview.join(' ');
}


document.getElementById('analyzeBtn').addEventListener('click', () => {
    runParser(false);
});

document.getElementById('stepBtn').addEventListener('click', () => {
    runParser(true);
});

//usado para pintar a célula no passo a passo
function highlightCell(nt, t) {
    document.querySelectorAll('td').forEach(cell => cell.classList.remove('bg-yellow-200'));
    const cell = document.getElementById(`${nt}_${t}`);
    if (cell) cell.classList.add('bg-yellow-200');
}

//executa o analisador
function runParser(stepMode = false, noFinalResult = false) {
    const input = document.getElementById('inputSentence').value.trim();
    const inputSymbols = input.split(/\s+/).concat('$'); //entrada inicial
    const stack = ['$', 'S'];     //pilha inicial
    let pointer = 0;
    let iterations = 0;
    const tableBody = document.getElementById('resultTable');
    const finalResult = document.getElementById('finalResult');

    tableBody.innerHTML = '';
    finalResult.textContent = '';

    const step = () => {

        //se a pilha ficar vazia mostra o resultado
        if (stack.length === 0) {
            if (!noFinalResult)
                finalResult.textContent = pointer === inputSymbols.length ? `✅ Sentença reconhecida com ${iterations} passos.` : '❌ Sentença incompleta.';
            return;
        }

        iterations++;
        const top = stack.pop();
        const current = inputSymbols[pointer];
        let action = '';

        if (stepMode)
            highlightCell(top, current);

        //se o topo da pilha é um terminal
        if (terminals.includes(top)) {
            //se o topo da pilha é a primiera entrada
            if (top === current) {
                action = `Lê '${current}'`;
                addRow(stack.concat([current]).join(' '), inputSymbols.slice(pointer).join(' '), action);
                pointer++;
            } else {
                if (!noFinalResult)
                    action = `Erro: Esperado '${top}', encontrado '${current}'`;
                addRow(stack.concat([top]).join(' '), inputSymbols.slice(pointer).join(' '), action);
                if (!noFinalResult)
                    finalResult.textContent = `❌ Sentença rejeitada com ${iterations} passos.`;
                return;
            }
            //se for um não terminal o topo da pilha e existir na tabela sua relação com a entrada
        } else if (table[top] && table[top][current] !== undefined) {
            const production = table[top][current];
            action = `${top} → ${production.length ? production.join(' ') : 'ε'}`;
            addRow(stack.concat([top]).join(' '), inputSymbols.slice(pointer).join(' '), action);
            //adiciona na pilha a produção encontrada
            for (let i = production.length - 1; i >= 0; i--) {
                stack.push(production[i]);
            }
        } else {
            if (!noFinalResult)
                action = `Erro: Nenhuma produção para [${top}, ${current}]`;
            addRow(stack.concat([top]).join(' '), inputSymbols.slice(pointer).join(' '), action);
            if (!noFinalResult)
                finalResult.textContent = `❌ Sentença rejeitada com ${iterations} passos.`;
            return;
        }

        if (stepMode) setTimeout(step, 1000);
        else step();
    };

    step();
}

//adiciona nova linha no analisador
function addRow(stackContent, inputContent, action) {
    const tableBody = document.getElementById('resultTable');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="border px-4 py-2">${stackContent}</td>
        <td class="border px-4 py-2">${inputContent}</td>
        <td class="border px-4 py-2">${action}</td>
      `;
    tableBody.appendChild(row);
}

//ao clicar no botão de gerar a sentença
document.getElementById('generateBtn').addEventListener('click', () => {
    generating = true;
    inputField.value = '';
    generatedSentence = [];
    ntStack = ['S'];
    currentNT = ntStack[ntStack.length - 1];
    highlightGeneration(currentNT);
});

//adiciona cor na linha da tabela para gerer sentença
function highlightGeneration(nt) {
    document.querySelectorAll('tr[data-nt]').forEach(row => {
        row.classList.remove('bg-purple-100');
        if (row.getAttribute('data-nt') === nt) {
            row.classList.add('bg-purple-100');
        }
    });
}

//ao clicar botão limpar
document.getElementById('clearBtn').addEventListener('click', () => {
    // Limpa campo de entrada
    inputField.value = '';

    // Limpa resultado da tabela
    document.getElementById('resultTable').innerHTML = '';

    // Limpa mensagem final
    document.getElementById('finalResult').textContent = '';

    // Limpa estado de geração
    generatedSentence = [];
    ntStack = [];
    currentNT = null;
    generating = false;

    // Remove destaque da tabela
    document.querySelectorAll('td').forEach(td => td.classList.remove('bg-yellow-200', 'bg-purple-100'));
});

//ao clicar no botão de gerar aleatória
document.getElementById('randomBtn').addEventListener('click', () => {
    const maxDepth = 10; // limite de expansão para evitar laços infinitos
    const result = generateRandomSentence('S', maxDepth);
    inputField.value = result.join(' ');
});

// Função recursiva para gerar sentença aleatoria
function generateRandomSentence(symbol, depth) {
    if (depth <= 0) return []; // segurança para não travar

    if (terminals.includes(symbol)) {
        return [symbol]; // terminal é retornado direto
    }

    const row = table[symbol];
    if (!row) return [];

    const options = Object.values(row).filter(Boolean);
    if (options.length === 0) return [];

    const prod = options[Math.floor(Math.random() * options.length)]; // escolhe produção aleatória
    let sentence = [];

    for (const sym of prod) {
        if (sym === '') continue; // ignora vazio
        sentence = sentence.concat(generateRandomSentence(sym, depth - 1));
    }

    return sentence;
}

//mostra ou não gramatica
document.getElementById('toggleGrammar').addEventListener('click', () => {
    const section = document.getElementById('grammarSection');
    section.classList.toggle('hidden');
    const btn = document.getElementById('toggleGrammar');
    btn.textContent = section.classList.contains('hidden')
        ? 'Mostrar Gramática, First e Follow'
        : 'Ocultar Gramática, First e Follow';
});

//exibe conforme constantes
document.getElementById('grammarText').textContent = grammarRules.trim();
document.getElementById('firstSet').textContent = firstSet.trim();
document.getElementById('followSet').textContent = followSet.trim();
