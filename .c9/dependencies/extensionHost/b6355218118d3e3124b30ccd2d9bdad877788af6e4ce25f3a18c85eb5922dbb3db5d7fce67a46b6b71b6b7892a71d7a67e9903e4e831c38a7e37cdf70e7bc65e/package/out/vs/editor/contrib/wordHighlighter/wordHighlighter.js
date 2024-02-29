/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/editor/common/modes", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService"], function (require, exports, nls, arrays, async_1, cancellation_1, errors_1, lifecycle_1, editorExtensions_1, range_1, editorContextKeys_1, model_1, textModel_1, modes_1, contextkey_1, colorRegistry_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.editorWordHighlight = colorRegistry_1.registerColor('editor.wordHighlightBackground', { dark: '#575757B8', light: '#57575740', hc: null }, nls.localize('wordHighlight', 'Background color of a symbol during read-access, like reading a variable. The color must not be opaque so as not to hide underlying decorations.'), true);
    exports.editorWordHighlightStrong = colorRegistry_1.registerColor('editor.wordHighlightStrongBackground', { dark: '#004972B8', light: '#0e639c40', hc: null }, nls.localize('wordHighlightStrong', 'Background color of a symbol during write-access, like writing to a variable. The color must not be opaque so as not to hide underlying decorations.'), true);
    exports.editorWordHighlightBorder = colorRegistry_1.registerColor('editor.wordHighlightBorder', { light: null, dark: null, hc: colorRegistry_1.activeContrastBorder }, nls.localize('wordHighlightBorder', 'Border color of a symbol during read-access, like reading a variable.'));
    exports.editorWordHighlightStrongBorder = colorRegistry_1.registerColor('editor.wordHighlightStrongBorder', { light: null, dark: null, hc: colorRegistry_1.activeContrastBorder }, nls.localize('wordHighlightStrongBorder', 'Border color of a symbol during write-access, like writing to a variable.'));
    exports.overviewRulerWordHighlightForeground = colorRegistry_1.registerColor('editorOverviewRuler.wordHighlightForeground', { dark: '#A0A0A0CC', light: '#A0A0A0CC', hc: '#A0A0A0CC' }, nls.localize('overviewRulerWordHighlightForeground', 'Overview ruler marker color for symbol highlights. The color must not be opaque so as not to hide underlying decorations.'), true);
    exports.overviewRulerWordHighlightStrongForeground = colorRegistry_1.registerColor('editorOverviewRuler.wordHighlightStrongForeground', { dark: '#C0A0C0CC', light: '#C0A0C0CC', hc: '#C0A0C0CC' }, nls.localize('overviewRulerWordHighlightStrongForeground', 'Overview ruler marker color for write-access symbol highlights. The color must not be opaque so as not to hide underlying decorations.'), true);
    exports.ctxHasWordHighlights = new contextkey_1.RawContextKey('hasWordHighlights', false);
    function getOccurrencesAtPosition(model, position, token) {
        const orderedByScore = modes_1.DocumentHighlightProviderRegistry.ordered(model);
        // in order of score ask the occurrences provider
        // until someone response with a good result
        // (good = none empty array)
        return async_1.first(orderedByScore.map(provider => () => {
            return Promise.resolve(provider.provideDocumentHighlights(model, position, token))
                .then(undefined, errors_1.onUnexpectedExternalError);
        }), arrays.isNonEmptyArray);
    }
    exports.getOccurrencesAtPosition = getOccurrencesAtPosition;
    class OccurenceAtPositionRequest {
        constructor(model, selection, wordSeparators) {
            this._wordRange = this._getCurrentWordRange(model, selection);
            this.result = async_1.createCancelablePromise(token => this._compute(model, selection, wordSeparators, token));
        }
        _getCurrentWordRange(model, selection) {
            const word = model.getWordAtPosition(selection.getPosition());
            if (word) {
                return new range_1.Range(selection.startLineNumber, word.startColumn, selection.startLineNumber, word.endColumn);
            }
            return null;
        }
        isValid(model, selection, decorationIds) {
            const lineNumber = selection.startLineNumber;
            const startColumn = selection.startColumn;
            const endColumn = selection.endColumn;
            const currentWordRange = this._getCurrentWordRange(model, selection);
            let requestIsValid = Boolean(this._wordRange && this._wordRange.equalsRange(currentWordRange));
            // Even if we are on a different word, if that word is in the decorations ranges, the request is still valid
            // (Same symbol)
            for (let i = 0, len = decorationIds.length; !requestIsValid && i < len; i++) {
                let range = model.getDecorationRange(decorationIds[i]);
                if (range && range.startLineNumber === lineNumber) {
                    if (range.startColumn <= startColumn && range.endColumn >= endColumn) {
                        requestIsValid = true;
                    }
                }
            }
            return requestIsValid;
        }
        cancel() {
            this.result.cancel();
        }
    }
    class SemanticOccurenceAtPositionRequest extends OccurenceAtPositionRequest {
        _compute(model, selection, wordSeparators, token) {
            return getOccurrencesAtPosition(model, selection.getPosition(), token).then(value => value || []);
        }
    }
    class TextualOccurenceAtPositionRequest extends OccurenceAtPositionRequest {
        constructor(model, selection, wordSeparators) {
            super(model, selection, wordSeparators);
            this._selectionIsEmpty = selection.isEmpty();
        }
        _compute(model, selection, wordSeparators, token) {
            return async_1.timeout(250, token).then(() => {
                if (!selection.isEmpty()) {
                    return [];
                }
                const word = model.getWordAtPosition(selection.getPosition());
                if (!word) {
                    return [];
                }
                const matches = model.findMatches(word.word, true, false, true, wordSeparators, false);
                return matches.map(m => {
                    return {
                        range: m.range,
                        kind: modes_1.DocumentHighlightKind.Text
                    };
                });
            });
        }
        isValid(model, selection, decorationIds) {
            const currentSelectionIsEmpty = selection.isEmpty();
            if (this._selectionIsEmpty !== currentSelectionIsEmpty) {
                return false;
            }
            return super.isValid(model, selection, decorationIds);
        }
    }
    function computeOccurencesAtPosition(model, selection, wordSeparators) {
        if (modes_1.DocumentHighlightProviderRegistry.has(model)) {
            return new SemanticOccurenceAtPositionRequest(model, selection, wordSeparators);
        }
        return new TextualOccurenceAtPositionRequest(model, selection, wordSeparators);
    }
    editorExtensions_1.registerDefaultLanguageCommand('_executeDocumentHighlights', (model, position) => getOccurrencesAtPosition(model, position, cancellation_1.CancellationToken.None));
    class WordHighlighter {
        constructor(editor, contextKeyService) {
            this.toUnhook = new lifecycle_1.DisposableStore();
            this.workerRequestTokenId = 0;
            this.workerRequestCompleted = false;
            this.workerRequestValue = [];
            this.lastCursorPositionChangeTime = 0;
            this.renderDecorationsTimer = -1;
            this.editor = editor;
            this._hasWordHighlights = exports.ctxHasWordHighlights.bindTo(contextKeyService);
            this._ignorePositionChangeEvent = false;
            this.occurrencesHighlight = this.editor.getConfiguration().contribInfo.occurrencesHighlight;
            this.model = this.editor.getModel();
            this.toUnhook.add(editor.onDidChangeCursorPosition((e) => {
                if (this._ignorePositionChangeEvent) {
                    // We are changing the position => ignore this event
                    return;
                }
                if (!this.occurrencesHighlight) {
                    // Early exit if nothing needs to be done!
                    // Leave some form of early exit check here if you wish to continue being a cursor position change listener ;)
                    return;
                }
                this._onPositionChanged(e);
            }));
            this.toUnhook.add(editor.onDidChangeModelContent((e) => {
                this._stopAll();
            }));
            this.toUnhook.add(editor.onDidChangeConfiguration((e) => {
                let newValue = this.editor.getConfiguration().contribInfo.occurrencesHighlight;
                if (this.occurrencesHighlight !== newValue) {
                    this.occurrencesHighlight = newValue;
                    this._stopAll();
                }
            }));
            this._decorationIds = [];
            this.workerRequestTokenId = 0;
            this.workerRequest = null;
            this.workerRequestCompleted = false;
            this.lastCursorPositionChangeTime = 0;
            this.renderDecorationsTimer = -1;
        }
        hasDecorations() {
            return (this._decorationIds.length > 0);
        }
        restore() {
            if (!this.occurrencesHighlight) {
                return;
            }
            this._run();
        }
        _getSortedHighlights() {
            return arrays.coalesce(this._decorationIds
                .map((id) => this.model.getDecorationRange(id))
                .sort(range_1.Range.compareRangesUsingStarts));
        }
        moveNext() {
            let highlights = this._getSortedHighlights();
            let index = arrays.firstIndex(highlights, (range) => range.containsPosition(this.editor.getPosition()));
            let newIndex = ((index + 1) % highlights.length);
            let dest = highlights[newIndex];
            try {
                this._ignorePositionChangeEvent = true;
                this.editor.setPosition(dest.getStartPosition());
                this.editor.revealRangeInCenterIfOutsideViewport(dest);
            }
            finally {
                this._ignorePositionChangeEvent = false;
            }
        }
        moveBack() {
            let highlights = this._getSortedHighlights();
            let index = arrays.firstIndex(highlights, (range) => range.containsPosition(this.editor.getPosition()));
            let newIndex = ((index - 1 + highlights.length) % highlights.length);
            let dest = highlights[newIndex];
            try {
                this._ignorePositionChangeEvent = true;
                this.editor.setPosition(dest.getStartPosition());
                this.editor.revealRangeInCenterIfOutsideViewport(dest);
            }
            finally {
                this._ignorePositionChangeEvent = false;
            }
        }
        _removeDecorations() {
            if (this._decorationIds.length > 0) {
                // remove decorations
                this._decorationIds = this.editor.deltaDecorations(this._decorationIds, []);
                this._hasWordHighlights.set(false);
            }
        }
        _stopAll() {
            // Remove any existing decorations
            this._removeDecorations();
            // Cancel any renderDecorationsTimer
            if (this.renderDecorationsTimer !== -1) {
                clearTimeout(this.renderDecorationsTimer);
                this.renderDecorationsTimer = -1;
            }
            // Cancel any worker request
            if (this.workerRequest !== null) {
                this.workerRequest.cancel();
                this.workerRequest = null;
            }
            // Invalidate any worker request callback
            if (!this.workerRequestCompleted) {
                this.workerRequestTokenId++;
                this.workerRequestCompleted = true;
            }
        }
        _onPositionChanged(e) {
            // disabled
            if (!this.occurrencesHighlight) {
                this._stopAll();
                return;
            }
            // ignore typing & other
            if (e.reason !== 3 /* Explicit */) {
                this._stopAll();
                return;
            }
            this._run();
        }
        _run() {
            let editorSelection = this.editor.getSelection();
            // ignore multiline selection
            if (editorSelection.startLineNumber !== editorSelection.endLineNumber) {
                this._stopAll();
                return;
            }
            let lineNumber = editorSelection.startLineNumber;
            let startColumn = editorSelection.startColumn;
            let endColumn = editorSelection.endColumn;
            let word = this.model.getWordAtPosition({
                lineNumber: lineNumber,
                column: startColumn
            });
            // The selection must be inside a word or surround one word at most
            if (!word || word.startColumn > startColumn || word.endColumn < endColumn) {
                this._stopAll();
                return;
            }
            // All the effort below is trying to achieve this:
            // - when cursor is moved to a word, trigger immediately a findOccurrences request
            // - 250ms later after the last cursor move event, render the occurrences
            // - no flickering!
            const workerRequestIsValid = (this.workerRequest && this.workerRequest.isValid(this.model, editorSelection, this._decorationIds));
            // There are 4 cases:
            // a) old workerRequest is valid & completed, renderDecorationsTimer fired
            // b) old workerRequest is valid & completed, renderDecorationsTimer not fired
            // c) old workerRequest is valid, but not completed
            // d) old workerRequest is not valid
            // For a) no action is needed
            // For c), member 'lastCursorPositionChangeTime' will be used when installing the timer so no action is needed
            this.lastCursorPositionChangeTime = (new Date()).getTime();
            if (workerRequestIsValid) {
                if (this.workerRequestCompleted && this.renderDecorationsTimer !== -1) {
                    // case b)
                    // Delay the firing of renderDecorationsTimer by an extra 250 ms
                    clearTimeout(this.renderDecorationsTimer);
                    this.renderDecorationsTimer = -1;
                    this._beginRenderDecorations();
                }
            }
            else {
                // case d)
                // Stop all previous actions and start fresh
                this._stopAll();
                let myRequestId = ++this.workerRequestTokenId;
                this.workerRequestCompleted = false;
                this.workerRequest = computeOccurencesAtPosition(this.model, this.editor.getSelection(), this.editor.getConfiguration().wordSeparators);
                this.workerRequest.result.then(data => {
                    if (myRequestId === this.workerRequestTokenId) {
                        this.workerRequestCompleted = true;
                        this.workerRequestValue = data || [];
                        this._beginRenderDecorations();
                    }
                }, errors_1.onUnexpectedError);
            }
        }
        _beginRenderDecorations() {
            let currentTime = (new Date()).getTime();
            let minimumRenderTime = this.lastCursorPositionChangeTime + 250;
            if (currentTime >= minimumRenderTime) {
                // Synchronous
                this.renderDecorationsTimer = -1;
                this.renderDecorations();
            }
            else {
                // Asynchronous
                this.renderDecorationsTimer = setTimeout(() => {
                    this.renderDecorations();
                }, (minimumRenderTime - currentTime));
            }
        }
        renderDecorations() {
            this.renderDecorationsTimer = -1;
            let decorations = [];
            for (let i = 0, len = this.workerRequestValue.length; i < len; i++) {
                let info = this.workerRequestValue[i];
                decorations.push({
                    range: info.range,
                    options: WordHighlighter._getDecorationOptions(info.kind)
                });
            }
            this._decorationIds = this.editor.deltaDecorations(this._decorationIds, decorations);
            this._hasWordHighlights.set(this.hasDecorations());
        }
        static _getDecorationOptions(kind) {
            if (kind === modes_1.DocumentHighlightKind.Write) {
                return this._WRITE_OPTIONS;
            }
            else if (kind === modes_1.DocumentHighlightKind.Text) {
                return this._TEXT_OPTIONS;
            }
            else {
                return this._REGULAR_OPTIONS;
            }
        }
        dispose() {
            this._stopAll();
            this.toUnhook.dispose();
        }
    }
    WordHighlighter._WRITE_OPTIONS = textModel_1.ModelDecorationOptions.register({
        stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
        className: 'wordHighlightStrong',
        overviewRuler: {
            color: themeService_1.themeColorFromId(exports.overviewRulerWordHighlightStrongForeground),
            position: model_1.OverviewRulerLane.Center
        }
    });
    WordHighlighter._TEXT_OPTIONS = textModel_1.ModelDecorationOptions.register({
        stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
        className: 'selectionHighlight',
        overviewRuler: {
            color: themeService_1.themeColorFromId(colorRegistry_1.overviewRulerSelectionHighlightForeground),
            position: model_1.OverviewRulerLane.Center
        }
    });
    WordHighlighter._REGULAR_OPTIONS = textModel_1.ModelDecorationOptions.register({
        stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
        className: 'wordHighlight',
        overviewRuler: {
            color: themeService_1.themeColorFromId(exports.overviewRulerWordHighlightForeground),
            position: model_1.OverviewRulerLane.Center
        }
    });
    let WordHighlighterContribution = class WordHighlighterContribution extends lifecycle_1.Disposable {
        constructor(editor, contextKeyService) {
            super();
            this.wordHighligher = null;
            const createWordHighlighterIfPossible = () => {
                if (editor.hasModel()) {
                    this.wordHighligher = new WordHighlighter(editor, contextKeyService);
                }
            };
            this._register(editor.onDidChangeModel((e) => {
                if (this.wordHighligher) {
                    this.wordHighligher.dispose();
                    this.wordHighligher = null;
                }
                createWordHighlighterIfPossible();
            }));
            createWordHighlighterIfPossible();
        }
        static get(editor) {
            return editor.getContribution(WordHighlighterContribution.ID);
        }
        getId() {
            return WordHighlighterContribution.ID;
        }
        saveViewState() {
            if (this.wordHighligher && this.wordHighligher.hasDecorations()) {
                return true;
            }
            return false;
        }
        moveNext() {
            if (this.wordHighligher) {
                this.wordHighligher.moveNext();
            }
        }
        moveBack() {
            if (this.wordHighligher) {
                this.wordHighligher.moveBack();
            }
        }
        restoreViewState(state) {
            if (this.wordHighligher && state) {
                this.wordHighligher.restore();
            }
        }
        dispose() {
            if (this.wordHighligher) {
                this.wordHighligher.dispose();
                this.wordHighligher = null;
            }
            super.dispose();
        }
    };
    WordHighlighterContribution.ID = 'editor.contrib.wordHighlighter';
    WordHighlighterContribution = __decorate([
        __param(1, contextkey_1.IContextKeyService)
    ], WordHighlighterContribution);
    class WordHighlightNavigationAction extends editorExtensions_1.EditorAction {
        constructor(next, opts) {
            super(opts);
            this._isNext = next;
        }
        run(accessor, editor) {
            const controller = WordHighlighterContribution.get(editor);
            if (!controller) {
                return;
            }
            if (this._isNext) {
                controller.moveNext();
            }
            else {
                controller.moveBack();
            }
        }
    }
    class NextWordHighlightAction extends WordHighlightNavigationAction {
        constructor() {
            super(true, {
                id: 'editor.action.wordHighlight.next',
                label: nls.localize('wordHighlight.next.label', "Go to Next Symbol Highlight"),
                alias: 'Go to Next Symbol Highlight',
                precondition: exports.ctxHasWordHighlights,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 65 /* F7 */,
                    weight: 100 /* EditorContrib */
                }
            });
        }
    }
    class PrevWordHighlightAction extends WordHighlightNavigationAction {
        constructor() {
            super(false, {
                id: 'editor.action.wordHighlight.prev',
                label: nls.localize('wordHighlight.previous.label', "Go to Previous Symbol Highlight"),
                alias: 'Go to Previous Symbol Highlight',
                precondition: exports.ctxHasWordHighlights,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 1024 /* Shift */ | 65 /* F7 */,
                    weight: 100 /* EditorContrib */
                }
            });
        }
    }
    class TriggerWordHighlightAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.wordHighlight.trigger',
                label: nls.localize('wordHighlight.trigger.label', "Trigger Symbol Highlight"),
                alias: 'Trigger Symbol Highlight',
                precondition: exports.ctxHasWordHighlights.toNegated(),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 0,
                    weight: 100 /* EditorContrib */
                }
            });
        }
        run(accessor, editor, args) {
            const controller = WordHighlighterContribution.get(editor);
            if (!controller) {
                return;
            }
            controller.restoreViewState(true);
        }
    }
    editorExtensions_1.registerEditorContribution(WordHighlighterContribution);
    editorExtensions_1.registerEditorAction(NextWordHighlightAction);
    editorExtensions_1.registerEditorAction(PrevWordHighlightAction);
    editorExtensions_1.registerEditorAction(TriggerWordHighlightAction);
    themeService_1.registerThemingParticipant((theme, collector) => {
        const selectionHighlight = theme.getColor(colorRegistry_1.editorSelectionHighlight);
        if (selectionHighlight) {
            collector.addRule(`.monaco-editor .focused .selectionHighlight { background-color: ${selectionHighlight}; }`);
            collector.addRule(`.monaco-editor .selectionHighlight { background-color: ${selectionHighlight.transparent(0.5)}; }`);
        }
        const wordHighlight = theme.getColor(exports.editorWordHighlight);
        if (wordHighlight) {
            collector.addRule(`.monaco-editor .wordHighlight { background-color: ${wordHighlight}; }`);
        }
        const wordHighlightStrong = theme.getColor(exports.editorWordHighlightStrong);
        if (wordHighlightStrong) {
            collector.addRule(`.monaco-editor .wordHighlightStrong { background-color: ${wordHighlightStrong}; }`);
        }
        const selectionHighlightBorder = theme.getColor(colorRegistry_1.editorSelectionHighlightBorder);
        if (selectionHighlightBorder) {
            collector.addRule(`.monaco-editor .selectionHighlight { border: 1px ${theme.type === 'hc' ? 'dotted' : 'solid'} ${selectionHighlightBorder}; box-sizing: border-box; }`);
        }
        const wordHighlightBorder = theme.getColor(exports.editorWordHighlightBorder);
        if (wordHighlightBorder) {
            collector.addRule(`.monaco-editor .wordHighlight { border: 1px ${theme.type === 'hc' ? 'dashed' : 'solid'} ${wordHighlightBorder}; box-sizing: border-box; }`);
        }
        const wordHighlightStrongBorder = theme.getColor(exports.editorWordHighlightStrongBorder);
        if (wordHighlightStrongBorder) {
            collector.addRule(`.monaco-editor .wordHighlightStrong { border: 1px ${theme.type === 'hc' ? 'dashed' : 'solid'} ${wordHighlightStrongBorder}; box-sizing: border-box; }`);
        }
    });
});
//# sourceMappingURL=wordHighlighter.js.map