import { ComposerButtonComponent } from '../ComposerButtonComponent'
import { ButtonIcons } from '../ButtonIcons'

function previousPrompt() { alert('previousPrompt') }
function nextPrompt() { alert('nextPrompt') }
function runPrompt() { alert('runPrompt') }

export function ComposerButtonRowComponent() {
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 8px', gap: 4 }}>
            <ComposerButtonComponent icon={ButtonIcons.previous} handler={previousPrompt} toolTipLabel="Previous Prompt" />
            <ComposerButtonComponent icon={ButtonIcons.next} handler={nextPrompt} toolTipLabel="Next Prompt" />
            <ComposerButtonComponent icon={ButtonIcons.play} handler={runPrompt} toolTipLabel="Run Prompt" />
        </div>
    )
}
