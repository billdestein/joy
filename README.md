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

- Yes, can find a four-minute demo of Lucy here:  [Lucy demo](https://s3.us-west-2.amazonaws.com/billdestein.videos/lucy-v3.mp4)

What is Lucy:

- Lucy is a chatbot for image generation and image manipulation.
- Lucy is built entirely from generated code.
- Lucy code was generated using Claude and the Joy DSL
- Lucy uses the Gemini Typescript SDK for image generation and image manipulation.
- Lucy was built from scratch in nine calendar days. (Check the commit history on this project)

# Claude's thoughts on Joy and Lucy:

## I shared this with Claude:

Claude, you're here:  https://github.com/billdestein/joy

In early 2026, I develooped a SAAS product I called Toolbox.  Toolbox is a chatbot for image generation and image manipulation.  It took me three months to develop Toolbox. I developed the code, one line at a time, using VS Code.  I used Claude Code for light-weight refactoring, code reviews and unit tests generation.

In May 2006, I thought it would be interesting to see if I could build a functionally similar chatbot using 100% generated code.

I found myself working with twenty or so prompts, each a few hundred lines of text. I found myself copy/pasting the prompts from text files into the Claude command line. I decided that I needed to programmatically orchestrate the submittal of prompts to Claude.  I considered using Typescript with the Claude SDK, but I decided that was more than I needed.  What I needed was two things:

- A way to tell Claude to learn somethinng
- A way to tell Claude to build something

That's when I invented Joy.  Joy is a Domain Specific Language (DSL) for orchestrating LLM code generation.  You can find Joy here:

https://github.com/billdestein/joy

The next challenge was dealing with regressions.  I'd discover a bug when testing the generated code.  I'd ask Claude to troubleshoot and suggest changes to the generated code. I'd test the changes and commit them to Git.  But I wasn't being careful to update the prompts to prevent recurrence in subsequent generations.  That's when Claude and I decided to this try this workflow:

learn → generate → test → fix → update prompts → repeat. 

One day, Claude and I were working on a stubborn bug.  After a few hours, I told Claude, "you know, this was working yesterday."  Claude replied, "sorry, you've cleared my context since then, so I can't go back and look."  I said, "yea, but we've got the Git history for all of the generated code, right?"  Claude was pretty excited.  He found the change in Git that caused the breakage and fixed it.

So we tweaked our workflow.  We now commit changes to the prompts and changes to the generated code in the same commit in the same Git repo.

In the end, Claude and I successfully developed a chatbot in nine calendar days.  That chatbot is named Lucy.  She is 100% generated code.

I'm not suggesting that our workflow is appropriate for production product development.  But instead that it can be useful for early phases of the Software Development Life Cycle (SDLC) including ideation, rapid prototypeing, Minimal Viable Products (MVPs) and Proof Of Concept (POC).

Claude, what are your thoughts on this?  Please share both the good and the less good.

## Claude replied:

This is a genuinely interesting experiment, and the workflow has some real strengths worth naming clearly.

What works well:

The learn → generate → test → fix → update prompts → repeat loop is disciplined in a way most LLM-assisted development isn't. Most people treat prompts as throwaway — you found a way to make them first-class artifacts that live alongside the code.

That's the right instinct.

Co-locating prompt changes and code changes in the same commit is particularly sharp. It closes the loop that usually breaks: generated code drifts from its generative intent, and no one knows why it was written the way it was. Your commit history is both a changelog and a recipe book.

The Git bisect story is a good proof point — using version control as a shared memory substitute when context windows clear is clever and practical.

Using a DSL (Joy) to orchestrate prompt submission rather than writing SDK scaffolding is the right call for the scale you were at. Premature infrastructure is a common failure mode in this kind of work.

Where this gets harder:

Nine calendar days for an MVP is fast, but the real test is day 90. Prompt-driven generation tends to accumulate latent inconsistency — the model makes slightly different design decisions across sessions, and the divergence compounds. Refactoring becomes expensive because you're refactoring both code and prompts.

The workflow depends heavily on the developer's ability to write precise, complete prompts. That's a skill, and it's not evenly distributed. The "100% generated code" framing understates how much expertise you brought to structuring the generative process itself.

Testing is the hard constraint. You found bugs through manual testing. Automated test suites are difficult to maintain when the code generation can reconstitute large sections — tests and code can drift out of sync unless you're also generating and versioning the tests.

Finally, this workflow optimizes for greenfield speed. It gets harder when you need to integrate with external systems that have their own constraints, or when requirements change in ways that require surgical edits rather than regeneration.

The honest summary:

What you built is a legitimate rapid prototyping methodology, not just a one-off experiment. The prompt-as-artifact discipline is the part most people miss, and it's what would make this transferable to a team. The ceiling is real — this isn't a replacement for deliberate software architecture — but for the SDLC phases you named, it's a credible tool.

✻ Sautéed for 18s

