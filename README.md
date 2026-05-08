
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

This morning (5/8/2026) I prompted Claude with this: 

```
Hello Claude,

You and I have been working on this project for a few days now.  Here's a couple of things
I like about using this framework.

First, I like that I can tell you to generate and run all of the code.  When something doesn't work,
I can ask you to figure out why and suggest a fix.  I expected that.

Secondly, I like that I can ask you to read all of my prompts (files in the /learn folder) and
tell me if you have all of the details you need to generate the frontend, backend, and various libraries.

Third, all of the prompts and resulting code are committed at the same time to a single repo. So I can
ask you something like this:  "such-and-such feature was working yesterday.  Can you figure out what
we changed that might have caused the breakage.  Suggest a fix."

Fourth, I review your proposed fix; I commit it to Git.  Then I ask you, what changes might I make to
my prompts to prevent the same problem recurring on the next generation.  You've gotten that right
every time so far.  

Our iteration cycle goes like

- Claude: learn
- Claude: generate
- Bill: test and report bugs, error messages, warnings
- Claude: suggest fixes
- Bill: review and commit fixes
- Claude: update prompts to avoid recurrence in the next generation
- repeat

I'm finding that the more iterations we go through, the more repeatable the code generation becomes.

What do you think?  Please share both good and not so good.
```

Claude responded:

```
⏺ This is a genuinely well-thought-out workflow. Let me give you an honest read.

What's working well
          
The prompt-code co-evolution loop is the strongest part. Most people treat prompts as
static inputs and code as the real artifact. You've inverted that — the prompts are the
durable thing, and the code is a derived product. That's the right mental model for
AI-assisted generation to compound over time.
                                                                                           
Keeping prompts and code in the same commit is underrated. It means the diff between
"working yesterday" and "broken today" includes both the prompt change that caused the
regression and the code change — full provenance.
                                
The explicit "update prompts to prevent recurrence" step is where most teams skip.
That's why their second generation is worse than their first. You're doing the thing
that makes this actually get better.
                               
What to watch for

Prompt drift is the main risk. As prompts accumulate fixes, they can become contradictory
or overspecified in ways that aren't obvious until a generation goes sideways. Periodic
prompt audits — not just reactive updates — help catch this.
                                
I have context windows, not perfect memory. If two sessions diverge significantly from what's
in the prompts, I'll drift. The prompts need to be authoritative, not my conversational memory
of prior decisions.

The loop assumes bugs surface during testing. Silent regressions — things that run but behave
subtly wrong — are harder. Worth thinking about whether any automated assertions could catch
those earlier.
                                
One observation 

The iteration cadence you're describing — where each cycle tightens the prompts — is essentially
prompt-driven TDD. The prompts are your spec, and generation failures are your red tests. That
framing might suggest what's missing: a way to explicitly mark which prompt constraints were added
reactively vs. designed proactively. Right now you likely can't distinguish them in the commit history.

✻ Baked for 14s

```