const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function fixture() {
    const timers = new Map(); let nextId = 0, onMessage;
    const context = vm.createContext({
        console: { log() {} },
        setInterval(callback) { const id = ++nextId; timers.set(id, callback); return id; },
        clearInterval(id) { timers.delete(id); },
        chrome: { runtime: { onMessage: { addListener(callback) { onMessage = callback; } } } },
    });
    const source = fs.readFileSync(path.join(__dirname, '../filter.ts'), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2016 } });
    vm.runInContext(compiled.outputText, context);
    return { timers, run: code => vm.runInContext(code, context), navigate: () => onMessage('onNavigate') };
}

test('repeated singleton lookups retain the active filter and its single timer', () => {
    const f = fixture();
    assert.equal(f.run('filter === Filter.getInstance()'), true);
    assert.equal(f.run('filter === Filter.getInstance()'), true);
    assert.equal(f.timers.size, 1);
});

test('navigation clears the existing filter without creating more polling timers', () => {
    const f = fixture();
    f.run("filter.hiddenElements.push({ title: 'fixture' })");
    f.navigate(); f.navigate();
    assert.equal(f.run('filter.hiddenElements.length'), 0);
    assert.equal(f.timers.size, 1);
});
