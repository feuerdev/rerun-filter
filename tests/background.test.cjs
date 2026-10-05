const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
function fixture() {
    const images = [], icons = [];
    let message, updated, removed;
    const context = vm.createContext({
        chrome: {
            runtime: { onMessage: { addListener(listener) { message = listener; } } },
            tabs: { onUpdated: { addListener(listener) { updated = listener; } },
                onRemoved: { addListener(listener) { removed = listener; } }, sendMessage() {} },
            pageAction: { setIcon(icon) { icons.push(icon); } },
        },
        document: { createElement(type) {
            if (type === 'img') { const image = {}; images.push(image); return image; }
            let count = 0;
            return { getContext() { return {
                drawImage() {}, createLinearGradient() { return { addColorStop() {} }; },
                fillRect() {}, strokeRect() {}, fillText(text) { count = Number(text); },
                getImageData() { return { count }; },
            }; } };
        } },
    });
    const source = fs.readFileSync(path.join(__dirname, '../background.ts'), 'utf8');
    vm.runInContext(ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2016 } }).outputText, context);
    return { icons, images, rawMessage: (request, sender) => message(request, sender), message: (id, count) => message({ message: Array(count).fill({}) }, { tab: { id } }),
        navigate: id => updated(id, { status: 'complete' }, { id }),
        remove: id => removed?.(id), run: code => vm.runInContext(code, context),
    };
}

test('delayed icon loads retain the count belonging to each tab', () => {
    const f = fixture(); f.message(1, 1); f.message(2, 2);
    f.images.forEach(image => image.onload());
    assert.deepEqual(f.icons.map(icon => [icon.tabId, icon.imageData.count]), [[1, 1], [2, 2]]);
});

test('navigation clears only the navigated tab', () => {
    const f = fixture(); f.message(1, 1); f.message(2, 2); f.navigate(1);
    f.run('setPageActionIcon({ id: 2 })'); f.images.at(-1).onload();
    assert.equal(f.icons.at(-1).imageData.count, 2);
});

test('closing a tab releases its cached count', () => {
    const f = fixture(); f.message(1, 1); f.remove(1);
    f.run('setPageActionIcon({ id: 1 })'); f.images.at(-1).onload();
    assert.equal(f.icons.at(-1).imageData.count, 0);
});

test('malformed messages and missing sender tabs cannot corrupt badge state', () => {
    const f = fixture();
    assert.doesNotThrow(() => f.rawMessage({ message: [] }, {}));
    for (const request of [{}, { message: null }, { message: 'bad' }]) {
        assert.doesNotThrow(() => f.rawMessage(request, { tab: { id: 1 } }));
    }
    assert.equal(f.images.length, 0);
});
