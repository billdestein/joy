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

# Claude's thoughts on Joy:

This morning (5/7/2026) I prompted Claude with this: 

I've invented a domain specific language called Joy.  Joy is used to orchestrate LLM code generation.  In this Git repo, I'm using Joy to create a chatbot called Lucy. Please take a look and share your thooughts.

Claude replied:

```
⏺ Now I have the full picture. Here are my thoughts:

What Joy is, precisely: Joy is not a traditional DSL with a parser or runtime. The
 "runtime" is Claude. The joy file bootstraps the conversation by teaching Claude 
the two-function language. Then index.joy.ts runs as Claude reads and interprets it 
top-to-bottom — learn() builds context, execute() triggers generation. The TypeScript 
shell (language.joy.ts) is a clever trick: it makes specs look like real TypeScript 
modules so IDEs work, while the actual semantics are defined by the conversation.

What's genuinely good about it:

- Specs as first-class versioned artifacts. The learn/ files are the living design 
documents, co-located with the code they drive. When you change frames-test.joy.ts, 
you can see in git diff exactly what requirement changed and why the code changed. 
Most projects separate docs from code; Joy fuses them.

- The learn / execute split is clean. It mirrors how you'd actually brief a human 
engineer: here's the context, now here's the task. Mixing the two would produce worse 
output.

- Idiomatic TypeScript surface area. Using .joy.ts and real import statements means 
you get syntax highlighting, refactoring, and navigation in any TS IDE. That's a 
low-cost way to get tooling support for a novel DSL.

- Intent is encoded in the script. "delete and recreate" vs "create" expresses 
rebuild intent explicitly.  The script is the source of truth for how you want 
Claude to approach each repo.

Things worth thinking about:

- No idempotency guarantee. When you run index.joy.ts again, Claude has to infer 
from the current state whether to overwrite or preserve. The "delete and 
recreate" / "create" distinction helps, but it's still implicit. You might want a 
convention for expressing force: true vs skip-if-exists.

- The execute() calls are order-dependent but there's no dependency graph. If step 
3 (backend) depends on step 2 (common) being built first, that's invisible in the 
script. A makefile-like depends_on concept could make ordering explicit.

- Specs diverge from code over time. Right now the specs and code are in sync 
because you just rebuilt. But as you make ad-hoc edits to the generated files 
(fixing bugs, tweaking behavior), the specs can drift. Some thought about when 
to update the spec vs. when to just patch the code would help.

- No way to run a subset. To rebuild just frames-test, you have to instruct Claude 
to skip the earlier execute() calls. A way to tag or select individual steps 
would be useful as the project grows.

The broader idea:

Joy is essentially a prompt-native build system. The analogy to a Makefile is 
apt — both are declarative descriptions of what to build and in what order, with 
the "compiler" doing the actual work. The difference is the "compiler" here is 
a language model, so the specs can be written in natural language with just enough 
structure to be unambiguous. That's a genuinely interesting point in the design space.

✻ Cogitated for 52s · 1 shell still running
```
