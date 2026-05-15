# Joy

Joy is a Domain Specific Language (DSL) for orchestrating LLM code generation.

In this Git repo, we use Joy to develop a chatbot that we call Lucy.

To follow along ...

1) Install Claude Code

2) Clone this Git repo

```
> git clone git@github.com:billdestein/joy.git
> cd joy
```

3) Start Claude 

```
> claude
```

4) Enter this Claude prompt

```
read and execute the file 'joy' in this directory
```

# Notes on Lucy:

Is there a demo?

- Yes. You can find a four-minute demo of Lucy here:  [Lucy demo](https://s3.us-west-2.amazonaws.com/billdestein.videos/lucy-v3.mp4)

What is Lucy:

- Lucy is a chatbot for image generation and image manipulation.
- Lucy is built entirely from generated code.
- Lucy code was generated using Claude and the Joy DSL
- Lucy uses the Gemini Typescript SDK for image generation and image manipulation.
- Lucy was built from scratch in nine business days. (Check the commit history on this project)

# Claude's thoughts on Joy and Lucy:

## I asked Claude:

```
- You're here:  https://github.com/billdestein/joy

- Joy is a small DSL that runs inside Claude Code. 

- I write prompts (plain files in a /learn directory) describing your system's frontend, backend, and libraries. 

- Then I tell you to learn from them and generate everything. 

- When something breaks, I ask you to suggest a fix — and then, critically, to update the prompts so the same
class of bug won't recur on the next generation.

- The iteration loop is: learn → generate → test → fix → update prompts → repeat. 

- The prompts and the code are committed together in the same repo. That means the diff between "working yesterday"
and "broken today" includes both the prompt change and the code change — full provenance.

- What I've found after a few days of using it: each iteration tightens the prompts, and the code generation gets
more repeatable. 

- It behaves like prompt-driven TDD — prompts are your spec, generation failures are your red tests.

- The repo includes a working example: we use Joy to develop a chatbot called Lucy. 

- Please share your thoughts, both good and less good.

```

## Claude replied,

```
⏺ Let me look at the repo before sharing thoughts.

  Read 8 files, listed 1 directory (ctrl+o to expand)

⏺ Now I have a good picture of the system. Here are my honest thoughts:

- What's genuinely clever

- The core insight is real: prompts are the spec, and committing them alongside the code gives you full provenance.
When a generation regresses, git diff shows you both the broken code and the prompt change that caused it. That's
something you don't get with any other AI-assisted workflow I'm aware of.

- The joyLearn/joyExecute split is a clean distinction. "Here's what to know" vs. "here's what to do" maps well onto
how an LLM actually processes a long context. Keeping the knowledge in named, modular .joy.ts files means you can
evolve one domain (e.g., the auth flow) without re-describing everything.

- The prompts in frontend.joy.ts show this working at its best: the Cognito/PKCE section is a dense, hard-won list
of gotchas (no profile scope, manual PKCE, window.location.origin exactly). That's exactly the kind of institutional
knowledge that evaporates in a normal codebase. Here it's a first-class artifact.

- Where it's fragile

- The runtime is just Claude's natural language parsing of plain text. There's no schema, no structured output, no
validation that what got generated actually matches what the prompt described. A subtle prompt change (or a model
update) can silently produce wrong code. You'd only catch it if you manually inspect the output or run tests.
The "red test" analogy holds only if you actually have tests.

- The joyLearn/joyExecute functions are stubs — learn(text) and execute(text) call into Claude's implicit
understanding, not a real runtime. That's fine for now, but it means there's no way to introspect what was
"learned," no way to detect contradictions between prompt files, and no isolation boundary between knowledge
domains. If architecture.joy.ts and backend.joy.ts say conflicting things, there's no error — just degraded generation.

- The workflow in index.joy.ts (execute("let me know if everything makes sense...")) requires a human in the loop at
each step. That's intentional, but it means the loop can't run unattended and the "repeatability" claim is partly
aspirational — the same prompts + a different model version or a different conversation state can produce different code.

- The tension to watch

- The prompts are getting more specific over time (the Cognito file is a good example), which is good for repeatability
but bad for generality. Eventually the prompts become so full of project-specific gotchas that they're essentially a
different representation of the codebase, not a spec above it. At that point the question is: is maintaining the
prompts cheaper than maintaining the code directly? Your answer after nine days seems to be yes — but that's worth
re-examining as the system grows.

- Bottom line

- It's a real methodology, not just a demo. The provenance story is the strongest part. The missing piece is a
lightweight validation layer — something that checks the generated output against the prompt's stated invariants
before you commit. Even a short checklist appended to each execute() call would help close the loop.

✻ Churned for 32s

```