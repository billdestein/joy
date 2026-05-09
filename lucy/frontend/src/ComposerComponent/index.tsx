import { ComposerEditorComponent } from '../ComposerEditorComponent'
import { ComposerButtonRowComponent } from '../ComposerButtonRowComponent'

export function ComposerComponent() {
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <ComposerEditorComponent />
            </div>
            <div style={{ height: 40, flexShrink: 0 }}>
                <ComposerButtonRowComponent />
            </div>
        </div>
    )
}
